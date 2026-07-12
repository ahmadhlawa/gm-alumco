from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.production_project import ProductionProject, ProductionProjectImage


def production_project_payload(**overrides) -> dict:
    payload = {
        "title_en": "Production project",
        "title_he": "פרויקט ייצור",
        "description_en": "Custom aluminum production",
        "description_he": "ייצור אלומיניום מותאם",
        "manufacturer_en": "T.A.S Factory",
        "manufacturer_he": "מפעל T.A.S",
        "execution_partner_en": "Site Partner",
        "execution_partner_he": "שותף ביצוע",
        "sort_order": 2,
        "is_active": True,
    }
    payload.update(overrides)
    return payload


def create_production_project(client: TestClient, headers: dict[str, str], **overrides) -> dict:
    response = client.post(
        "/api/v1/admin/production-projects",
        headers=headers,
        json=production_project_payload(**overrides),
    )
    assert response.status_code == 201
    return response.json()


def test_public_production_projects_are_active_sorted_with_ordered_images(
    client: TestClient, auth_headers
) -> None:
    headers = auth_headers()
    second = create_production_project(client, headers, title_en="Second", sort_order=2)
    first = create_production_project(client, headers, title_en="First", sort_order=1)
    create_production_project(client, headers, title_en="Hidden", sort_order=0, is_active=False)

    client.post(
        f"/api/v1/admin/production-projects/{first['id']}/images",
        headers=headers,
        json={"image_url": "https://x.test/2.jpg", "sort_order": 2},
    )
    client.post(
        f"/api/v1/admin/production-projects/{first['id']}/images",
        headers=headers,
        json={"image_url": "https://x.test/1.jpg", "sort_order": 1},
    )

    response = client.get("/api/v1/production-projects")

    assert response.status_code == 200
    body = response.json()
    assert [item["id"] for item in body] == [first["id"], second["id"]]
    assert [image["sort_order"] for image in body[0]["images"]] == [1, 2]


def test_admin_can_crud_production_projects_and_images(
    client: TestClient, auth_headers
) -> None:
    headers = auth_headers()
    created = create_production_project(client, headers, is_active=False)
    project_id = created["id"]

    listing = client.get("/api/v1/admin/production-projects", headers=headers)
    detail = client.get(f"/api/v1/admin/production-projects/{project_id}", headers=headers)
    updated = client.put(
        f"/api/v1/admin/production-projects/{project_id}",
        headers=headers,
        json={"title_en": "Updated", "is_active": True},
    )
    image = client.post(
        f"/api/v1/admin/production-projects/{project_id}/images",
        headers=headers,
        json={
            "image_url": "https://drive.google.com/production.jpg",
            "alt_text_en": "Facade",
            "sort_order": 3,
        },
    )
    deleted_image = client.delete(
        f"/api/v1/admin/production-project-images/{image.json()['id']}",
        headers=headers,
    )
    deleted = client.delete(
        f"/api/v1/admin/production-projects/{project_id}",
        headers=headers,
    )

    assert listing.status_code == 200 and len(listing.json()) == 1
    assert detail.status_code == 200
    assert updated.json()["title_en"] == "Updated"
    assert updated.json()["is_active"] is True
    assert image.status_code == 201
    assert deleted_image.status_code == 204
    assert deleted.status_code == 204


def test_create_production_project_persists_initial_images_atomically(
    client: TestClient, auth_headers
) -> None:
    response = client.post(
        "/api/v1/admin/production-projects",
        headers=auth_headers(),
        json=production_project_payload(
            images=[
                {"image_url": "https://x.test/first.jpg", "sort_order": 0},
                {"image_url": "https://x.test/second.jpg", "sort_order": 1},
            ]
        ),
    )

    assert response.status_code == 201
    assert [image["image_url"] for image in response.json()["images"]] == [
        "https://x.test/first.jpg",
        "https://x.test/second.jpg",
    ]


def test_deleting_production_project_removes_its_image_rows(
    client: TestClient, db: Session, auth_headers
) -> None:
    headers = auth_headers()
    project_id = create_production_project(client, headers)["id"]
    image_id = client.post(
        f"/api/v1/admin/production-projects/{project_id}/images",
        headers=headers,
        json={"image_url": "https://x.test/production.jpg"},
    ).json()["id"]

    assert client.delete(f"/api/v1/admin/production-projects/{project_id}", headers=headers).status_code == 204

    assert db.get(ProductionProject, project_id) is None
    assert db.get(ProductionProjectImage, image_id) is None
    assert client.get("/api/v1/admin/production-projects", headers=headers).json() == []


def test_production_project_validation_and_authentication(
    client: TestClient, auth_headers
) -> None:
    headers = auth_headers()
    long_title = client.post(
        "/api/v1/admin/production-projects",
        headers=headers,
        json=production_project_payload(title_en="x" * 256),
    )
    bad_image = client.post(
        "/api/v1/admin/production-projects/1/images",
        headers=headers,
        json={"image_url": "not-a-url"},
    )

    assert long_title.status_code == 422
    assert bad_image.status_code == 422
    assert client.get("/api/v1/admin/production-projects").status_code == 401
