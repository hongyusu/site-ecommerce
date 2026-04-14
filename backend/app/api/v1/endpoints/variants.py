"""Product variant management endpoints (admin)."""

from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_admin
from app.core.database import get_db
from app.models.product import Product, ProductVariant
from app.models.user import User

router = APIRouter()


class VariantCreate(BaseModel):
    """Schema for creating a variant."""

    sku: str = Field(..., min_length=1, max_length=100)
    name: str = Field(..., min_length=1, max_length=255)
    options: dict = Field(..., description='e.g. {"size": "L"} or {"storage": "512GB"}')
    price: Decimal | None = Field(None, ge=0)
    stock_quantity: int = Field(default=0, ge=0)
    is_active: bool = True


class VariantUpdate(BaseModel):
    """Schema for updating a variant."""

    name: str | None = Field(None, max_length=255)
    options: dict | None = None
    price: Decimal | None = None
    stock_quantity: int | None = Field(None, ge=0)
    is_active: bool | None = None


class VariantResponse(BaseModel):
    """Schema for variant response."""

    id: int
    product_id: int
    sku: str
    name: str
    options: dict
    price: Decimal | None
    stock_quantity: int
    is_active: bool

    class Config:
        """Pydantic config."""

        from_attributes = True


@router.get("/{product_id}/variants", response_model=list[VariantResponse])
def list_variants(
    product_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
) -> list[ProductVariant]:
    """List all variants for a product."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    return (
        db.query(ProductVariant)
        .filter(ProductVariant.product_id == product_id)
        .order_by(ProductVariant.name)
        .all()
    )


@router.post(
    "/{product_id}/variants",
    response_model=VariantResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_variant(
    product_id: int,
    variant_data: VariantCreate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
) -> ProductVariant:
    """Create a new variant for a product."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    existing = (
        db.query(ProductVariant)
        .filter(ProductVariant.sku == variant_data.sku)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Variant with this SKU already exists",
        )

    variant = ProductVariant(
        product_id=product_id,
        **variant_data.model_dump(),
    )
    db.add(variant)
    db.commit()
    db.refresh(variant)
    return variant


@router.patch("/{product_id}/variants/{variant_id}", response_model=VariantResponse)
def update_variant(
    product_id: int,
    variant_id: int,
    variant_data: VariantUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
) -> ProductVariant:
    """Update a variant."""
    variant = (
        db.query(ProductVariant)
        .filter(
            ProductVariant.id == variant_id,
            ProductVariant.product_id == product_id,
        )
        .first()
    )
    if not variant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Variant not found",
        )

    update_data = variant_data.model_dump(exclude_unset=True)

    # Handle price=0 as "remove override" (set to None)
    if "price" in update_data and update_data["price"] == 0:
        update_data["price"] = None

    for field, value in update_data.items():
        setattr(variant, field, value)

    db.commit()
    db.refresh(variant)
    return variant


@router.delete(
    "/{product_id}/variants/{variant_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_variant(
    product_id: int,
    variant_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
) -> None:
    """Delete a variant."""
    variant = (
        db.query(ProductVariant)
        .filter(
            ProductVariant.id == variant_id,
            ProductVariant.product_id == product_id,
        )
        .first()
    )
    if not variant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Variant not found",
        )

    db.delete(variant)
    db.commit()
