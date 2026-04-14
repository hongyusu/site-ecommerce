"""Authentication endpoints."""

from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import get_db
from pydantic import BaseModel, EmailStr, Field

from app.core.security import (
    create_access_token, create_email_token, create_refresh_token,
    decode_email_token, hash_password, verify_password,
)
from app.models.user import User, UserRole
from app.schemas.auth import PasswordChange, Token, UserLogin, UserRegister
from app.schemas.user import UserProfile, UserUpdate
from app.services.email import (
    send_password_reset_email, send_verification_email,
)


class ForgotPasswordRequest(BaseModel):
    """Schema for forgot password request."""

    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Schema for reset password."""

    token: str
    new_password: str = Field(..., min_length=8, max_length=100)

router = APIRouter()


@router.post("/register", response_model=UserProfile, status_code=status.HTTP_201_CREATED)
def register(
    user_data: UserRegister,
    db: Annotated[Session, Depends(get_db)],
) -> User:
    """
    Register a new user.

    Parameters
    ----------
    user_data : UserRegister
        User registration data.
    db : Session
        Database session.

    Returns
    -------
    User
        Newly created user.

    Raises
    ------
    HTTPException
        If email already exists.

    """
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Create new user (unverified)
    new_user = User(
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        phone=user_data.phone,
        preferred_language=user_data.preferred_language,
        role=UserRole.CUSTOMER,
        is_active=True,
        is_verified=False,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Send verification email
    token = create_email_token(new_user.email, "verify", hours=24)
    send_verification_email(
        to=new_user.email,
        name=new_user.first_name,
        token=token,
    )

    return new_user


@router.post("/login", response_model=Token)
def login(
    credentials: UserLogin,
    db: Annotated[Session, Depends(get_db)],
) -> dict[str, str]:
    """
    Login with email and password.

    Parameters
    ----------
    credentials : UserLogin
        User login credentials.
    db : Session
        Database session.

    Returns
    -------
    dict[str, str]
        Access and refresh tokens.

    Raises
    ------
    HTTPException
        If credentials are invalid.

    """
    # Find user
    user = db.query(User).filter(User.email == credentials.email).first()

    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email before logging in",
        )

    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()

    # Create tokens
    token_data = {"sub": str(user.id), "email": user.email, "role": user.role.value}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@router.get("/me", response_model=UserProfile)
def get_current_user_profile(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """
    Get current user profile.

    Parameters
    ----------
    current_user : User
        Current authenticated user.

    Returns
    -------
    User
        Current user profile.

    """
    return current_user


@router.patch("/me", response_model=UserProfile)
def update_profile(
    profile_data: UserUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    """
    Update current user profile.

    Parameters
    ----------
    profile_data : UserUpdate
        Profile update data.
    current_user : User
        Current authenticated user.
    db : Session
        Database session.

    Returns
    -------
    User
        Updated user profile.

    """
    update_data = profile_data.model_dump(exclude_unset=True)
    update_data.pop("email", None)
    update_data.pop("password", None)

    for field, value in update_data.items():
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/change-password")
def change_password(
    password_data: PasswordChange,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> dict[str, str]:
    """
    Change user password.

    Parameters
    ----------
    password_data : PasswordChange
        Password change data.
    current_user : User
        Current authenticated user.
    db : Session
        Database session.

    Returns
    -------
    dict[str, str]
        Success message.

    Raises
    ------
    HTTPException
        If current password is incorrect.

    """
    # Verify current password
    if not verify_password(password_data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    # Update password
    current_user.password_hash = hash_password(password_data.new_password)
    db.commit()

    return {"message": "Password changed successfully"}


@router.post("/verify-email")
def verify_email(
    token: str,
    db: Annotated[Session, Depends(get_db)],
) -> dict[str, str]:
    """Verify user email with token."""
    email = decode_email_token(token, "verify")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification link",
        )

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user.is_verified:
        return {"message": "Email already verified"}

    user.is_verified = True
    db.commit()
    return {"message": "Email verified successfully"}


@router.post("/forgot-password")
def forgot_password(
    request: ForgotPasswordRequest,
    db: Annotated[Session, Depends(get_db)],
) -> dict[str, str]:
    """Send password reset email."""
    user = db.query(User).filter(User.email == request.email).first()
    if user:
        token = create_email_token(user.email, "reset", hours=1)
        send_password_reset_email(
            to=user.email,
            name=user.first_name,
            token=token,
        )
    # Always return success to prevent email enumeration
    return {"message": "If the email exists, a reset link has been sent"}


@router.post("/reset-password")
def reset_password(
    request: ResetPasswordRequest,
    db: Annotated[Session, Depends(get_db)],
) -> dict[str, str]:
    """Reset password with token."""
    email = decode_email_token(request.token, "reset")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset link",
        )

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    user.password_hash = hash_password(request.new_password)
    db.commit()
    return {"message": "Password reset successfully"}
