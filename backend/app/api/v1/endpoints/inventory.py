"""Inventory management endpoints (admin only)."""

from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import asc, desc, func
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_admin
from app.core.database import get_db
from app.models.product import Product, ProductImage, ProductVariant
from app.models.user import User

router = APIRouter()


class PricingUpdate(BaseModel):
    """Schema for updating product pricing."""

    price: float | None = Field(None, ge=0, description="Regular price")
    compare_at_price: float | None = Field(None, ge=0, description="Original/compare price (for showing discount)")


class StockAdjustment(BaseModel):
    """Schema for adjusting stock by a delta (+/-)."""

    quantity: int = Field(..., description="Positive to add, negative to remove")
    reason: str | None = Field(None, max_length=500)


class BulkStockUpdate(BaseModel):
    """Schema for bulk stock update."""

    product_id: int
    quantity: int = Field(..., description="Positive to add, negative to remove")


class BulkStockRequest(BaseModel):
    """Schema for bulk stock adjustment request."""

    adjustments: list[BulkStockUpdate] = Field(..., min_length=1)


class InventoryItemResponse(BaseModel):
    """Inventory item response with stock-focused fields."""

    id: int
    name: str
    sku: str
    slug: str
    price: float
    compare_at_price: float | None
    stock_quantity: int
    low_stock_threshold: int
    is_active: bool
    is_featured: bool
    category_id: int | None
    brand: str | None
    image_url: str | None
    updated_at: datetime
    variant_count: int = 0
    variants: list[dict] = []

    class Config:
        """Pydantic config."""

        from_attributes = True


class InventoryListResponse(BaseModel):
    """Paginated inventory list."""

    items: list[InventoryItemResponse]
    total: int
    page: int
    page_size: int
    pages: int
    summary: dict


class InventoryStatsResponse(BaseModel):
    """Inventory statistics."""

    total_products: int
    active_products: int
    inactive_products: int
    out_of_stock: int
    low_stock: int
    total_stock_value: float


def _get_primary_image_url(db: Session, product_id: int) -> str | None:
    """Get primary image URL for a product."""
    img = (
        db.query(ProductImage.image_url)
        .filter(
            ProductImage.product_id == product_id,
            ProductImage.is_primary.is_(True),
        )
        .first()
    )
    return img[0] if img else None


@router.get("/stats", response_model=InventoryStatsResponse)
def get_inventory_stats(
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
) -> dict:
    """
    Get inventory statistics overview.

    Parameters
    ----------
    db : Session
        Database session.
    current_admin : User
        Current admin user.

    Returns
    -------
    dict
        Inventory statistics.

    """
    total = db.query(func.count(Product.id)).scalar() or 0
    active = (
        db.query(func.count(Product.id))
        .filter(Product.is_active.is_(True))
        .scalar() or 0
    )
    out_of_stock = (
        db.query(func.count(Product.id))
        .filter(Product.stock_quantity == 0)
        .scalar() or 0
    )
    low_stock = (
        db.query(func.count(Product.id))
        .filter(
            Product.stock_quantity > 0,
            Product.stock_quantity <= Product.low_stock_threshold,
        )
        .scalar() or 0
    )
    stock_value = (
        db.query(
            func.sum(Product.price * Product.stock_quantity)
        )
        .filter(Product.is_active.is_(True))
        .scalar() or 0
    )

    return {
        "total_products": total,
        "active_products": active,
        "inactive_products": total - active,
        "out_of_stock": out_of_stock,
        "low_stock": low_stock,
        "total_stock_value": float(stock_value),
    }


