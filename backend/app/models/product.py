"""Product models."""

from datetime import datetime
from decimal import Decimal

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Product(Base):
    """Product model for e-commerce catalog."""

    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    category_id: Mapped[int] = mapped_column(
        ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True
    )

    # Basic info
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String(280), unique=True, nullable=False, index=True)
    sku: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text)
    short_description: Mapped[str | None] = mapped_column(String(500))

    # Translations (JSONB with locale keys: en, fi, sv)
    name_translations: Mapped[dict | None] = mapped_column(JSONB)
    description_translations: Mapped[dict | None] = mapped_column(JSONB)
    short_description_translations: Mapped[dict | None] = mapped_column(JSONB)

    # Pricing
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    compare_at_price: Mapped[Decimal | None] = mapped_column(Numeric(10, 2))
    cost_price: Mapped[Decimal | None] = mapped_column(Numeric(10, 2))

    # Inventory
    stock_quantity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    low_stock_threshold: Mapped[int] = mapped_column(Integer, default=10, nullable=False)

    # Product specifications (JSON)
    specifications: Mapped[dict | None] = mapped_column(JSONB)

    # Enhanced product information
    key_features: Mapped[list | None] = mapped_column(JSONB)  # Product highlights/bullet points
    brand: Mapped[str | None] = mapped_column(String(100))
    warranty_months: Mapped[int | None] = mapped_column(Integer)
    weight_kg: Mapped[Decimal | None] = mapped_column(Numeric(10, 3))
    delivery_time_days: Mapped[str | None] = mapped_column(String(50))  # e.g., "1-3 päivää"

    # Ratings and reviews
    rating_average: Mapped[Decimal | None] = mapped_column(Numeric(3, 2), default=Decimal("0.00"))
    rating_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Flags
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_deal: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # SEO
    meta_title: Mapped[str | None] = mapped_column(String(255))
    meta_description: Mapped[str | None] = mapped_column(String(500))

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    images: Mapped[list["ProductImage"]] = relationship(
        "ProductImage", back_populates="product", cascade="all, delete-orphan"
    )
    variants: Mapped[list["ProductVariant"]] = relationship(
        "ProductVariant", back_populates="product", cascade="all, delete-orphan"
    )
    reviews: Mapped[list["ProductReview"]] = relationship(
        "ProductReview", back_populates="product", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        """String representation of Product."""
        return f"<Product(id={self.id}, name={self.name}, sku={self.sku})>"


class ProductImage(Base):
    """Product image model with URL storage."""

    __tablename__ = "product_images"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True
    )

    image_url: Mapped[str] = mapped_column(String(500), nullable=False)
    alt_text: Mapped[str | None] = mapped_column(String(255))
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    # Relationships
    product: Mapped["Product"] = relationship("Product", back_populates="images")

    def __repr__(self) -> str:
        """String representation of ProductImage."""
        return f"<ProductImage(id={self.id}, product_id={self.product_id})>"


class ProductVariant(Base):
    """Product variant model for size, color, etc."""

    __tablename__ = "product_variants"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # Variant details
    sku: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)

    # Variant options (e.g., {"size": "L", "color": "Red"})
    options: Mapped[dict] = mapped_column(JSONB, nullable=False)

    # Pricing (overrides product price if set)
    price: Mapped[Decimal | None] = mapped_column(Numeric(10, 2))

    # Inventory
    stock_quantity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    product: Mapped["Product"] = relationship("Product", back_populates="variants")

    def __repr__(self) -> str:
        """String representation of ProductVariant."""
        return f"<ProductVariant(id={self.id}, sku={self.sku}, name={self.name})>"


class ProductReview(Base):
    """Product review model for customer feedback."""

    __tablename__ = "product_reviews"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # Review content
    rating: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-5 stars
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    comment: Mapped[str] = mapped_column(Text, nullable=False)

    # Metadata
    helpful_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    verified_purchase: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    product: Mapped["Product"] = relationship("Product", back_populates="reviews")

    def __repr__(self) -> str:
        """String representation of ProductReview."""
        return f"<ProductReview(id={self.id}, product_id={self.product_id}, rating={self.rating})>"
