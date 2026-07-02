from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.api.dependencies import require_admin
from app.db.database import get_db
from app.models.admin import Admin
from app.models.message import ContactMessage
from app.schemas.message import (
    ContactMessageCreate,
    ContactMessageRead,
    ContactMessageStatusUpdate,
)
from app.services.crud import create_entity
from app.services.inbox_service import (
    delete_inbox_record,
    get_inbox_record_or_404,
    list_inbox_records,
    mark_all_inbox_records_read,
    mark_inbox_record_read,
    update_inbox_status,
)


public_router = APIRouter()
admin_router = APIRouter()


@public_router.post(
    "",
    response_model=ContactMessageRead,
    status_code=status.HTTP_201_CREATED,
)
def create_contact_message(
    data: ContactMessageCreate,
    db: Session = Depends(get_db),
) -> ContactMessage:
    return create_entity(db, ContactMessage, data)


@admin_router.get("", response_model=list[ContactMessageRead])
def read_contact_messages(
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> list[ContactMessage]:
    return list_inbox_records(db, ContactMessage)


@admin_router.post("/mark-all-read", response_model=list[ContactMessageRead])
def mark_contact_messages_read(
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> list[ContactMessage]:
    return mark_all_inbox_records_read(db, ContactMessage)


@admin_router.get("/{message_id}", response_model=ContactMessageRead)
def read_contact_message(
    message_id: int,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> ContactMessage:
    message = get_inbox_record_or_404(
        db, ContactMessage, message_id, label="Contact message"
    )
    return mark_inbox_record_read(db, message)


@admin_router.post("/{message_id}/read", response_model=ContactMessageRead)
def mark_contact_message_read(
    message_id: int,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> ContactMessage:
    message = get_inbox_record_or_404(
        db, ContactMessage, message_id, label="Contact message"
    )
    return mark_inbox_record_read(db, message)


@admin_router.patch("/{message_id}/status", response_model=ContactMessageRead)
def update_contact_message_status(
    message_id: int,
    data: ContactMessageStatusUpdate,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> ContactMessage:
    message = get_inbox_record_or_404(
        db, ContactMessage, message_id, label="Contact message"
    )
    return update_inbox_status(db, message, data.status)


@admin_router.delete("/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact_message(
    message_id: int,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> Response:
    message = get_inbox_record_or_404(
        db, ContactMessage, message_id, label="Contact message"
    )
    delete_inbox_record(db, message)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
