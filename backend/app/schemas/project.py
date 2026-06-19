from datetime import datetime

from pydantic import BaseModel

from app.schemas.common import ORMModel


class ProjectBase(BaseModel):
    title_ar: str
    title_en: str
    title_he: str
    description_ar: str | None = None
    description_en: str | None = None
    description_he: str | None = None
    category: str = "local"
    main_image_url: str | None = None
    is_active: bool = True
    sort_order: int = 0


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    title_ar: str | None = None
    title_en: str | None = None
    title_he: str | None = None
    description_ar: str | None = None
    description_en: str | None = None
    description_he: str | None = None
    category: str | None = None
    main_image_url: str | None = None
    is_active: bool | None = None
    sort_order: int | None = None


class ProjectRead(ProjectBase, ORMModel):
    id: int
    created_at: datetime
    updated_at: datetime
