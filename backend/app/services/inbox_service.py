from typing import TypeVar

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session


InboxT = TypeVar("InboxT")


def list_inbox_records(db: Session, model: type[InboxT]) -> list[InboxT]:
    statement = select(model).order_by(model.created_at.desc(), model.id.desc())
    return list(db.scalars(statement).all())


def get_inbox_record_or_404(
    db: Session,
    model: type[InboxT],
    record_id: int,
    *,
    label: str,
) -> InboxT:
    record = db.get(model, record_id)
    if record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{label} not found",
        )
    return record


def update_inbox_status(db: Session, record: InboxT, new_status: str) -> InboxT:
    record.status = new_status
    db.commit()
    db.refresh(record)
    return record


def delete_inbox_record(db: Session, record: InboxT) -> None:
    db.delete(record)
    db.commit()
