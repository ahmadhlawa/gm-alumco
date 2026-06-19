from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Testimonial(Base):
    __tablename__ = "testimonials"

    id: Mapped[int] = mapped_column(primary_key=True)
    client_name_ar: Mapped[str] = mapped_column(String(180))
    client_name_en: Mapped[str] = mapped_column(String(180))
    client_name_he: Mapped[str] = mapped_column(String(180))
    message_ar: Mapped[str] = mapped_column(String(2000))
    message_en: Mapped[str] = mapped_column(String(2000))
    message_he: Mapped[str] = mapped_column(String(2000))
    client_position_ar: Mapped[str | None] = mapped_column(String(255), nullable=True)
    client_position_en: Mapped[str | None] = mapped_column(String(255), nullable=True)
    client_position_he: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )
