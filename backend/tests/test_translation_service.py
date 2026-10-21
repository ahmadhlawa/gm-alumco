"""CMS translation contracts; all HTTP traffic and database writes stay local."""
from types import SimpleNamespace

import httpx
import pytest
from fastapi import HTTPException
from sqlalchemy import func, select

from app.models.about_page_content import AboutPageContent
from app.schemas.project import ProjectUpdate
from app.services.translation_service import translate_fields, translate_public_stats


@pytest.fixture
def translator(monkeypatch):
    calls = []

    def post(url, *, json, timeout):
        calls.append(json)
        return httpx.Response(200, json={"translatedText": "English text"}, request=httpx.Request("POST", url))

    monkeypatch.setattr("app.services.translation_service.httpx.post", post)
    return calls


@pytest.mark.parametrize("route,payload,field", [
    ("projects", {"title_he": "פרויקט"}, "title_en"),
    ("production-projects", {"title_he": "פרויקט", "images": [{"image_url": "/uploads/test/a.jpg", "alt_text_he": "חלון"}]}, "title_en"),
    ("services", {"title_he": "שירות"}, "title_en"),
    ("partners", {"name_he": "שותף", "logo_url": "/uploads/test/a.jpg"}, "name_en"),
    ("testimonials", {"client_name_he": "לקוח", "message_he": "תודה"}, "message_en"),
])
def test_hebrew_only_create_update_and_preserve(client, auth_headers, translator, route, payload, field):
    headers = auth_headers()
    url = f"/api/v1/admin/{route}"
    response = client.post(url, headers=headers, json=payload)
    assert response.status_code == 201, response.text
    body = response.json()
    assert body[field] == "English text"
    if route == "production-projects":
        assert body["images"][0]["alt_text_en"] == "English text"
    url += f"/{body['id']}"
    count = len(translator)
    unchanged = {k: v for k, v in payload.items() if k.endswith("_he")}
    unchanged[field] = "Stale English from an old client"
    response = client.put(url, headers=headers, json={**unchanged, "sort_order": 7})
    assert response.status_code == 200
    assert response.json()[field] == "English text"
    assert len(translator) == count
    he_field = field[:-3] + "_he"
    response = client.put(url, headers=headers, json={he_field: "תוכן חדש", field: "Stale"})
    assert response.status_code == 200
    assert response.json()[field] == "English text"
    assert len(translator) == count + 1


def test_optional_clear_and_null_required_validation(client, auth_headers, translator):
    headers = auth_headers()
    url = "/api/v1/admin/projects"
    body = client.post(url, headers=headers, json={"title_he": "פרויקט", "description_he": "תיאור"}).json()
    url += f"/{body['id']}"
    cleared = client.put(url, headers=headers, json={"description_he": " "})
    assert cleared.status_code == 200
    assert cleared.json()["description_en"] is None
    assert client.put(url, headers=headers, json={"title_he": None}).status_code == 422
    assert client.get(url, headers=headers).json()["title_he"] == "פרויקט"


def test_existing_english_and_latin_brands_are_preserved(translator):
    old = SimpleNamespace(title_he="כותרת", title_en="Curated title")
    translated = translate_fields(ProjectUpdate(title_he="כותרת", title_en="Stale"), existing=old)
    assert "title_en" not in translated.model_fields_set
    brand = translate_fields(ProjectUpdate(title_he="Schüco AWS 75.SI+"))
    assert brand.title_en == "Schüco AWS 75.SI+"
    assert translator == []


