"""Wishlist endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.product import Product, ProductImage
from app.models.user import User
from app.models.wishlist import WishlistItem

router = APIRouter()


@router.get("")
def list_wishlist(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> list[dict]:
    """List user's wishlist items with product details."""
    items = (
        db.query(WishlistItem)
        .filter(WishlistItem.user_id == current_user.id)
        .order_by(WishlistItem.created_at.desc())
        .all()
    )

    result = []
    for wi in items:
        product = db.query(Product).filter(Product.id == wi.product_id).first()
        if not product:
            continue
        img = (
            db.query(ProductImage.image_url)
            .filter(ProductImage.product_id == product.id, ProductImage.is_primary.is_(True))
            .first()
        )
        result.append({
            "id": wi.id,
            "product_id": product.id,
            "product_name": product.name,
            "product_slug": product.slug,
            "product_price": float(product.price),
            "product_compare_at_price": (
                float(product.compare_at_price) if product.compare_at_price else None
            ),
            "product_image_url": img[0] if img else None,
            "product_stock": product.stock_quantity,
            "product_is_active": product.is_active,
            "created_at": wi.created_at.isoformat(),
        })

    return result


@router.post("/{product_id}", status_code=status.HTTP_201_CREATED)
def add_to_wishlist(
    product_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict:
    """Add a product to wishlist."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    existing = (
        db.query(WishlistItem)
        .filter(
            WishlistItem.user_id == current_user.id,
            WishlistItem.product_id == product_id,
        )
        .first()
    )
    if existing:
        return {"message": "Already in wishlist", "in_wishlist": True}

    item = WishlistItem(user_id=current_user.id, product_id=product_id)
    db.add(item)
    db.commit()
    return {"message": "Added to wishlist", "in_wishlist": True}


@router.delete("/{product_id}", status_code=status.HTTP_200_OK)
def remove_from_wishlist(
    product_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict:
    """Remove a product from wishlist."""
    item = (
        db.query(WishlistItem)
        .filter(
            WishlistItem.user_id == current_user.id,
            WishlistItem.product_id == product_id,
        )
        .first()
    )
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not in wishlist",
        )

    db.delete(item)
    db.commit()
    return {"message": "Removed from wishlist", "in_wishlist": False}


@router.get("/check/{product_id}")
def check_wishlist(
    product_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict:
    """Check if a product is in wishlist."""
    exists = (
        db.query(WishlistItem)
        .filter(
            WishlistItem.user_id == current_user.id,
            WishlistItem.product_id == product_id,
        )
        .first()
    )
    return {"in_wishlist": exists is not None}
