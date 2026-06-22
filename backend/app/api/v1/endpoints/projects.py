from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.api.dependencies import require_admin
from app.db.database import get_db
from app.models.admin import Admin
from app.models.project import Project, ProjectImage
from app.schemas.project import (
    ProjectCategory,
    ProjectCreate,
    ProjectDetail,
    ProjectImageCreate,
    ProjectImageRead,
    ProjectRead,
    ProjectUpdate,
)
from app.services.crud import (
    create_entity,
    get_entity_or_404,
    list_entities,
    soft_delete_entity,
    update_entity,
)
from app.services.audit_service import record_audit
from app.services.project_service import (
    add_project_image,
    delete_project_image,
    get_project_or_404,
)


public_router = APIRouter()
admin_router = APIRouter()
admin_image_router = APIRouter()


@public_router.get("", response_model=list[ProjectRead])
def read_projects(
    category: ProjectCategory | None = None,
    db: Session = Depends(get_db),
) -> list[Project]:
    return list_entities(
        db,
        Project,
        active_only=True,
        filters={"category": category},
    )


@public_router.get("/{project_id}", response_model=ProjectDetail)
def read_project(project_id: int, db: Session = Depends(get_db)) -> Project:
    return get_project_or_404(db, project_id, active_only=True)


@admin_router.get("", response_model=list[ProjectRead])
def read_admin_projects(
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> list[Project]:
    return list_entities(db, Project)


@admin_router.get("/{project_id}", response_model=ProjectDetail)
def read_admin_project(
    project_id: int,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> Project:
    return get_project_or_404(db, project_id)


@admin_router.post("", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
def create_project(
    data: ProjectCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
) -> Project:
    project = create_entity(db, Project, data)
    record_audit(
        db,
        admin_id=current_admin.id,
        action="create",
        entity_type="project",
        entity_id=project.id,
    )
    return project


@admin_router.put("/{project_id}", response_model=ProjectRead)
def update_project(
    project_id: int,
    data: ProjectUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
) -> Project:
    project = update_entity(db, get_entity_or_404(db, Project, project_id), data)
    record_audit(
        db,
        admin_id=current_admin.id,
        action="update",
        entity_type="project",
        entity_id=project.id,
    )
    return project


@admin_router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
) -> Response:
    soft_delete_entity(db, get_entity_or_404(db, Project, project_id))
    record_audit(
        db,
        admin_id=current_admin.id,
        action="delete",
        entity_type="project",
        entity_id=project_id,
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@admin_router.post(
    "/{project_id}/images",
    response_model=ProjectImageRead,
    status_code=status.HTTP_201_CREATED,
)
def create_project_image(
    project_id: int,
    data: ProjectImageCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
) -> ProjectImage:
    image = add_project_image(db, get_project_or_404(db, project_id), data)
    record_audit(
        db,
        admin_id=current_admin.id,
        action="add_image",
        entity_type="project",
        entity_id=project_id,
        details={"image_id": image.id},
    )
    return image


@admin_image_router.delete("/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_project_image(
    image_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
) -> Response:
    delete_project_image(db, image_id)
    record_audit(
        db,
        admin_id=current_admin.id,
        action="delete_image",
        entity_type="project_image",
        entity_id=image_id,
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)
