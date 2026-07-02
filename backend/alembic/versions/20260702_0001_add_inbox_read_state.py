"""Add read-state columns to admin inbox tables.

Revision ID: 20260702_0001
Revises: 20260701_0002
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op


revision: str = "20260702_0001"
down_revision: str | None = "20260701_0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "contact_messages",
        sa.Column("is_read", sa.Boolean(), nullable=False, server_default="0"),
    )
    op.add_column(
        "quote_requests",
        sa.Column("is_read", sa.Boolean(), nullable=False, server_default="0"),
    )


def downgrade() -> None:
    op.drop_column("quote_requests", "is_read")
    op.drop_column("contact_messages", "is_read")
