from datetime import datetime

from app.schemas.common import ORMModel


class AdminRead(ORMModel):
    id: int
    full_name: str
    email: str
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    last_login_at: datetime | None = None
