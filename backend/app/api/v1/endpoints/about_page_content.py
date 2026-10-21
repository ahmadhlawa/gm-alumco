import logging

from app.services.about_content_service import translate_about_content
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.api.dependencies import require_admin
from app.db.database import get_db
from app.models.about_page_content import AboutPageContent
from app.models.admin import Admin
from app.schemas.about_page_content import (
    AboutPageContentPublic,
    AboutPageContentRead,
    AboutPageContentUpdate,
)
from app.services.audit_service import record_audit


public_router = APIRouter()
admin_router = APIRouter()
logger = logging.getLogger(__name__)


def load_content(db: Session) -> AboutPageContent | None:
    try:
        return db.scalar(select(AboutPageContent).order_by(AboutPageContent.id))
    except SQLAlchemyError as exc:
        db.rollback()
        logger.exception("Unable to load About content; check database connectivity and Alembic migrations")
        raise HTTPException(
            status_code=503,
            detail="About content could not be loaded. Ask an administrator to check database connectivity and migrations. Nothing was saved.",
        ) from exc


def get_or_create_content(db: Session) -> AboutPageContent:
    """Return the singleton About page content, creating it if absent."""
    content = load_content(db)
    if content is None:
        content = AboutPageContent()
        db.add(content)
        db.commit()
        db.refresh(content)
    return content


@public_router.get("", response_model=AboutPageContentPublic)
def read_public_about_content(db: Session = Depends(get_db)) -> AboutPageContent:
    return get_or_create_content(db)


@admin_router.get("", response_model=AboutPageContentRead)
def read_admin_about_content(
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> AboutPageContent:
    return get_or_create_content(db)


@admin_router.put("", response_model=AboutPageContentRead)
def update_about_content(
    data: AboutPageContentUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
) -> AboutPageContent:
    content = load_content(db)
    translated = translate_about_content(data, content)
    if content is None:
        content = AboutPageContent()
        db.add(content)
    for field, value in translated.model_dump(exclude_unset=True).items():
        setattr(content, field, value)
    db.commit()
    db.refresh(content)
    record_audit(
        db,
        admin_id=current_admin.id,
        action="update",
        entity_type="about_page_content",
        entity_id=content.id,
    )
    return content
