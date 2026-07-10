from datetime import datetime
from pathlib import PurePosixPath
import re
from typing import Annotated, Any
from urllib.parse import urlsplit

from pydantic import AfterValidator, BaseModel, ConfigDict, field_validator


PHONE_RE = re.compile(r"^\+?[0-9][0-9\s().-]{5,49}$")


def normalize_required_text(value: Any) -> Any:
    if isinstance(value, str):
        value = value.strip()
    if value == "":
        raise ValueError("Field must not be blank")
    return value


def normalize_optional_text(value: Any) -> Any:
    if value is None:
        return None
    if isinstance(value, str):
        value = value.strip()
    return value or None


def validate_phone_number(value: str) -> str:
    value = normalize_required_text(value)
    if not isinstance(value, str) or not PHONE_RE.fullmatch(value):
        raise ValueError("Phone number is invalid")
    if sum(char.isdigit() for char in value) < 6:
        raise ValueError("Phone number is invalid")
    return value


def validate_optional_phone_number(value: str | None) -> str | None:
    value = normalize_optional_text(value)
    return validate_phone_number(value) if value is not None else None


def validate_http_url(value: str) -> str:
    parsed = urlsplit(value)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise ValueError("URL must use HTTP or HTTPS")
    return value


HttpUrlString = Annotated[str, AfterValidator(validate_http_url)]


def validate_image_url(value: str) -> str:
    parsed = urlsplit(value)
    parts = PurePosixPath(parsed.path).parts
    if (
        not parsed.scheme
        and not parsed.netloc
        and not parsed.query
        and not parsed.fragment
        and len(parts) >= 3
        # "uploads" covers admin-uploaded files; "images" covers the frontend's
        # bundled static assets (e.g. seeded defaults that predate the uploader).
        and parts[1] in {"uploads", "images"}
        and ".." not in parts
        and "\\" not in value
    ):
        return value
    return validate_http_url(value)


ImageUrlString = Annotated[str, AfterValidator(validate_image_url)]


def validate_safe_link(value: str) -> str:
    parsed = urlsplit(value)
    if parsed.netloc and not parsed.scheme:
        raise ValueError("Link must use HTTP or HTTPS, or be a relative path")
    if parsed.scheme and parsed.scheme not in {"http", "https"}:
        raise ValueError("Link must use HTTP or HTTPS, or be a relative path")
    return value


SafeLinkString = Annotated[str, AfterValidator(validate_safe_link)]


class LocalizedText(BaseModel):
    ar: str | None = None
    en: str | None = None
    he: str | None = None


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class TextSanitizedModel(BaseModel):
    @field_validator("*", mode="before")
    @classmethod
    def normalize_text_fields(cls, value: Any) -> Any:
        return normalize_optional_text(value) if isinstance(value, str) else value


class MessageResponse(BaseModel):
    message: str


class TimestampedModel(ORMModel):
    created_at: datetime
    updated_at: datetime
