from fastapi.testclient import TestClient
import httpx
import pytest
from sqlalchemy import select, text

from app.models.about_page_content import AboutPageContent


def test_brands_and_terms_in_long_body_preserve_structure_and_existing_english(client, db, auth_headers, monkeypatch):
    headers = auth_headers()
    url = "/api/v1/admin/about-page-content"
    baseline = client.get(url, headers=headers).json()
    def post(url, *, json, timeout):
        query = json["q"]
        assert "טכנו" not in query and "אלוקובונד" not in query and "קירות מסך" not in query
        return httpx.Response(200, json={"translatedText": query.replace("תוכן ארוך", "Long content").replace("המשך", "More")}, request=httpx.Request("POST", url))
    monkeypatch.setattr("app.services.translation_service.httpx.post", post)
    paragraph = "תוכן ארוך " * 80
    body = paragraph + "טכנו אלום סיסטם\n\n" + "\n".join([
        "- טכנו אלום סיסטם", "* קירות מסך", "× חיפויי אלוקובונד", "• חזיתות מבנים",
        "- T.A.S", "* Techno Alum System", "• אלוקובונד",
    ]) + "\n\nהמשך טכנו־אלום־סיסטם"
    response = client.put(url, headers=headers, json={"body_he": body})
    assert response.status_code == 200, response.text
    saved = response.json()
    assert saved["body_he"] == body
    assert saved["body_en"] == "Long content " * 80 + "Techno Alum System\n\n- Techno Alum System\n* curtain walls\n× ALUCOBOND cladding\n• building façades\n- T.A.S\n* Techno Alum System\n• ALUCOBOND\n\nMore Techno Alum System"
    assert client.get("/api/v1/about-page-content").json()["body_en"] == saved["body_en"]
    for key in ["vision_text_he", "vision_text_en", "mission_text_he", "mission_text_en"]:
        assert saved[key] == baseline[key]
    def offline(*args, **kwargs):
        raise AssertionError("Unchanged Hebrew must preserve stored English without translation")
    monkeypatch.setattr("app.services.translation_service.httpx.post", offline)
    response = client.put(url, headers=headers, json={"body_he": body, "body_en": "Unapproved"})
    assert response.status_code == 200
    assert response.json()["body_en"] == saved["body_en"]


@pytest.mark.parametrize("failure", ["missing", "duplicate", "corrupted", "suffix", "prefix"])
def test_lost_or_corrupted_protected_terms_never_write_partial_content(client, auth_headers, monkeypatch, failure):
    headers = auth_headers()
    url = "/api/v1/admin/about-page-content"
    original = client.get(url, headers=headers).json()
    calls = []
    def post(url, *, json, timeout):
        query = json["q"]
        calls.append(query)
        if len(calls) == 1:
            result = "Translated introduction"
        elif failure == "missing":
            result = "The Aluminum Sistm"
        elif failure == "duplicate":
            result = query + " " + query
        elif failure == "corrupted":
            result = "Corrupted " + query.replace("QXZ", "broken")
        elif failure == "suffix":
            result = query.replace("QXZ", "QXZX")
        else:
            result = query.replace("ZXQATS", "XZXQATS")
        return httpx.Response(200, json={"translatedText": result}, request=httpx.Request("POST", url))
    monkeypatch.setattr("app.services.translation_service.httpx.post", post)
    response = client.put(url, headers=headers, json={"body_he": "פתיחה\n\n- טכנו אלום סיסטם היא חברה", "image_url": "/uploads/test/new.jpg"})
    assert response.status_code == 503
    assert "Nothing was saved" in response.json()["detail"]
    assert client.get(url, headers=headers).json() == original


