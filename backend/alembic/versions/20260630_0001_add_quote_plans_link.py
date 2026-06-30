"""Add a plans_link text column to quote_requests.

Quote requests may include a single optional link (e.g. a Google Drive /
cloud folder) pointing to the customer's plans, drawings or related files.
Only the link string is stored — no files are uploaded or kept in the database.

Revision ID: 20260630_0001
Revises: 20260629_0001
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op


revision: str = "20260630_0001"
down_revision: str | None = "20260629_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "quote_requests",
        sa.Column("plans_link", sa.String(1000), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("quote_requests", "plans_link")
