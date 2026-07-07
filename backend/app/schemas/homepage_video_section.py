from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import ImageUrlString, ORMModel


class HomepageVideoSectionBase(BaseModel):
    is_enabled: bool = False
    # Reuses the shared media-URL validator: accepts local /uploads/... paths or
    # absolute HTTP(S) URLs. Both video and poster live under /uploads.
    video_url: ImageUrlString | None = None
    poster_image_url: ImageUrlString | None = None
    title_ar: str | None = Field(default=None, max_length=255)
    title_en: str | None = Field(default=None, max_length=255)
    title_he: str | None = Field(default=None, max_length=255)
    description_ar: str | None = Field(default=None, max_length=2000)
    description_en: str | None = Field(default=None, max_length=2000)
    description_he: str | None = Field(default=None, max_length=2000)
    display_order: int = 0


class HomepageVideoSectionUpdate(BaseModel):
    is_enabled: bool | None = None
    video_url: ImageUrlString | None = None
    poster_image_url: ImageUrlString | None = None
    title_ar: str | None = Field(default=None, max_length=255)
    title_en: str | None = Field(default=None, max_length=255)
    title_he: str | None = Field(default=None, max_length=255)
    description_ar: str | None = Field(default=None, max_length=2000)
    description_en: str | None = Field(default=None, max_length=2000)
    description_he: str | None = Field(default=None, max_length=2000)
    display_order: int | None = None


class HomepageVideoSectionRead(HomepageVideoSectionBase, ORMModel):
    id: int
    created_at: datetime
    updated_at: datetime


class HomepageVideoSectionPublic(ORMModel):
    """Fields the public homepage needs — no audit timestamps or internal id."""

    is_enabled: bool
    video_url: str | None
    poster_image_url: str | None
    title_ar: str | None
    title_en: str | None
    title_he: str | None
    description_ar: str | None
    description_en: str | None
    description_he: str | None
    display_order: int
