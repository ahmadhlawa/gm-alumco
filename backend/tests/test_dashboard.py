from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.message import ContactMessage, QuoteRequest
from app.models.partner import Partner
from app.models.service import Service

from tests.test_projects import add_project


def test_dashboard_stats_reflect_data(
    client: TestClient, db: Session, auth_headers
) -> None:
    headers = auth_headers()
    add_project(db, title_en="One", category="LOCAL", is_active=True)
    add_project(db, title_en="Two", category="INTERNATIONAL", is_active=True)
    add_project(db, title_en="Featured", category="FEATURED", is_active=True)
    add_project(db, title_en="Hidden", is_active=False)
    db.add_all(
        [
            Service(title_en="Service", title_he="שירות", is_active=True),
            Service(title_en="Hidden", title_he="מוסתר", is_active=False),
            Partner(name_en="Partner", name_he="שותף", logo_url="https://x.test/logo.png", is_active=True),
            ContactMessage(name="A", email="a@x.test", message="hi", status="NEW"),
            ContactMessage(name="B", email="b@x.test", message="hi", status="READ"),
            ContactMessage(name="D", email="d@x.test", message="hi", status="ARCHIVED"),
            QuoteRequest(name="C", email=None, phone="123", status="NEW"),
            QuoteRequest(name="E", email=None, phone="456", status="ARCHIVED"),
        ]
    )
    db.commit()

    response = client.get("/api/v1/admin/dashboard/stats", headers=headers)

    assert response.status_code == 200
    body = response.json()
    assert body["projects"] == 3
    assert body["local_projects"] == 1
    assert body["international_projects"] == 1
    assert body["featured_projects"] == 1
    assert body["services"] == 1
    assert body["partners"] == 1
    assert body["contact_messages"] == {"NEW": 1, "READ": 1}
    assert body["quote_requests"] == {"NEW": 1}


def test_dashboard_stats_requires_authentication(client: TestClient) -> None:
    assert client.get("/api/v1/admin/dashboard/stats").status_code == 401
