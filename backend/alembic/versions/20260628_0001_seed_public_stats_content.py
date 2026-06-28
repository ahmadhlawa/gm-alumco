"""Seed editable public stats content.

Revision ID: 20260628_0001
Revises: 20260622_0001
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op


revision: str = "20260628_0001"
down_revision: str | None = "20260622_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


site_content = sa.table(
    "site_content",
    sa.column("section", sa.String),
    sa.column("key", sa.String),
    sa.column("value", sa.JSON),
    sa.column("content_type", sa.String),
    sa.column("is_active", sa.Boolean),
)


PUBLIC_STATS = {
    "heroStats": [
        {"id": "completed-projects", "value": "250+", "label": {"ar": "مشروع منجز", "en": "Completed projects", "he": "פרויקטים שהושלמו"}, "sort_order": 1, "is_active": True},
        {"id": "years-experience", "value": "10+", "label": {"ar": "سنوات خبرة", "en": "Years of experience", "he": "שנות ניסיון"}, "sort_order": 2, "is_active": True},
        {"id": "warranty-years", "value": "5", "label": {"ar": "سنوات ضمان", "en": "Years warranty", "he": "שנות אחריות"}, "sort_order": 3, "is_active": True},
    ],
    "aboutPreviewStats": [
        {"id": "about-completed", "value": "250+", "label": {"ar": "مشاريع مكتملة", "en": "Completed Projects", "he": "פרויקטים שהושלמו"}, "sort_order": 1, "is_active": True},
        {"id": "about-experience", "value": "10+", "label": {"ar": "سنوات خبرة", "en": "Years of Experience", "he": "שנות ניסיון"}, "sort_order": 2, "is_active": True},
        {"id": "about-team", "value": "40+", "label": {"ar": "فريق مختص", "en": "Expert Team", "he": "צוות מומחים"}, "sort_order": 3, "is_active": True},
        {"id": "about-warranty", "value": "100%", "label": {"ar": "ضمان جودة", "en": "Quality Warranty", "he": "אחריות איכות"}, "sort_order": 4, "is_active": True},
    ],
    "aboutPageStats": [
        {"id": "about-years", "value": "+15", "label": {"ar": "سنوات من الخبرة", "en": "Years of experience", "he": "שנות נסיון"}, "sort_order": 1, "is_active": True},
        {"id": "about-projects", "value": "+350", "label": {"ar": "مشروع منجز", "en": "Completed projects", "he": "פרויקטים שהושלמו"}, "sort_order": 2, "is_active": True},
        {"id": "about-customers", "value": "+200", "label": {"ar": "عميل سعيد", "en": "Happy customers", "he": "לקוחות מרוצים"}, "sort_order": 3, "is_active": True},
        {"id": "about-engineers", "value": "+40", "label": {"ar": "فريق هندسي متخصص", "en": "Specialized engineering team", "he": "צוות מהנדסים מומחים"}, "sort_order": 4, "is_active": True},
    ],
    "valueChips": [
        {"id": "premium-quality", "value": "", "label": {"ar": "جودة فائقة", "en": "Premium quality", "he": "איכות פרימיום"}, "sort_order": 1, "is_active": True},
        {"id": "precise-engineering", "value": "", "label": {"ar": "هندسة دقيقة", "en": "Precise engineering", "he": "הנדסה מדויקת"}, "sort_order": 2, "is_active": True},
        {"id": "durable-performance", "value": "", "label": {"ar": "أداء متين", "en": "Durable performance", "he": "ביצועים עמידים"}, "sort_order": 3, "is_active": True},
        {"id": "modern-aesthetic", "value": "", "label": {"ar": "تصميم عصري", "en": "Modern aesthetic", "he": "אסתטיקה מודרנית"}, "sort_order": 4, "is_active": True},
    ],
    "aboutHighlight": {"id": "about-highlight-years", "value": "15+", "label": {"ar": "عاماً من الريادة في المملكة", "en": "Years of leadership", "he": "שנים של מצוינות בבנייה"}, "sort_order": 1, "is_active": True},
    "heroSince": {"id": "hero-since-year", "value": "2014", "label": {"ar": "تميّز هندسي منذ", "en": "Engineering excellence since", "he": "מצוינות הנדסית מאז"}, "sort_order": 1, "is_active": True},
}


def upgrade() -> None:
    connection = op.get_bind()
    exists = connection.execute(
        sa.select(sa.literal(1)).select_from(site_content).where(
            sa.and_(site_content.c.section == "public_stats", site_content.c.key == "content")
        )
    ).first()
    if exists:
        return

    connection.execute(
        site_content.insert().values(
            section="public_stats",
            key="content",
            value=PUBLIC_STATS,
            content_type="json",
            is_active=True,
        )
    )


def downgrade() -> None:
    op.execute(
        site_content.delete().where(
            sa.and_(site_content.c.section == "public_stats", site_content.c.key == "content")
        )
    )
