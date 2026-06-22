"""Align operational admin fields and enum values.

Revision ID: 20260622_0001
Revises: 20260620_0001
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op


revision: str = "20260622_0001"
down_revision: str | None = "20260620_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("services", sa.Column("starting_price", sa.Numeric(12, 2), nullable=True))
    with op.batch_alter_table("quote_requests") as batch_op:
        batch_op.alter_column("email", existing_type=sa.String(255), nullable=True)

    op.execute("UPDATE projects SET category = 'LOCAL' WHERE category = 'local'")
    op.execute("UPDATE projects SET category = 'INTERNATIONAL' WHERE category = 'abroad'")
    op.execute("UPDATE projects SET category = 'FEATURED' WHERE category = 'featured'")
    op.execute("UPDATE contact_messages SET status = UPPER(status)")
    op.execute("UPDATE quote_requests SET status = 'DONE' WHERE status = 'completed'")
    op.execute("UPDATE quote_requests SET status = UPPER(status) WHERE status <> 'DONE'")


def downgrade() -> None:
    op.execute("UPDATE projects SET category = 'local' WHERE category = 'LOCAL'")
    op.execute("UPDATE projects SET category = 'abroad' WHERE category = 'INTERNATIONAL'")
    op.execute("UPDATE projects SET category = 'featured' WHERE category = 'FEATURED'")
    op.execute("UPDATE contact_messages SET status = LOWER(status)")
    op.execute("UPDATE quote_requests SET status = 'completed' WHERE status = 'DONE'")
    op.execute("UPDATE quote_requests SET status = LOWER(status) WHERE status <> 'completed'")

    with op.batch_alter_table("quote_requests") as batch_op:
        batch_op.alter_column("email", existing_type=sa.String(255), nullable=False)
    op.drop_column("services", "starting_price")
