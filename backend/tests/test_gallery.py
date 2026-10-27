from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.gallery import GalleryImage
import pytest


PHOTO_URL = "/uploads/gallery/12345678-1234-1234-1234-123456789abc.png"


def test_project_photos_exclude_legacy_and_hidden_records(client, db):
    db.add_all([
        GalleryImage(image_url=PHOTO_URL, category="LOCAL"),
        GalleryImage(image_url=PHOTO_URL, category="facades"),
        GalleryImage(image_url=PHOTO_URL, category="PROJECT_PHOTO_LOCAL", sort_order=2),
        GalleryImage(image_url=PHOTO_URL, category="PROJECT_PHOTO_INTERNATIONAL", sort_order=1),
        GalleryImage(image_url=PHOTO_URL, category="PROJECT_PHOTO_LOCAL", is_active=False),
    ])
    db.commit()
    response = client.get("/api/v1/gallery/project-photos")
    assert response.status_code == 200
    assert [item["category"] for item in response.json()] == ["INTERNATIONAL", "LOCAL"]
    assert len(client.get("/api/v1/gallery/project-photos?category=LOCAL").json()) == 1
    assert client.get("/api/v1/gallery/project-photos?category=facades").status_code == 422


def test_project_photo_create_retry_order_updates_and_audit(client, db, auth_headers):
    from app.models.audit_log import AuditLog
    from sqlalchemy import select

    headers = auth_headers()
    payload = {"image_url": PHOTO_URL, "category": "LOCAL"}
    first = client.post("/api/v1/admin/gallery/project-photos", headers=headers, json=payload)
    assert first.status_code == 201
    image_id = first.json()["id"]
    assert first.json()["category"] == "LOCAL"
    assert first.json()["title_en"] is None
    retry = client.post("/api/v1/admin/gallery/project-photos", headers=headers, json=payload)
    assert retry.json()["id"] == image_id
    second = client.post("/api/v1/admin/gallery/project-photos", headers=headers, json={
        **payload, "image_url": PHOTO_URL.replace("abc.png", "abd.png"),
    })
    assert second.json()["sort_order"] > first.json()["sort_order"]
    updated = client.put(f"/api/v1/admin/gallery/project-photos/{image_id}", headers=headers,
                         json={"category": "INTERNATIONAL", "is_active": False})
    assert updated.status_code == 200
    assert updated.json()["category"] == "INTERNATIONAL"
    assert updated.json()["is_active"] is False
    assert len(client.get("/api/v1/gallery/project-photos").json()) == 1
    # Retrying a lost create response must never republish a subsequently hidden photo.
    assert client.post("/api/v1/admin/gallery/project-photos", headers=headers,
                       json=payload).json()["is_active"] is False
    assert len(client.get("/api/v1/admin/gallery/project-photos", headers=headers).json()) == 2
    published = client.put(f"/api/v1/admin/gallery/project-photos/{image_id}", headers=headers,
                           json={"is_active": True})
    assert published.json()["is_active"] is True
    assert len(client.get("/api/v1/gallery/project-photos").json()) == 2
    assert len(list(db.scalars(select(AuditLog).where(AuditLog.entity_type == "project_photo")))) == 4


@pytest.mark.parametrize("patch", [{"category": None}, {"category": "facades"},
                                  {"is_active": None}, {"sort_order": -1},
                                  {"image_url": "https://example.com/photo.jpg"}])
def test_project_photo_patch_validation(client, auth_headers, patch):
    headers = auth_headers()
    item = client.post("/api/v1/admin/gallery/project-photos", headers=headers,
                       json={"image_url": PHOTO_URL, "category": "LOCAL"}).json()
    response = client.put(f"/api/v1/admin/gallery/project-photos/{item['id']}",
                          headers=headers, json=patch)
    assert response.status_code == 422


@pytest.mark.parametrize("url", ["javascript:alert(1)", "//evil.test/x.jpg",
                                "/uploads/gallery/../secret.png", "/uploads/gallery/%2e%2e.png",
                                "https://example.com/photo.png", "/uploads/projects/a.png"])
def test_project_photo_rejects_non_gallery_uploads(client, auth_headers, url):
    response = client.post("/api/v1/admin/gallery/project-photos", headers=auth_headers(),
                           json={"image_url": url, "category": "LOCAL"})
    assert response.status_code == 422


