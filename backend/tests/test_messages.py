from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.message import ContactMessage, QuoteRequest


def contact_payload(**overrides) -> dict:
    payload = {
        "name": "Website Visitor",
        "email": "visitor@example.com",
        "phone": "+970599000000",
        "subject": "Project inquiry",
        "message": "Please contact me about a facade project.",
    }
    payload.update(overrides)
    return payload


def quote_payload(**overrides) -> dict:
    payload = {
        "name": "Quote Customer",
        "email": "quote@example.com",
        "phone": "+970598000000",
        "service_type": "Aluminium facade",
        "message": "Please prepare an estimate.",
    }
    payload.update(overrides)
    return payload


def test_public_contact_submission_creates_new_message(
    client: TestClient, db: Session
) -> None:
    response = client.post("/api/v1/contact/messages", json=contact_payload())

    assert response.status_code == 201
    assert response.json()["status"] == "new"
    stored = db.scalar(select(ContactMessage))
    assert stored is not None
    assert stored.email == "visitor@example.com"


def test_public_contact_submission_validates_email(client: TestClient) -> None:
    response = client.post(
        "/api/v1/contact/messages",
        json=contact_payload(email="invalid-email"),
    )
    assert response.status_code == 422


def test_public_quote_submission_creates_new_request(
    client: TestClient, db: Session
) -> None:
    response = client.post("/api/v1/quote-requests", json=quote_payload())

    assert response.status_code == 201
    assert response.json()["status"] == "new"
    stored = db.scalar(select(QuoteRequest))
    assert stored is not None
    assert stored.phone == "+970598000000"


def test_public_quote_submission_requires_valid_email_and_phone(
    client: TestClient,
) -> None:
    invalid_email = client.post(
        "/api/v1/quote-requests",
        json=quote_payload(email="invalid-email"),
    )
    missing_phone = quote_payload()
    missing_phone.pop("phone")
    no_phone = client.post("/api/v1/quote-requests", json=missing_phone)

    assert invalid_email.status_code == 422
    assert no_phone.status_code == 422


def test_inbox_admin_routes_require_authentication(client: TestClient) -> None:
    assert client.get("/api/v1/admin/contact-messages").status_code == 401
    assert client.get("/api/v1/admin/quote-requests").status_code == 401


def test_admin_manages_contact_messages(client: TestClient, auth_headers) -> None:
    first = client.post(
        "/api/v1/contact/messages",
        json=contact_payload(email="first@example.com"),
    ).json()
    second = client.post(
        "/api/v1/contact/messages",
        json=contact_payload(email="second@example.com"),
    ).json()
    headers = auth_headers()

    listing = client.get("/api/v1/admin/contact-messages", headers=headers)
    detail = client.get(
        f"/api/v1/admin/contact-messages/{first['id']}", headers=headers
    )
    updated = client.patch(
        f"/api/v1/admin/contact-messages/{first['id']}/status",
        headers=headers,
        json={"status": "read"},
    )
    invalid = client.patch(
        f"/api/v1/admin/contact-messages/{first['id']}/status",
        headers=headers,
        json={"status": "in_progress"},
    )
    deleted = client.delete(
        f"/api/v1/admin/contact-messages/{first['id']}", headers=headers
    )

    assert listing.status_code == 200
    assert [item["id"] for item in listing.json()] == [second["id"], first["id"]]
    assert detail.status_code == 200
    assert updated.status_code == 200 and updated.json()["status"] == "read"
    assert invalid.status_code == 422
    assert deleted.status_code == 204
    assert client.get(
        f"/api/v1/admin/contact-messages/{first['id']}", headers=headers
    ).status_code == 404


def test_admin_manages_quote_requests(client: TestClient, auth_headers) -> None:
    created = client.post("/api/v1/quote-requests", json=quote_payload()).json()
    headers = auth_headers()

    listing = client.get("/api/v1/admin/quote-requests", headers=headers)
    detail = client.get(
        f"/api/v1/admin/quote-requests/{created['id']}", headers=headers
    )
    updated = client.patch(
        f"/api/v1/admin/quote-requests/{created['id']}/status",
        headers=headers,
        json={"status": "in_progress"},
    )
    invalid = client.patch(
        f"/api/v1/admin/quote-requests/{created['id']}/status",
        headers=headers,
        json={"status": "read"},
    )
    deleted = client.delete(
        f"/api/v1/admin/quote-requests/{created['id']}", headers=headers
    )

    assert listing.status_code == 200 and len(listing.json()) == 1
    assert detail.status_code == 200
    assert updated.status_code == 200 and updated.json()["status"] == "in_progress"
    assert invalid.status_code == 422
    assert deleted.status_code == 204
    assert client.patch(
        "/api/v1/admin/quote-requests/999/status",
        headers=headers,
        json={"status": "completed"},
    ).status_code == 404
