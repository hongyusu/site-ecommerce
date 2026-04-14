"""Cart endpoints."""

from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.cart import Cart, CartItem
from app.models.product import Product, ProductImage
from app.models.user import User
from app.schemas.cart import (
    CartItemAdd,
    CartItemUpdate,
    CartResponse,
)

router = APIRouter()


def _get_or_create_cart(
    db: Session, user_id: int
) -> Cart:
    """Get existing cart or create a new one for the user."""
    cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    if not cart:
        cart = Cart(user_id=user_id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart


def _build_cart_response(db: Session, cart: Cart) -> dict:
    """Build cart response with product details."""
    items_data = []
    subtotal = Decimal("0.00")
    item_count = 0

    cart_items = (
        db.query(CartItem)
        .filter(CartItem.cart_id == cart.id)
        .all()
    )

    for ci in cart_items:
        product = (
            db.query(Product)
            .filter(Product.id == ci.product_id)
            .first()
        )
        if not product:
            continue

        primary_image = (
            db.query(ProductImage)
            .filter(
                ProductImage.product_id == product.id,
                ProductImage.is_primary.is_(True),
            )
            .first()
        )
        image_url = primary_image.image_url if primary_image else None

        line_total = product.price * ci.quantity
        subtotal += line_total
        item_count += ci.quantity

        items_data.append({
            "id": ci.id,
            "product_id": ci.product_id,
            "variant_id": ci.variant_id,
            "quantity": ci.quantity,
            "product_name": product.name,
            "product_price": product.price,
            "product_image_url": image_url,
            "product_slug": product.slug,
            "product_stock": product.stock_quantity,
            "created_at": ci.created_at,
            "updated_at": ci.updated_at,
        })

    return {
        "id": cart.id,
        "user_id": cart.user_id,
        "items": items_data,
        "item_count": item_count,
        "subtotal": subtotal,
        "created_at": cart.created_at,
        "updated_at": cart.updated_at,
    }


@router.get("", response_model=CartResponse)
def get_cart(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict:
    """
    Get current user's cart.

    Parameters
    ----------
    db : Session
        Database session.
    current_user : User
        Current authenticated user.

    Returns
    -------
    dict
        Cart with items and computed totals.

    """
    cart = _get_or_create_cart(db, current_user.id)
    return _build_cart_response(db, cart)


@router.post(
    "/items", response_model=CartResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_item(
    item_data: CartItemAdd,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict:
    """
    Add item to cart.

    Parameters
    ----------
    item_data : CartItemAdd
        Item data with product_id and quantity.
    db : Session
        Database session.
    current_user : User
        Current authenticated user.

    Returns
    -------
    dict
        Updated cart.

    Raises
    ------
    HTTPException
        If product not found, inactive, or insufficient stock.

    """
    product = (
        db.query(Product)
        .filter(Product.id == item_data.product_id)
        .first()
    )
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    if not product.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product is not available",
        )

    cart = _get_or_create_cart(db, current_user.id)

    existing_item = (
        db.query(CartItem)
        .filter(
            CartItem.cart_id == cart.id,
            CartItem.product_id == item_data.product_id,
            CartItem.variant_id == item_data.variant_id,
        )
        .first()
    )

    new_qty = (
        existing_item.quantity + item_data.quantity
        if existing_item
        else item_data.quantity
    )

    if new_qty > product.stock_quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient stock. Available: {product.stock_quantity}",
        )

    if existing_item:
        existing_item.quantity = new_qty
    else:
        new_item = CartItem(
            cart_id=cart.id,
            product_id=item_data.product_id,
            variant_id=item_data.variant_id,
            quantity=item_data.quantity,
        )
        db.add(new_item)

    db.commit()
    return _build_cart_response(db, cart)


@router.patch("/items/{item_id}", response_model=CartResponse)
def update_item(
    item_id: int,
    item_data: CartItemUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict:
    """
    Update cart item quantity.

    Parameters
    ----------
    item_id : int
        Cart item ID.
    item_data : CartItemUpdate
        New quantity.
    db : Session
        Database session.
    current_user : User
        Current authenticated user.

    Returns
    -------
    dict
        Updated cart.

    Raises
    ------
    HTTPException
        If item not found, not owned, or insufficient stock.

    """
    cart = _get_or_create_cart(db, current_user.id)

    cart_item = (
        db.query(CartItem)
        .filter(CartItem.id == item_id, CartItem.cart_id == cart.id)
        .first()
    )
    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found",
        )

    product = (
        db.query(Product)
        .filter(Product.id == cart_item.product_id)
        .first()
    )
    if product and item_data.quantity > product.stock_quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient stock. Available: {product.stock_quantity}",
        )

    cart_item.quantity = item_data.quantity
    db.commit()
    return _build_cart_response(db, cart)


@router.delete("/items/{item_id}", response_model=CartResponse)
def remove_item(
    item_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict:
    """
    Remove item from cart.

    Parameters
    ----------
    item_id : int
        Cart item ID.
    db : Session
        Database session.
    current_user : User
        Current authenticated user.

    Returns
    -------
    dict
        Updated cart.

    Raises
    ------
    HTTPException
        If item not found.

    """
    cart = _get_or_create_cart(db, current_user.id)

    cart_item = (
        db.query(CartItem)
        .filter(CartItem.id == item_id, CartItem.cart_id == cart.id)
        .first()
    )
    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found",
        )

    db.delete(cart_item)
    db.commit()
    return _build_cart_response(db, cart)


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def clear_cart(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> None:
    """
    Clear all items from cart.

    Parameters
    ----------
    db : Session
        Database session.
    current_user : User
        Current authenticated user.

    """
    cart = (
        db.query(Cart)
        .filter(Cart.user_id == current_user.id)
        .first()
    )
    if cart:
        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
        db.commit()