def test_project_photo_auth_and_legacy_update_protection(client, db, auth_headers):
    assert client.get("/api/v1/admin/gallery/project-photos").status_code == 401
    assert client.post("/api/v1/admin/gallery/project-photos", json={}).status_code == 401
    assert client.put("/api/v1/admin/gallery/project-photos/1", json={}).status_code == 401
    legacy = GalleryImage(**gallery_payload())
    db.add(legacy)
    db.commit()
    headers = auth_headers()
    assert client.put(f"/api/v1/admin/gallery/project-photos/{legacy.id}", headers=headers,
                      json={"is_active": False}).status_code == 404
    assert db.get(GalleryImage, legacy.id).is_active is True


def test_project_photos_empty_and_tie_order(client, db):
    assert client.get("/api/v1/gallery/project-photos").json() == []
    first = GalleryImage(image_url=PHOTO_URL, category="PROJECT_PHOTO_LOCAL", sort_order=1)
    second = GalleryImage(image_url=PHOTO_URL, category="PROJECT_PHOTO_LOCAL", sort_order=1)
    db.add_all([first, second])
    db.commit()
    assert [x["id"] for x in client.get("/api/v1/gallery/project-photos").json()] == [first.id, second.id]


@pytest.mark.parametrize("extra", [{"category": "facades"}, {"category": None},
                                  {"title_en": "Unwanted caption"}, {"sort_order": 99}])
def test_project_photo_create_contract(client, auth_headers, extra):
    response = client.post("/api/v1/admin/gallery/project-photos", headers=auth_headers(),
                           json={"image_url": PHOTO_URL, "category": "LOCAL", **extra})
    assert response.status_code == 422


def test_project_photo_invalid_role_and_inactive_admin(client, auth_headers, db):
    from app.models.admin import Admin
    from sqlalchemy import select

    headers = auth_headers(role="viewer")
    assert client.get("/api/v1/admin/gallery/project-photos", headers=headers).status_code == 403
    assert client.post("/api/v1/admin/gallery/project-photos", headers=headers,
                       json={"image_url": PHOTO_URL, "category": "LOCAL"}).status_code == 403
    admin = db.scalar(select(Admin).where(Admin.role == "viewer"))
    admin.is_active = False
    db.commit()
    assert client.get("/api/v1/admin/gallery/project-photos", headers=headers).status_code == 401


def test_upload_to_gallery_publish_and_hide_integration(client, auth_headers, tmp_path, monkeypatch):
    import base64
    from app.api.v1.endpoints import uploads

    monkeypatch.setattr(uploads, "UPLOAD_ROOT", tmp_path)
    headers = auth_headers()
    image = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=")
    uploaded = client.post("/api/v1/admin/uploads/image", headers=headers, data={"folder": "gallery"},
                           files={"file": ("photo.png", image, "image/png")})
    assert uploaded.status_code == 201
    payload = uploaded.json()
    assert (tmp_path / "gallery" / payload["filename"]).read_bytes() == image
    created = client.post("/api/v1/admin/gallery/project-photos", headers=headers,
                          json={"image_url": payload["url"], "category": "INTERNATIONAL"})
    assert created.status_code == 201
    item = created.json()
    assert client.get("/api/v1/gallery/project-photos").json()[0]["id"] == item["id"]
    assert client.put(f"/api/v1/admin/gallery/project-photos/{item['id']}", headers=headers,
                      json={"is_active": False}).status_code == 200
    assert client.get("/api/v1/gallery/project-photos").json() == []
    assert (tmp_path / "gallery" / payload["filename"]).read_bytes() == image


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


def test_gallery_rejects_values_that_exceed_database_lengths(
    client: TestClient, auth_headers
) -> None:
    headers = auth_headers()
    long_title = client.post(
        "/api/v1/admin/gallery",
        headers=headers,
        json=gallery_payload(title_en="x" * 256),
    )
    long_category = client.post(
        "/api/v1/admin/gallery",
        headers=headers,
        json=gallery_payload(category="x" * 101),
    )

    assert long_title.status_code == 422
    assert long_category.status_code == 422


