from datetime import datetime

from pydantic import BaseModel, Field, ValidationInfo, field_validator

from app.schemas.common import ImageUrlString, ORMModel, SafeLinkString, TextSanitizedModel


class AboutPageContentBase(TextSanitizedModel):
    # At most 64,000 UTF-8 bytes, within MySQL TEXT capacity even for 4-byte characters.
    body_he: str | None = Field(default=None, max_length=16000)
    body_en: str | None = Field(default=None, max_length=16000)

    @field_validator("*", mode="before")
    @classmethod
    def normalize_text_fields(cls, value, info: ValidationInfo):
        if info.field_name in {"body_he", "body_en"} and isinstance(value, str):
            # Empty saved bodies intentionally suppress the legacy fallback.
            return value.replace("\r\n", "\n").replace("\r", "\n").strip()
        return TextSanitizedModel.normalize_text_fields(value)

    title_en: str | None = Field(default=None, max_length=60)
    title_he: str | None = Field(default=None, max_length=60)
    subtitle_en: str | None = Field(default=None, max_length=120)
    subtitle_he: str | None = Field(default=None, max_length=120)
    paragraph_1_en: str | None = Field(default=None, max_length=350)
    paragraph_1_he: str | None = Field(default=None, max_length=350)
    paragraph_2_en: str | None = Field(default=None, max_length=350)
    paragraph_2_he: str | None = Field(default=None, max_length=350)
    bullet_1_en: str | None = Field(default=None, max_length=90)
    bullet_1_he: str | None = Field(default=None, max_length=90)
    bullet_2_en: str | None = Field(default=None, max_length=90)
    bullet_2_he: str | None = Field(default=None, max_length=90)
    bullet_3_en: str | None = Field(default=None, max_length=90)
    bullet_3_he: str | None = Field(default=None, max_length=90)
    bullet_4_en: str | None = Field(default=None, max_length=90)
    bullet_4_he: str | None = Field(default=None, max_length=90)
    image_url: ImageUrlString | None = Field(default=None, max_length=500)
    experience_number: str | None = Field(default=None, max_length=12)
    experience_label_en: str | None = Field(default=None, max_length=40)
    experience_label_he: str | None = Field(default=None, max_length=40)

    vision_title_en: str | None = Field(default=None, max_length=60)
    vision_title_he: str | None = Field(default=None, max_length=60)
    vision_text_en: str | None = Field(default=None, max_length=250)
    vision_text_he: str | None = Field(default=None, max_length=250)
    mission_title_en: str | None = Field(default=None, max_length=60)
    mission_title_he: str | None = Field(default=None, max_length=60)
    mission_text_en: str | None = Field(default=None, max_length=250)
    mission_text_he: str | None = Field(default=None, max_length=250)

    difference_title_en: str | None = Field(default=None, max_length=60)
    difference_title_he: str | None = Field(default=None, max_length=60)
    difference_intro_en: str | None = Field(default=None, max_length=120)
    difference_intro_he: str | None = Field(default=None, max_length=120)
    difference_paragraph_en: str | None = Field(default=None, max_length=350)
    difference_paragraph_he: str | None = Field(default=None, max_length=350)
    cta_text_en: str | None = Field(default=None, max_length=40)
    cta_text_he: str | None = Field(default=None, max_length=40)
    cta_link: SafeLinkString | None = Field(default=None, max_length=255)
    stat_1_number: str | None = Field(default=None, max_length=12)
    stat_1_label_en: str | None = Field(default=None, max_length=40)
    stat_1_label_he: str | None = Field(default=None, max_length=40)
    stat_2_number: str | None = Field(default=None, max_length=12)
    stat_2_label_en: str | None = Field(default=None, max_length=40)
    stat_2_label_he: str | None = Field(default=None, max_length=40)
    stat_3_number: str | None = Field(default=None, max_length=12)
    stat_3_label_en: str | None = Field(default=None, max_length=40)
    stat_3_label_he: str | None = Field(default=None, max_length=40)


class AboutPageContentUpdate(AboutPageContentBase):
    @field_validator("body_he", "body_en", mode="before")
    @classmethod
    def clear_body(cls, value):
        return "" if value is None else value


class AboutPageContentRead(AboutPageContentBase, ORMModel):
    id: int
    created_at: datetime
    updated_at: datetime


class AboutPageContentPublic(AboutPageContentBase, ORMModel):
    """Fields the public About page needs — no internal id/audit timestamps."""
