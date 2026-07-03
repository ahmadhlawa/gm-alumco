from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.v1.endpoints import quote_requests as quote_requests_endpoint
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
    assert response.json()["status"] == "NEW"
    assert response.json()["is_read"] is False
    stored = db.scalar(select(ContactMessage))
    assert stored is not None
    assert stored.email == "visitor@example.com"
    assert stored.is_read is False


def test_public_contact_submission_validates_email(client: TestClient) -> None:
    response = client.post(
        "/api/v1/contact/messages",
        json=contact_payload(email="invalid-email"),
    )
    assert response.status_code == 422


def test_public_contact_submission_rejects_blank_required_fields(
    client: TestClient,
) -> None:
    blank_name = client.post(
        "/api/v1/contact/messages",
        json=contact_payload(name="   "),
    )
    blank_message = client.post(
        "/api/v1/contact/messages",
        json=contact_payload(message="   "),
    )

    assert blank_name.status_code == 422
    assert blank_message.status_code == 422


def test_public_contact_submission_rejects_oversized_message(
    client: TestClient,
) -> None:
    response = client.post(
        "/api/v1/contact/messages",
        json=contact_payload(message="x" * 5001),
    )

    assert response.status_code == 422


def test_public_quote_submission_creates_new_request(
    client: TestClient, db: Session
) -> None:
    response = client.post("/api/v1/quote-requests", json=quote_payload())

    assert response.status_code == 201
    assert response.json()["status"] == "NEW"
    assert response.json()["is_read"] is False
    stored = db.scalar(select(QuoteRequest))
    assert stored is not None
    assert stored.phone == "+970598000000"
    assert stored.is_read is False


def test_public_quote_submission_stays_successful_when_email_fails(
    client: TestClient,
    db: Session,
    monkeypatch,
) -> None:
    delivery_attempt: dict = {}

    def fail_delivery(request: QuoteRequest) -> None:
        delivery_attempt["id"] = request.id
        delivery_attempt["created_at"] = request.created_at
        raise RuntimeError("internal SMTP detail")

    monkeypatch.setattr(
        quote_requests_endpoint.email_service,
        "send_quote_request_notification",
        fail_delivery,
    )

    response = client.post("/api/v1/quote-requests", json=quote_payload())

    assert response.status_code == 201
    assert delivery_attempt["id"] is not None
    assert delivery_attempt["created_at"] is not None
    stored = db.scalar(select(QuoteRequest))
    assert stored is not None
    assert stored.name == "Quote Customer"


def test_public_quote_submission_stays_successful_when_confirmation_fails(
    client: TestClient,
    db: Session,
    monkeypatch,
) -> None:
    def fail_confirmation(request: QuoteRequest) -> None:
        raise RuntimeError("internal SMTP detail")

    monkeypatch.setattr(
        quote_requests_endpoint.email_service,
        "send_quote_confirmation",
        fail_confirmation,
    )

    response = client.post("/api/v1/quote-requests", json=quote_payload())

    assert response.status_code == 201
    stored = db.scalar(select(QuoteRequest))
    assert stored is not None
    assert stored.name == "Quote Customer"


def test_public_quote_submission_saves_when_smtp_disabled(
    client: TestClient,
    db: Session,
    monkeypatch,
) -> None:
    monkeypatch.setattr(
        quote_requests_endpoint.email_service.settings, "smtp_enabled", False
    )
    monkeypatch.setattr(
        quote_requests_endpoint.email_service,
        "smtp_factory",
        lambda *_args, **_kwargs: (_ for _ in ()).throw(
            AssertionError("must not connect")
        ),
    )

    response = client.post("/api/v1/quote-requests", json=quote_payload())

    assert response.status_code == 201
    stored = db.scalar(select(QuoteRequest))
    assert stored is not None
    assert stored.name == "Quote Customer"


def test_public_quote_submission_attempts_both_emails(
    client: TestClient,
    monkeypatch,
) -> None:
    sent: list[tuple[str, str | None]] = []

    monkeypatch.setattr(
        quote_requests_endpoint.email_service,
        "send_quote_request_notification",
        lambda request: sent.append(("notification", request.email)) or True,
    )
    monkeypatch.setattr(
        quote_requests_endpoint.email_service,
        "send_quote_confirmation",
        lambda request: sent.append(("confirmation", request.email)) or True,
    )

    response = client.post("/api/v1/quote-requests", json=quote_payload())

    assert response.status_code == 201
    assert sent == [
        ("notification", "quote@example.com"),
        ("confirmation", "quote@example.com"),
    ]


