from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.common import ImageUrlString, ORMModel, TextSanitizedModel


class GalleryBase(TextSanitizedModel):
    image_url: ImageUrlString = Field(max_length=500)
    title_en: str | None = Field(default=None, max_length=255)
    title_he: str | None = Field(default=None, max_length=255)
    alt_text_en: str | None = Field(default=None, max_length=255)
    alt_text_he: str | None = Field(default=None, max_length=255)
    category: str | None = Field(default=None, max_length=100)
    sort_order: int = 0
    is_active: bool = True


class GalleryCreate(GalleryBase):
    pass


class GalleryUpdate(TextSanitizedModel):
    image_url: ImageUrlString | None = Field(default=None, max_length=500)
    title_en: str | None = Field(default=None, max_length=255)
    title_he: str | None = Field(default=None, max_length=255)
    alt_text_en: str | None = Field(default=None, max_length=255)
    alt_text_he: str | None = Field(default=None, max_length=255)
    category: str | None = Field(default=None, max_length=100)
    sort_order: int | None = None
    is_active: bool | None = None


class GalleryRead(GalleryBase, ORMModel):
    id: int
    created_at: datetime
    updated_at: datetime


PhotoCategory = Literal["LOCAL", "INTERNATIONAL"]


class ProjectPhotoCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    # Only canonical files returned by the existing gallery image uploader.
    image_url: str = Field(pattern=r"^/uploads/gallery/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp)$")
    category: PhotoCategory


class ProjectPhotoUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    category: PhotoCategory | None = None
    is_active: bool | None = None

    @field_validator("category", "is_active")
    @classmethod
    def reject_explicit_null(cls, value):
        if value is None:
            raise ValueError("Field must not be null")
        return value
