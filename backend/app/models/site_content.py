from datetime import datetime
from typing import Any

from sqlalchemy import Boolean, DateTime, JSON, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class SiteContent(Base):
    __tablename__ = "site_content"
    __table_args__ = (UniqueConstraint("section", "key", name="uq_site_content_section_key"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    section: Mapped[str] = mapped_column(String(100), index=True)
    key: Mapped[str] = mapped_column(String(180), index=True)
    value: Mapped[dict[str, Any]] = mapped_column(JSON)
    content_type: Mapped[str] = mapped_column(String(50), default="text")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )
