from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.api.dependencies import require_admin
from app.db.database import get_db
from app.models.admin import Admin
from app.models.production_project import ProductionProject, ProductionProjectImage
from app.schemas.production_project import (
    ProductionProjectCreate,
    ProductionProjectImageCreate,
    ProductionProjectImageRead,
    ProductionProjectRead,
    ProductionProjectUpdate,
)
from app.services.audit_service import record_audit
from app.services.crud import delete_entity, get_entity_or_404, update_entity
from app.services.production_project_service import (
    add_production_project_image,
    create_production_project as create_production_project_entity,
    delete_production_project_image,
    get_production_project_or_404,
    list_production_projects,
)


public_router = APIRouter()
admin_router = APIRouter()
admin_image_router = APIRouter()


@public_router.get("", response_model=list[ProductionProjectRead])
def read_production_projects(db: Session = Depends(get_db)) -> list[ProductionProject]:
    return list_production_projects(db, active_only=True)


@public_router.get("/{project_id}", response_model=ProductionProjectRead)
def read_production_project(project_id: int, db: Session = Depends(get_db)) -> ProductionProject:
    return get_production_project_or_404(db, project_id, active_only=True)


@admin_router.get("", response_model=list[ProductionProjectRead])
def read_admin_production_projects(
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> list[ProductionProject]:
    return list_production_projects(db)


@admin_router.get("/{project_id}", response_model=ProductionProjectRead)
def read_admin_production_project(
    project_id: int,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> ProductionProject:
    return get_production_project_or_404(db, project_id)


@admin_router.post("", response_model=ProductionProjectRead, status_code=status.HTTP_201_CREATED)
def create_production_project(
    data: ProductionProjectCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
) -> ProductionProject:
    project = create_production_project_entity(db, data)
    record_audit(
        db,
        admin_id=current_admin.id,
        action="create",
        entity_type="production_project",
        entity_id=project.id,
    )
    return project


@admin_router.put("/{project_id}", response_model=ProductionProjectRead)
def update_production_project(
    project_id: int,
    data: ProductionProjectUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
) -> ProductionProject:
    project = update_entity(db, get_entity_or_404(db, ProductionProject, project_id), data)
    record_audit(
        db,
        admin_id=current_admin.id,
        action="update",
        entity_type="production_project",
        entity_id=project.id,
    )
    return project


@admin_router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_production_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
) -> Response:
    delete_entity(db, get_production_project_or_404(db, project_id))
    record_audit(
        db,
        admin_id=current_admin.id,
        action="delete",
        entity_type="production_project",
        entity_id=project_id,
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@admin_router.post(
    "/{project_id}/images",
    response_model=ProductionProjectImageRead,
    status_code=status.HTTP_201_CREATED,
)
def create_production_project_image(
    project_id: int,
    data: ProductionProjectImageCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
) -> ProductionProjectImage:
    image = add_production_project_image(
        db,
        get_production_project_or_404(db, project_id),
        data,
    )
    record_audit(
        db,
        admin_id=current_admin.id,
        action="add_image",
        entity_type="production_project",
        entity_id=project_id,
        details={"image_id": image.id},
    )
    return image


@admin_image_router.delete("/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_production_project_image(
    image_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
) -> Response:
    delete_production_project_image(db, image_id)
    record_audit(
        db,
        admin_id=current_admin.id,
        action="delete_image",
        entity_type="production_project_image",
        entity_id=image_id,
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)