@pytest.mark.parametrize("reserved", ["PROJECT_PHOTO_LOCAL", "PROJECT_PHOTO_INTERNATIONAL"])
def test_legacy_create_cannot_claim_project_photo_categories(client, db, auth_headers, reserved):
    from sqlalchemy import select

    response = client.post(
        "/api/v1/admin/gallery",
        headers=auth_headers(),
        json=gallery_payload(category=reserved),
    )
    assert response.status_code == 422
    assert db.scalar(select(GalleryImage).where(GalleryImage.category == reserved)) is None


@pytest.mark.parametrize("reserved", ["PROJECT_PHOTO_LOCAL", "PROJECT_PHOTO_INTERNATIONAL"])
def test_legacy_update_cannot_convert_existing_record_into_project_photo(
    client, db, auth_headers, reserved,
):
    headers = auth_headers()
    created = client.post(
        "/api/v1/admin/gallery", headers=headers, json=gallery_payload()
    )
    assert created.status_code == 201
    image_id = created.json()["id"]

    blocked = client.put(
        f"/api/v1/admin/gallery/{image_id}",
        headers=headers,
        json={"category": reserved, "title_en": "Should not save"},
    )
    assert blocked.status_code == 422
    db.refresh(db.get(GalleryImage, image_id))
    current = client.get(f"/api/v1/admin/gallery/{image_id}", headers=headers)
    assert current.status_code == 200
    assert current.json()["category"] == "facades"
    assert current.json()["title_en"] == "Image"


def test_project_photo_is_unreachable_and_immutable_via_legacy_gallery_routes(
    client, db, auth_headers,
):
    headers = auth_headers()
    legacy = client.post(
        "/api/v1/admin/gallery", headers=headers, json=gallery_payload()
    )
    assert legacy.status_code == 201
    created = client.post(
        "/api/v1/admin/gallery/project-photos",
        headers=headers,
        json={"image_url": PHOTO_URL, "category": "LOCAL"},
    )
    assert created.status_code == 201
    photo_id = created.json()["id"]
    legacy_id = legacy.json()["id"]

    # Dedicated APIs only: legacy lists (including category-filtered reads)
    # must not display records owned by the photo-only gallery.
    public = client.get("/api/v1/gallery")
    admin = client.get("/api/v1/admin/gallery", headers=headers)
    assert [image["id"] for image in public.json()] == [legacy_id]
    assert [image["id"] for image in admin.json()] == [legacy_id]
    assert client.get("/api/v1/gallery?category=PROJECT_PHOTO_LOCAL").json() == []
    assert [image["id"] for image in client.get("/api/v1/gallery/project-photos").json()] == [photo_id]

    assert client.get(f"/api/v1/admin/gallery/{photo_id}", headers=headers).status_code == 404
    assert client.put(
        f"/api/v1/admin/gallery/{photo_id}", headers=headers,
        json={"category": "facades", "image_url": "https://example.com/replaced.jpg",
              "title_en": "Injected title", "is_active": False},
    ).status_code == 404
    assert client.delete(
        f"/api/v1/admin/gallery/{photo_id}", headers=headers,
    ).status_code == 404

    db.expire_all()
    photo = db.get(GalleryImage, photo_id)
    assert photo.category == "PROJECT_PHOTO_LOCAL"
    assert photo.image_url == PHOTO_URL
    assert photo.title_en is None
    assert photo.is_active is True

    # Dedicated edit/hide controls continue to work after blocked legacy requests.
    dedicated = client.put(
        f"/api/v1/admin/gallery/project-photos/{photo_id}",
        headers=headers, json={"is_active": False, "category": "INTERNATIONAL"},
    )
    assert dedicated.status_code == 200
    assert dedicated.json()["category"] == "INTERNATIONAL"
    assert dedicated.json()["is_active"] is False

    # Ordinary existing gallery operations continue to work.
    assert client.put(
        f"/api/v1/admin/gallery/{legacy_id}", headers=headers,
        json={"title_en": "Updated legacy"},
    ).status_code == 200
    assert client.delete(
        f"/api/v1/admin/gallery/{legacy_id}", headers=headers,
    ).status_code == 204


def test_legacy_gallery_list_preserves_null_categories(client, db, auth_headers):
    image = GalleryImage(**gallery_payload(category=None))
    db.add(image)
    db.commit()
    assert [item["id"] for item in client.get("/api/v1/gallery").json()] == [image.id]
    response = client.get("/api/v1/admin/gallery", headers=auth_headers())
    assert [item["id"] for item in response.json()] == [image.id]
