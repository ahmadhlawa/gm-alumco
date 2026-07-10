from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.common import ImageUrlString, ORMModel, TextSanitizedModel


ProjectCategory = Literal["LOCAL", "INTERNATIONAL", "FEATURED"]


class ProjectBase(TextSanitizedModel):
    title_en: str = Field(min_length=1, max_length=255)
    title_he: str = Field(min_length=1, max_length=255)
    description_en: str | None = Field(default=None, max_length=2000)
    description_he: str | None = Field(default=None, max_length=2000)
    category: ProjectCategory = "LOCAL"
    main_image_url: ImageUrlString | None = Field(default=None, max_length=500)
    is_active: bool = True
    sort_order: int = 0


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(TextSanitizedModel):
    title_en: str | None = Field(default=None, min_length=1, max_length=255)
    title_he: str | None = Field(default=None, min_length=1, max_length=255)
    description_en: str | None = Field(default=None, max_length=2000)
    description_he: str | None = Field(default=None, max_length=2000)
    category: ProjectCategory | None = None
    main_image_url: ImageUrlString | None = Field(default=None, max_length=500)
    is_active: bool | None = None
    sort_order: int | None = None


class ProjectRead(ProjectBase, ORMModel):
    id: int
    created_at: datetime
    updated_at: datetime


class ProjectImageCreate(TextSanitizedModel):
    image_url: ImageUrlString = Field(max_length=500)
    alt_text_en: str | None = Field(default=None, max_length=255)
    alt_text_he: str | None = Field(default=None, max_length=255)
    sort_order: int = 0


class ProjectImageRead(ProjectImageCreate, ORMModel):
    id: int
    project_id: int
    created_at: datetime


class ProjectDetail(ProjectRead):
    images: list[ProjectImageRead]
