"""Drop Arabic (*_ar) localized content columns.

Production supports Hebrew + English only. Arabic was development-only and is
now removed from the schema. This migration drops ONLY the Arabic-specific
localized content columns; it does not drop any table and leaves every Hebrew
(*_he) and English (*_en) column untouched. Auth / admin / audit / upload and
all non-localized columns are not affected.

Columns dropped (6 tables, 11 columns):
  projects:        title_ar, description_ar
  project_images:  alt_text_ar
  services:        title_ar, description_ar
  partners:        name_ar
  gallery_images:  title_ar, alt_text_ar
  testimonials:    client_name_ar, message_ar, client_position_ar

The downgrade re-adds the same columns so the change stays reversible. Columns
that were originally NOT NULL are re-added with an empty-string server default
so the downgrade succeeds against tables that already contain rows.

Revision ID: 20260701_0001
Revises: 20260630_0001
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op


revision: str = "20260701_0001"
down_revision: str | None = "20260630_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.drop_column("projects", "title_ar")
    op.drop_column("projects", "description_ar")

    op.drop_column("project_images", "alt_text_ar")

    op.drop_column("services", "title_ar")
    op.drop_column("services", "description_ar")

    op.drop_column("partners", "name_ar")

    op.drop_column("gallery_images", "title_ar")
    op.drop_column("gallery_images", "alt_text_ar")

    op.drop_column("testimonials", "client_name_ar")
    op.drop_column("testimonials", "message_ar")
    op.drop_column("testimonials", "client_position_ar")


def downgrade() -> None:
    # Re-add the Arabic columns with their original types. NOT NULL columns get
    # an empty-string server default so existing rows satisfy the constraint.
    op.add_column(
        "projects",
        sa.Column("title_ar", sa.String(255), nullable=False, server_default=""),
    )
    op.add_column(
        "projects",
        sa.Column("description_ar", sa.String(2000), nullable=True),
    )

    op.add_column(
        "project_images",
        sa.Column("alt_text_ar", sa.String(255), nullable=True),
    )

    op.add_column(
        "services",
        sa.Column("title_ar", sa.String(255), nullable=False, server_default=""),
    )
    op.add_column(
        "services",
        sa.Column("description_ar", sa.String(2000), nullable=True),
    )

    op.add_column(
        "partners",
        sa.Column("name_ar", sa.String(255), nullable=False, server_default=""),
    )

    op.add_column(
        "gallery_images",
        sa.Column("title_ar", sa.String(255), nullable=True),
    )
    op.add_column(
        "gallery_images",
        sa.Column("alt_text_ar", sa.String(255), nullable=True),
    )

    op.add_column(
        "testimonials",
        sa.Column("client_name_ar", sa.String(180), nullable=False, server_default=""),
    )
    op.add_column(
        "testimonials",
        sa.Column("message_ar", sa.String(2000), nullable=False, server_default=""),
    )
    op.add_column(
        "testimonials",
        sa.Column("client_position_ar", sa.String(255), nullable=True),
    )
