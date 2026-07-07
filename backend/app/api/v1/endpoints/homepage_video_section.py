from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import require_admin
from app.db.database import get_db
from app.models.admin import Admin
from app.models.homepage_video_section import HomepageVideoSection
from app.schemas.homepage_video_section import (
    HomepageVideoSectionPublic,
    HomepageVideoSectionRead,
    HomepageVideoSectionUpdate,
)
from app.services.audit_service import record_audit


public_router = APIRouter()
admin_router = APIRouter()


def get_or_create_section(db: Session) -> HomepageVideoSection:
    """Return the singleton homepage video section, creating it if absent.

    The migration seeds one row, but this keeps the endpoints resilient (e.g.
    fresh databases created from metadata in tests) without ever duplicating.
    """
    section = db.scalar(select(HomepageVideoSection).order_by(HomepageVideoSection.id))
    if section is None:
        section = HomepageVideoSection()
        db.add(section)
        db.commit()
        db.refresh(section)
    return section


@public_router.get("", response_model=HomepageVideoSectionPublic)
def read_public_video_section(db: Session = Depends(get_db)) -> HomepageVideoSection:
    return get_or_create_section(db)


@admin_router.get("", response_model=HomepageVideoSectionRead)
def read_admin_video_section(
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> HomepageVideoSection:
    return get_or_create_section(db)


@admin_router.put("", response_model=HomepageVideoSectionRead)
def update_video_section(
    data: HomepageVideoSectionUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
) -> HomepageVideoSection:
    section = get_or_create_section(db)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(section, field, value)
    db.commit()
    db.refresh(section)
    record_audit(
        db,
        admin_id=current_admin.id,
        action="update",
        entity_type="homepage_video_section",
        entity_id=section.id,
    )
    return section
