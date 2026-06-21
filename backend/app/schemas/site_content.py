from datetime import datetime

from pydantic import BaseModel, Field, JsonValue

from app.schemas.common import ORMModel


class SiteContentCreate(BaseModel):
    section: str = Field(min_length=1, max_length=100)
    key: str = Field(min_length=1, max_length=180)
    value: JsonValue
    content_type: str = Field(default="text", min_length=1, max_length=50)
    is_active: bool = True


class SiteContentUpdate(BaseModel):
    section: str | None = Field(default=None, min_length=1, max_length=100)
    key: str | None = Field(default=None, min_length=1, max_length=180)
    value: JsonValue = None
    content_type: str | None = Field(default=None, min_length=1, max_length=50)
    is_active: bool | None = None


class SiteContentRead(SiteContentCreate, ORMModel):
    id: int
    created_at: datetime
    updated_at: datetime


class SiteSettingCreate(BaseModel):
    key: str = Field(min_length=1, max_length=180)
    value: JsonValue


class SiteSettingUpdate(BaseModel):
    key: str | None = Field(default=None, min_length=1, max_length=180)
    value: JsonValue = None


class SiteSettingRead(SiteSettingCreate, ORMModel):
    id: int
    created_at: datetime
    updated_at: datetime