@pytest.mark.parametrize("english", ["T.A.S is a leading company.", "The Aluminum Sistm is a leading company."])
def test_glossary_never_backfills_or_rewrites_unchanged_stored_english(client, db, auth_headers, monkeypatch, english):
    headers = auth_headers()
    row = AboutPageContent(body_he="טכנו אלום סיסטם היא חברה מובילה.", body_en=english)
    db.add(row)
    db.commit()
    def offline(*args, **kwargs):
        raise AssertionError("Existing English needs explicit approval for a targeted correction")
    monkeypatch.setattr("app.services.translation_service.httpx.post", offline)
    response = client.put("/api/v1/admin/about-page-content", headers=headers, json={"body_he": row.body_he, "image_url": "/uploads/test/about.jpg"})
    assert response.status_code == 200
    assert response.json()["body_en"] == english


@pytest.mark.parametrize("method", ["get", "put"])
def test_missing_body_migration_returns_actionable_error_without_writes(client, db, auth_headers, method):
    headers = {**auth_headers(), "Origin": "http://localhost:5173"}
    url = "/api/v1/admin/about-page-content"
    original = client.get(url, headers=headers).json()
    db.execute(text("ALTER TABLE about_page_content DROP COLUMN body_he"))
    db.execute(text("ALTER TABLE about_page_content DROP COLUMN body_en"))
    db.commit()
    response = getattr(client, method)(url, headers=headers, **({"json": {"body_he": "חדש"}} if method == "put" else {}))
    assert response.status_code == 503
    assert "migration" in response.json()["detail"].lower()
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"
    row = db.execute(text("SELECT paragraph_1_he, vision_text_he, mission_text_en FROM about_page_content")).one()
    assert tuple(row) == tuple(original[key] for key in ["paragraph_1_he", "vision_text_he", "mission_text_en"])


def test_long_body_has_a_bounded_budget_longer_than_short_cms_fields(client, auth_headers, monkeypatch):
    headers = auth_headers()
    clock = [0.0]
    monkeypatch.setattr("app.services.translation_service.monotonic", lambda: clock[0])
    monkeypatch.setattr("app.services.about_content_service.monotonic", lambda: clock[0], raising=False)
    def slow(url, **kwargs):
        clock[0] += 3
        return httpx.Response(200, json={"translatedText": "English paragraph"}, request=httpx.Request("POST", url))
    monkeypatch.setattr("app.services.translation_service.httpx.post", slow)
    body = "פתיחה ארוכה\n\n" + "\n".join(f"- נקודה {i}" for i in range(6)) + "\n\nסיום ארוך"
    response = client.put("/api/v1/admin/about-page-content", headers=headers, json={"body_he": body})
    assert response.status_code == 200, response.text
    assert response.json()["body_en"] == "English paragraph\n\n" + "\n".join(["- English paragraph"] * 6) + "\n\nEnglish paragraph"


def test_long_body_budget_exhaustion_preserves_existing_content(client, db, auth_headers, monkeypatch):
    headers = auth_headers()
    url = "/api/v1/admin/about-page-content"
    original = client.get(url, headers=headers).json()
    clock = [0.0]
    monkeypatch.setattr("app.services.translation_service.monotonic", lambda: clock[0])
    monkeypatch.setattr("app.services.about_content_service.monotonic", lambda: clock[0], raising=False)
    def slow(url, **kwargs):
        clock[0] += 31
        return httpx.Response(200, json={"translatedText": "English paragraph"}, request=httpx.Request("POST", url))
    monkeypatch.setattr("app.services.translation_service.httpx.post", slow)
    response = client.put(url, headers=headers, json={"body_he": "פתיחה\n\nסיום", "image_url": "/uploads/test/changed.jpg"})
    assert response.status_code == 503
    assert client.get(url, headers=headers).json() == original


def test_public_about_content_returns_seeded_defaults(client: TestClient) -> None:
    response = client.get("/api/v1/about-page-content")
    assert response.status_code == 200
    payload = response.json()
    assert payload["title_en"] == "Our success story"
    assert payload["title_he"] == "סיפור ההצלחה שלנו"
    assert payload["image_url"] == "/images/our-success-story.png"
    assert payload["stat_1_number"] == "250+"
    # Public payload excludes internal audit fields.
    assert "id" not in payload
    assert "created_at" not in payload