@router.get("", response_model=InventoryListResponse)
def list_inventory(
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    stock_status: str | None = Query(
        None, regex="^(all|in_stock|low_stock|out_of_stock)$"
    ),
    active_status: str | None = Query(
        None, regex="^(all|active|inactive)$"
    ),
    sort_by: str = Query(
        "stock_quantity",
        regex="^(name|sku|price|stock_quantity|updated_at)$",
    ),
    sort_order: str = Query("asc", regex="^(asc|desc)$"),
) -> dict:
    """
    List all products for inventory management.

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
    search : str | None
        Search by name or SKU.
    stock_status : str | None
        Filter: all, in_stock, low_stock, out_of_stock.
    active_status : str | None
        Filter: all, active, inactive.
    sort_by : str
        Sort column.
    sort_order : str
        Sort direction.

    Returns
    -------
    dict
        Paginated inventory list with summary.

    """
    query = db.query(Product)

    if search:
        query = query.filter(
            (Product.name.ilike(f"%{search}%"))
            | (Product.sku.ilike(f"%{search}%"))
        )

    if stock_status == "out_of_stock":
        query = query.filter(Product.stock_quantity == 0)
    elif stock_status == "low_stock":
        query = query.filter(
            Product.stock_quantity > 0,
            Product.stock_quantity <= Product.low_stock_threshold,
        )
    elif stock_status == "in_stock":
        query = query.filter(
            Product.stock_quantity > Product.low_stock_threshold
        )

    if active_status == "active":
        query = query.filter(Product.is_active.is_(True))
    elif active_status == "inactive":
        query = query.filter(Product.is_active.is_(False))

    total = query.count()

    sort_column = getattr(Product, sort_by, Product.stock_quantity)
    order_func = asc if sort_order == "asc" else desc
    query = query.order_by(order_func(sort_column))

    products = query.offset((page - 1) * page_size).limit(page_size).all()
    pages = (total + page_size - 1) // page_size

    items = []
    for p in products:
        variants = (
            db.query(ProductVariant)
            .filter(ProductVariant.product_id == p.id)
            .all()
        )
        variant_info = [
            {"id": v.id, "name": v.name, "sku": v.sku, "stock_quantity": v.stock_quantity, "price": float(v.price) if v.price else None}
            for v in variants
        ]
        items.append({
            "id": p.id,
            "name": p.name,
            "sku": p.sku,
            "slug": p.slug,
            "price": float(p.price),
            "compare_at_price": float(p.compare_at_price) if p.compare_at_price else None,
            "stock_quantity": p.stock_quantity,
            "low_stock_threshold": p.low_stock_threshold,
            "is_active": p.is_active,
            "is_featured": p.is_featured,
            "category_id": p.category_id,
            "brand": p.brand,
            "image_url": _get_primary_image_url(db, p.id),
            "updated_at": p.updated_at,
            "variant_count": len(variants),
            "variants": variant_info,
        })

    all_products = db.query(Product)
    summary = {
        "total_stock_units": (
            db.query(func.sum(Product.stock_quantity)).scalar() or 0
        ),
        "low_stock_count": (
            all_products.filter(
                Product.stock_quantity > 0,
                Product.stock_quantity <= Product.low_stock_threshold,
            ).count()
        ),
        "out_of_stock_count": (
            all_products.filter(Product.stock_quantity == 0).count()
        ),
    }

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": pages,
        "summary": summary,
    }


@router.patch("/{product_id}/stock", response_model=InventoryItemResponse)
def adjust_stock(
    product_id: int,
    adjustment: StockAdjustment,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
) -> dict:
    """
    Adjust product stock by a delta (add or remove units).

    Parameters
    ----------
    product_id : int
        Product ID.
    adjustment : StockAdjustment
        Stock adjustment with quantity delta and optional reason.
    db : Session
        Database session.
    current_admin : User
        Current admin user.

    Returns
    -------
    dict
        Updated inventory item.

    Raises
    ------
    HTTPException
        If product not found or resulting stock would be negative.

    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    new_qty = product.stock_quantity + adjustment.quantity
    if new_qty < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot reduce stock below 0. Current: {product.stock_quantity}, adjustment: {adjustment.quantity}",
        )

    product.stock_quantity = new_qty
    db.commit()
    db.refresh(product)

    return {
        "id": product.id,
        "name": product.name,
        "sku": product.sku,
        "slug": product.slug,
        "price": float(product.price),
        "compare_at_price": float(product.compare_at_price) if product.compare_at_price else None,
        "stock_quantity": product.stock_quantity,
        "low_stock_threshold": product.low_stock_threshold,
        "is_active": product.is_active,
        "is_featured": product.is_featured,
        "category_id": product.category_id,
        "brand": product.brand,
        "image_url": _get_primary_image_url(db, product.id),
        "updated_at": product.updated_at,
    }


@router.patch("/{product_id}/toggle-active", response_model=InventoryItemResponse)
def toggle_product_active(
    product_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
) -> dict:
    """
    Toggle product active/inactive status.

    Parameters
    ----------
    product_id : int
        Product ID.
    db : Session
        Database session.
    current_admin : User
        Current admin user.

    Returns
    -------
    dict
        Updated inventory item.

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

    product.is_active = not product.is_active
    db.commit()
    db.refresh(product)

    return {
        "id": product.id,
        "name": product.name,
        "sku": product.sku,
        "slug": product.slug,
        "price": float(product.price),
        "compare_at_price": float(product.compare_at_price) if product.compare_at_price else None,
        "stock_quantity": product.stock_quantity,
        "low_stock_threshold": product.low_stock_threshold,
        "is_active": product.is_active,
        "is_featured": product.is_featured,
        "category_id": product.category_id,
        "brand": product.brand,
        "image_url": _get_primary_image_url(db, product.id),
        "updated_at": product.updated_at,
    }


