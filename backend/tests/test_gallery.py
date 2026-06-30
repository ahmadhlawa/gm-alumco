from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.gallery import GalleryImage


def gallery_payload(**overrides) -> dict:
    payload = {
        "image_url": "https://drive.google.com/gallery.jpg",
        "title_en": "Image",
        "title_he": "תמונה",
        "alt_text_en": "Building",
        "alt_text_he": None,
        "category": "facades",
        "sort_order": 1,
        "is_active": True,
    }
    payload.update(overrides)
    return payload


def test_public_gallery_is_active_sorted_and_filterable(
    client: TestClient, db: Session
) -> None:
    db.add_all(
        [
            GalleryImage(**gallery_payload(title_en="Second", sort_order=2)),
            GalleryImage(**gallery_payload(title_en="First", sort_order=1)),
            GalleryImage(**gallery_payload(title_en="Other", category="doors")),
            GalleryImage(**gallery_payload(title_en="Hidden", is_active=False, sort_order=0)),
        ]
    )
    db.commit()
    response = client.get("/api/v1/gallery?category=facades")
    assert response.status_code == 200
    assert [item["title_en"] for item in response.json()] == ["First", "Second"]


def test_admin_can_crud_gallery_image(client: TestClient, auth_headers) -> None:
    headers = auth_headers()
    created = client.post("/api/v1/admin/gallery", headers=headers, json=gallery_payload())
    assert created.status_code == 201
    image_id = created.json()["id"]
    assert client.get("/api/v1/admin/gallery", headers=headers).status_code == 200
    assert client.get(f"/api/v1/admin/gallery/{image_id}", headers=headers).status_code == 200
    updated = client.put(
        f"/api/v1/admin/gallery/{image_id}",
        headers=headers,
        json={"title_en": "Updated"},
    )
    assert updated.json()["title_en"] == "Updated"
    assert client.delete(f"/api/v1/admin/gallery/{image_id}", headers=headers).status_code == 204


def test_gallery_requires_http_url_and_admin_auth(client: TestClient, auth_headers) -> None:
    response = client.post(
        "/api/v1/admin/gallery",
        headers=auth_headers(),
        json=gallery_payload(image_url="not-a-url"),
    )
    assert response.status_code == 422
    assert client.get("/api/v1/admin/gallery").status_code == 401
