from fastapi.testclient import TestClient


def test_public_video_section_returns_seeded_defaults(client: TestClient) -> None:
    response = client.get("/api/v1/homepage-video-section")
    assert response.status_code == 200
    payload = response.json()
    # A singleton row is created on demand; it starts disabled and empty.
    assert payload["is_enabled"] is False
    assert payload["video_url"] is None
    assert payload["poster_image_url"] is None
    # Public payload excludes internal audit fields.
    assert "id" not in payload
    assert "created_at" not in payload


def test_public_video_section_requires_no_auth(client: TestClient) -> None:
    assert client.get("/api/v1/homepage-video-section").status_code == 200


def test_admin_video_section_requires_auth(client: TestClient) -> None:
    assert client.get("/api/v1/admin/homepage-video-section").status_code == 401
    assert client.put("/api/v1/admin/homepage-video-section", json={}).status_code == 401


def test_admin_can_read_and_update_video_section(client: TestClient, auth_headers) -> None:
    headers = auth_headers()

    read = client.get("/api/v1/admin/homepage-video-section", headers=headers)
    assert read.status_code == 200
    assert "id" in read.json()

    update = client.put(
        "/api/v1/admin/homepage-video-section",
        headers=headers,
        json={
            "is_enabled": True,
            "video_url": "/uploads/videos/demo.mp4",
            "poster_image_url": "/uploads/videos/poster.jpg",
            "title_he": "כותרת",
            "title_en": "Heading",
            "title_ar": "عنوان",
            "description_en": "A short description.",
            "display_order": 2,
        },
    )
    assert update.status_code == 200
    saved = update.json()
    assert saved["is_enabled"] is True
    assert saved["video_url"] == "/uploads/videos/demo.mp4"
    assert saved["title_ar"] == "عنوان"
    assert saved["display_order"] == 2

    # The change is persisted (still one singleton row) and visible publicly.
    public = client.get("/api/v1/homepage-video-section").json()
    assert public["is_enabled"] is True
    assert public["video_url"] == "/uploads/videos/demo.mp4"
    assert public["title_en"] == "Heading"


def test_minimal_payload_without_poster_or_arabic_enables_public_video(
    client: TestClient, auth_headers
) -> None:
    # Mirrors the frontend: only enable + video_url are sent (no poster, no *_ar).
    update = client.put(
        "/api/v1/admin/homepage-video-section",
        headers=auth_headers(),
        json={"is_enabled": True, "video_url": "/uploads/videos/only.mp4"},
    )
    assert update.status_code == 200

    public = client.get("/api/v1/homepage-video-section").json()
    assert public["is_enabled"] is True
    assert public["video_url"] == "/uploads/videos/only.mp4"
    # No title/description required — they stay empty.
    assert public["title_en"] is None
    assert public["title_he"] is None
    assert public["description_en"] is None


def test_admin_update_is_partial(client: TestClient, auth_headers) -> None:
    headers = auth_headers()
    client.put(
        "/api/v1/admin/homepage-video-section",
        headers=headers,
        json={"video_url": "/uploads/videos/demo.mp4", "title_en": "Keep me"},
    )
    # Only toggling is_enabled must not wipe the previously saved fields.
    client.put(
        "/api/v1/admin/homepage-video-section",
        headers=headers,
        json={"is_enabled": True},
    )
    saved = client.get("/api/v1/admin/homepage-video-section", headers=headers).json()
    assert saved["is_enabled"] is True
    assert saved["title_en"] == "Keep me"


def test_admin_update_rejects_unsafe_video_url(client: TestClient, auth_headers) -> None:
    response = client.put(
        "/api/v1/admin/homepage-video-section",
        headers=auth_headers(),
        json={"video_url": "javascript:alert(1)"},
    )
    assert response.status_code == 422


def test_admin_update_records_audit_log(client: TestClient, auth_headers) -> None:
    headers = auth_headers(role="super_admin")
    client.put(
        "/api/v1/admin/homepage-video-section",
        headers=headers,
        json={"is_enabled": True},
    )
    logs = client.get("/api/v1/admin/audit-logs", headers=headers).json()
    assert any(
        entry["action"] == "update" and entry["entity_type"] == "homepage_video_section"
        for entry in logs
    )
