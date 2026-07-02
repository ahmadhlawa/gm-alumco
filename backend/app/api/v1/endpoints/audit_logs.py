from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import require_super_admin
from app.db.database import get_db
from app.models.admin import Admin
from app.models.audit_log import AuditLog
from app.schemas.audit_log import AuditLogRead
from app.services.audit_service import cleanup_old_audit_logs


router = APIRouter()


@router.get("", response_model=list[AuditLogRead])
def read_audit_logs(
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
    _: Admin = Depends(require_super_admin),
) -> list[AuditLog]:
    cleanup_old_audit_logs(db)
    return list(
        db.scalars(select(AuditLog).order_by(AuditLog.id.desc()).limit(limit)).all()
    )
