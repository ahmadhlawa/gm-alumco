from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.project import Project, ProjectImage


def project_payload(**overrides) -> dict:
    payload = {
        "title_en": "Project",
        "title_he": "פרויקט",
        "description_en": "Description",
        "description_he": None,
        "category": "LOCAL",
        "main_image_url": "https://drive.google.com/project.jpg",
        "sort_order": 2,
        "is_active": True,
    }
    payload.update(overrides)
    return payload


def add_project(db: Session, **overrides) -> Project:
    project = Project(**project_payload(**overrides))
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


def test_public_projects_are_active_sorted_and_filterable(
    client: TestClient, db: Session
) -> None:
    abroad = add_project(db, title_en="Abroad", category="INTERNATIONAL", sort_order=2)
    local = add_project(db, title_en="Local", category="LOCAL", sort_order=1)
    add_project(db, title_en="Hidden", is_active=False, sort_order=0)

    response = client.get("/api/v1/projects")
    filtered = client.get("/api/v1/projects?category=INTERNATIONAL")

    assert response.status_code == 200
    assert [item["id"] for item in response.json()] == [local.id, abroad.id]
    assert [item["id"] for item in filtered.json()] == [abroad.id]


def test_public_detail_includes_ordered_images_and_hides_inactive(
    client: TestClient, db: Session
) -> None:
    project = add_project(db)
    hidden = add_project(db, title_en="Hidden", is_active=False)
    db.add_all(
        [
            ProjectImage(project_id=project.id, image_url="https://x.test/2.jpg", sort_order=2),
            ProjectImage(project_id=project.id, image_url="https://x.test/1.jpg", sort_order=1),
        ]
    )
    db.commit()

    response = client.get(f"/api/v1/projects/{project.id}")

    assert response.status_code == 200
    assert [item["sort_order"] for item in response.json()["images"]] == [1, 2]
    assert client.get(f"/api/v1/projects/{hidden.id}").status_code == 404


def test_admin_can_crud_projects_and_see_inactive(
    client: TestClient, auth_headers
) -> None:
    headers = auth_headers()
    created = client.post(
        "/api/v1/admin/projects",
        headers=headers,
        json=project_payload(is_active=False),
    )
    assert created.status_code == 201
    project_id = created.json()["id"]

    listing = client.get("/api/v1/admin/projects", headers=headers)
    detail = client.get(f"/api/v1/admin/projects/{project_id}", headers=headers)
    updated = client.put(
        f"/api/v1/admin/projects/{project_id}",
        headers=headers,
        json={"title_en": "Updated"},
    )
    deleted = client.delete(f"/api/v1/admin/projects/{project_id}", headers=headers)

    assert listing.status_code == 200 and len(listing.json()) == 1
    assert detail.status_code == 200
    assert updated.json()["title_en"] == "Updated"
    assert deleted.status_code == 204


def test_admin_can_add_and_delete_project_image(
    client: TestClient, auth_headers
) -> None:
    headers = auth_headers()
    project_id = client.post(
        "/api/v1/admin/projects", headers=headers, json=project_payload()
    ).json()["id"]

    image = client.post(
        f"/api/v1/admin/projects/{project_id}/images",
        headers=headers,
        json={
            "image_url": "https://drive.google.com/gallery.jpg",
            "alt_text_en": "Facade",
            "sort_order": 3,
        },
    )
    assert image.status_code == 201
    deleted = client.delete(
        f"/api/v1/admin/project-images/{image.json()['id']}", headers=headers
    )
    assert deleted.status_code == 204


def test_project_rejects_invalid_category_and_url(
    client: TestClient, auth_headers
) -> None:
    headers = auth_headers()
    bad_category = client.post(
        "/api/v1/admin/projects",
        headers=headers,
        json=project_payload(category="unknown"),
    )
    bad_url = client.post(
        "/api/v1/admin/projects",
        headers=headers,
        json=project_payload(main_image_url="not-a-url"),
    )
    assert bad_category.status_code == 422
    assert bad_url.status_code == 422


def test_project_rejects_values_that_exceed_database_lengths(
    client: TestClient, auth_headers
) -> None:
    headers = auth_headers()
    long_title = client.post(
        "/api/v1/admin/projects",
        headers=headers,
        json=project_payload(title_en="x" * 256),
    )
    long_description = client.post(
        "/api/v1/admin/projects",
        headers=headers,
        json=project_payload(description_en="x" * 2001),
    )
    long_alt = client.post(
        "/api/v1/admin/projects/1/images",
        headers=headers,
        json={"image_url": "https://x.test/1.jpg", "alt_text_en": "x" * 256},
    )

    assert long_title.status_code == 422
    assert long_description.status_code == 422
    assert long_alt.status_code == 422


def test_project_admin_routes_require_authentication(client: TestClient) -> None:
    assert client.get("/api/v1/admin/projects").status_code == 401
