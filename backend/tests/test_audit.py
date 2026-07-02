from datetime import UTC, datetime, timedelta

from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog

from tests.test_partners import partner_payload
from tests.test_projects import project_payload
from tests.test_services import service_payload


def _actions(db: Session) -> list[str]:
    return list(db.scalars(select(AuditLog.action).order_by(AuditLog.id)).all())


def test_login_writes_audit_entry(client: TestClient, db: Session, auth_headers) -> None:
    auth_headers()  # triggers one successful login
    logs = list(db.scalars(select(AuditLog)).all())
    assert [log.action for log in logs] == ["login"]
    assert logs[0].admin_id is not None


def test_project_mutations_are_audited(
    client: TestClient, db: Session, auth_headers
) -> None:
    headers = auth_headers()
    created = client.post(
        "/api/v1/admin/projects", headers=headers, json=project_payload()
    )
    project_id = created.json()["id"]
    client.put(
        f"/api/v1/admin/projects/{project_id}",
        headers=headers,
        json={"title_en": "Renamed"},
    )
    client.delete(f"/api/v1/admin/projects/{project_id}", headers=headers)

    actions = _actions(db)
    assert actions == ["login", "create", "update", "delete"]


def test_service_and_partner_mutations_are_audited(
    client: TestClient, db: Session, auth_headers
) -> None:
    headers = auth_headers()

    service = client.post(
        "/api/v1/admin/services", headers=headers, json=service_payload()
    ).json()
    client.put(
        f"/api/v1/admin/services/{service['id']}",
        headers=headers,
        json={"title_en": "Updated service"},
    )
    client.delete(f"/api/v1/admin/services/{service['id']}", headers=headers)

    partner = client.post(
        "/api/v1/admin/partners", headers=headers, json=partner_payload()
    ).json()
    client.put(
        f"/api/v1/admin/partners/{partner['id']}",
        headers=headers,
        json={"website_url": None},
    )
    client.delete(f"/api/v1/admin/partners/{partner['id']}", headers=headers)

    logs = list(db.scalars(select(AuditLog).order_by(AuditLog.id)).all())
    assert [(log.action, log.entity_type) for log in logs] == [
        ("login", None),
        ("create", "service"),
        ("update", "service"),
        ("delete", "service"),
        ("create", "partner"),
        ("update", "partner"),
        ("delete", "partner"),
    ]


def test_audit_logs_endpoint_requires_super_admin(
    client: TestClient, auth_headers
) -> None:
    admin_headers = auth_headers(role="admin")
    super_headers = auth_headers(role="super_admin")

    forbidden = client.get("/api/v1/admin/audit-logs", headers=admin_headers)
    allowed = client.get("/api/v1/admin/audit-logs", headers=super_headers)
    anonymous = client.get("/api/v1/admin/audit-logs")

    assert forbidden.status_code == 403
    assert allowed.status_code == 200
    # newest first; the two logins above are present
    assert {item["action"] for item in allowed.json()} == {"login"}
    assert all(item["actor_name"] == "Test Admin" for item in allowed.json())
    assert {item["actor_email"] for item in allowed.json()} == {
        "admin@example.com",
        "super_admin@example.com",
    }
    assert anonymous.status_code == 401


def test_audit_logs_older_than_seven_days_are_cleaned_up(
    client: TestClient, db: Session, auth_headers
) -> None:
    super_headers = auth_headers(role="super_admin")
    now = datetime.now(UTC).replace(tzinfo=None)
    old_log = AuditLog(action="old", created_at=now - timedelta(days=8))
    recent_log = AuditLog(action="recent", created_at=now - timedelta(days=6))
    db.add_all([old_log, recent_log])
    db.commit()

    response = client.get("/api/v1/admin/audit-logs", headers=super_headers)

    assert response.status_code == 200
    assert "old" not in {item["action"] for item in response.json()}
    assert "recent" in {item["action"] for item in response.json()}
    assert db.scalar(select(AuditLog).where(AuditLog.action == "old")) is None
