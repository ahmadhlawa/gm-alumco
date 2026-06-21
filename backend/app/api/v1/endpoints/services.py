from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.api.dependencies import require_admin
from app.db.database import get_db
from app.models.admin import Admin
from app.models.service import Service
from app.schemas.service import ServiceCreate, ServiceRead, ServiceUpdate
from app.services.crud import (
    create_entity,
    get_entity_or_404,
    list_entities,
    soft_delete_entity,
    update_entity,
)


public_router = APIRouter()
admin_router = APIRouter()


@public_router.get("", response_model=list[ServiceRead])
def read_services(db: Session = Depends(get_db)) -> list[Service]:
    return list_entities(db, Service, active_only=True)


@public_router.get("/{service_id}", response_model=ServiceRead)
def read_service(service_id: int, db: Session = Depends(get_db)) -> Service:
    return get_entity_or_404(db, Service, service_id, active_only=True)


@admin_router.get("", response_model=list[ServiceRead])
def read_admin_services(
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> list[Service]:
    return list_entities(db, Service)


@admin_router.get("/{service_id}", response_model=ServiceRead)
def read_admin_service(
    service_id: int,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> Service:
    return get_entity_or_404(db, Service, service_id)


@admin_router.post("", response_model=ServiceRead, status_code=status.HTTP_201_CREATED)
def create_service(
    data: ServiceCreate,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> Service:
    return create_entity(db, Service, data)


@admin_router.put("/{service_id}", response_model=ServiceRead)
def update_service(
    service_id: int,
    data: ServiceUpdate,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> Service:
    return update_entity(db, get_entity_or_404(db, Service, service_id), data)


@admin_router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> Response:
    soft_delete_entity(db, get_entity_or_404(db, Service, service_id))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
