"""Add tracking fields to orders.

Revision ID: 5a_add_tracking
Revises: 4a_add_wishlist
Create Date: 2026-04-14

"""
from alembic import op
import sqlalchemy as sa

revision = "5a_add_tracking"
down_revision = "4a_add_wishlist"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add tracking_number and carrier to orders table."""
    op.add_column("orders", sa.Column("tracking_number", sa.String(255), nullable=True))
    op.add_column("orders", sa.Column("carrier", sa.String(100), nullable=True))


def downgrade() -> None:
    """Remove tracking fields."""
    op.drop_column("orders", "carrier")
    op.drop_column("orders", "tracking_number")
