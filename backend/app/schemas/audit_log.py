from datetime import datetime
from typing import Any

from app.schemas.common import ORMModel


class AuditLogRead(ORMModel):
    id: int
    admin_id: int | None = None
    action: str
    entity_type: str | None = None
    entity_id: str | None = None
    details: dict[str, Any] | None = None
    created_at: datetime
