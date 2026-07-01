"""Add a rating column to testimonials.

Testimonials display a 1-5 star rating on the public site. Ratings default to 5
so existing rows remain valid. No localized (*_ar/*_he/*_en) columns are touched.

Revision ID: 20260701_0002
Revises: 20260701_0001
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op


revision: str = "20260701_0002"
down_revision: str | None = "20260701_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "testimonials",
        sa.Column("rating", sa.Integer(), nullable=False, server_default="5"),
    )


def downgrade() -> None:
    op.drop_column("testimonials", "rating")
