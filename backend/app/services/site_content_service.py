from typing import TypeVar

from fastapi import HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.site_content import SiteContent
from app.models.site_settings import SiteSettings


SiteRecordT = TypeVar("SiteRecordT")


def list_site_content(
    db: Session,
    *,
    active_only: bool = False,
    section: str | None = None,
) -> list[SiteContent]:
    statement = select(SiteContent)
    if active_only:
        statement = statement.where(SiteContent.is_active.is_(True))
    if section is not None:
        statement = statement.where(SiteContent.section == section)
    statement = statement.order_by(SiteContent.section, SiteContent.key, SiteContent.id)
    return list(db.scalars(statement).all())


def list_site_settings(db: Session) -> list[SiteSettings]:
    statement = select(SiteSettings).order_by(SiteSettings.key, SiteSettings.id)
    return list(db.scalars(statement).all())


def get_site_record_or_404(
    db: Session,
    model: type[SiteRecordT],
    record_id: int,
    *,
    label: str,
) -> SiteRecordT:
    record = db.get(model, record_id)
    if record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{label} not found",
        )
    return record


def _commit_or_conflict(db: Session, detail: str) -> None:
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail) from exc


def create_unique_record(
    db: Session,
    model: type[SiteRecordT],
    data: BaseModel,
    *,
    conflict_detail: str,
) -> SiteRecordT:
    record = model(**data.model_dump())
    db.add(record)
    _commit_or_conflict(db, conflict_detail)
    db.refresh(record)
    return record


def update_unique_record(
    db: Session,
    record: SiteRecordT,
    data: BaseModel,
    *,
    conflict_detail: str,
) -> SiteRecordT:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(record, field, value)
    _commit_or_conflict(db, conflict_detail)
    db.refresh(record)
    return record


def hard_delete_site_record(db: Session, record: SiteRecordT) -> None:
    db.delete(record)
    db.commit()