def test_public_about_content_requires_no_auth(client: TestClient) -> None:
    assert client.get("/api/v1/about-page-content").status_code == 200


def test_admin_about_content_requires_auth(client: TestClient) -> None:
    assert client.get("/api/v1/admin/about-page-content").status_code == 401
    assert client.put("/api/v1/admin/about-page-content", json={}).status_code == 401


def test_admin_can_read_and_update_about_content(client: TestClient, auth_headers) -> None:
    headers = auth_headers()

    read = client.get("/api/v1/admin/about-page-content", headers=headers)
    assert read.status_code == 200
    assert "id" in read.json()

    update = client.put(
        "/api/v1/admin/about-page-content",
        headers=headers,
        json={
            "title_en": "Updated title",
            "title_he": "כותרת מעודכנת",
            "stat_1_number": "500+",
        },
    )
    assert update.status_code == 200
    assert update.json()["title_en"] == "Translated content"
    assert update.json()["stat_1_number"] == "500+"

    public = client.get("/api/v1/about-page-content")
    assert public.json()["title_en"] == "Translated content"


def test_admin_update_is_partial(client: TestClient, auth_headers) -> None:
    headers = auth_headers()

    client.put(
        "/api/v1/admin/about-page-content",
        headers=headers,
        json={"title_he": "עדכון ראשון"},
    )
    second = client.put(
        "/api/v1/admin/about-page-content",
        headers=headers,
        json={"subtitle_he": "עדכון שני"},
    )
    assert second.status_code == 200
    body = second.json()
    assert body["title_he"] == "עדכון ראשון"
    assert body["subtitle_he"] == "עדכון שני"
    assert body["title_en"] == "Translated content"
    assert body["subtitle_en"] == "Translated content"


def test_admin_update_rejects_over_limit_title(client: TestClient, auth_headers) -> None:
    headers = auth_headers()
    response = client.put(
        "/api/v1/admin/about-page-content",
        headers=headers,
        json={"title_en": "x" * 61},
    )
    assert response.status_code == 422


def test_admin_update_rejects_over_limit_paragraph(client: TestClient, auth_headers) -> None:
    headers = auth_headers()
    response = client.put(
        "/api/v1/admin/about-page-content",
        headers=headers,
        json={"paragraph_1_en": "x" * 351},
    )
    assert response.status_code == 422


def test_admin_update_rejects_unsafe_cta_link(client: TestClient, auth_headers) -> None:
    headers = auth_headers()
    response = client.put(
        "/api/v1/admin/about-page-content",
        headers=headers,
        json={"cta_link": "javascript:alert(1)"},
    )
    assert response.status_code == 422


def test_admin_update_accepts_relative_cta_link(client: TestClient, auth_headers) -> None:
    headers = auth_headers()
    response = client.put(
        "/api/v1/admin/about-page-content",
        headers=headers,
        json={"cta_link": "/contact"},
    )
    assert response.status_code == 200
    assert response.json()["cta_link"] == "/contact"


def test_admin_update_records_audit_log(client: TestClient, auth_headers) -> None:
    headers = auth_headers(role="super_admin")
    client.put(
        "/api/v1/admin/about-page-content",
        headers=headers,
        json={"title_he": "עדכון מתועד"},
    )
    logs = client.get("/api/v1/admin/audit-logs", headers=headers)
    assert logs.status_code == 200
    entries = logs.json()
    assert any(
        entry["action"] == "update" and entry["entity_type"] == "about_page_content"
        for entry in entries
    )


