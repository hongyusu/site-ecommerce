"""API dependencies for authentication and authorization."""

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User, UserRole

security = HTTPBearer()


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    """
    Get current authenticated user from JWT token.

    Parameters
    ----------
    credentials : HTTPAuthorizationCredentials
        Bearer token credentials.
    db : Session
        Database session.

    Returns
    -------
    User
        Current authenticated user.

    Raises
    ------
    HTTPException
        If token is invalid or user not found.

    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        token = credentials.credentials
        payload = decode_token(token)
        user_id_raw = payload.get("sub")
        token_type: str | None = payload.get("type")
        user_id = int(user_id_raw) if user_id_raw is not None else None

        if user_id is None or token_type != "access":
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="User account is inactive"
        )

    return user


def get_current_admin(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """
    Verify current user is an admin.

    Parameters
    ----------
    current_user : User
        Current authenticated user.

    Returns
    -------
    User
        Current admin user.

    Raises
    ------
    HTTPException
        If user is not an admin.

    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions. Admin access required.",
        )
    return current_user


def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(HTTPBearer(auto_error=False)),
    db: Session = Depends(get_db),
) -> User | None:
    """
    Get current user if token is provided, otherwise return None.

    Useful for endpoints that work for both authenticated and anonymous users.

    Parameters
    ----------
    credentials : HTTPAuthorizationCredentials | None
        Optional bearer token credentials.
    db : Session
        Database session.

    Returns
    -------
    User | None
        Current user if authenticated, None otherwise.

    """
    if credentials is None:
        return None

    try:
        token = credentials.credentials
        payload = decode_token(token)
        user_id_raw = payload.get("sub")
        token_type: str | None = payload.get("type")
        user_id = int(user_id_raw) if user_id_raw is not None else None

        if user_id is None or token_type != "access":
            return None

        user = db.query(User).filter(User.id == user_id, User.is_active.is_(True)).first()
        return user

    except JWTError:
        return None
