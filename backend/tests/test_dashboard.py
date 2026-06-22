from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.message import ContactMessage, QuoteRequest

from tests.test_projects import add_project


def test_dashboard_stats_reflect_data(
    client: TestClient, db: Session, auth_headers
) -> None:
    headers = auth_headers()
    add_project(db, title_en="One", is_active=True)
    add_project(db, title_en="Two", is_active=True)
    add_project(db, title_en="Hidden", is_active=False)
    db.add_all(
        [
            ContactMessage(name="A", email="a@x.test", message="hi", status="new"),
            ContactMessage(name="B", email="b@x.test", message="hi", status="read"),
            QuoteRequest(name="C", email="c@x.test", phone="123", status="new"),
        ]
    )
    db.commit()

    response = client.get("/api/v1/admin/dashboard/stats", headers=headers)

    assert response.status_code == 200
    body = response.json()
    assert body["projects"] == 2  # active only
    assert body["contact_messages"] == {"new": 1, "read": 1}
    assert body["quote_requests"] == {"new": 1}


def test_dashboard_stats_requires_authentication(client: TestClient) -> None:
    assert client.get("/api/v1/admin/dashboard/stats").status_code == 401
