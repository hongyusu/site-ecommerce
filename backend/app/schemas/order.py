"""Order schemas."""

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class OrderItemBase(BaseModel):
    """Base order item schema."""

    product_id: int
    variant_id: int | None = None
    quantity: int = Field(..., ge=1)


class OrderItemResponse(BaseModel):
    """Order item response schema."""

    id: int
    product_id: int | None
    variant_id: int | None
    product_name: str
    product_sku: str
    variant_name: str | None
    unit_price: Decimal
    quantity: int
    total_price: Decimal
    created_at: datetime

    class Config:
        """Pydantic config."""

        from_attributes = True


class OrderCreate(BaseModel):
    """Schema for creating an order."""

    items: list[OrderItemBase] = Field(..., min_length=1)
    shipping_name: str = Field(..., max_length=200)
    shipping_address_line1: str = Field(..., max_length=255)
    shipping_address_line2: str | None = Field(None, max_length=255)
    shipping_city: str = Field(..., max_length=100)
    shipping_postal_code: str = Field(..., max_length=20)
    shipping_country: str = Field(..., max_length=100)
    shipping_phone: str | None = Field(None, max_length=20)
    customer_notes: str | None = None
    coupon_code: str | None = None


class OrderCreateFromCart(BaseModel):
    """Schema for creating an order from the shopping cart."""

    address_id: int
    coupon_code: str | None = None
    customer_notes: str | None = None
    payment_method: str = Field(default="invoice", max_length=50)


class OrderUpdate(BaseModel):
    """Schema for updating an order (admin only)."""

    status: str | None = None
    payment_status: str | None = None
    payment_method: str | None = None
    payment_reference: str | None = None
    tracking_number: str | None = None
    carrier: str | None = None
    admin_notes: str | None = None


class OrderResponse(BaseModel):
    """Order response schema."""

    id: int
    user_id: int
    order_number: str
    status: str
    payment_status: str
    subtotal: Decimal
    tax_amount: Decimal
    shipping_cost: Decimal
    discount_amount: Decimal
    total: Decimal
    currency: str
    payment_method: str | None
    tracking_number: str | None = None
    carrier: str | None = None
    shipping_name: str
    shipping_address_line1: str
    shipping_address_line2: str | None
    shipping_city: str
    shipping_postal_code: str
    shipping_country: str
    shipping_phone: str | None
    customer_notes: str | None
    items: list[OrderItemResponse] = []
    created_at: datetime
    updated_at: datetime
    paid_at: datetime | None
    shipped_at: datetime | None
    delivered_at: datetime | None

    class Config:
        """Pydantic config."""

        from_attributes = True


class OrderListResponse(BaseModel):
    """Order list response with pagination."""

    items: list[OrderResponse]
    total: int
    page: int
    page_size: int
    pages: int
