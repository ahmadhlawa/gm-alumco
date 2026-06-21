from datetime import datetime
from typing import Annotated
from urllib.parse import urlsplit

from pydantic import AfterValidator, BaseModel, ConfigDict


def validate_http_url(value: str) -> str:
    parsed = urlsplit(value)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise ValueError("URL must use HTTP or HTTPS")
    return value


HttpUrlString = Annotated[str, AfterValidator(validate_http_url)]


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
