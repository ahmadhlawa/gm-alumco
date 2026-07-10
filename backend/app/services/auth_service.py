from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import create_access_token, verify_password
from app.models.admin import Admin


DUMMY_PASSWORD_HASH = (
    "$2b$12$LQv3c1yqBWVHxkd0LQ4YCOQe7HnB9Q8nYhT1S8ZT1L4bJf4J4m2W6"
)


def authenticate_admin(db: Session, email: str, password: str) -> Admin | None:
    admin = db.scalar(select(Admin).where(Admin.email == email.lower()))
    if admin is None or not admin.is_active:
        verify_password(password, DUMMY_PASSWORD_HASH)
        return None
    if not verify_password(password, admin.password_hash):
        return None
    admin.last_login_at = datetime.now(timezone.utc).replace(tzinfo=None)
    db.commit()
    db.refresh(admin)
    return admin


def issue_admin_token(admin: Admin) -> str:
    return create_access_token(admin.id)
