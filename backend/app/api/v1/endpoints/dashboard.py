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
    Product,
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
    rows = db.execute(select(model.status, func.count()).group_by(model.status)).all()
    return {status_value: count for status_value, count in rows}


@router.get("/stats", response_model=DashboardStats)
def read_dashboard_stats(
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> DashboardStats:
    return DashboardStats(
        projects=_active_count(db, Project),
        services=_active_count(db, Service),
        products=_active_count(db, Product),
        gallery=_active_count(db, GalleryImage),
        partners=_active_count(db, Partner),
        testimonials=_active_count(db, Testimonial),
        contact_messages=_status_counts(db, ContactMessage),
        quote_requests=_status_counts(db, QuoteRequest),
    )
