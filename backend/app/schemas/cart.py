"""Cart schemas."""

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class CartItemAdd(BaseModel):
    """Schema for adding an item to cart."""

    product_id: int
    variant_id: int | None = None
    quantity: int = Field(default=1, ge=1)


class CartItemUpdate(BaseModel):
    """Schema for updating cart item quantity."""

    quantity: int = Field(..., ge=1)


class CartItemResponse(BaseModel):
    """Schema for cart item response with product details."""

    id: int
    product_id: int
    variant_id: int | None
    quantity: int
    product_name: str
    product_price: Decimal
    product_image_url: str | None
    product_slug: str
    product_stock: int
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic config."""

        from_attributes = True


class CartResponse(BaseModel):
    """Schema for full cart response."""

    id: int
    user_id: int
    items: list[CartItemResponse]
    item_count: int
    subtotal: Decimal
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic config."""

        from_attributes = True
