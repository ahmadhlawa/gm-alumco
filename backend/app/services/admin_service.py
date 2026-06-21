from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.models.admin import Admin
from app.schemas.admin import AdminCreate, AdminUpdate


def list_admins(db: Session) -> list[Admin]:
    return list(db.scalars(select(Admin).order_by(Admin.id)).all())


def get_admin_or_404(db: Session, admin_id: int) -> Admin:
    admin = db.get(Admin, admin_id)
    if admin is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin not found")
    return admin


def _commit_or_conflict(db: Session) -> None:
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already exists",
        ) from exc


def create_admin(db: Session, data: AdminCreate) -> Admin:
    admin = Admin(
        full_name=data.full_name,
        email=str(data.email).lower(),
        password_hash=get_password_hash(data.password),
        role=data.role,
        is_active=True,
    )
    db.add(admin)
    _commit_or_conflict(db)
    db.refresh(admin)
    return admin


def update_admin(
    db: Session,
    target: Admin,
    data: AdminUpdate,
    current_admin: Admin,
) -> Admin:
    changes = data.model_dump(exclude_unset=True)
    if target.id == current_admin.id and (
        changes.get("is_active") is False or changes.get("role") == "admin"
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Super Admin cannot deactivate or demote self",
        )
    if "email" in changes:
        changes["email"] = str(changes["email"]).lower()
    password = changes.pop("password", None)
    if password is not None:
        target.password_hash = get_password_hash(password)
    for field, value in changes.items():
        setattr(target, field, value)
    _commit_or_conflict(db)
    db.refresh(target)
    return target


def deactivate_admin(db: Session, target: Admin, current_admin: Admin) -> None:
    if target.id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Super Admin cannot deactivate self",
        )
    target.is_active = False
    db.commit()
