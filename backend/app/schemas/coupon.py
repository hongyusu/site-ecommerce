"""Coupon schemas."""

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class CouponCreate(BaseModel):
    """Schema for creating a coupon."""

    code: str = Field(..., min_length=1, max_length=50)
    description: str | None = None
    discount_type: str = Field(..., pattern="^(percentage|fixed_amount|free_shipping)$")
    discount_value: Decimal = Field(..., ge=0)
    max_uses: int | None = None
    max_uses_per_user: int | None = None
    min_purchase_amount: Decimal | None = Field(None, ge=0)
    valid_from: datetime
    valid_until: datetime | None = None
    is_active: bool = True


class CouponUpdate(BaseModel):
    """Schema for updating a coupon."""

    description: str | None = None
    discount_type: str | None = Field(None, pattern="^(percentage|fixed_amount|free_shipping)$")
    discount_value: Decimal | None = Field(None, ge=0)
    max_uses: int | None = None
    max_uses_per_user: int | None = None
    min_purchase_amount: Decimal | None = Field(None, ge=0)
    valid_until: datetime | None = None
    is_active: bool | None = None


class CouponResponse(BaseModel):
    """Schema for coupon response."""

    id: int
    code: str
    description: str | None
    discount_type: str
    discount_value: Decimal
    max_uses: int | None
    used_count: int
    max_uses_per_user: int | None
    min_purchase_amount: Decimal | None
    valid_from: datetime
    valid_until: datetime | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic config."""

        from_attributes = True


class CouponValidateRequest(BaseModel):
    """Schema for validating a coupon."""

    code: str
    subtotal: Decimal = Field(..., ge=0)


class CouponValidateResponse(BaseModel):
    """Schema for coupon validation response."""

    valid: bool
    code: str
    discount_type: str
    discount_value: Decimal
    discount_amount: Decimal
    free_shipping: bool
    message: str
