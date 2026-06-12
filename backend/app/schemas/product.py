from datetime import datetime
from typing import Any

from pydantic import BaseModel

from app.schemas.common import LocalizedText, ORMModel


class ProductBase(BaseModel):
    slug: str
    title: LocalizedText
    description: LocalizedText | None = None
    category: LocalizedText | None = None
    specifications: dict[str, Any] | None = None
    image_url: str | None = None
    is_featured: bool = False
    is_published: bool = False
    display_order: int = 0


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    slug: str | None = None
    title: LocalizedText | None = None
    description: LocalizedText | None = None
    category: LocalizedText | None = None
    specifications: dict[str, Any] | None = None
    image_url: str | None = None
    is_featured: bool | None = None
    is_published: bool | None = None
    display_order: int | None = None


class ProductRead(ProductBase, ORMModel):
    id: int
    created_at: datetime
    updated_at: datetime
