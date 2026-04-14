"""Admin management endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_admin
from app.core.database import get_db
from app.models.order import Order
from app.models.user import User
from app.models.product import Product

router = APIRouter()


@router.get("/users")
def list_users(
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    role: str | None = Query(None),
) -> dict:
    """List all users (admin only)."""
    query = db.query(User).order_by(desc(User.created_at))

    if search:
        query = query.filter(
            (User.email.ilike(f"%{search}%"))
            | (User.first_name.ilike(f"%{search}%"))
            | (User.last_name.ilike(f"%{search}%"))
        )
    if role:
        query = query.filter(User.role == role)

    total = query.count()
    users = query.offset((page - 1) * page_size).limit(page_size).all()
    pages = (total + page_size - 1) // page_size

    items = []
    for u in users:
        order_count = db.query(func.count(Order.id)).filter(Order.user_id == u.id).scalar() or 0
        items.append({
            "id": u.id,
            "email": u.email,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "role": u.role.value if hasattr(u.role, 'value') else str(u.role),
            "is_active": u.is_active,
            "is_verified": u.is_verified,
            "preferred_language": u.preferred_language,
            "phone": u.phone,
            "order_count": order_count,
            "created_at": u.created_at.isoformat(),
            "last_login": u.last_login.isoformat() if u.last_login else None,
        })

    return {"items": items, "total": total, "page": page, "page_size": page_size, "pages": pages}


@router.patch("/users/{user_id}/toggle-active")
def toggle_user_active(
    user_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
) -> dict:
    """Toggle user active/inactive (admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.id == current_admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot deactivate yourself")

    user.is_active = not user.is_active
    db.commit()
    return {"id": user.id, "is_active": user.is_active}


@router.get("/analytics")
def get_analytics(
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
) -> dict:
    """Get analytics data (admin only)."""
    from app.models.order import OrderStatus, PaymentStatus
    from decimal import Decimal
    from datetime import datetime, timedelta, timezone

    now = datetime.now(timezone.utc)
    thirty_days_ago = now - timedelta(days=30)
    seven_days_ago = now - timedelta(days=7)

    total_revenue = (
        db.query(func.sum(Order.total))
        .filter(Order.payment_status == PaymentStatus.PAID)
        .scalar() or Decimal("0")
    )
    revenue_30d = (
        db.query(func.sum(Order.total))
        .filter(Order.payment_status == PaymentStatus.PAID, Order.created_at >= thirty_days_ago)
        .scalar() or Decimal("0")
    )
    revenue_7d = (
        db.query(func.sum(Order.total))
        .filter(Order.payment_status == PaymentStatus.PAID, Order.created_at >= seven_days_ago)
        .scalar() or Decimal("0")
    )

    total_orders = db.query(func.count(Order.id)).scalar() or 0
    orders_30d = (
        db.query(func.count(Order.id))
        .filter(Order.created_at >= thirty_days_ago)
        .scalar() or 0
    )
    from app.models.user import UserRole
    total_customers = db.query(func.count(User.id)).filter(User.role == UserRole.CUSTOMER).scalar() or 0
    total_products = db.query(func.count(Product.id)).filter(Product.is_active.is_(True)).scalar() or 0

    # Top products by order count
    from app.models.order import OrderItem
    top_products_raw = (
        db.query(
            OrderItem.product_name,
            func.sum(OrderItem.quantity).label("total_qty"),
            func.sum(OrderItem.total_price).label("total_revenue"),
        )
        .group_by(OrderItem.product_name)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(10)
        .all()
    )
    top_products = [
        {"name": r[0], "quantity": int(r[1]), "revenue": float(r[2])}
        for r in top_products_raw
    ]

    # Orders by status
    status_counts_raw = (
        db.query(Order.status, func.count(Order.id))
        .group_by(Order.status)
        .all()
    )
    status_counts = {
        s.value if hasattr(s, 'value') else str(s): c
        for s, c in status_counts_raw
    }

    return {
        "total_revenue": float(total_revenue),
        "revenue_30d": float(revenue_30d),
        "revenue_7d": float(revenue_7d),
        "total_orders": total_orders,
        "orders_30d": orders_30d,
        "total_customers": total_customers,
        "total_products": total_products,
        "top_products": top_products,
        "order_status_counts": status_counts,
        "avg_order_value": float(total_revenue / total_orders) if total_orders > 0 else 0,
    }
