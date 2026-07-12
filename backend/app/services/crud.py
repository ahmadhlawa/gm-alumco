from typing import Any, TypeVar

from fastapi import HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session


ModelT = TypeVar("ModelT")


def list_entities(
    db: Session,
    model: type[ModelT],
    *,
    active_only: bool = False,
    filters: dict[str, Any] | None = None,
) -> list[ModelT]:
    statement = select(model)
    if active_only:
        statement = statement.where(model.is_active.is_(True))
    for field, value in (filters or {}).items():
        if value is not None:
            statement = statement.where(getattr(model, field) == value)
    order_columns = []
    if hasattr(model, "sort_order"):
        order_columns.append(model.sort_order)
    order_columns.append(model.id)
    return list(db.scalars(statement.order_by(*order_columns)).all())


def get_entity_or_404(
    db: Session,
    model: type[ModelT],
    entity_id: int,
    *,
    active_only: bool = False,
) -> ModelT:
    statement = select(model).where(model.id == entity_id)
    if active_only:
        statement = statement.where(model.is_active.is_(True))
    entity = db.scalar(statement)
    if entity is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return entity


def create_entity(db: Session, model: type[ModelT], data: BaseModel) -> ModelT:
    entity = model(**data.model_dump())
    db.add(entity)
    db.commit()
    db.refresh(entity)
    return entity


def update_entity(db: Session, entity: ModelT, data: BaseModel) -> ModelT:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(entity, field, value)
    db.commit()
    db.refresh(entity)
    return entity


def soft_delete_entity(db: Session, entity: ModelT) -> None:
    entity.is_active = False
    db.commit()


def delete_entity(db: Session, entity: ModelT) -> None:
    db.delete(entity)
    db.commit()
