"""Address schemas."""

from datetime import datetime

from pydantic import BaseModel, Field


class AddressCreate(BaseModel):
    """Schema for creating an address."""

    full_name: str = Field(..., min_length=1, max_length=200)
    phone: str | None = Field(None, max_length=20)
    address_line1: str = Field(..., min_length=1, max_length=255)
    address_line2: str | None = Field(None, max_length=255)
    city: str = Field(..., min_length=1, max_length=100)
    postal_code: str = Field(..., min_length=1, max_length=20)
    country: str = Field(..., min_length=1, max_length=100)
    is_default_shipping: bool = False
    is_default_billing: bool = False


class AddressUpdate(BaseModel):
    """Schema for updating an address."""

    full_name: str | None = Field(None, max_length=200)
    phone: str | None = Field(None, max_length=20)
    address_line1: str | None = Field(None, max_length=255)
    address_line2: str | None = Field(None, max_length=255)
    city: str | None = Field(None, max_length=100)
    postal_code: str | None = Field(None, max_length=20)
    country: str | None = Field(None, max_length=100)
    is_default_shipping: bool | None = None
    is_default_billing: bool | None = None


class AddressResponse(BaseModel):
    """Schema for address response."""

    id: int
    user_id: int
    full_name: str
    phone: str | None
    address_line1: str
    address_line2: str | None
    city: str
    postal_code: str
    country: str
    is_default_shipping: bool
    is_default_billing: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic config."""

        from_attributes = True
