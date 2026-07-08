from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.production_project import ProductionProject, ProductionProjectImage
from app.schemas.production_project import ProductionProjectImageCreate


def list_production_projects(
    db: Session,
    *,
    active_only: bool = False,
) -> list[ProductionProject]:
    statement = select(ProductionProject).options(selectinload(ProductionProject.images))
    if active_only:
        statement = statement.where(ProductionProject.is_active.is_(True))
    statement = statement.order_by(ProductionProject.sort_order, ProductionProject.id)
    return list(db.scalars(statement).all())


def get_production_project_or_404(
    db: Session,
    project_id: int,
    *,
    active_only: bool = False,
) -> ProductionProject:
    statement = (
        select(ProductionProject)
        .options(selectinload(ProductionProject.images))
        .where(ProductionProject.id == project_id)
    )
    if active_only:
        statement = statement.where(ProductionProject.is_active.is_(True))
    project = db.scalar(statement)
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Production project not found",
        )
    return project


def add_production_project_image(
    db: Session,
    project: ProductionProject,
    data: ProductionProjectImageCreate,
) -> ProductionProjectImage:
    image = ProductionProjectImage(project_id=project.id, **data.model_dump())
    db.add(image)
    db.commit()
    db.refresh(image)
    return image


def delete_production_project_image(db: Session, image_id: int) -> None:
    image = db.get(ProductionProjectImage, image_id)
    if image is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Production project image not found",
        )
    db.delete(image)
    db.commit()
