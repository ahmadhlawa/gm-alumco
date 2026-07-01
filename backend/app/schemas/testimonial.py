from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import ORMModel


class TestimonialBase(BaseModel):
    client_name_en: str = Field(max_length=180)
    client_name_he: str = Field(max_length=180)
    message_en: str = Field(max_length=2000)
    message_he: str = Field(max_length=2000)
    client_position_en: str | None = Field(default=None, max_length=255)
    client_position_he: str | None = Field(default=None, max_length=255)
    rating: int = Field(default=5, ge=1, le=5)
    sort_order: int = 0
    is_active: bool = True


class TestimonialCreate(TestimonialBase):
    pass


class TestimonialUpdate(BaseModel):
    client_name_en: str | None = Field(default=None, max_length=180)
    client_name_he: str | None = Field(default=None, max_length=180)
    message_en: str | None = Field(default=None, max_length=2000)
    message_he: str | None = Field(default=None, max_length=2000)
    client_position_en: str | None = Field(default=None, max_length=255)
    client_position_he: str | None = Field(default=None, max_length=255)
    rating: int | None = Field(default=None, ge=1, le=5)
    sort_order: int | None = None
    is_active: bool | None = None


class TestimonialRead(TestimonialBase, ORMModel):
    id: int
    created_at: datetime
    updated_at: datetime
