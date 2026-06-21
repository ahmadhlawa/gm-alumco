from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import verify_password
from app.models.admin import Admin


def test_admin_cannot_manage_admins(client: TestClient, auth_headers) -> None:
    response = client.get(
        "/api/v1/admin/admins",
        headers=auth_headers(role="admin"),
    )
    assert response.status_code == 403


def test_super_admin_can_create_and_list_admin(
    client: TestClient, db: Session, auth_headers
) -> None:
    headers = auth_headers(role="super_admin")
    response = client.post(
        "/api/v1/admin/admins",
        headers=headers,
        json={
            "full_name": "Content Admin",
            "email": "CONTENT@EXAMPLE.COM",
            "password": "AnotherPass123!",
            "role": "admin",
        },
    )

    assert response.status_code == 201
    assert response.json()["email"] == "content@example.com"
    stored = db.scalar(select(Admin).where(Admin.email == "content@example.com"))
    assert stored is not None
    assert verify_password("AnotherPass123!", stored.password_hash)
    listing = client.get("/api/v1/admin/admins", headers=headers)
    assert listing.status_code == 200
    assert {item["email"] for item in listing.json()} == {
        "super_admin@example.com",
        "content@example.com",
    }


def test_super_admin_can_update_and_deactivate_another_admin(
    client: TestClient, make_admin, auth_headers
) -> None:
    target = make_admin(email="target@example.com")
    headers = auth_headers(role="super_admin")

    updated = client.put(
        f"/api/v1/admin/admins/{target.id}",
        headers=headers,
        json={"full_name": "Updated Admin"},
    )
    deleted = client.delete(
        f"/api/v1/admin/admins/{target.id}",
        headers=headers,
    )

    assert updated.status_code == 200
    assert updated.json()["full_name"] == "Updated Admin"
    assert deleted.status_code == 204


def test_super_admin_cannot_deactivate_self(client: TestClient, auth_headers) -> None:
    headers = auth_headers(role="super_admin")
    me = client.get("/api/v1/auth/me", headers=headers).json()
    response = client.delete(f"/api/v1/admin/admins/{me['id']}", headers=headers)
    assert response.status_code == 409


def test_duplicate_admin_email_returns_conflict(
    client: TestClient, make_admin, auth_headers
) -> None:
    make_admin(email="duplicate@example.com")
    response = client.post(
        "/api/v1/admin/admins",
        headers=auth_headers(role="super_admin"),
        json={
            "full_name": "Duplicate",
            "email": "duplicate@example.com",
            "password": "AnotherPass123!",
            "role": "admin",
        },
    )
    assert response.status_code == 409
