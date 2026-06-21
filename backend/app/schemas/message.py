from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field

from app.schemas.common import ORMModel


ContactMessageStatus = Literal["new", "read", "archived"]
QuoteRequestStatus = Literal["new", "in_progress", "completed", "archived"]


class ContactMessageCreate(BaseModel):
    name: str = Field(min_length=1, max_length=180)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=50)
    subject: str | None = Field(default=None, max_length=255)
    message: str = Field(min_length=1)


class ContactMessageRead(ContactMessageCreate, ORMModel):
    id: int
    status: ContactMessageStatus
    created_at: datetime


class ContactMessageStatusUpdate(BaseModel):
    status: ContactMessageStatus


class QuoteRequestCreate(BaseModel):
    name: str = Field(min_length=1, max_length=180)
    email: EmailStr
    phone: str = Field(min_length=1, max_length=50)
    service_type: str | None = Field(default=None, max_length=180)
    message: str | None = None


class QuoteRequestRead(QuoteRequestCreate, ORMModel):
    id: int
    status: QuoteRequestStatus
    created_at: datetime
    updated_at: datetime


class QuoteRequestStatusUpdate(BaseModel):
    status: QuoteRequestStatus
