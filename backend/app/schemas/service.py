from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field

from app.schemas.common import ImageUrlString, ORMModel, TextSanitizedModel


class ServiceBase(TextSanitizedModel):
    title_en: str = Field(min_length=1, max_length=255)
    title_he: str = Field(min_length=1, max_length=255)
    description_en: str | None = Field(default=None, max_length=2000)
    description_he: str | None = Field(default=None, max_length=2000)
    image_url: ImageUrlString | None = Field(default=None, max_length=500)
    starting_price: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)
    is_active: bool = True
    sort_order: int = 0


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(TextSanitizedModel):
    title_en: str | None = Field(default=None, min_length=1, max_length=255)
    title_he: str | None = Field(default=None, min_length=1, max_length=255)
    description_en: str | None = Field(default=None, max_length=2000)
    description_he: str | None = Field(default=None, max_length=2000)
    image_url: ImageUrlString | None = Field(default=None, max_length=500)
    starting_price: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)
    is_active: bool | None = None
    sort_order: int | None = None


class ServiceRead(ServiceBase, ORMModel):
    id: int
    created_at: datetime
    updated_at: datetime
