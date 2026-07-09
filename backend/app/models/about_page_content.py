from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class AboutPageContent(Base):
    """Singleton editable content for the public About page.

    Success Story, Vision/Mission, and Difference/Stats sections. There is
    only ever one row, created on demand by get_or_create_content and seeded
    by migration 20260709_0001. Hebrew + English only — no Arabic columns.
    """

    __tablename__ = "about_page_content"

    id: Mapped[int] = mapped_column(primary_key=True)

    title_en: Mapped[str | None] = mapped_column(String(60), nullable=True)
    title_he: Mapped[str | None] = mapped_column(String(60), nullable=True)
    subtitle_en: Mapped[str | None] = mapped_column(String(120), nullable=True)
    subtitle_he: Mapped[str | None] = mapped_column(String(120), nullable=True)
    paragraph_1_en: Mapped[str | None] = mapped_column(String(350), nullable=True)
    paragraph_1_he: Mapped[str | None] = mapped_column(String(350), nullable=True)
    paragraph_2_en: Mapped[str | None] = mapped_column(String(350), nullable=True)
    paragraph_2_he: Mapped[str | None] = mapped_column(String(350), nullable=True)
    bullet_1_en: Mapped[str | None] = mapped_column(String(90), nullable=True)
    bullet_1_he: Mapped[str | None] = mapped_column(String(90), nullable=True)
    bullet_2_en: Mapped[str | None] = mapped_column(String(90), nullable=True)
    bullet_2_he: Mapped[str | None] = mapped_column(String(90), nullable=True)
    bullet_3_en: Mapped[str | None] = mapped_column(String(90), nullable=True)
    bullet_3_he: Mapped[str | None] = mapped_column(String(90), nullable=True)
    bullet_4_en: Mapped[str | None] = mapped_column(String(90), nullable=True)
    bullet_4_he: Mapped[str | None] = mapped_column(String(90), nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    experience_number: Mapped[str | None] = mapped_column(String(12), nullable=True)
    experience_label_en: Mapped[str | None] = mapped_column(String(40), nullable=True)
    experience_label_he: Mapped[str | None] = mapped_column(String(40), nullable=True)

    vision_title_en: Mapped[str | None] = mapped_column(String(60), nullable=True)
    vision_title_he: Mapped[str | None] = mapped_column(String(60), nullable=True)
    vision_text_en: Mapped[str | None] = mapped_column(String(250), nullable=True)
    vision_text_he: Mapped[str | None] = mapped_column(String(250), nullable=True)
    mission_title_en: Mapped[str | None] = mapped_column(String(60), nullable=True)
    mission_title_he: Mapped[str | None] = mapped_column(String(60), nullable=True)
    mission_text_en: Mapped[str | None] = mapped_column(String(250), nullable=True)
    mission_text_he: Mapped[str | None] = mapped_column(String(250), nullable=True)

    difference_title_en: Mapped[str | None] = mapped_column(String(60), nullable=True)
    difference_title_he: Mapped[str | None] = mapped_column(String(60), nullable=True)
    difference_intro_en: Mapped[str | None] = mapped_column(String(120), nullable=True)
    difference_intro_he: Mapped[str | None] = mapped_column(String(120), nullable=True)
    difference_paragraph_en: Mapped[str | None] = mapped_column(String(350), nullable=True)
    difference_paragraph_he: Mapped[str | None] = mapped_column(String(350), nullable=True)
    cta_text_en: Mapped[str | None] = mapped_column(String(40), nullable=True)
    cta_text_he: Mapped[str | None] = mapped_column(String(40), nullable=True)
    cta_link: Mapped[str | None] = mapped_column(String(255), nullable=True)
    stat_1_number: Mapped[str | None] = mapped_column(String(12), nullable=True)
    stat_1_label_en: Mapped[str | None] = mapped_column(String(40), nullable=True)
    stat_1_label_he: Mapped[str | None] = mapped_column(String(40), nullable=True)
    stat_2_number: Mapped[str | None] = mapped_column(String(12), nullable=True)
    stat_2_label_en: Mapped[str | None] = mapped_column(String(40), nullable=True)
    stat_2_label_he: Mapped[str | None] = mapped_column(String(40), nullable=True)
    stat_3_number: Mapped[str | None] = mapped_column(String(12), nullable=True)
    stat_3_label_en: Mapped[str | None] = mapped_column(String(40), nullable=True)
    stat_3_label_he: Mapped[str | None] = mapped_column(String(40), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )
