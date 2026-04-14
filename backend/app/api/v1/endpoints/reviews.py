"""Review management endpoints (admin)."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_admin
from app.core.database import get_db
from app.models.product import Product, ProductReview
from app.models.user import User

router = APIRouter()


@router.get("")
def list_reviews(
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    product_id: int | None = Query(None),
    min_rating: int | None = Query(None, ge=1, le=5),
    max_rating: int | None = Query(None, ge=1, le=5),
) -> dict:
    """
    List all reviews (admin only).

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
    product_id : int | None
        Filter by product.
    min_rating : int | None
        Filter by minimum rating.
    max_rating : int | None
        Filter by maximum rating.

    Returns
    -------
    dict
        Paginated review list.

    """
    query = db.query(ProductReview).order_by(desc(ProductReview.created_at))

    if product_id:
        query = query.filter(ProductReview.product_id == product_id)
    if min_rating:
        query = query.filter(ProductReview.rating >= min_rating)
    if max_rating:
        query = query.filter(ProductReview.rating <= max_rating)

    total = query.count()
    reviews = query.offset((page - 1) * page_size).limit(page_size).all()
    pages = (total + page_size - 1) // page_size

    items = []
    for r in reviews:
        product = db.query(Product).filter(Product.id == r.product_id).first()
        user = db.query(User).filter(User.id == r.user_id).first()
        items.append({
            "id": r.id,
            "product_id": r.product_id,
            "product_name": product.name if product else "Deleted",
            "user_id": r.user_id,
            "user_email": user.email if user else "Unknown",
            "user_name": f"{user.first_name} {user.last_name}" if user else "Unknown",
            "rating": r.rating,
            "title": r.title,
            "comment": r.comment,
            "verified_purchase": r.verified_purchase,
            "helpful_count": r.helpful_count,
            "created_at": r.created_at.isoformat(),
        })

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": pages,
    }


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(
    review_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
) -> None:
    """
    Delete a review (admin only).

    Parameters
    ----------
    review_id : int
        Review ID.
    db : Session
        Database session.
    current_admin : User
        Current admin user.

    Raises
    ------
    HTTPException
        If review not found.

    """
    review = db.query(ProductReview).filter(ProductReview.id == review_id).first()
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found",
        )

    product = db.query(Product).filter(Product.id == review.product_id).first()

    db.delete(review)
    db.flush()

    # Recalculate product rating
    if product:
        remaining = (
            db.query(ProductReview)
            .filter(ProductReview.product_id == product.id)
            .all()
        )
        if remaining:
            avg = sum(r.rating for r in remaining) / len(remaining)
            product.rating_average = round(avg, 2)
            product.rating_count = len(remaining)
        else:
            product.rating_average = 0
            product.rating_count = 0

    db.commit()
