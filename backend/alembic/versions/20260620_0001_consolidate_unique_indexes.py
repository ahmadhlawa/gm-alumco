"""Consolidate redundant unique+named-index pairs into single unique named indexes.

The initial migration created both a UniqueConstraint (MySQL index named after the column)
and a separate non-unique named index on the same column for admins.email and
site_settings.key. This left two indexes per column while SQLAlchemy autogenerate
expects one unified unique named index, causing `alembic check` to report drift.

This migration drops the redundant pair and recreates each as a single unique named index.

Revision ID: 20260620_0001
Revises: 20260612_0001
Create Date: 2026-06-20
"""

from collections.abc import Sequence

from alembic import op


revision: str = "20260620_0001"
down_revision: str | None = "20260612_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # admins.email: drop non-unique ix_admins_email and the unnamed unique constraint
    # index 'email', then create one unified unique named index.
    op.drop_index("ix_admins_email", table_name="admins")
    op.drop_index("email", table_name="admins")
    op.create_index("ix_admins_email", "admins", ["email"], unique=True)

    # site_settings.key: same pattern.
    op.drop_index("ix_site_settings_key", table_name="site_settings")
    op.drop_index("key", table_name="site_settings")
    op.create_index("ix_site_settings_key", "site_settings", ["key"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_admins_email", table_name="admins")
    op.create_index("email", "admins", ["email"], unique=True)
    op.create_index("ix_admins_email", "admins", ["email"])

    op.drop_index("ix_site_settings_key", table_name="site_settings")
    op.create_index("key", "site_settings", ["key"], unique=True)
    op.create_index("ix_site_settings_key", "site_settings", ["key"])
