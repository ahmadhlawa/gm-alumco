"""Add homepage video section table.

Creates the singleton `homepage_video_section` table for the configurable
full-width autoplay video on the public homepage, and seeds one disabled row so
the admin has a record to edit immediately. Arabic columns are kept as
passthrough alongside Hebrew/English.

Revision ID: 20260708_0001
Revises: 20260702_0001
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op


revision: str = "20260708_0001"
down_revision: str | None = "20260702_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


homepage_video_section = sa.table(
    "homepage_video_section",
    sa.column("is_enabled", sa.Boolean),
    sa.column("display_order", sa.Integer),
)


def upgrade() -> None:
    op.create_table(
        "homepage_video_section",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("is_enabled", sa.Boolean(), nullable=False, server_default="0"),
        sa.Column("video_url", sa.String(500), nullable=True),
        sa.Column("poster_image_url", sa.String(500), nullable=True),
        sa.Column("title_ar", sa.String(255), nullable=True),
        sa.Column("title_en", sa.String(255), nullable=True),
        sa.Column("title_he", sa.String(255), nullable=True),
        sa.Column("description_ar", sa.String(2000), nullable=True),
        sa.Column("description_en", sa.String(2000), nullable=True),
        sa.Column("description_he", sa.String(2000), nullable=True),
        sa.Column("display_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )

    # Seed the single disabled row so the admin panel always has one to edit.
    connection = op.get_bind()
    exists = connection.execute(
        sa.select(sa.literal(1)).select_from(homepage_video_section)
    ).first()
    if not exists:
        connection.execute(
            homepage_video_section.insert().values(is_enabled=False, display_order=0)
        )


def downgrade() -> None:
    op.drop_table("homepage_video_section")