def test_flexible_body_preserves_long_paragraphs_lists_and_order(client, auth_headers, monkeypatch):
    headers = auth_headers()
    calls = []
    def post(url, *, json, timeout):
        calls.append(json["q"])
        assert "\n" not in json["q"]
        assert not json["q"].startswith(("-", "*", "×", "•"))
        return httpx.Response(200, json={"translatedText": "English text"}, request=httpx.Request("POST", url))
    monkeypatch.setattr("app.services.translation_service.httpx.post", post)
    paragraph = "תוכן ארוך " * 80
    body = paragraph.strip() + "\n\n" + "\n".join(f"{marker} נקודה {index}" for index, marker in enumerate(["-", "*", "×", "•", "-", "•"])) + "\n\nאחרי הרשימה\n\n* רשימה שנייה\n\nסיום"
    response = client.put("/api/v1/admin/about-page-content", headers=headers, json={"body_he": body})
    assert response.status_code == 200, response.text
    result = response.json()
    assert result["body_he"] == body
    assert result["body_en"] == "English text\n\n- English text\n* English text\n× English text\n• English text\n- English text\n• English text\n\nEnglish text\n\n* English text\n\nEnglish text"
    assert len(calls) == 10
    assert client.get("/api/v1/about-page-content").json()["body_en"] == result["body_en"]


def test_unchanged_body_preserves_curated_english_and_vision_mission(client, db, auth_headers, monkeypatch):
    headers = auth_headers()
    row = AboutPageContent(body_he="תוכן\n\n- נקודה", body_en="Curated\n\n- Item")
    db.add(row)
    db.commit()
    def fail(*args, **kwargs):
        raise AssertionError("Unchanged body must not call LibreTranslate")
    monkeypatch.setattr("app.services.translation_service.httpx.post", fail)
    response = client.put("/api/v1/admin/about-page-content", headers=headers, json={"body_he": row.body_he, "body_en": "Ignore"})
    assert response.status_code == 200
    assert response.json()["body_en"] == "Curated\n\n- Item"
    assert response.json()["vision_text_he"] == row.vision_text_he
    assert response.json()["mission_text_he"] == row.mission_text_he


def test_legacy_body_first_save_preserves_both_languages_and_columns(client, db, auth_headers, monkeypatch):
    headers = auth_headers()
    row = AboutPageContent(paragraph_1_he="התחלה", paragraph_2_he="המשך", paragraph_1_en="Intro", paragraph_2_en="More",
                           bullet_1_he="נקודה", bullet_1_en="Item", bullet_2_he="", bullet_2_en="", bullet_3_he="", bullet_3_en="", bullet_4_he="", bullet_4_en="")
    db.add(row)
    db.commit()
    legacy = client.get("/api/v1/about-page-content").json()
    assert legacy["body_he"] is None
    def fail(*args, **kwargs):
        raise AssertionError("Legacy mapping must preserve curated English")
    monkeypatch.setattr("app.services.translation_service.httpx.post", fail)
    response = client.put("/api/v1/admin/about-page-content", headers=headers, json={"body_he": "התחלה\n\nהמשך\n\n- נקודה"})
    assert response.status_code == 200, response.text
    assert response.json()["body_en"] == "Intro\n\nMore\n\n- Item"
    for key in ["paragraph_1_he", "paragraph_2_en", "bullet_1_en", "vision_text_en", "mission_text_he"]:
        assert response.json()[key] == legacy[key]


def test_body_failure_after_first_line_saves_nothing(client, db, auth_headers, monkeypatch):
    headers = auth_headers()
    calls = []
    def post(url, **kwargs):
        calls.append(kwargs["json"]["q"])
        if len(calls) == 2:
            raise httpx.ReadTimeout("offline")
        return httpx.Response(200, json={"translatedText": "Translated"}, request=httpx.Request("POST", url))
    monkeypatch.setattr("app.services.translation_service.httpx.post", post)
    response = client.put("/api/v1/admin/about-page-content", headers=headers, json={"body_he": "התחלה\n\n- המשך", "image_url": "/uploads/test/new.jpg"})
    assert response.status_code == 503
    assert len(calls) == 2
    assert db.scalar(select(AboutPageContent)) is None


