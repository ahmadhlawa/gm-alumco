from datetime import datetime

from pydantic import BaseModel, ConfigDict


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
