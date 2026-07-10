from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import HttpUrlString, ImageUrlString, ORMModel, TextSanitizedModel


class PartnerBase(TextSanitizedModel):
    name_en: str = Field(min_length=1, max_length=255)
    name_he: str = Field(min_length=1, max_length=255)
    logo_url: ImageUrlString = Field(max_length=500)
    website_url: HttpUrlString | None = Field(default=None, max_length=500)
    sort_order: int = 0
    is_active: bool = True


class PartnerCreate(PartnerBase):
    pass


class PartnerUpdate(TextSanitizedModel):
    name_en: str | None = Field(default=None, min_length=1, max_length=255)
    name_he: str | None = Field(default=None, min_length=1, max_length=255)
    logo_url: ImageUrlString | None = Field(default=None, max_length=500)
    website_url: HttpUrlString | None = Field(default=None, max_length=500)
    sort_order: int | None = None
    is_active: bool | None = None


class PartnerRead(PartnerBase, ORMModel):
    id: int
    created_at: datetime
    updated_at: datetime
