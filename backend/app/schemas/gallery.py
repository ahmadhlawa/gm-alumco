from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import ImageUrlString, ORMModel


class GalleryBase(BaseModel):
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


class GalleryUpdate(BaseModel):
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
