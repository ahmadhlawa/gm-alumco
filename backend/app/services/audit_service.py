from typing import Any

from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def record_audit(
    db: Session,
    *,
    admin_id: int | None,
    action: str,
    entity_type: str | None = None,
    entity_id: int | str | None = None,
    details: dict[str, Any] | None = None,
) -> None:
    """Append an audit-log entry.

    Best-effort and isolated from the caller's success: an audit failure must
    never break the mutation it records. The mutation itself has already been
    committed before this is called, so this performs its own commit.
    """
    try:
        entry = AuditLog(
            admin_id=admin_id,
            action=action,
            entity_type=entity_type,
            entity_id=str(entity_id) if entity_id is not None else None,
            details=details,
        )
        db.add(entry)
        db.commit()
    except Exception:  # pragma: no cover - defensive, never surface to caller
        db.rollback()
