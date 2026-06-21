from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.testimonial import Testimonial as testimonial_model


def make_testimonial_payload(**overrides) -> dict:
    payload = {
        "client_name_ar": "عميل",
        "client_name_en": "Client",
        "client_name_he": "לקוח",
        "message_ar": "رسالة",
        "message_en": "Message",
        "message_he": "הודעה",
        "client_position_ar": None,
        "client_position_en": "Manager",
        "client_position_he": None,
        "sort_order": 1,
        "is_active": True,
    }
    payload.update(overrides)
    return payload


def test_public_testimonials_only_return_active_sorted(
    client: TestClient, db: Session
) -> None:
    db.add_all(
        [
            testimonial_model(**make_testimonial_payload(client_name_en="Second", sort_order=2)),
            testimonial_model(**make_testimonial_payload(client_name_en="First", sort_order=1)),
            testimonial_model(**make_testimonial_payload(client_name_en="Hidden", is_active=False, sort_order=0)),
        ]
    )
    db.commit()
    response = client.get("/api/v1/testimonials")
    assert response.status_code == 200
    assert [item["client_name_en"] for item in response.json()] == ["First", "Second"]


def test_admin_can_crud_testimonial(client: TestClient, auth_headers) -> None:
    headers = auth_headers()
    created = client.post(
        "/api/v1/admin/testimonials",
        headers=headers,
        json=make_testimonial_payload(is_active=False),
    )
    assert created.status_code == 201
    testimonial_id = created.json()["id"]
    assert client.get("/api/v1/admin/testimonials", headers=headers).status_code == 200
    assert client.get(
        f"/api/v1/admin/testimonials/{testimonial_id}", headers=headers
    ).status_code == 200
    updated = client.put(
        f"/api/v1/admin/testimonials/{testimonial_id}",
        headers=headers,
        json={"client_position_en": None, "message_en": "Updated"},
    )
    assert updated.json()["client_position_en"] is None
    assert updated.json()["message_en"] == "Updated"
    assert client.delete(
        f"/api/v1/admin/testimonials/{testimonial_id}", headers=headers
    ).status_code == 204


def test_testimonial_requires_all_translations_and_auth(
    client: TestClient, auth_headers
) -> None:
    payload = make_testimonial_payload()
    payload.pop("message_he")
    response = client.post(
        "/api/v1/admin/testimonials",
        headers=auth_headers(),
        json=payload,
    )
    assert response.status_code == 422
    assert client.get("/api/v1/admin/testimonials").status_code == 401
