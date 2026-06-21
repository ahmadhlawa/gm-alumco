from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.api.dependencies import require_admin
from app.db.database import get_db
from app.models.admin import Admin
from app.models.partner import Partner
from app.schemas.partner import PartnerCreate, PartnerRead, PartnerUpdate
from app.services.crud import (
    create_entity,
    get_entity_or_404,
    list_entities,
    soft_delete_entity,
    update_entity,
)


public_router = APIRouter()
admin_router = APIRouter()


@public_router.get("", response_model=list[PartnerRead])
def read_partners(db: Session = Depends(get_db)) -> list[Partner]:
    return list_entities(db, Partner, active_only=True)


@admin_router.get("", response_model=list[PartnerRead])
def read_admin_partners(
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> list[Partner]:
    return list_entities(db, Partner)


@admin_router.get("/{partner_id}", response_model=PartnerRead)
def read_admin_partner(
    partner_id: int,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> Partner:
    return get_entity_or_404(db, Partner, partner_id)


@admin_router.post("", response_model=PartnerRead, status_code=status.HTTP_201_CREATED)
def create_partner(
    data: PartnerCreate,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> Partner:
    return create_entity(db, Partner, data)


@admin_router.put("/{partner_id}", response_model=PartnerRead)
def update_partner(
    partner_id: int,
    data: PartnerUpdate,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> Partner:
    return update_entity(db, get_entity_or_404(db, Partner, partner_id), data)


@admin_router.delete("/{partner_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_partner(
    partner_id: int,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> Response:
    soft_delete_entity(db, get_entity_or_404(db, Partner, partner_id))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
