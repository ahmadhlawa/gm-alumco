"""Drop the products table.

The Products module was removed from the product entirely (the site is a
corporate portfolio without a products catalog). This migration safely drops
the ``products`` table. The downgrade recreates it with its original schema so
the change remains reversible. The table has no foreign keys or indexes.

Revision ID: 20260629_0001
Revises: 20260628_0001
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op


revision: str = "20260629_0001"
down_revision: str | None = "20260628_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.drop_table("products")


def downgrade() -> None:
    op.create_table(
        "products",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title_ar", sa.String(255), nullable=False),
        sa.Column("title_en", sa.String(255), nullable=False),
        sa.Column("title_he", sa.String(255), nullable=False),
        sa.Column("description_ar", sa.String(2000), nullable=True),
        sa.Column("description_en", sa.String(2000), nullable=True),
        sa.Column("description_he", sa.String(2000), nullable=True),
        sa.Column("image_url", sa.String(500), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