@pytest.mark.parametrize("failure", ["timeout", "status", "json", "shape", "empty", "too_long"])
def test_failed_update_is_atomic(client, auth_headers, translator, monkeypatch, failure):
    headers = auth_headers()
    url = "/api/v1/admin/projects"
    body = client.post(url, headers=headers, json={"title_he": "ישן"}).json()
    url += f"/{body['id']}"

    def post(url, **kwargs):
        if failure == "timeout":
            raise httpx.ReadTimeout("timeout")
        return httpx.Response(
            500 if failure == "status" else 200,
            content=b"invalid" if failure == "json" else None,
            json=None if failure == "json" else ([] if failure == "shape" else {"translatedText": "x" * 256 if failure == "too_long" else ""}),
            request=httpx.Request("POST", url),
        )

    monkeypatch.setattr("app.services.translation_service.httpx.post", post)
    response = client.put(url, headers=headers, json={"title_he": "חדש", "sort_order": 99})
    assert response.status_code == (422 if failure == "too_long" else 503)
    stored = client.get(url, headers=headers).json()
    assert (stored["title_he"], stored["title_en"], stored["sort_order"]) == ("ישן", "English text", 0)


def test_about_failure_does_not_create_singleton(client, db, auth_headers, monkeypatch):
    headers = auth_headers()
    def fail(*args, **kwargs):
        raise httpx.ConnectError("offline")
    monkeypatch.setattr("app.services.translation_service.httpx.post", fail)
    response = client.put("/api/v1/admin/about-page-content", headers=headers, json={"title_he": "אודות"})
    assert response.status_code == 503
    assert db.scalar(select(func.count()).select_from(AboutPageContent)) == 0


def test_stats_preserve_each_existing_translation_and_clear_empty(translator):
    old = {"heroStats": [{"id": "completed-projects", "label": {"he": "פרויקטים", "en": "Projects"}}],
           "aboutPageStats": [{"id": "completed-projects", "label": {"he": "פרויקטים", "en": "Completed projects"}}]}
    result = translate_public_stats(old, existing=old)
    assert result == old
    assert translator == []
    empty = {"heroStats": [{"id": "completed-projects", "label": {"he": "", "en": "stale"}}]}
    assert translate_public_stats(empty)["heroStats"][0]["label"]["en"] == ""


def test_stats_reject_conflicting_hebrew_labels(translator):
    value = {"heroStats": [{"id": "completed-projects", "label": {"he": "אחד"}}],
             "aboutPageStats": [{"id": "completed-projects", "label": {"he": "אחר"}}]}
    with pytest.raises(HTTPException) as exc:
        translate_public_stats(value)
    assert exc.value.status_code == 422


def test_about_hebrew_create_edit_and_preserve(client, auth_headers, translator):
    headers = auth_headers()
    url = "/api/v1/admin/about-page-content"
    first = client.put(url, headers=headers, json={"title_he": "אודות", "paragraph_1_he": "הסיפור שלנו"})
    assert first.status_code == 200
    assert first.json()["paragraph_1_en"] == "English text"
    count = len(translator)
    same = client.put(url, headers=headers, json={"title_he": "אודות", "image_url": "/uploads/test/about.jpg"})
    assert same.status_code == 200
    assert same.json()["title_en"] == "English text"
    assert len(translator) == count
    changed = client.put(url, headers=headers, json={"title_he": "סיפור חדש", "paragraph_1_he": None})
    assert changed.status_code == 200
    assert changed.json()["title_en"] == "English text"
    assert changed.json()["paragraph_1_en"] is None


def test_company_numbers_api_create_update_and_failure(client, auth_headers, translator, monkeypatch):
    headers = auth_headers()
    url = "/api/v1/admin/site-content"
    value = {"heroStats": [{"id": "completed-projects", "value": "250", "label": {"he": "פרויקטים"}}],
             "valueChips": [{"label": {"en": "Untouched", "ar": "عربي"}}]}
    created = client.post(url, headers=headers, json={"section": "public_stats", "key": "content", "content_type": "json", "value": value})
    assert created.status_code == 201, created.text
    body = created.json()
    assert body["value"]["heroStats"][0]["label"]["en"] == "English text"
    assert body["value"]["valueChips"] == value["valueChips"]
    url += f"/{body['id']}"
    count = len(translator)
    value["heroStats"][0]["value"] = "300"
    updated = client.put(url, headers=headers, json={"value": value})
    assert updated.status_code == 200
    assert updated.json()["value"]["heroStats"][0]["label"]["en"] == "English text"
    assert len(translator) == count
    def fail(*args, **kwargs):
        raise httpx.ConnectError("offline")
    monkeypatch.setattr("app.services.translation_service.httpx.post", fail)
    value["heroStats"][0]["label"]["he"] = "חדש"
    assert client.put(url, headers=headers, json={"value": value}).status_code == 503
    assert client.get(url, headers=headers).json()["value"] == updated.json()["value"]


