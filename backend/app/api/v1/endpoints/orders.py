"""Order endpoints."""

import random
import time
from datetime import datetime
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_admin, get_current_user
from app.core.database import get_db
from app.models.address import Address
from app.models.cart import Cart, CartItem
from app.models.coupon import Coupon, DiscountType
from app.models.order import Order, OrderItem, OrderStatus, PaymentStatus
from app.models.product import Product
from app.models.user import User
from app.schemas.order import (
    OrderCreateFromCart,
    OrderListResponse,
    OrderResponse,
    OrderUpdate,
)
from app.services.email import send_order_confirmation_email

router = APIRouter()

TAX_RATE = Decimal("0.24")
FREE_SHIPPING_THRESHOLD = Decimal("100.00")
SHIPPING_COST = Decimal("5.90")


def _generate_order_number() -> str:
    """Generate a unique order number."""
    ts = int(time.time()) % 1000000
    rand = random.randint(1000, 9999)
    return f"ORD-{ts}-{rand}"


@router.post(
    "", response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_order(
    order_data: OrderCreateFromCart,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> Order:
    """
    Create an order from the user's cart.

    Parameters
    ----------
    order_data : OrderCreateFromCart
        Order creation data with address_id.
    db : Session
        Database session.
    current_user : User
        Current authenticated user.

    Returns
    -------
    Order
        Created order.

    Raises
    ------
    HTTPException
        If cart is empty, address not found, or insufficient stock.

    """
    cart = (
        db.query(Cart)
        .filter(Cart.user_id == current_user.id)
        .first()
    )
    cart_items = (
        db.query(CartItem).filter(CartItem.cart_id == cart.id).all()
        if cart else []
    )
    if not cart_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty",
        )

    address = (
        db.query(Address)
        .filter(
            Address.id == order_data.address_id,
            Address.user_id == current_user.id,
        )
        .first()
    )
    if not address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found",
        )

    subtotal = Decimal("0.00")
    order_items_data = []

    for ci in cart_items:
        product = db.query(Product).filter(Product.id == ci.product_id).first()
        if not product or not product.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product '{ci.product_id}' is not available",
            )
        if ci.quantity > product.stock_quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for '{product.name}'",
            )

        unit_price = product.price
        line_total = unit_price * ci.quantity
        subtotal += line_total

        order_items_data.append({
            "product_id": product.id,
            "variant_id": ci.variant_id,
            "product_name": product.name,
            "product_sku": product.sku,
            "variant_name": None,
            "unit_price": unit_price,
            "quantity": ci.quantity,
            "total_price": line_total,
        })

    tax_amount = (subtotal * TAX_RATE).quantize(Decimal("0.01"))
    shipping_cost = (
        Decimal("0.00") if subtotal >= FREE_SHIPPING_THRESHOLD
        else SHIPPING_COST
    )
    # Apply coupon if provided
    discount_amount = Decimal("0.00")
    if order_data.coupon_code:
        coupon = (
            db.query(Coupon)
            .filter(Coupon.code == order_data.coupon_code.upper())
            .first()
        )
        if coupon and coupon.is_active:
            from datetime import timezone as tz
            now = datetime.now(tz.utc)
            valid = True
            if coupon.valid_from.replace(tzinfo=tz.utc) > now:
                valid = False
            if coupon.valid_until and coupon.valid_until.replace(tzinfo=tz.utc) < now:
                valid = False
            if coupon.max_uses and coupon.used_count >= coupon.max_uses:
                valid = False
            if coupon.min_purchase_amount and subtotal < coupon.min_purchase_amount:
                valid = False

            if valid:
                if coupon.discount_type == DiscountType.PERCENTAGE:
                    discount_amount = (
                        subtotal * coupon.discount_value / Decimal("100")
                    ).quantize(Decimal("0.01"))
                elif coupon.discount_type == DiscountType.FIXED_AMOUNT:
                    discount_amount = min(coupon.discount_value, subtotal)
                elif coupon.discount_type == DiscountType.FREE_SHIPPING:
                    shipping_cost = Decimal("0.00")

                coupon.used_count += 1

    total = subtotal + tax_amount + shipping_cost - discount_amount

    order = Order(
        user_id=current_user.id,
        order_number=_generate_order_number(),
        status=OrderStatus.CONFIRMED,
        payment_status=PaymentStatus.PAID,
        subtotal=subtotal,
        tax_amount=tax_amount,
        shipping_cost=shipping_cost,
        discount_amount=discount_amount,
        total=total,
        payment_method=order_data.payment_method,
        shipping_name=address.full_name,
        shipping_address_line1=address.address_line1,
        shipping_address_line2=address.address_line2,
        shipping_city=address.city,
        shipping_postal_code=address.postal_code,
        shipping_country=address.country,
        shipping_phone=address.phone,
        customer_notes=order_data.customer_notes,
        paid_at=datetime.utcnow(),
    )
    db.add(order)
    db.flush()

    for item_data in order_items_data:
        order_item = OrderItem(order_id=order.id, **item_data)
        db.add(order_item)
        product = (
            db.query(Product)
            .filter(Product.id == item_data["product_id"])
            .first()
        )
        if product:
            product.stock_quantity -= item_data["quantity"]

    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
    db.commit()
    db.refresh(order)

    # Send confirmation email
    send_order_confirmation_email(
        to=current_user.email,
        name=current_user.first_name,
        order_number=order.order_number,
        total=str(order.total),
    )

    return order


