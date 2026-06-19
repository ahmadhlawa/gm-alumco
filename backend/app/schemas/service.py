from datetime import datetime

from pydantic import BaseModel

from app.schemas.common import ORMModel


class ServiceBase(BaseModel):
    title_ar: str
    title_en: str
    title_he: str
    description_ar: str | None = None
    description_en: str | None = None
    description_he: str | None = None
    image_url: str | None = None
    is_active: bool = True
    sort_order: int = 0


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(BaseModel):
    title_ar: str | None = None
    title_en: str | None = None
    title_he: str | None = None
    description_ar: str | None = None
    description_en: str | None = None
    description_he: str | None = None
    image_url: str | None = None
    is_active: bool | None = None
    sort_order: int | None = None


class ServiceRead(ServiceBase, ORMModel):
    id: int
    created_at: datetime
    updated_at: datetime
