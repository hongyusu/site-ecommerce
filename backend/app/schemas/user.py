"""User schemas."""

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    """Base user schema."""

    email: EmailStr
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    phone: str | None = Field(None, max_length=20)
    preferred_language: str = Field(default="fi", pattern="^(fi|sv|en|zh)$")


class UserCreate(UserBase):
    """Schema for creating a user."""

    password: str = Field(..., min_length=8, max_length=100)


class UserUpdate(BaseModel):
    """Schema for updating user profile."""

    first_name: str | None = Field(None, min_length=1, max_length=100)
    last_name: str | None = Field(None, min_length=1, max_length=100)
    phone: str | None = Field(None, max_length=20)
    preferred_language: str | None = Field(None, pattern="^(fi|sv|en|zh)$")


class UserResponse(UserBase):
    """Schema for user response."""

    id: int
    role: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    last_login: datetime | None

    class Config:
        """Pydantic config."""

        from_attributes = True


class UserProfile(BaseModel):
    """Schema for user profile with additional details."""

    id: int
    email: EmailStr
    first_name: str
    last_name: str
    phone: str | None
    preferred_language: str
    role: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime
    last_login: datetime | None

    class Config:
        """Pydantic config."""

        from_attributes = True
