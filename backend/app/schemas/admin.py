from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.schemas.common import ORMModel, normalize_required_text


AdminRole = Literal["admin", "super_admin"]


class AdminCreate(BaseModel):
    full_name: str = Field(min_length=1, max_length=150)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: AdminRole = "admin"

    @field_validator("full_name", mode="before")
    @classmethod
    def _full_name_not_blank(cls, value: str) -> str:
        return normalize_required_text(value)


class AdminUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=150)
    email: EmailStr | None = None
    password: str | None = Field(default=None, min_length=8, max_length=128)
    role: AdminRole | None = None
    is_active: bool | None = None

    @field_validator("full_name", mode="before")
    @classmethod
    def _full_name_not_blank(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return normalize_required_text(value)


class AdminRead(ORMModel):
    id: int
    full_name: str
    email: str
    role: AdminRole
    is_active: bool
    created_at: datetime
    updated_at: datetime
    last_login_at: datetime | None = None
