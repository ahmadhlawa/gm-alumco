from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.project import Project, ProjectImage
from app.schemas.project import ProjectImageCreate


def get_project_or_404(
    db: Session,
    project_id: int,
    *,
    active_only: bool = False,
) -> Project:
    statement = (
        select(Project)
        .options(selectinload(Project.images))
        .where(Project.id == project_id)
    )
    if active_only:
        statement = statement.where(Project.is_active.is_(True))
    project = db.scalar(statement)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


def add_project_image(
    db: Session,
    project: Project,
    data: ProjectImageCreate,
) -> ProjectImage:
    image = ProjectImage(project_id=project.id, **data.model_dump())
    db.add(image)
    db.commit()
    db.refresh(image)
    return image


def delete_project_image(db: Session, image_id: int) -> None:
    image = db.get(ProjectImage, image_id)
    if image is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project image not found",
        )
    db.delete(image)
    db.commit()
