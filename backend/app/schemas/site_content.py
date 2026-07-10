from datetime import datetime

from pydantic import BaseModel, Field, JsonValue, field_validator

from app.schemas.common import ORMModel, normalize_required_text


class SiteContentCreate(BaseModel):
    section: str = Field(min_length=1, max_length=100)
    key: str = Field(min_length=1, max_length=180)
    value: JsonValue
    content_type: str = Field(default="text", min_length=1, max_length=50)
    is_active: bool = True

    @field_validator("section", "key", "content_type", mode="before")
    @classmethod
    def _text_not_blank(cls, value: str) -> str:
        return normalize_required_text(value)


class SiteContentUpdate(BaseModel):
    section: str | None = Field(default=None, min_length=1, max_length=100)
    key: str | None = Field(default=None, min_length=1, max_length=180)
    value: JsonValue = None
    content_type: str | None = Field(default=None, min_length=1, max_length=50)
    is_active: bool | None = None

    @field_validator("section", "key", "content_type", mode="before")
    @classmethod
    def _text_not_blank(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return normalize_required_text(value)


class SiteContentRead(SiteContentCreate, ORMModel):
    id: int
    created_at: datetime
    updated_at: datetime


class SiteSettingCreate(BaseModel):
    key: str = Field(min_length=1, max_length=180)
    value: JsonValue

    @field_validator("key", mode="before")
    @classmethod
    def _key_not_blank(cls, value: str) -> str:
        return normalize_required_text(value)


class SiteSettingUpdate(BaseModel):
    key: str | None = Field(default=None, min_length=1, max_length=180)
    value: JsonValue = None

    @field_validator("key", mode="before")
    @classmethod
    def _key_not_blank(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return normalize_required_text(value)


class SiteSettingRead(SiteSettingCreate, ORMModel):
    id: int
    created_at: datetime
    updated_at: datetime
