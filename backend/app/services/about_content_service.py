"""About-specific legacy mapping without altering the stored legacy columns."""
from app.schemas.about_page_content import AboutPageContentUpdate
from app.services.translation_service import translate_fields


def legacy_body(content: object, language: str) -> str:
    other = "en" if language == "he" else "he"

    def text(name: str) -> str:
        primary = (getattr(content, f"{name}_{language}", None) or "").strip()
        return primary or (getattr(content, f"{name}_{other}", None) or "").strip()

    paragraphs = [text(f"paragraph_{index}") for index in (1, 2)]
    bullets = [f"- {text(f'bullet_{index}')}" for index in range(1, 5) if text(f"bullet_{index}")]
    return "\n\n".join(part for part in [*paragraphs, "\n".join(bullets)] if part)


def translate_about_content(data: AboutPageContentUpdate, existing: object | None) -> AboutPageContentUpdate:
    # First save of the legacy editor projection copies its curated English.
    # Never add a body implicitly during unrelated updates (e.g. Vision/Mission).
    if (existing is not None and getattr(existing, "body_he", None) is None
            and "body_he" in data.model_fields_set and data.body_he == legacy_body(existing, "he")):
        remaining = data.model_dump(exclude_unset=True, exclude={"body_he", "body_en"})
        translated = translate_fields(AboutPageContentUpdate.model_validate(remaining), existing=existing)
        return AboutPageContentUpdate.model_validate({
            **translated.model_dump(exclude_unset=True),
            "body_he": data.body_he, "body_en": legacy_body(existing, "en"),
        })
    return translate_fields(data, existing=existing, structured_fields=frozenset({"body_he"}))
