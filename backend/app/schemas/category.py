"""Category schemas."""

from datetime import datetime

from pydantic import BaseModel, Field


class CategoryBase(BaseModel):
    """Base category schema."""

    name: str = Field(..., min_length=1, max_length=100)
    slug: str = Field(..., max_length=120)
    description: str | None = None
    image_url: str | None = Field(None, max_length=500)
    parent_id: int | None = None
    display_order: int = Field(default=0)
    is_active: bool = Field(default=True)


class CategoryCreate(CategoryBase):
    """Schema for creating a category."""

    pass


class CategoryUpdate(BaseModel):
    """Schema for updating a category."""

    name: str | None = Field(None, min_length=1, max_length=100)
    slug: str | None = Field(None, max_length=120)
    description: str | None = None
    image_url: str | None = Field(None, max_length=500)
    parent_id: int | None = None
    display_order: int | None = None
    is_active: bool | None = None


class CategoryResponse(CategoryBase):
    """Category response schema."""

    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic config."""

        from_attributes = True


class CategoryTree(CategoryResponse):
    """Category with children (tree structure)."""

    children: list["CategoryTree"] = []

    class Config:
        """Pydantic config."""

        from_attributes = True
