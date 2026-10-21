"""Server-side Hebrew -> English translation for CMS writes."""
from copy import deepcopy
import re
from time import monotonic
from typing import TypeVar

import httpx
from fastapi import HTTPException
from pydantic import BaseModel, ValidationError

from app.core.config import settings


T = TypeVar("T", bound=BaseModel)
COMPANY_IDS = {"completed-projects", "years-experience", "warranty-years"}
HEBREW = re.compile(r"[\u0590-\u05ff]")
# Keep Latin brand names and model numbers verbatim, including in mixed text.
LATIN_NAME = re.compile(r"([A-Za-z\u00c0-\u024f][A-Za-z\u00c0-\u024f0-9.+&'/-]*(?:[ \t]+[A-Za-z\u00c0-\u024f0-9][A-Za-z\u00c0-\u024f0-9.+&'/-]*)*)")


def translate_hebrew(
    text: str, *, _deadline: float | None = None, _cache: dict[str, str] | None = None,
) -> str:
    if not HEBREW.search(text):
        return text
    deadline = _deadline if _deadline is not None else monotonic() + settings.translation_timeout_seconds
    cache = _cache if _cache is not None else {}
    if text in cache:
        return cache[text]
    parts = LATIN_NAME.split(text)
    if len(parts) > 1:
        return "".join(
            part[:len(part) - len(part.lstrip())]
            + translate_hebrew(part.strip(), _deadline=deadline, _cache=cache)
            + part[len(part.rstrip()):]
            if HEBREW.search(part) else part
            for part in parts
        )
    try:
        remaining = deadline - monotonic()
        if remaining <= 0:
            raise ValueError("Translation deadline exceeded")
        response = httpx.post(
            f"{settings.translation_url.rstrip('/')}/translate",
            json={"q": text, "source": "he", "target": "en", "format": "text"},
            timeout=remaining,
        )
        response.raise_for_status()
        if monotonic() >= deadline:
            raise ValueError("Translation deadline exceeded")
        result = response.json()["translatedText"]
        if not isinstance(result, str) or not result.strip():
            raise ValueError("Empty translation")
        cache[text] = result.strip()
        return cache[text]
    except (httpx.HTTPError, ValueError, KeyError, TypeError) as exc:
        raise HTTPException(
            status_code=503,
            detail="Automatic translation is unavailable. Nothing was saved; please retry.",
        ) from exc


def _validate_hebrew_sources(value: object) -> None:
    if isinstance(value, dict):
        for key, item in value.items():
            if key.endswith("_en") and key[:-3] + "_he" not in value:
                raise HTTPException(
                    status_code=422,
                    detail=f"{key} requires its Hebrew source {key[:-3]}_he; English-only writes are not supported.",
                )
            _validate_hebrew_sources(item)
    elif isinstance(value, list):
        for item in value:
            _validate_hebrew_sources(item)


def translate_fields(
    data: T, *, existing: object | None = None,
    _deadline: float | None = None, _cache: dict[str, str] | None = None,
) -> T:
    """Hebrew is authoritative; preserve English when its source is unchanged.

    Every submitted English field must include its paired Hebrew source.
    English values are ignored in favor of generated or existing translations.
    """
    deadline = _deadline if _deadline is not None else monotonic() + settings.translation_timeout_seconds
    cache = _cache if _cache is not None else {}
    payload = data.model_dump(exclude_unset=True)
    _validate_hebrew_sources(payload)
    for he_key, source in list(payload.items()):
        if not he_key.endswith("_he"):
            continue
        en_key = he_key[:-3] + "_en"
        if en_key not in type(data).model_fields:
            continue
        if existing is not None and getattr(existing, he_key, object()) == source:
            payload.pop(en_key, None)
            continue
        payload[en_key] = (
            translate_hebrew(source.strip(), _deadline=deadline, _cache=cache)
            if isinstance(source, str) and source.strip()
            else None
        )
    # Production project creation includes captions in the same transaction.
    if "images" in payload:
        payload["images"] = [
            translate_fields(image, _deadline=deadline, _cache=cache).model_dump()
            for image in data.images
        ]
    try:
        return type(data).model_validate(payload)
    except ValidationError as exc:
        raise HTTPException(
            status_code=422,
            detail="Automatic translation exceeds a field limit; nothing was saved.",
        ) from exc


