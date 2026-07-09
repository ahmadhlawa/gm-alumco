from fastapi import APIRouter, Depends
from sqlalchemy import select
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


def get_or_create_content(db: Session) -> AboutPageContent:
    """Return the singleton About page content, creating it if absent."""
    content = db.scalar(select(AboutPageContent).order_by(AboutPageContent.id))
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
    content = get_or_create_content(db)
    for field, value in data.model_dump(exclude_unset=True).items():
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
