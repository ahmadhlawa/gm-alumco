from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import ImageUrlString, ORMModel


class ProductionProjectBase(BaseModel):
    title_en: str = Field(min_length=1, max_length=255)
    title_he: str = Field(min_length=1, max_length=255)
    description_en: str | None = Field(default=None, max_length=2000)
    description_he: str | None = Field(default=None, max_length=2000)
    manufacturer_en: str | None = Field(default=None, max_length=255)
    manufacturer_he: str | None = Field(default=None, max_length=255)
    execution_partner_en: str | None = Field(default=None, max_length=255)
    execution_partner_he: str | None = Field(default=None, max_length=255)
    is_active: bool = True
    sort_order: int = 0


class ProductionProjectCreate(ProductionProjectBase):
    pass


class ProductionProjectUpdate(BaseModel):
    title_en: str | None = Field(default=None, min_length=1, max_length=255)
    title_he: str | None = Field(default=None, min_length=1, max_length=255)
    description_en: str | None = Field(default=None, max_length=2000)
    description_he: str | None = Field(default=None, max_length=2000)
    manufacturer_en: str | None = Field(default=None, max_length=255)
    manufacturer_he: str | None = Field(default=None, max_length=255)
    execution_partner_en: str | None = Field(default=None, max_length=255)
    execution_partner_he: str | None = Field(default=None, max_length=255)
    is_active: bool | None = None
    sort_order: int | None = None


class ProductionProjectImageCreate(BaseModel):
    image_url: ImageUrlString = Field(max_length=500)
    alt_text_en: str | None = Field(default=None, max_length=255)
    alt_text_he: str | None = Field(default=None, max_length=255)
    sort_order: int = 0


class ProductionProjectImageRead(ProductionProjectImageCreate, ORMModel):
    id: int
    project_id: int
    created_at: datetime


class ProductionProjectRead(ProductionProjectBase, ORMModel):
    id: int
    created_at: datetime
    updated_at: datetime
    images: list[ProductionProjectImageRead] = []
