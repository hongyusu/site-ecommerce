"""Product endpoints."""

from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import asc, desc
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_admin, get_current_user, get_optional_user
from app.core.database import get_db
from app.models.category import Category
from app.models.product import Product, ProductReview
from app.models.user import User
from app.schemas.product import (
    ProductCreate,
    ProductListResponse,
    ProductResponse,
    ProductReviewCreate,
    ProductReviewListResponse,
    ProductReviewResponse,
    ProductUpdate,
)
from app.utils.translations import apply_translations_to_product

router = APIRouter()


@router.get("/autocomplete")
def autocomplete_products(
    q: str = Query("", min_length=1),
    db: Session = Depends(get_db),
) -> list[dict]:
    """Return top 6 product matches for search autocomplete."""
    if not q.strip():
        return []
    products = (
        db.query(Product)
        .filter(Product.is_active.is_(True), Product.name.ilike(f"%{q}%"))
        .order_by(Product.name)
        .limit(6)
        .all()
    )
    results = []
    for p in products:
        img = (
            db.query(ProductImage)
            .filter(ProductImage.product_id == p.id, ProductImage.is_primary.is_(True))
            .first()
        )
        results.append({
            "id": p.id,
            "name": p.name,
            "slug": p.slug,
            "price": float(p.price),
            "image_url": img.image_url if img else None,
        })
    return results


@router.get("", response_model=ProductListResponse)
def list_products(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User | None, Depends(get_optional_user)],
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category_id: int | None = Query(None),
    is_featured: bool | None = Query(None),
    is_deal: bool | None = Query(None),
    search: str | None = Query(None),
    sort_by: str = Query("created_at", regex="^(price|name|rating_average|created_at)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    min_price: Decimal | None = Query(None, ge=0),
    max_price: Decimal | None = Query(None, ge=0),
    in_stock: bool | None = Query(None),
    locale: str = Query("en", regex="^(en|fi|sv|zh)$"),
) -> dict[str, list[Product] | int]:
    """
    List products with pagination and filters.

    Parameters
    ----------
    db : Session
        Database session.
    current_user : User | None
        Optional current user.
    page : int
        Page number (1-indexed).
    page_size : int
        Number of items per page.
    category_id : int | None
        Filter by category ID.
    is_featured : bool | None
        Filter by featured products.
    is_deal : bool | None
        Filter by deal products.
    search : str | None
        Search by product name.
    locale : str
        Language code for translations (en, fi, sv).

    Returns
    -------
    dict[str, list[Product] | int]
        Paginated list of products.

    """
    query = db.query(Product).filter(Product.is_active.is_(True))

    # Apply filters
    if category_id:
        # Get all subcategories of the selected category
        subcategory_ids = db.query(Category.id).filter(Category.parent_id == category_id).all()
        subcategory_ids = [subcat_id for (subcat_id,) in subcategory_ids]

        # Include both the parent category and all its subcategories
        category_ids = [category_id] + subcategory_ids
        query = query.filter(Product.category_id.in_(category_ids))
    if is_featured is not None:
        query = query.filter(Product.is_featured.is_(is_featured))
    if is_deal is not None:
        query = query.filter(Product.is_deal.is_(is_deal))
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    if in_stock is True:
        query = query.filter(Product.stock_quantity > 0)
    elif in_stock is False:
        query = query.filter(Product.stock_quantity == 0)

    # Count total
    total = query.count()

    # Sort
    sort_column = getattr(Product, sort_by, Product.created_at)
    order_func = asc if sort_order == "asc" else desc
    query = query.order_by(order_func(sort_column))

    # Paginate
    offset = (page - 1) * page_size
    products = query.offset(offset).limit(page_size).all()

    # Apply translations to each product
    for product in products:
        apply_translations_to_product(product, locale)

    return {
        "items": products,
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": (total + page_size - 1) // page_size,
    }


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User | None, Depends(get_optional_user)],
    locale: str = Query("en", regex="^(en|fi|sv|zh)$"),
) -> Product:
    """
    Get product by ID.

    Parameters
    ----------
    product_id : int
        Product ID.
    db : Session
        Database session.
    current_user : User | None
        Optional current user.
    locale : str
        Language code for translations (en, fi, sv).

    Returns
    -------
    Product
        Product details.

    Raises
    ------
    HTTPException
        If product not found.

    """
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    # Apply translations
    apply_translations_to_product(product, locale)

    return product


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product_data: ProductCreate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
) -> Product:
    """
    Create a new product (admin only).

    Parameters
    ----------
    product_data : ProductCreate
        Product data.
    db : Session
        Database session.
    current_admin : User
        Current admin user.

    Returns
    -------
    Product
        Created product.

    Raises
    ------
    HTTPException
        If SKU or slug already exists.

    """
    # Check if SKU or slug already exists
    existing_product = (
        db.query(Product)
        .filter((Product.sku == product_data.sku) | (Product.slug == product_data.slug))
        .first()
    )

    if existing_product:
        if existing_product.sku == product_data.sku:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Product with this SKU already exists",
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Product with this slug already exists",
            )

    # Create product
    new_product = Product(**product_data.model_dump())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product


