from datetime import datetime

from pydantic import BaseModel

from app.schemas.common import LocalizedText, ORMModel


class ServiceBase(BaseModel):
    slug: str
    title: LocalizedText
    description: LocalizedText | None = None
    icon: str | None = None
    image_url: str | None = None
    is_published: bool = False
    display_order: int = 0


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(BaseModel):
    slug: str | None = None
    title: LocalizedText | None = None
    description: LocalizedText | None = None
    icon: str | None = None
    image_url: str | None = None
    is_published: bool | None = None
    display_order: int | None = None


class ServiceRead(ServiceBase, ORMModel):
    id: int
    created_at: datetime
    updated_at: datetime
