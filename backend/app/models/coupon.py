"""Coupon model."""

from datetime import datetime
from decimal import Decimal
from enum import Enum as PyEnum

from sqlalchemy import Boolean, DateTime, Enum, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class DiscountType(PyEnum):
    """Discount type enumeration."""

    PERCENTAGE = "percentage"
    FIXED_AMOUNT = "fixed_amount"
    FREE_SHIPPING = "free_shipping"


class Coupon(Base):
    """Coupon model for discounts and promotions."""

    __tablename__ = "coupons"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    # Coupon details
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text)

    # Discount
    discount_type: Mapped[DiscountType] = mapped_column(
        Enum(DiscountType), nullable=False, default=DiscountType.PERCENTAGE
    )
    discount_value: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    # Usage limits
    max_uses: Mapped[int | None] = mapped_column(Integer)  # None = unlimited
    used_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    max_uses_per_user: Mapped[int | None] = mapped_column(Integer)

    # Conditions
    min_purchase_amount: Mapped[Decimal | None] = mapped_column(Numeric(10, 2))

    # Validity
    valid_from: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    valid_until: Mapped[datetime | None] = mapped_column(DateTime)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    def __repr__(self) -> str:
        """String representation of Coupon."""
        return f"<Coupon(id={self.id}, code={self.code}, type={self.discount_type.value})>"