def test_public_quote_submission_allows_missing_email_but_requires_valid_supplied_email_and_phone(
    client: TestClient,
) -> None:
    invalid_email = client.post(
        "/api/v1/quote-requests",
        json=quote_payload(email="invalid-email"),
    )
    without_email = quote_payload()
    without_email.pop("email")
    no_email = client.post("/api/v1/quote-requests", json=without_email)
    missing_phone = quote_payload()
    missing_phone.pop("phone")
    no_phone = client.post("/api/v1/quote-requests", json=missing_phone)

    assert invalid_email.status_code == 422
    assert no_email.status_code == 201
    assert no_email.json()["email"] is None
    assert no_phone.status_code == 422


def test_public_quote_submission_rejects_blank_required_fields(
    client: TestClient,
) -> None:
    blank_name = client.post(
        "/api/v1/quote-requests",
        json=quote_payload(name="   "),
    )
    blank_phone = client.post(
        "/api/v1/quote-requests",
        json=quote_payload(phone="   "),
    )

    assert blank_name.status_code == 422
    assert blank_phone.status_code == 422


def test_public_quote_submission_rejects_oversized_message(
    client: TestClient,
) -> None:
    response = client.post(
        "/api/v1/quote-requests",
        json=quote_payload(message="x" * 5001),
    )

    assert response.status_code == 422


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
        json={"status": "READ"},
    )
    invalid = client.patch(
        f"/api/v1/admin/contact-messages/{first['id']}/status",
        headers=headers,
        json={"status": "IN_PROGRESS"},
    )
    deleted = client.delete(
        f"/api/v1/admin/contact-messages/{first['id']}", headers=headers
    )

    assert listing.status_code == 200
    assert [item["id"] for item in listing.json()] == [second["id"], first["id"]]
    assert detail.status_code == 200
    assert updated.status_code == 200 and updated.json()["status"] == "READ"
    assert invalid.status_code == 422
    assert deleted.status_code == 204
    assert client.get(
        f"/api/v1/admin/contact-messages/{first['id']}", headers=headers
    ).status_code == 404


def test_admin_marks_contact_messages_read(client: TestClient, auth_headers) -> None:
    first = client.post("/api/v1/contact/messages", json=contact_payload()).json()
    second = client.post(
        "/api/v1/contact/messages",
        json=contact_payload(email="second@example.com"),
    ).json()
    headers = auth_headers()

    detail = client.get(f"/api/v1/admin/contact-messages/{first['id']}", headers=headers)
    listing_after_detail = client.get("/api/v1/admin/contact-messages", headers=headers)
    mark_all = client.post("/api/v1/admin/contact-messages/mark-all-read", headers=headers)

    assert detail.status_code == 200
    assert detail.json()["is_read"] is True
    states = {item["id"]: item["is_read"] for item in listing_after_detail.json()}
    assert states == {second["id"]: False, first["id"]: True}
    assert mark_all.status_code == 200
    assert all(item["is_read"] for item in mark_all.json())


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
        json={"status": "IN_PROGRESS"},
    )
    invalid = client.patch(
        f"/api/v1/admin/quote-requests/{created['id']}/status",
        headers=headers,
        json={"status": "READ"},
    )
    deleted = client.delete(
        f"/api/v1/admin/quote-requests/{created['id']}", headers=headers
    )

    assert listing.status_code == 200 and len(listing.json()) == 1
    assert detail.status_code == 200
    assert updated.status_code == 200 and updated.json()["status"] == "IN_PROGRESS"
    assert invalid.status_code == 422
    assert deleted.status_code == 204
    assert client.patch(
        "/api/v1/admin/quote-requests/999/status",
        headers=headers,
        json={"status": "DONE"},
    ).status_code == 404


def test_admin_marks_quote_requests_read(client: TestClient, auth_headers) -> None:
    first = client.post("/api/v1/quote-requests", json=quote_payload()).json()
    second = client.post(
        "/api/v1/quote-requests",
        json=quote_payload(phone="+970597000000"),
    ).json()
    headers = auth_headers()

    detail = client.get(f"/api/v1/admin/quote-requests/{first['id']}", headers=headers)
    listing_after_detail = client.get("/api/v1/admin/quote-requests", headers=headers)
    mark_all = client.post("/api/v1/admin/quote-requests/mark-all-read", headers=headers)

    assert detail.status_code == 200
    assert detail.json()["is_read"] is True
    states = {item["id"]: item["is_read"] for item in listing_after_detail.json()}
    assert states == {second["id"]: False, first["id"]: True}
    assert mark_all.status_code == 200
    assert all(item["is_read"] for item in mark_all.json())
