from datetime import datetime

from pydantic import BaseModel

from app.schemas.common import ImageUrlString, ORMModel


class GalleryBase(BaseModel):
    image_url: ImageUrlString
    title_en: str | None = None
    title_he: str | None = None
    alt_text_en: str | None = None
    alt_text_he: str | None = None
    category: str | None = None
    sort_order: int = 0
    is_active: bool = True


class GalleryCreate(GalleryBase):
    pass


class GalleryUpdate(BaseModel):
    image_url: ImageUrlString | None = None
    title_en: str | None = None
    title_he: str | None = None
    alt_text_en: str | None = None
    alt_text_he: str | None = None
    category: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class GalleryRead(GalleryBase, ORMModel):
    id: int
    created_at: datetime
    updated_at: datetime
