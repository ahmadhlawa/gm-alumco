import logging

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.api.dependencies import require_admin
from app.db.database import get_db
from app.models.admin import Admin
from app.models.message import QuoteRequest
from app.schemas.message import (
    QuoteRequestCreate,
    QuoteRequestRead,
    QuoteRequestStatusUpdate,
)
from app.services.crud import create_entity
from app.services.email_service import email_service
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
logger = logging.getLogger(__name__)


@public_router.post(
    "",
    response_model=QuoteRequestRead,
    status_code=status.HTTP_201_CREATED,
)
def create_quote_request(
    data: QuoteRequestCreate,
    db: Session = Depends(get_db),
) -> QuoteRequest:
    request = create_entity(db, QuoteRequest, data)
    try:
        email_service.send_quote_request_notification(request)
    except Exception as exc:
        logger.error(
            "Unexpected quote notification failure after request %s was saved (%s).",
            request.id,
            type(exc).__name__,
        )
    try:
        email_service.send_quote_confirmation(request)
    except Exception as exc:
        logger.error(
            "Unexpected quote confirmation failure after request %s was saved (%s).",
            request.id,
            type(exc).__name__,
        )
    return request


@admin_router.get("", response_model=list[QuoteRequestRead])
def read_quote_requests(
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> list[QuoteRequest]:
    return list_inbox_records(db, QuoteRequest)


@admin_router.post("/mark-all-read", response_model=list[QuoteRequestRead])
def mark_quote_requests_read(
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> list[QuoteRequest]:
    return mark_all_inbox_records_read(db, QuoteRequest)


@admin_router.get("/{request_id}", response_model=QuoteRequestRead)
def read_quote_request(
    request_id: int,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> QuoteRequest:
    request = get_inbox_record_or_404(db, QuoteRequest, request_id, label="Quote request")
    return mark_inbox_record_read(db, request)


@admin_router.post("/{request_id}/read", response_model=QuoteRequestRead)
def mark_quote_request_read(
    request_id: int,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> QuoteRequest:
    request = get_inbox_record_or_404(db, QuoteRequest, request_id, label="Quote request")
    return mark_inbox_record_read(db, request)


@admin_router.patch("/{request_id}/status", response_model=QuoteRequestRead)
def update_quote_request_status(
    request_id: int,
    data: QuoteRequestStatusUpdate,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> QuoteRequest:
    request = get_inbox_record_or_404(
        db, QuoteRequest, request_id, label="Quote request"
    )
    return update_inbox_status(db, request, data.status)


@admin_router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_quote_request(
    request_id: int,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> Response:
    request = get_inbox_record_or_404(
        db, QuoteRequest, request_id, label="Quote request"
    )
    delete_inbox_record(db, request)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
