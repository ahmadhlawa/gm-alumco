from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.site_content import SiteContent
from app.models.site_settings import SiteSettings


def content_payload(**overrides) -> dict:
    payload = {
        "section": "hero",
        "key": "headline",
        "value": {"ar": "الألومنيوم", "en": "Aluminium", "he": "אלומיניום"},
        "content_type": "localized_text",
        "is_active": True,
    }
    payload.update(overrides)
    return payload


def test_public_site_content_is_active_and_filterable_by_section(
    client: TestClient, db: Session
) -> None:
    db.add_all(
        [
            SiteContent(**content_payload(key="headline")),
            SiteContent(**content_payload(key="cta", value="Request quote")),
            SiteContent(**content_payload(section="footer", key="copyright")),
            SiteContent(**content_payload(key="hidden", is_active=False)),
        ]
    )
    db.commit()

    listing = client.get("/api/v1/site-content")
    section = client.get("/api/v1/site-content/hero")

    assert listing.status_code == 200
    assert {(item["section"], item["key"]) for item in listing.json()} == {
        ("hero", "headline"),
        ("hero", "cta"),
        ("footer", "copyright"),
    }
    assert [item["key"] for item in section.json()] == ["cta", "headline"]


def test_public_site_settings_returns_all_json_values(
    client: TestClient, db: Session
) -> None:
    db.add_all(
        [
            SiteSettings(key="seo", value={"title": "T.A.S"}),
            SiteSettings(key="social_links", value=["https://example.com"]),
        ]
    )
    db.commit()

    response = client.get("/api/v1/site-settings")

    assert response.status_code == 200
    assert [item["key"] for item in response.json()] == ["seo", "social_links"]
    assert response.json()[1]["value"] == ["https://example.com"]


def test_site_management_routes_require_authentication(client: TestClient) -> None:
    assert client.get("/api/v1/admin/site-content").status_code == 401
    assert client.get("/api/v1/admin/site-settings").status_code == 401


def test_admin_crud_site_content_with_soft_delete(
    client: TestClient, auth_headers
) -> None:
    headers = auth_headers()
    created = client.post(
        "/api/v1/admin/site-content",
        headers=headers,
        json=content_payload(),
    )
    assert created.status_code == 201
    content_id = created.json()["id"]

    listing = client.get("/api/v1/admin/site-content", headers=headers)
    detail = client.get(
        f"/api/v1/admin/site-content/{content_id}", headers=headers
    )
    updated = client.put(
        f"/api/v1/admin/site-content/{content_id}",
        headers=headers,
        json={"value": [1, {"label": "two"}]},
    )
    deleted = client.delete(
        f"/api/v1/admin/site-content/{content_id}", headers=headers
    )
    admin_after_delete = client.get(
        f"/api/v1/admin/site-content/{content_id}", headers=headers
    )

    assert listing.status_code == 200 and len(listing.json()) == 1
    assert detail.status_code == 200
    assert updated.status_code == 200
    assert updated.json()["value"] == [1, {"label": "two"}]
    assert deleted.status_code == 204
    assert admin_after_delete.json()["is_active"] is False
    assert client.get("/api/v1/site-content/hero").json() == []


def test_site_content_duplicate_and_missing_records_are_clear(
    client: TestClient, auth_headers
) -> None:
    headers = auth_headers()
    assert client.post(
        "/api/v1/admin/site-content", headers=headers, json=content_payload()
    ).status_code == 201
    duplicate = client.post(
        "/api/v1/admin/site-content", headers=headers, json=content_payload()
    )

    assert duplicate.status_code == 409
    assert client.get("/api/v1/admin/site-content/999", headers=headers).status_code == 404


def test_admin_crud_site_settings_with_hard_delete(
    client: TestClient, auth_headers
) -> None:
    headers = auth_headers()
    created = client.post(
        "/api/v1/admin/site-settings",
        headers=headers,
        json={"key": "contact", "value": {"phone": "+970599000000"}},
    )
    assert created.status_code == 201
    setting_id = created.json()["id"]

    listing = client.get("/api/v1/admin/site-settings", headers=headers)
    detail = client.get(
        f"/api/v1/admin/site-settings/{setting_id}", headers=headers
    )
    updated = client.put(
        f"/api/v1/admin/site-settings/{setting_id}",
        headers=headers,
        json={"value": True},
    )
    duplicate = client.post(
        "/api/v1/admin/site-settings",
        headers=headers,
        json={"key": "contact", "value": {}},
    )
    deleted = client.delete(
        f"/api/v1/admin/site-settings/{setting_id}", headers=headers
    )

    assert listing.status_code == 200 and len(listing.json()) == 1
    assert detail.status_code == 200
    assert updated.status_code == 200 and updated.json()["value"] is True
    assert duplicate.status_code == 409
    assert deleted.status_code == 204
    assert client.get(
        f"/api/v1/admin/site-settings/{setting_id}", headers=headers
    ).status_code == 404
