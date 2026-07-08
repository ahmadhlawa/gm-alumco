"""Add production projects tables.

Revision ID: 20260708_0002
Revises: 20260708_0001
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op


revision: str = "20260708_0002"
down_revision: str | None = "20260708_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "production_projects",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title_en", sa.String(255), nullable=False),
        sa.Column("title_he", sa.String(255), nullable=False),
        sa.Column("description_en", sa.String(2000), nullable=True),
        sa.Column("description_he", sa.String(2000), nullable=True),
        sa.Column("manufacturer_en", sa.String(255), nullable=True),
        sa.Column("manufacturer_he", sa.String(255), nullable=True),
        sa.Column("execution_partner_en", sa.String(255), nullable=True),
        sa.Column("execution_partner_he", sa.String(255), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="1"),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index(
        "ix_production_projects_is_active",
        "production_projects",
        ["is_active"],
    )
    op.create_index(
        "ix_production_projects_sort_order",
        "production_projects",
        ["sort_order"],
    )
    op.create_table(
        "production_project_images",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("project_id", sa.Integer(), nullable=False),
        sa.Column("image_url", sa.String(500), nullable=False),
        sa.Column("alt_text_en", sa.String(255), nullable=True),
        sa.Column("alt_text_he", sa.String(255), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["project_id"], ["production_projects.id"], ondelete="CASCADE"),
    )
    op.create_index(
        "ix_production_project_images_project_id",
        "production_project_images",
        ["project_id"],
    )


def downgrade() -> None:
    op.drop_index("ix_production_project_images_project_id", table_name="production_project_images")
    op.drop_table("production_project_images")
    op.drop_index("ix_production_projects_sort_order", table_name="production_projects")
    op.drop_index("ix_production_projects_is_active", table_name="production_projects")
    op.drop_table("production_projects")
