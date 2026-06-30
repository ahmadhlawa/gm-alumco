from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.service import Service


def service_payload(**overrides) -> dict:
    payload = {
        "title_en": "Service",
        "title_he": "שירות",
        "description_en": "Description",
        "description_he": None,
        "image_url": "https://drive.google.com/service.jpg",
        "starting_price": "1250.00",
        "sort_order": 1,
        "is_active": True,
    }
    payload.update(overrides)
    return payload


def test_public_services_only_return_active_sorted(client: TestClient, db: Session) -> None:
    db.add_all(
        [
            Service(**service_payload(title_en="Second", sort_order=2)),
            Service(**service_payload(title_en="First", sort_order=1)),
            Service(**service_payload(title_en="Hidden", sort_order=0, is_active=False)),
        ]
    )
    db.commit()
    response = client.get("/api/v1/services")
    assert response.status_code == 200
    assert [item["title_en"] for item in response.json()] == ["First", "Second"]


def test_admin_can_crud_service_and_read_inactive(client: TestClient, auth_headers) -> None:
    headers = auth_headers()
    created = client.post(
        "/api/v1/admin/services",
        headers=headers,
        json=service_payload(is_active=False),
    )
    assert created.status_code == 201
    assert created.json()["starting_price"] == "1250.00"
    service_id = created.json()["id"]
    assert client.get("/api/v1/admin/services", headers=headers).status_code == 200
    assert client.get(f"/api/v1/admin/services/{service_id}", headers=headers).status_code == 200
    updated = client.put(
        f"/api/v1/admin/services/{service_id}",
        headers=headers,
        json={"title_en": "Updated"},
    )
    assert updated.json()["title_en"] == "Updated"
    assert client.delete(f"/api/v1/admin/services/{service_id}", headers=headers).status_code == 204
    assert client.get(f"/api/v1/services/{service_id}").status_code == 404


def test_service_validates_url_and_auth(client: TestClient, auth_headers) -> None:
    response = client.post(
        "/api/v1/admin/services",
        headers=auth_headers(),
        json=service_payload(image_url="file:///tmp/image.jpg"),
    )
    assert response.status_code == 422
    assert client.get("/api/v1/admin/services").status_code == 401