@router.patch("/{product_id}/threshold")
def update_threshold(
    product_id: int,
    threshold: int = Query(..., ge=0),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> dict:
    """
    Update low stock threshold for a product.

    Parameters
    ----------
    product_id : int
        Product ID.
    threshold : int
        New low stock threshold.
    db : Session
        Database session.
    current_admin : User
        Current admin user.

    Returns
    -------
    dict
        Success message.

    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    product.low_stock_threshold = threshold
    db.commit()

    return {"message": f"Threshold updated to {threshold}"}


@router.patch("/{product_id}/pricing", response_model=InventoryItemResponse)
def update_pricing(
    product_id: int,
    pricing: PricingUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
) -> dict:
    """
    Update product price and/or compare-at (discount) price.

    Parameters
    ----------
    product_id : int
        Product ID.
    pricing : PricingUpdate
        New pricing data.
    db : Session
        Database session.
    current_admin : User
        Current admin user.

    Returns
    -------
    dict
        Updated inventory item.

    Raises
    ------
    HTTPException
        If product not found or compare_at_price <= price.

    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    update_data = pricing.model_dump(exclude_unset=True)

    new_price = update_data.get("price", float(product.price))
    new_compare = update_data.get("compare_at_price")

    if new_compare is not None and new_compare > 0 and new_compare <= new_price:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Compare-at price must be higher than the selling price",
        )

    if "price" in update_data:
        product.price = update_data["price"]
    if "compare_at_price" in update_data:
        product.compare_at_price = (
            update_data["compare_at_price"]
            if update_data["compare_at_price"] and update_data["compare_at_price"] > 0
            else None
        )

    db.commit()
    db.refresh(product)

    return {
        "id": product.id,
        "name": product.name,
        "sku": product.sku,
        "slug": product.slug,
        "price": float(product.price),
        "compare_at_price": float(product.compare_at_price) if product.compare_at_price else None,
        "stock_quantity": product.stock_quantity,
        "low_stock_threshold": product.low_stock_threshold,
        "is_active": product.is_active,
        "is_featured": product.is_featured,
        "category_id": product.category_id,
        "brand": product.brand,
        "image_url": _get_primary_image_url(db, product.id),
        "updated_at": product.updated_at,
    }


@router.post("/bulk-adjust")
def bulk_adjust_stock(
    request: BulkStockRequest,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
) -> dict:
    """
    Bulk adjust stock for multiple products.

    Parameters
    ----------
    request : BulkStockRequest
        List of product ID + quantity adjustments.
    db : Session
        Database session.
    current_admin : User
        Current admin user.

    Returns
    -------
    dict
        Summary of adjustments.

    """
    updated = 0
    errors = []

    for adj in request.adjustments:
        product = (
            db.query(Product)
            .filter(Product.id == adj.product_id)
            .first()
        )
        if not product:
            errors.append(f"Product {adj.product_id} not found")
            continue

        new_qty = product.stock_quantity + adj.quantity
        if new_qty < 0:
            errors.append(
                f"{product.name}: cannot go below 0 "
                f"(current: {product.stock_quantity}, adj: {adj.quantity})"
            )
            continue

        product.stock_quantity = new_qty
        updated += 1

    db.commit()

    return {
        "updated": updated,
        "errors": errors,
        "message": f"Updated {updated} products",
    }
