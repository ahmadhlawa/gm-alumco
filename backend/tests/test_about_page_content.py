from fastapi.testclient import TestClient


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
    assert update.json()["title_en"] == "Updated title"
    assert update.json()["stat_1_number"] == "500+"

    public = client.get("/api/v1/about-page-content")
    assert public.json()["title_en"] == "Updated title"


def test_admin_update_is_partial(client: TestClient, auth_headers) -> None:
    headers = auth_headers()

    client.put(
        "/api/v1/admin/about-page-content",
        headers=headers,
        json={"title_en": "First update"},
    )
    second = client.put(
        "/api/v1/admin/about-page-content",
        headers=headers,
        json={"subtitle_en": "Second update"},
    )
    assert second.status_code == 200
    body = second.json()
    assert body["title_en"] == "First update"
    assert body["subtitle_en"] == "Second update"


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
        json={"title_en": "Audited update"},
    )
    logs = client.get("/api/v1/admin/audit-logs", headers=headers)
    assert logs.status_code == 200
    entries = logs.json()
    assert any(
        entry["action"] == "update" and entry["entity_type"] == "about_page_content"
        for entry in entries
    )
