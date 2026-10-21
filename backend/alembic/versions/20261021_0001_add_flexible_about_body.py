"""Add nullable bilingual About body fields; retain all legacy content columns."""
from alembic import op
import sqlalchemy as sa

revision = "20261021_0001"
down_revision = "20260710_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("about_page_content", sa.Column("body_he", sa.Text(), nullable=True))
    op.add_column("about_page_content", sa.Column("body_en", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("about_page_content", "body_en")
    op.drop_column("about_page_content", "body_he")
