"""Security utilities for authentication and authorization."""

from datetime import datetime, timedelta
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.

    Parameters
    ----------
    password : str
        Plain text password.

    Returns
    -------
    str
        Hashed password.

    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash.

    Parameters
    ----------
    plain_password : str
        Plain text password to verify.
    hashed_password : str
        Hashed password to compare against.

    Returns
    -------
    bool
        True if password matches, False otherwise.

    """
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict[str, Any], expires_delta: timedelta | None = None) -> str:
    """
    Create a JWT access token.

    Parameters
    ----------
    data : dict[str, Any]
        Payload data to encode in the token.
    expires_delta : timedelta | None, optional
        Token expiration time. Defaults to None (uses config default).

    Returns
    -------
    str
        Encoded JWT token.

    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict[str, Any]) -> str:
    """
    Create a JWT refresh token.

    Parameters
    ----------
    data : dict[str, Any]
        Payload data to encode in the token.

    Returns
    -------
    str
        Encoded JWT refresh token.

    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def create_email_token(email: str, token_type: str, hours: int = 24) -> str:
    """Create a token for email verification or password reset."""
    expire = datetime.utcnow() + timedelta(hours=hours)
    return jwt.encode(
        {"sub": email, "type": token_type, "exp": expire},
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM,
    )


def decode_email_token(token: str, expected_type: str) -> str | None:
    """Decode and validate an email token, return email if valid."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        if payload.get("type") != expected_type:
            return None
        return payload.get("sub")
    except JWTError:
        return None


def decode_token(token: str) -> dict[str, Any]:
    """
    Decode and validate a JWT token.

    Parameters
    ----------
    token : str
        JWT token to decode.

    Returns
    -------
    dict[str, Any]
        Decoded token payload.

    Raises
    ------
    JWTError
        If token is invalid or expired.

    """
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError as e:
        raise JWTError("Invalid token") from e
