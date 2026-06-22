from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog

from tests.test_projects import project_payload


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
    assert anonymous.status_code == 401
