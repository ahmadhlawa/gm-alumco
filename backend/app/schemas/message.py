from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.schemas.common import (
    ORMModel,
    normalize_optional_text,
    normalize_required_text,
    validate_http_url,
    validate_optional_phone_number,
    validate_phone_number,
)


ContactMessageStatus = Literal["NEW", "READ", "ARCHIVED"]
QuoteRequestStatus = Literal["NEW", "IN_PROGRESS", "DONE", "ARCHIVED"]
MESSAGE_MAX_LENGTH = 5000


class ContactMessageCreate(BaseModel):
    name: str = Field(min_length=1, max_length=180)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=50)
    subject: str | None = Field(default=None, max_length=255)
    message: str = Field(min_length=1, max_length=MESSAGE_MAX_LENGTH)

    @field_validator("name", "message", mode="before")
    @classmethod
    def _required_text_not_blank(cls, value: str) -> str:
        return normalize_required_text(value)

    @field_validator("subject", mode="before")
    @classmethod
    def _optional_text_empty_to_none(cls, value: str | None) -> str | None:
        return normalize_optional_text(value)

    @field_validator("phone", mode="before")
    @classmethod
    def _valid_phone_or_none(cls, value: str | None) -> str | None:
        return validate_optional_phone_number(value)


class ContactMessageRead(ContactMessageCreate, ORMModel):
    id: int
    status: ContactMessageStatus
    is_read: bool
    created_at: datetime


class ContactMessageStatusUpdate(BaseModel):
    status: ContactMessageStatus


class QuoteRequestCreate(BaseModel):
    name: str = Field(min_length=1, max_length=180)
    email: EmailStr | None = None
    phone: str = Field(min_length=1, max_length=50)
    service_type: str | None = Field(default=None, max_length=180)
    message: str | None = Field(default=None, max_length=MESSAGE_MAX_LENGTH)
    # Optional link (e.g. Google Drive / cloud folder) to plans or files.
    # Stored only as text — no files are uploaded or stored.
    plans_link: str | None = Field(default=None, max_length=1000)

    @field_validator("name", "phone", mode="before")
    @classmethod
    def _required_text_not_blank(cls, value: str) -> str:
        return normalize_required_text(value)

    @field_validator("service_type", "message", mode="before")
    @classmethod
    def _optional_text_empty_to_none(cls, value: str | None) -> str | None:
        return normalize_optional_text(value)

    @field_validator("phone", mode="before")
    @classmethod
    def _valid_phone(cls, value: str) -> str:
        return validate_phone_number(value)

    @field_validator("plans_link")
    @classmethod
    def _normalize_plans_link(cls, value: str | None) -> str | None:
        if value is None:
            return None
        trimmed = value.strip()
        if not trimmed:
            return None
        return validate_http_url(trimmed)


class QuoteRequestRead(QuoteRequestCreate, ORMModel):
    id: int
    status: QuoteRequestStatus
    is_read: bool
    created_at: datetime
    updated_at: datetime


class QuoteRequestStatusUpdate(BaseModel):
    status: QuoteRequestStatus
