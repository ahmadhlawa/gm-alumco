from datetime import datetime
from typing import Literal

from pydantic import BaseModel

from app.schemas.common import ImageUrlString, ORMModel


ProjectCategory = Literal["LOCAL", "INTERNATIONAL", "FEATURED"]


class ProjectBase(BaseModel):
    title_ar: str
    title_en: str
    title_he: str
    description_ar: str | None = None
    description_en: str | None = None
    description_he: str | None = None
    category: ProjectCategory = "LOCAL"
    main_image_url: ImageUrlString | None = None
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
    category: ProjectCategory | None = None
    main_image_url: ImageUrlString | None = None
    is_active: bool | None = None
    sort_order: int | None = None


class ProjectRead(ProjectBase, ORMModel):
    id: int
    created_at: datetime
    updated_at: datetime


class ProjectImageCreate(BaseModel):
    image_url: ImageUrlString
    alt_text_ar: str | None = None
    alt_text_en: str | None = None
    alt_text_he: str | None = None
    sort_order: int = 0


class ProjectImageRead(ProjectImageCreate, ORMModel):
    id: int
    project_id: int
    created_at: datetime


class ProjectDetail(ProjectRead):
    images: list[ProjectImageRead]
