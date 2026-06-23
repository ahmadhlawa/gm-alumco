"""Create initial schema for T.A.S.

Revision ID: 20260612_0001
Revises:
Create Date: 2026-06-12
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20260612_0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "admins",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("full_name", sa.String(150), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("role", sa.String(50), nullable=False, server_default="admin"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("last_login_at", sa.DateTime(), nullable=True),
        sa.UniqueConstraint("email"),
    )
    op.create_index("ix_admins_email", "admins", ["email"])

    op.create_table(
        "projects",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title_ar", sa.String(255), nullable=False),
        sa.Column("title_en", sa.String(255), nullable=False),
        sa.Column("title_he", sa.String(255), nullable=False),
        sa.Column("description_ar", sa.String(2000), nullable=True),
        sa.Column("description_en", sa.String(2000), nullable=True),
        sa.Column("description_he", sa.String(2000), nullable=True),
        sa.Column("category", sa.String(50), nullable=False, server_default="local"),
        sa.Column("main_image_url", sa.String(500), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_projects_category", "projects", ["category"])

    op.create_table(
        "project_images",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("project_id", sa.Integer(), nullable=False),
        sa.Column("image_url", sa.String(500), nullable=False),
        sa.Column("alt_text_ar", sa.String(255), nullable=True),
        sa.Column("alt_text_en", sa.String(255), nullable=True),
        sa.Column("alt_text_he", sa.String(255), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_project_images_project_id", "project_images", ["project_id"])

    op.create_table(
        "services",
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

    op.create_table(
        "gallery_images",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("image_url", sa.String(500), nullable=False),
        sa.Column("title_ar", sa.String(255), nullable=True),
        sa.Column("title_en", sa.String(255), nullable=True),
        sa.Column("title_he", sa.String(255), nullable=True),
        sa.Column("alt_text_ar", sa.String(255), nullable=True),
        sa.Column("alt_text_en", sa.String(255), nullable=True),
        sa.Column("alt_text_he", sa.String(255), nullable=True),
        sa.Column("category", sa.String(100), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )

    op.create_table(
        "partners",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name_ar", sa.String(255), nullable=False),
        sa.Column("name_en", sa.String(255), nullable=False),
        sa.Column("name_he", sa.String(255), nullable=False),
        sa.Column("logo_url", sa.String(500), nullable=False),
        sa.Column("website_url", sa.String(500), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )

    op.create_table(
        "testimonials",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("client_name_ar", sa.String(180), nullable=False),
        sa.Column("client_name_en", sa.String(180), nullable=False),
        sa.Column("client_name_he", sa.String(180), nullable=False),
        sa.Column("message_ar", sa.String(2000), nullable=False),
        sa.Column("message_en", sa.String(2000), nullable=False),
        sa.Column("message_he", sa.String(2000), nullable=False),
        sa.Column("client_position_ar", sa.String(255), nullable=True),
        sa.Column("client_position_en", sa.String(255), nullable=True),
        sa.Column("client_position_he", sa.String(255), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )

    op.create_table(
        "site_content",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("section", sa.String(100), nullable=False),
        sa.Column("key", sa.String(180), nullable=False),
        sa.Column("value", sa.JSON(), nullable=False),
        sa.Column("content_type", sa.String(50), nullable=False, server_default="text"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("section", "key", name="uq_site_content_section_key"),
    )
    op.create_index("ix_site_content_section", "site_content", ["section"])
    op.create_index("ix_site_content_key", "site_content", ["key"])

    op.create_table(
        "site_settings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("key", sa.String(180), nullable=False),
        sa.Column("value", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("key"),
    )
    op.create_index("ix_site_settings_key", "site_settings", ["key"])

    op.create_table(
        "contact_messages",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(180), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(50), nullable=True),
        sa.Column("subject", sa.String(255), nullable=True),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("status", sa.String(50), nullable=False, server_default="new"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_contact_messages_email", "contact_messages", ["email"])
    op.create_index("ix_contact_messages_status", "contact_messages", ["status"])

    op.create_table(
        "quote_requests",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(180), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(50), nullable=False),
        sa.Column("service_type", sa.String(180), nullable=True),
        sa.Column("message", sa.Text(), nullable=True),
        sa.Column("status", sa.String(50), nullable=False, server_default="new"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_quote_requests_email", "quote_requests", ["email"])
    op.create_index("ix_quote_requests_status", "quote_requests", ["status"])

    op.create_table(
        "audit_logs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("admin_id", sa.Integer(), nullable=True),
        sa.Column("action", sa.String(100), nullable=False),
        sa.Column("entity_type", sa.String(100), nullable=True),
        sa.Column("entity_id", sa.String(100), nullable=True),
        sa.Column("details", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["admin_id"], ["admins.id"], ondelete="SET NULL"),
    )
    op.create_index("ix_audit_logs_action", "audit_logs", ["action"])
    op.create_index("ix_audit_logs_admin_id", "audit_logs", ["admin_id"])


def downgrade() -> None:
    op.drop_table("audit_logs")
    op.drop_table("quote_requests")
    op.drop_table("contact_messages")
    op.drop_table("site_settings")
    op.drop_table("site_content")
    op.drop_table("testimonials")
    op.drop_table("partners")
    op.drop_table("gallery_images")
    op.drop_table("products")
    op.drop_table("services")
    op.drop_table("project_images")
    op.drop_table("projects")
    op.drop_table("admins")
