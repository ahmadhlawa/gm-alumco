from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ProductionProject(Base):
    __tablename__ = "production_projects"

    id: Mapped[int] = mapped_column(primary_key=True)
    title_en: Mapped[str] = mapped_column(String(255))
    title_he: Mapped[str] = mapped_column(String(255))
    description_en: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    description_he: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    manufacturer_en: Mapped[str | None] = mapped_column(String(255), nullable=True)
    manufacturer_he: Mapped[str | None] = mapped_column(String(255), nullable=True)
    execution_partner_en: Mapped[str | None] = mapped_column(String(255), nullable=True)
    execution_partner_he: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    images: Mapped[list["ProductionProjectImage"]] = relationship(
        back_populates="project",
        cascade="all, delete-orphan",
        order_by="ProductionProjectImage.sort_order",
    )


class ProductionProjectImage(Base):
    __tablename__ = "production_project_images"

    id: Mapped[int] = mapped_column(primary_key=True)
    project_id: Mapped[int] = mapped_column(
        ForeignKey("production_projects.id", ondelete="CASCADE"), index=True
    )
    image_url: Mapped[str] = mapped_column(String(500))
    alt_text_en: Mapped[str | None] = mapped_column(String(255), nullable=True)
    alt_text_he: Mapped[str | None] = mapped_column(String(255), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    project: Mapped[ProductionProject] = relationship(back_populates="images")
