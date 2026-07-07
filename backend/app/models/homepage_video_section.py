from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class HomepageVideoSection(Base):
    """Single configurable autoplay video section for the public homepage.

    There is only ever one row (a singleton), seeded by migration. Arabic
    columns are kept as passthrough — the public site renders Hebrew/English,
    but Arabic values are stored and returned for forward compatibility.
    """

    __tablename__ = "homepage_video_section"

    id: Mapped[int] = mapped_column(primary_key=True)
    is_enabled: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default="0"
    )
    video_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    poster_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    title_ar: Mapped[str | None] = mapped_column(String(255), nullable=True)
    title_en: Mapped[str | None] = mapped_column(String(255), nullable=True)
    title_he: Mapped[str | None] = mapped_column(String(255), nullable=True)
    description_ar: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    description_en: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    description_he: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )
