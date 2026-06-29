from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.dependencies import require_admin
from app.db.database import get_db
from app.models import (
    Admin,
    ContactMessage,
    GalleryImage,
    Partner,
    Project,
    QuoteRequest,
    Service,
    Testimonial,
)
from app.schemas.dashboard import DashboardStats


router = APIRouter()


def _active_count(db: Session, model: type) -> int:
    return db.scalar(
        select(func.count()).select_from(model).where(model.is_active.is_(True))
    ) or 0


def _status_counts(db: Session, model: type) -> dict[str, int]:
    rows = db.execute(
        select(model.status, func.count())
        .where(model.status != "ARCHIVED")
        .group_by(model.status)
    ).all()
    return {status_value: count for status_value, count in rows}


def _active_project_count(db: Session, category: str) -> int:
    return db.scalar(
        select(func.count())
        .select_from(Project)
        .where(Project.is_active.is_(True), Project.category == category)
    ) or 0


@router.get("/stats", response_model=DashboardStats)
def read_dashboard_stats(
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> DashboardStats:
    return DashboardStats(
        projects=_active_count(db, Project),
        local_projects=_active_project_count(db, "LOCAL"),
        international_projects=_active_project_count(db, "INTERNATIONAL"),
        featured_projects=_active_project_count(db, "FEATURED"),
        services=_active_count(db, Service),
        gallery=_active_count(db, GalleryImage),
        partners=_active_count(db, Partner),
        testimonials=_active_count(db, Testimonial),
        contact_messages=_status_counts(db, ContactMessage),
        quote_requests=_status_counts(db, QuoteRequest),
    )
