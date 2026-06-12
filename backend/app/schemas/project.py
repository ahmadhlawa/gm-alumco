from datetime import date, datetime

from pydantic import BaseModel

from app.schemas.common import LocalizedText, ORMModel


class ProjectBase(BaseModel):
    slug: str
    title: LocalizedText
    description: LocalizedText | None = None
    location: LocalizedText | None = None
    cover_image_url: str | None = None
    completed_at: date | None = None
    is_featured: bool = False
    is_published: bool = False
    display_order: int = 0


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    slug: str | None = None
    title: LocalizedText | None = None
    description: LocalizedText | None = None
    location: LocalizedText | None = None
    cover_image_url: str | None = None
    completed_at: date | None = None
    is_featured: bool | None = None
    is_published: bool | None = None
    display_order: int | None = None


class ProjectRead(ProjectBase, ORMModel):
    id: int
    created_at: datetime
    updated_at: datetime
