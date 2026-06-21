from datetime import datetime

from pydantic import BaseModel

from app.schemas.common import HttpUrlString, ORMModel


class PartnerBase(BaseModel):
    name_ar: str
    name_en: str
    name_he: str
    logo_url: HttpUrlString
    website_url: HttpUrlString | None = None
    sort_order: int = 0
    is_active: bool = True


class PartnerCreate(PartnerBase):
    pass


class PartnerUpdate(BaseModel):
    name_ar: str | None = None
    name_en: str | None = None
    name_he: str | None = None
    logo_url: HttpUrlString | None = None
    website_url: HttpUrlString | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class PartnerRead(PartnerBase, ORMModel):
    id: int
    created_at: datetime
    updated_at: datetime
