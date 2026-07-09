from datetime import datetime
from pathlib import PurePosixPath
from typing import Annotated
from urllib.parse import urlsplit

from pydantic import AfterValidator, BaseModel, ConfigDict


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


class MessageResponse(BaseModel):
    message: str


class TimestampedModel(ORMModel):
    created_at: datetime
    updated_at: datetime