def _stats(value: object, *, strict: bool = False, partial: bool = False) -> dict[tuple[str, str], dict]:
    if not isinstance(value, dict):
        return {}
    labels = {}
    seen = set()

    def add(key: str, item: object) -> None:
        if not isinstance(item, dict) or not isinstance(item.get("id"), str):
            if strict:
                raise HTTPException(status_code=422, detail="Company number IDs must be strings.")
            return
        if item["id"] not in COMPANY_IDS:
            return
        identity = (key, item["id"])
        if identity in seen:
            if strict:
                raise HTTPException(status_code=422, detail="Company numbers require unique IDs within each section.")
            return
        seen.add(identity)
        if partial and "label" not in item:
            return
        if not isinstance(item.get("label"), dict):
            if strict:
                raise HTTPException(status_code=422, detail="Company numbers require unique IDs and label objects.")
            return
        labels[identity] = item["label"]

    for key in ("heroStats", "aboutPreviewStats", "aboutPageStats"):
        rows = value.get(key)
        if key in value and not isinstance(rows, list) and strict:
            raise HTTPException(status_code=422, detail="Company number sections must be lists.")
        if isinstance(rows, list):
            for item in rows:
                add(key, item)
    if "aboutHighlight" in value:
        add("aboutHighlight", value["aboutHighlight"])
    return labels


def _merge_stats_content(existing: object, incoming: object) -> object:
    """Patch dictionaries and stat rows by ID without dropping stored content."""
    if isinstance(existing, dict) and isinstance(incoming, dict):
        result = deepcopy(existing)
        for key, value in incoming.items():
            result[key] = _merge_stats_content(result.get(key), value)
        return result
    if isinstance(existing, list) and isinstance(incoming, list):
        # Only merge identified rows. Other JSON arrays retain replacement semantics.
        if all(isinstance(row, dict) and isinstance(row.get("id"), str) for row in existing + incoming):
            result = deepcopy(existing)
            positions = {row["id"]: index for index, row in enumerate(result)}
            for row in incoming:
                if row["id"] in positions:
                    index = positions[row["id"]]
                    result[index] = _merge_stats_content(result[index], row)
                else:
                    positions[row["id"]] = len(result)
                    result.append(deepcopy(row))
            return result
    return deepcopy(incoming)


def translate_public_stats(value: object, *, existing: object = None) -> object:
    """Apply Hebrew label changes to all duplicates, preserving unrelated JSON."""
    if not isinstance(value, dict):
        raise HTTPException(status_code=422, detail="Company numbers must be a JSON object.")
    deadline = monotonic() + settings.translation_timeout_seconds
    old = _stats(existing)
    incoming = _stats(value, strict=True, partial=True)
    sources = {}
    for identity, label in incoming.items():
        if "en" in label and "he" not in label:
            raise HTTPException(status_code=422, detail="Company number English labels require their Hebrew source; English-only writes are not supported.")
        if "he" not in label:
            if identity not in old:
                raise HTTPException(status_code=422, detail="New company number labels require Hebrew text.")
            continue
        stat_id = identity[1]
        source = label.get("he")
        if source is not None and not isinstance(source, str):
            raise HTTPException(status_code=422, detail="Company number labels must be text.")
        source = (source or "").strip()
        if stat_id in sources and sources[stat_id] != source:
            raise HTTPException(status_code=422, detail="Company number labels must match across sections.")
        sources[stat_id] = source
    result = _merge_stats_content(existing, value)
    new = _stats(result, strict=True)
    # A partial edit to one occurrence updates the label on every stored occurrence.
    for identity, label in new.items():
        if identity[1] in sources:
            label["he"] = sources[identity[1]]
    canonical = {}
    cache = {}
    for identity, label in new.items():
        stat_id = identity[1]
        source = label.get("he")
        if source is not None and not isinstance(source, str):
            raise HTTPException(status_code=422, detail="Company number labels must be text.")
        source = (source or "").strip()
        if stat_id in canonical:
            if canonical[stat_id][0] != source:
                raise HTTPException(status_code=422, detail="Company number labels must match across sections.")
        else:
            previous = next((prev["en"] for key, prev in old.items()
                             if key[1] == stat_id and isinstance(prev.get("he", ""), (str, type(None)))
                             and (prev.get("he") or "").strip() == source
                             and isinstance(prev.get("en"), str) and (prev["en"].strip() or not source)), None)
            english = previous if previous is not None else (
                translate_hebrew(source, _deadline=deadline, _cache=cache) if source else ""
            )
            canonical[stat_id] = (source, english)
        label["en"] = canonical[stat_id][1]
    return result