@pytest.mark.parametrize("route", ["projects", "production-projects"])
def test_caption_translation_and_failure_are_atomic(client, auth_headers, translator, monkeypatch, route):
    headers = auth_headers()
    url = f"/api/v1/admin/{route}"
    created = client.post(url, headers=headers, json={"title_he": "פרויקט"}).json()
    url += f"/{created['id']}/images"
    image = client.post(url, headers=headers, json={"image_url": "/uploads/test/a.jpg", "alt_text_he": "חלון"})
    assert image.status_code == 201
    assert image.json()["alt_text_en"] == "English text"
    def fail(*args, **kwargs):
        raise httpx.ReadTimeout("offline")
    monkeypatch.setattr("app.services.translation_service.httpx.post", fail)
    assert client.post(url, headers=headers, json={"image_url": "/uploads/test/b.jpg", "alt_text_he": "דלת"}).status_code == 503
    detail = client.get(url.removesuffix("/images"), headers=headers).json()
    assert len(detail["images"]) == 1


def test_mixed_brand_tokens_and_request_contract(translator):
    result = translate_fields(ProjectUpdate(title_he="חלונות Schüco AWS 75.SI+ איכות"))
    assert result.title_en == "English text Schüco AWS 75.SI+ English text"
    assert all(call["source"] == "he" and call["target"] == "en" and call["format"] == "text" for call in translator)


@pytest.mark.parametrize("value", [[], None, {"heroStats": "bad"}, {"heroStats": [{"id": [], "label": {}}]}, {"heroStats": [{"id": "completed-projects", "label": []}]}, {"heroStats": [{"id": "completed-projects", "label": {"he": 1}}]}])
def test_malformed_stats_return_validation_error(value, translator):
    with pytest.raises(HTTPException) as exc:
        translate_public_stats(value)
    assert exc.value.status_code == 422


def test_failed_creates_leave_no_records(client, auth_headers, monkeypatch):
    headers = auth_headers()
    def fail(*args, **kwargs):
        raise httpx.ReadTimeout("offline")
    monkeypatch.setattr("app.services.translation_service.httpx.post", fail)
    for route, payload in [
        ("projects", {"title_he": "פרויקט"}),
        ("production-projects", {"title_he": "פרויקט"}),
        ("services", {"title_he": "שירות"}),
        ("partners", {"name_he": "שותף", "logo_url": "/uploads/test/a.jpg"}),
        ("testimonials", {"client_name_he": "לקוח", "message_he": "תודה"}),
    ]:
        url = f"/api/v1/admin/{route}"
        assert client.post(url, headers=headers, json=payload).status_code == 503
        assert client.get(url, headers=headers).json() == []


def test_whole_save_has_one_timeout_budget(client, db, auth_headers, monkeypatch):
    headers = auth_headers()
    clock = [0.0]
    monkeypatch.setattr("app.services.translation_service.monotonic", lambda: clock[0], raising=False)
    def slow(url, **kwargs):
        clock[0] += 10
        return httpx.Response(200, json={"translatedText": "English text"}, request=httpx.Request("POST", url))
    monkeypatch.setattr("app.services.translation_service.httpx.post", slow)
    response = client.put("/api/v1/admin/about-page-content", headers=headers, json={"title_he": "אודות", "subtitle_he": "סיפור", "paragraph_1_he": "פרטים"})
    assert response.status_code == 503
    assert db.scalar(select(func.count()).select_from(AboutPageContent)) == 0
