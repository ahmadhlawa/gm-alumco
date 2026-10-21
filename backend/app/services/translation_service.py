"""Server-side Hebrew -> English translation for CMS writes."""
from copy import deepcopy
from typing import TypeVar

import httpx
from fastapi import HTTPException
from pydantic import BaseModel, ValidationError

from app.core.config import settings


T = TypeVar("T", bound=BaseModel)
COMPANY_IDS = {"completed-projects", "years-experience", "warranty-years"}


def translate_hebrew(text: str) -> str:
    try:
        response = httpx.post(
            f"{settings.translation_url.rstrip('/')}/translate",
            json={"q": text, "source": "he", "target": "en", "format": "text"},
            timeout=settings.translation_timeout_seconds,
        )
        response.raise_for_status()
        result = response.json()["translatedText"]
        if not isinstance(result, str) or not result.strip():
            raise ValueError("Empty translation")
        return result.strip()
    except (httpx.HTTPError, ValueError, KeyError, TypeError) as exc:
        raise HTTPException(
            status_code=503,
            detail="Automatic translation is unavailable. Nothing was saved; please retry.",
        ) from exc


def translate_fields(data: T, *, existing: object | None = None) -> T:
    """Fill English for new/changed Hebrew. Explicit English remains legacy-compatible."""
    payload = data.model_dump(exclude_unset=True)
    for he_key, source in list(payload.items()):
        if not he_key.endswith("_he"):
            continue
        en_key = he_key[:-3] + "_en"
        if en_key not in type(data).model_fields or en_key in payload:
            continue
        if existing is not None and getattr(existing, he_key, object()) == source:
            continue
        payload[en_key] = (
            translate_hebrew(source.strip())
            if isinstance(source, str) and source.strip()
            else None
        )
    try:
        return type(data).model_validate(payload)
    except ValidationError as exc:
        raise HTTPException(
            status_code=422,
            detail="Automatic translation exceeds a field limit; nothing was saved.",
        ) from exc


def _stats(value: object) -> dict[str, dict]:
    if not isinstance(value, dict):
        return {}
    labels = {}
    for key in ("heroStats", "aboutPreviewStats", "aboutPageStats"):
        rows = value.get(key)
        if isinstance(rows, list):
            for item in rows:
                if isinstance(item, dict) and item.get("id") in COMPANY_IDS and isinstance(item.get("label"), dict):
                    labels.setdefault(item["id"], item["label"])
    highlight = value.get("aboutHighlight")
    if isinstance(highlight, dict) and highlight.get("id") in COMPANY_IDS and isinstance(highlight.get("label"), dict):
        labels.setdefault(highlight["id"], highlight["label"])
    return labels


def translate_public_stats(value: object, *, existing: object = None) -> object:
    """Translate canonical company-number labels, preserving other JSON sections."""
    if not isinstance(value, dict):
        return value
    result = deepcopy(value)
    old = _stats(existing)
    new = _stats(result)
    translated = {}
    for stat_id, label in new.items():
        source = label.get("he")
        if not isinstance(source, str) or not source.strip():
            continue
        prev = old.get(stat_id, {})
        translated[stat_id] = (
            prev["en"]
            if prev.get("he") == source and isinstance(prev.get("en"), str) and prev["en"].strip()
            else translate_hebrew(source.strip())
        )
    for key in ("heroStats", "aboutPreviewStats", "aboutPageStats"):
        rows = result.get(key)
        if isinstance(rows, list):
            for item in rows:
                if isinstance(item, dict) and item.get("id") in translated and isinstance(item.get("label"), dict):
                    item["label"]["en"] = translated[item["id"]]
    highlight = result.get("aboutHighlight")
    if isinstance(highlight, dict) and highlight.get("id") in translated and isinstance(highlight.get("label"), dict):
        highlight["label"]["en"] = translated[highlight["id"]]
    return result