@router.patch("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
) -> Product:
    """
    Update product (admin only).

    Parameters
    ----------
    product_id : int
        Product ID.
    product_data : ProductUpdate
        Product update data.
    db : Session
        Database session.
    current_admin : User
        Current admin user.

    Returns
    -------
    Product
        Updated product.

    Raises
    ------
    HTTPException
        If product not found or slug already exists.

    """
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    # Check if slug already exists (if being updated)
    if product_data.slug and product_data.slug != product.slug:
        existing_slug = (
            db.query(Product).filter(Product.slug == product_data.slug, Product.id != product_id).first()
        )
        if existing_slug:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Product with this slug already exists",
            )

    # Update product
    update_data = product_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)

    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
) -> None:
    """
    Delete product (admin only).

    Parameters
    ----------
    product_id : int
        Product ID.
    db : Session
        Database session.
    current_admin : User
        Current admin user.

    Raises
    ------
    HTTPException
        If product not found.

    """
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    db.delete(product)
    db.commit()


@router.get("/{product_id}/reviews", response_model=ProductReviewListResponse)
def list_product_reviews(
    product_id: int,
    db: Annotated[Session, Depends(get_db)],
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
) -> dict:
    """
    List reviews for a product with pagination.

    Parameters
    ----------
    product_id : int
        Product ID.
    db : Session
        Database session.
    page : int
        Page number (1-indexed).
    page_size : int
        Number of items per page.

    Returns
    -------
    dict
        Paginated list of reviews with rating statistics.

    Raises
    ------
    HTTPException
        If product not found.

    """
    # Check if product exists
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    # Get reviews
    query = db.query(ProductReview).filter(ProductReview.product_id == product_id)
    total = query.count()

    # Paginate
    offset = (page - 1) * page_size
    reviews = query.order_by(ProductReview.created_at.desc()).offset(offset).limit(page_size).all()

    # Calculate rating distribution
    rating_distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    all_reviews = db.query(ProductReview).filter(ProductReview.product_id == product_id).all()
    for review in all_reviews:
        rating_distribution[review.rating] += 1

    return {
        "items": reviews,
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": (total + page_size - 1) // page_size,
        "average_rating": product.rating_average or 0,
        "rating_distribution": rating_distribution,
    }


@router.post("/{product_id}/reviews", response_model=ProductReviewResponse, status_code=status.HTTP_201_CREATED)
def create_product_review(
    product_id: int,
    review_data: ProductReviewCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> ProductReview:
    """
    Create a new review for a product (authenticated users only).

    Parameters
    ----------
    product_id : int
        Product ID.
    review_data : ProductReviewCreate
        Review data.
    db : Session
        Database session.
    current_user : User
        Current authenticated user.

    Returns
    -------
    ProductReview
        Created review.

    Raises
    ------
    HTTPException
        If product not found or user already reviewed.

    """
    # Check if product exists
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    # Check if user already reviewed this product
    existing_review = (
        db.query(ProductReview)
        .filter(ProductReview.product_id == product_id, ProductReview.user_id == current_user.id)
        .first()
    )
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this product",
        )

    # Create review
    new_review = ProductReview(
        product_id=product_id,
        user_id=current_user.id,
        **review_data.model_dump(),
    )
    db.add(new_review)

    # Update product rating
    all_reviews = db.query(ProductReview).filter(ProductReview.product_id == product_id).all()
    total_rating = sum(r.rating for r in all_reviews) + review_data.rating
    review_count = len(all_reviews) + 1
    product.rating_average = total_rating / review_count
    product.rating_count = review_count

    db.commit()
    db.refresh(new_review)

    return new_review
