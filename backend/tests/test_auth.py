from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.admin import Admin


def test_login_returns_token_updates_last_login_and_me(
    client: TestClient, db: Session, make_admin
) -> None:
    admin = make_admin(email="owner@example.com", role="super_admin")

    response = client.post(
        "/api/v1/auth/login",
        json={"email": "OWNER@EXAMPLE.COM", "password": "StrongPass123!"},
    )

    assert response.status_code == 200
    token = response.json()["access_token"]
    me = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me.status_code == 200
    assert me.json()["email"] == "owner@example.com"
    db.refresh(admin)
    assert admin.last_login_at is not None


def test_login_accepts_seeded_local_admin_email(client: TestClient, make_admin) -> None:
    make_admin(email="admin@gm-alomco.local", role="super_admin")

    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@gm-alomco.local", "password": "StrongPass123!"},
    )

    assert response.status_code == 200
    assert response.json()["access_token"]


def test_login_rejects_wrong_password(client: TestClient, make_admin) -> None:
    make_admin()
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "wrong-password"},
    )
    assert response.status_code == 401


def test_me_rejects_inactive_admin(client: TestClient, make_admin) -> None:
    make_admin(is_active=False)
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "StrongPass123!"},
    )
    assert response.status_code == 401


def test_me_rejects_invalid_token(client: TestClient) -> None:
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalid"},
    )
    assert response.status_code == 401


def test_me_rejects_unknown_admin_role(client: TestClient, make_admin) -> None:
    make_admin(role="viewer")
    login = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "StrongPass123!"},
    )
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {login.json()['access_token']}"},
    )
    assert response.status_code == 403
