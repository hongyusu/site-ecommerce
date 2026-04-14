"""Product schemas."""

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class ProductImageBase(BaseModel):
    """Base product image schema."""

    image_url: str = Field(..., max_length=500)
    alt_text: str | None = Field(None, max_length=255)
    display_order: int = Field(default=0)
    is_primary: bool = Field(default=False)


class ProductImageResponse(ProductImageBase):
    """Product image response schema."""

    id: int
    product_id: int
    created_at: datetime

    class Config:
        """Pydantic config."""

        from_attributes = True


class ProductVariantBase(BaseModel):
    """Base product variant schema."""

    sku: str = Field(..., max_length=100)
    name: str = Field(..., max_length=255)
    options: dict = Field(...)  # e.g., {"size": "L", "color": "Red"}
    price: Decimal | None = Field(None, ge=0)
    stock_quantity: int = Field(default=0, ge=0)
    is_active: bool = Field(default=True)


class ProductVariantResponse(ProductVariantBase):
    """Product variant response schema."""

    id: int
    product_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic config."""

        from_attributes = True


class ProductBase(BaseModel):
    """Base product schema."""

    category_id: int | None = None
    name: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., max_length=280)
    sku: str = Field(..., max_length=100)
    description: str | None = None
    short_description: str | None = Field(None, max_length=500)
    price: Decimal = Field(..., ge=0)
    compare_at_price: Decimal | None = Field(None, ge=0)
    stock_quantity: int = Field(default=0, ge=0)
    specifications: dict | None = None
    key_features: list | None = None
    brand: str | None = Field(None, max_length=100)
    warranty_months: int | None = Field(None, ge=0)
    weight_kg: Decimal | None = Field(None, ge=0)
    delivery_time_days: str | None = Field(None, max_length=50)
    rating_average: Decimal | None = Field(None, ge=0, le=5)
    rating_count: int = Field(default=0, ge=0)
    is_active: bool = Field(default=True)
    is_featured: bool = Field(default=False)
    is_deal: bool = Field(default=False)


class ProductCreate(ProductBase):
    """Schema for creating a product."""

    pass


class ProductUpdate(BaseModel):
    """Schema for updating a product."""

    category_id: int | None = None
    name: str | None = Field(None, min_length=1, max_length=255)
    slug: str | None = Field(None, max_length=280)
    description: str | None = None
    short_description: str | None = Field(None, max_length=500)
    price: Decimal | None = Field(None, ge=0)
    compare_at_price: Decimal | None = Field(None, ge=0)
    stock_quantity: int | None = Field(None, ge=0)
    specifications: dict | None = None
    key_features: list | None = None
    brand: str | None = Field(None, max_length=100)
    warranty_months: int | None = Field(None, ge=0)
    weight_kg: Decimal | None = Field(None, ge=0)
    delivery_time_days: str | None = Field(None, max_length=50)
    is_active: bool | None = None
    is_featured: bool | None = None
    is_deal: bool | None = None


class ProductResponse(ProductBase):
    """Product response schema."""

    id: int
    created_at: datetime
    updated_at: datetime
    images: list[ProductImageResponse] = []
    variants: list[ProductVariantResponse] = []

    class Config:
        """Pydantic config."""

        from_attributes = True


class ProductListResponse(BaseModel):
    """Product list response with pagination."""

    items: list[ProductResponse]
    total: int
    page: int
    page_size: int
    pages: int


class ProductReviewBase(BaseModel):
    """Base product review schema."""

    rating: int = Field(..., ge=1, le=5)
    title: str = Field(..., min_length=1, max_length=200)
    comment: str = Field(..., min_length=1)


class ProductReviewCreate(ProductReviewBase):
    """Schema for creating a product review."""

    pass


class ProductReviewResponse(ProductReviewBase):
    """Product review response schema."""

    id: int
    product_id: int
    user_id: int
    helpful_count: int
    verified_purchase: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic config."""

        from_attributes = True


class ProductReviewListResponse(BaseModel):
    """Product review list response with pagination."""

    items: list[ProductReviewResponse]
    total: int
    page: int
    page_size: int
    pages: int
    average_rating: Decimal
    rating_distribution: dict[int, int]  # {5: 10, 4: 5, 3: 2, 2: 1, 1: 0}
