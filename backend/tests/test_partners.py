from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.partner import Partner


def partner_payload(**overrides) -> dict:
    payload = {
        "name_en": "Partner",
        "name_he": "שותף",
        "logo_url": "https://drive.google.com/logo.png",
        "website_url": "https://example.com",
        "sort_order": 1,
        "is_active": True,
    }
    payload.update(overrides)
    return payload


def test_public_partners_only_return_active_sorted(client: TestClient, db: Session) -> None:
    db.add_all(
        [
            Partner(**partner_payload(name_en="Second", sort_order=2)),
            Partner(**partner_payload(name_en="First", sort_order=1)),
            Partner(**partner_payload(name_en="Hidden", is_active=False, sort_order=0)),
        ]
    )
    db.commit()
    response = client.get("/api/v1/partners")
    assert response.status_code == 200
    assert [item["name_en"] for item in response.json()] == ["First", "Second"]


def test_admin_can_crud_partner(client: TestClient, auth_headers) -> None:
    headers = auth_headers()
    created = client.post("/api/v1/admin/partners", headers=headers, json=partner_payload())
    assert created.status_code == 201
    partner_id = created.json()["id"]
    assert client.get("/api/v1/admin/partners", headers=headers).status_code == 200
    assert client.get(f"/api/v1/admin/partners/{partner_id}", headers=headers).status_code == 200
    updated = client.put(
        f"/api/v1/admin/partners/{partner_id}",
        headers=headers,
        json={"website_url": None},
    )
    assert updated.json()["website_url"] is None
    assert client.delete(f"/api/v1/admin/partners/{partner_id}", headers=headers).status_code == 204


def test_partner_validates_urls_and_auth(client: TestClient, auth_headers) -> None:
    response = client.post(
        "/api/v1/admin/partners",
        headers=auth_headers(),
        json=partner_payload(logo_url="ftp://example.com/logo.png"),
    )
    assert response.status_code == 422
    assert client.get("/api/v1/admin/partners").status_code == 401