def test_body_limit_and_english_only_rejection(client, auth_headers):
    headers = auth_headers()
    url = "/api/v1/admin/about-page-content"
    assert client.put(url, headers=headers, json={"body_he": "א" * 16001}).status_code == 422
    assert client.put(url, headers=headers, json={"body_en": "Bypass"}).status_code == 422


def test_body_clear_and_normal_vision_mission_updates(client, auth_headers):
    headers = auth_headers()
    url = "/api/v1/admin/about-page-content"
    created = client.put(url, headers=headers, json={"body_he": "תוכן"}).json()
    response = client.put(url, headers=headers, json={"vision_title_he": "חזון חדש", "vision_text_he": "החזון", "mission_title_he": "משימה חדשה", "mission_text_he": "המשימה"})
    assert response.status_code == 200
    for key in ["vision_title_en", "vision_text_en", "mission_title_en", "mission_text_en"]:
        assert response.json()[key] == "Translated content"
    assert response.json()["body_en"] == created["body_en"]
    cleared = client.put(url, headers=headers, json={"body_he": None}).json()
    assert cleared["body_he"] == cleared["body_en"] == ""
    assert cleared["paragraph_1_he"] == created["paragraph_1_he"]


def test_body_translation_cannot_inject_new_structure(client, auth_headers, monkeypatch):
    headers = auth_headers()
    def post(url, **kwargs):
        return httpx.Response(200, json={"translatedText": "Injected\n- Item"}, request=httpx.Request("POST", url))
    monkeypatch.setattr("app.services.translation_service.httpx.post", post)
    response = client.put("/api/v1/admin/about-page-content", headers=headers, json={"body_he": "פסקה"})
    assert response.status_code == 503


def test_overlong_body_translation_keeps_existing_record(client, auth_headers, monkeypatch):
    headers = auth_headers()
    url = "/api/v1/admin/about-page-content"
    original = client.put(url, headers=headers, json={"body_he": "קיים"}).json()
    def post(url, **kwargs):
        return httpx.Response(200, json={"translatedText": "x" * 16001}, request=httpx.Request("POST", url))
    monkeypatch.setattr("app.services.translation_service.httpx.post", post)
    response = client.put(url, headers=headers, json={"body_he": "חדש", "image_url": "/uploads/test/changed.jpg"})
    assert response.status_code == 422
    assert client.get(url, headers=headers).json() == original


def test_flexible_body_migration_is_additive_and_reversible():
    import importlib.util
    from pathlib import Path
    import sqlalchemy as sa
    from alembic.migration import MigrationContext
    from alembic.operations import Operations

    path = Path(__file__).parents[1] / "alembic/versions/20261021_0001_add_flexible_about_body.py"
    spec = importlib.util.spec_from_file_location("flexible_about_body_migration", path)
    migration = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(migration)
    engine = sa.create_engine("sqlite://")
    with engine.begin() as connection:
        connection.execute(sa.text("CREATE TABLE about_page_content (id INTEGER PRIMARY KEY, paragraph_1_he VARCHAR(350), bullet_1_en VARCHAR(90), vision_text_he VARCHAR(250))"))
        connection.execute(sa.text("INSERT INTO about_page_content VALUES (1, 'Legacy paragraph', 'Legacy item', 'Legacy vision')"))
        context = MigrationContext.configure(connection)
        with Operations.context(context):
            migration.upgrade()
        columns = {column["name"]: column for column in sa.inspect(connection).get_columns("about_page_content")}
        assert columns["body_he"]["nullable"] and columns["body_en"]["nullable"]
        assert connection.execute(sa.text("SELECT body_he, body_en FROM about_page_content")).one() == (None, None)
        with Operations.context(context):
            migration.downgrade()
        assert {column["name"] for column in sa.inspect(connection).get_columns("about_page_content")} == {"id", "paragraph_1_he", "bullet_1_en", "vision_text_he"}
        assert connection.execute(sa.text("SELECT * FROM about_page_content")).one() == (1, "Legacy paragraph", "Legacy item", "Legacy vision")
    engine.dispose()
