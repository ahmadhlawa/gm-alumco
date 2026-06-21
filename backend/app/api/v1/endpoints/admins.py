from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.api.dependencies import require_super_admin
from app.db.database import get_db
from app.models.admin import Admin
from app.schemas.admin import AdminCreate, AdminRead, AdminUpdate
from app.services.admin_service import (
    create_admin,
    deactivate_admin,
    get_admin_or_404,
    list_admins,
    update_admin,
)

router = APIRouter()


@router.get("", response_model=list[AdminRead])
def read_admins(
    db: Session = Depends(get_db),
    _: Admin = Depends(require_super_admin),
) -> list[Admin]:
    return list_admins(db)


@router.get("/{admin_id}", response_model=AdminRead)
def read_admin(
    admin_id: int,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_super_admin),
) -> Admin:
    return get_admin_or_404(db, admin_id)


@router.post("", response_model=AdminRead, status_code=status.HTTP_201_CREATED)
def add_admin(
    data: AdminCreate,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_super_admin),
) -> Admin:
    return create_admin(db, data)


@router.put("/{admin_id}", response_model=AdminRead)
def edit_admin(
    admin_id: int,
    data: AdminUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_super_admin),
) -> Admin:
    return update_admin(db, get_admin_or_404(db, admin_id), data, current_admin)


@router.delete("/{admin_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_admin(
    admin_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_super_admin),
) -> Response:
    deactivate_admin(db, get_admin_or_404(db, admin_id), current_admin)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
