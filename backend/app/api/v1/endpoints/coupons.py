"""Coupon endpoints."""

from datetime import datetime, timezone
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_admin, get_current_user
from app.core.database import get_db
from app.models.coupon import Coupon, DiscountType
from app.models.user import User
from app.schemas.coupon import (
    CouponCreate,
    CouponResponse,
    CouponUpdate,
    CouponValidateRequest,
    CouponValidateResponse,
)

router = APIRouter()


@router.post("/validate", response_model=CouponValidateResponse)
def validate_coupon(
    request: CouponValidateRequest,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict:
    """
    Validate a coupon code against a subtotal.

    Parameters
    ----------
    request : CouponValidateRequest
        Coupon code and cart subtotal.
    db : Session
        Database session.
    current_user : User
        Current authenticated user.

    Returns
    -------
    dict
        Validation result with discount amount.

    """
    coupon = (
        db.query(Coupon)
        .filter(Coupon.code == request.code.upper())
        .first()
    )
    if not coupon:
        return {
            "valid": False, "code": request.code, "discount_type": "",
            "discount_value": Decimal("0"), "discount_amount": Decimal("0"),
            "free_shipping": False, "message": "Invalid coupon code",
        }

    now = datetime.now(timezone.utc)

    if not coupon.is_active:
        return {
            "valid": False, "code": request.code, "discount_type": "",
            "discount_value": Decimal("0"), "discount_amount": Decimal("0"),
            "free_shipping": False, "message": "This coupon is no longer active",
        }

    if coupon.valid_from.replace(tzinfo=timezone.utc) > now:
        return {
            "valid": False, "code": request.code, "discount_type": "",
            "discount_value": Decimal("0"), "discount_amount": Decimal("0"),
            "free_shipping": False, "message": "This coupon is not yet valid",
        }

    if coupon.valid_until and coupon.valid_until.replace(tzinfo=timezone.utc) < now:
        return {
            "valid": False, "code": request.code, "discount_type": "",
            "discount_value": Decimal("0"), "discount_amount": Decimal("0"),
            "free_shipping": False, "message": "This coupon has expired",
        }

    if coupon.max_uses and coupon.used_count >= coupon.max_uses:
        return {
            "valid": False, "code": request.code, "discount_type": "",
            "discount_value": Decimal("0"), "discount_amount": Decimal("0"),
            "free_shipping": False, "message": "This coupon has reached its usage limit",
        }

    if (
        coupon.min_purchase_amount
        and request.subtotal < coupon.min_purchase_amount
    ):
        return {
            "valid": False, "code": request.code, "discount_type": "",
            "discount_value": Decimal("0"), "discount_amount": Decimal("0"),
            "free_shipping": False,
            "message": f"Minimum purchase of EUR {coupon.min_purchase_amount} required",
        }

    # Calculate discount
    discount_amount = Decimal("0")
    free_shipping = False

    if coupon.discount_type == DiscountType.PERCENTAGE:
        discount_amount = (
            request.subtotal * coupon.discount_value / Decimal("100")
        ).quantize(Decimal("0.01"))
    elif coupon.discount_type == DiscountType.FIXED_AMOUNT:
        discount_amount = min(coupon.discount_value, request.subtotal)
    elif coupon.discount_type == DiscountType.FREE_SHIPPING:
        free_shipping = True

    return {
        "valid": True,
        "code": coupon.code,
        "discount_type": coupon.discount_type.value,
        "discount_value": coupon.discount_value,
        "discount_amount": discount_amount,
        "free_shipping": free_shipping,
        "message": coupon.description or "Coupon applied!",
    }


@router.get("", response_model=list[CouponResponse])
def list_coupons(
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
) -> list[Coupon]:
    """List all coupons (admin only)."""
    return db.query(Coupon).order_by(Coupon.created_at.desc()).all()


@router.post(
    "", response_model=CouponResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_coupon(
    coupon_data: CouponCreate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
) -> Coupon:
    """Create a new coupon (admin only)."""
    existing = (
        db.query(Coupon)
        .filter(Coupon.code == coupon_data.code.upper())
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Coupon code already exists",
        )

    data = coupon_data.model_dump()
    data["code"] = data["code"].upper()
    data["discount_type"] = DiscountType(data["discount_type"])
    coupon = Coupon(**data)
    db.add(coupon)
    db.commit()
    db.refresh(coupon)
    return coupon


@router.patch("/{coupon_id}", response_model=CouponResponse)
def update_coupon(
    coupon_id: int,
    coupon_data: CouponUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
) -> Coupon:
    """Update a coupon (admin only)."""
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coupon not found",
        )

    update_data = coupon_data.model_dump(exclude_unset=True)
    if "discount_type" in update_data:
        update_data["discount_type"] = DiscountType(update_data["discount_type"])

    for field, value in update_data.items():
        setattr(coupon, field, value)

    db.commit()
    db.refresh(coupon)
    return coupon


@router.delete("/{coupon_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_coupon(
    coupon_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
) -> None:
    """Delete a coupon (admin only)."""
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coupon not found",
        )
    db.delete(coupon)
    db.commit()
