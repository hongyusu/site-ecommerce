"""Add wishlist table.

Revision ID: 4a_add_wishlist
Revises: 18dad5557ec7
Create Date: 2026-04-14

"""
from alembic import op
import sqlalchemy as sa

revision = "4a_add_wishlist"
down_revision = "18dad5557ec7"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create wishlist_items table."""
    op.create_table(
        "wishlist_items",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "product_id", name="uq_wishlist_user_product"),
    )
    op.create_index("ix_wishlist_items_id", "wishlist_items", ["id"])
    op.create_index("ix_wishlist_items_user_id", "wishlist_items", ["user_id"])
    op.create_index("ix_wishlist_items_product_id", "wishlist_items", ["product_id"])


def downgrade() -> None:
    """Drop wishlist_items table."""
    op.drop_table("wishlist_items")