@router.get("/track")
def track_order(
    order_number: str = Query(...),
    email: str = Query(...),
    db: Session = Depends(get_db),
) -> dict:
    """Public order tracking by order number and email."""
    from app.models.user import User as UserModel
    order = (
        db.query(Order)
        .filter(Order.order_number == order_number)
        .first()
    )
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    user = db.query(UserModel).filter(UserModel.id == order.user_id).first()
    if not user or user.email.lower() != email.lower():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    return {
        "order_number": order.order_number,
        "status": order.status.value,
        "payment_status": order.payment_status.value,
        "total": float(order.total),
        "tracking_number": order.tracking_number,
        "carrier": order.carrier,
        "created_at": order.created_at.isoformat(),
        "shipped_at": order.shipped_at.isoformat() if order.shipped_at else None,
        "delivered_at": order.delivered_at.isoformat() if order.delivered_at else None,
        "items": [
            {
                "product_name": item.product_name,
                "quantity": item.quantity,
                "total_price": float(item.total_price),
            }
            for item in order.items
        ],
    }


@router.get("", response_model=OrderListResponse)
def list_orders(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
) -> dict:
    """
    List current user's orders.

    Parameters
    ----------
    db : Session
        Database session.
    current_user : User
        Current authenticated user.
    page : int
        Page number.
    page_size : int
        Items per page.

    Returns
    -------
    dict
        Paginated order list.

    """
    query = (
        db.query(Order)
        .filter(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
    )
    total = query.count()
    orders = query.offset((page - 1) * page_size).limit(page_size).all()
    pages = (total + page_size - 1) // page_size

    return {
        "items": orders,
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": pages,
    }


@router.get("/admin", response_model=OrderListResponse)
def list_all_orders(
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    order_status: str | None = Query(None),
) -> dict:
    """
    List all orders (admin only).

    Parameters
    ----------
    db : Session
        Database session.
    current_admin : User
        Current admin user.
    page : int
        Page number.
    page_size : int
        Items per page.
    order_status : str | None
        Filter by order status.

    Returns
    -------
    dict
        Paginated order list.

    """
    query = db.query(Order).order_by(Order.created_at.desc())

    if order_status:
        try:
            status_enum = OrderStatus(order_status)
            query = query.filter(Order.status == status_enum)
        except ValueError:
            pass

    total = query.count()
    orders = query.offset((page - 1) * page_size).limit(page_size).all()
    pages = (total + page_size - 1) // page_size

    return {
        "items": orders,
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": pages,
    }


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> Order:
    """
    Get order details.

    Parameters
    ----------
    order_id : int
        Order ID.
    db : Session
        Database session.
    current_user : User
        Current authenticated user.

    Returns
    -------
    Order
        Order details.

    Raises
    ------
    HTTPException
        If order not found.

    """
    order = (
        db.query(Order)
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )
    from app.models.user import UserRole
    if (
        order.user_id != current_user.id
        and current_user.role != UserRole.ADMIN
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )
    return order


@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    order_data: OrderUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
) -> Order:
    """
    Update order status (admin only).

    Parameters
    ----------
    order_id : int
        Order ID.
    order_data : OrderUpdate
        Status update data.
    db : Session
        Database session.
    current_admin : User
        Current admin user.

    Returns
    -------
    Order
        Updated order.

    Raises
    ------
    HTTPException
        If order not found.

    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    update_data = order_data.model_dump(exclude_unset=True)

    if "status" in update_data:
        try:
            order.status = OrderStatus(update_data["status"])
            if order.status == OrderStatus.SHIPPED:
                order.shipped_at = datetime.utcnow()
            elif order.status == OrderStatus.DELIVERED:
                order.delivered_at = datetime.utcnow()
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid order status",
            )

    if "payment_status" in update_data:
        try:
            order.payment_status = PaymentStatus(update_data["payment_status"])
            if order.payment_status == PaymentStatus.PAID:
                order.paid_at = datetime.utcnow()
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid payment status",
            )

    if "admin_notes" in update_data:
        order.admin_notes = update_data["admin_notes"]
    if "payment_method" in update_data:
        order.payment_method = update_data["payment_method"]
    if "payment_reference" in update_data:
        order.payment_reference = update_data["payment_reference"]
    if "tracking_number" in update_data:
        order.tracking_number = update_data["tracking_number"]
    if "carrier" in update_data:
        order.carrier = update_data["carrier"]

    db.commit()
    db.refresh(order)
    return order
