"""Category endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_admin, get_optional_user
from app.core.database import get_db
from app.models.category import Category
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate
from app.utils.translations import apply_translations_to_category

router = APIRouter()


@router.get("", response_model=list[CategoryResponse])
def list_categories(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User | None, Depends(get_optional_user)],
    locale: str = Query("en", regex="^(en|fi|sv|zh)$"),
) -> list[Category]:
    """
    List all active categories.

    Parameters
    ----------
    db : Session
        Database session.
    current_user : User | None
        Optional current user.
    locale : str
        Language code for translations (en, fi, sv).

    Returns
    -------
    list[Category]
        List of categories.

    """
    categories = db.query(Category).filter(Category.is_active.is_(True)).order_by(Category.display_order).all()

    # Apply translations to each category
    for category in categories:
        apply_translations_to_category(category, locale)

    return categories


@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(
    category_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User | None, Depends(get_optional_user)],
    locale: str = Query("en", regex="^(en|fi|sv|zh)$"),
) -> Category:
    """
    Get category by ID.

    Parameters
    ----------
    category_id : int
        Category ID.
    db : Session
        Database session.
    current_user : User | None
        Optional current user.
    locale : str
        Language code for translations (en, fi, sv).

    Returns
    -------
    Category
        Category details.

    Raises
    ------
    HTTPException
        If category not found.

    """
    category = db.query(Category).filter(Category.id == category_id).first()

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    # Apply translations
    apply_translations_to_category(category, locale)

    return category


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    category_data: CategoryCreate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
) -> Category:
    """
    Create a new category (admin only).

    Parameters
    ----------
    category_data : CategoryCreate
        Category data.
    db : Session
        Database session.
    current_admin : User
        Current admin user.

    Returns
    -------
    Category
        Created category.

    Raises
    ------
    HTTPException
        If slug already exists.

    """
    # Check if slug already exists
    existing_category = db.query(Category).filter(Category.slug == category_data.slug).first()

    if existing_category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this slug already exists",
        )

    # Create category
    new_category = Category(**category_data.model_dump())
    db.add(new_category)
    db.commit()
    db.refresh(new_category)

    return new_category


@router.patch("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    category_data: CategoryUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
) -> Category:
    """
    Update category (admin only).

    Parameters
    ----------
    category_id : int
        Category ID.
    category_data : CategoryUpdate
        Category update data.
    db : Session
        Database session.
    current_admin : User
        Current admin user.

    Returns
    -------
    Category
        Updated category.

    Raises
    ------
    HTTPException
        If category not found or slug already exists.

    """
    category = db.query(Category).filter(Category.id == category_id).first()

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    # Check if slug already exists (if being updated)
    if category_data.slug and category_data.slug != category.slug:
        existing_slug = (
            db.query(Category)
            .filter(Category.slug == category_data.slug, Category.id != category_id)
            .first()
        )
        if existing_slug:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category with this slug already exists",
            )

    # Update category
    update_data = category_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(category, field, value)

    db.commit()
    db.refresh(category)

    return category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
) -> None:
    """
    Delete category (admin only).

    Parameters
    ----------
    category_id : int
        Category ID.
    db : Session
        Database session.
    current_admin : User
        Current admin user.

    Raises
    ------
    HTTPException
        If category not found.

    """
    category = db.query(Category).filter(Category.id == category_id).first()

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    db.delete(category)
    db.commit()
