from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.api.dependencies import require_admin
from app.db.database import get_db
from app.models.admin import Admin
from app.models.site_content import SiteContent
from app.schemas.site_content import (
    SiteContentCreate,
    SiteContentRead,
    SiteContentUpdate,
)
from app.services.crud import soft_delete_entity
from app.services.site_content_service import (
    create_unique_record,
    get_site_record_or_404,
    list_site_content,
    update_unique_record,
)


public_router = APIRouter()
admin_router = APIRouter()


@public_router.get("", response_model=list[SiteContentRead])
def read_public_site_content(db: Session = Depends(get_db)) -> list[SiteContent]:
    return list_site_content(db, active_only=True)


@public_router.get("/{section}", response_model=list[SiteContentRead])
def read_public_site_content_section(
    section: str,
    db: Session = Depends(get_db),
) -> list[SiteContent]:
    return list_site_content(db, active_only=True, section=section)


@admin_router.get("", response_model=list[SiteContentRead])
def read_admin_site_content(
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> list[SiteContent]:
    return list_site_content(db)


@admin_router.get("/{content_id}", response_model=SiteContentRead)
def read_admin_site_content_item(
    content_id: int,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> SiteContent:
    return get_site_record_or_404(
        db, SiteContent, content_id, label="Site content"
    )


@admin_router.post(
    "",
    response_model=SiteContentRead,
    status_code=status.HTTP_201_CREATED,
)
def create_site_content(
    data: SiteContentCreate,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> SiteContent:
    return create_unique_record(
        db,
        SiteContent,
        data,
        conflict_detail="Section and key already exist",
    )


@admin_router.put("/{content_id}", response_model=SiteContentRead)
def update_site_content(
    content_id: int,
    data: SiteContentUpdate,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> SiteContent:
    content = get_site_record_or_404(
        db, SiteContent, content_id, label="Site content"
    )
    return update_unique_record(
        db,
        content,
        data,
        conflict_detail="Section and key already exist",
    )


@admin_router.delete("/{content_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_site_content(
    content_id: int,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> Response:
    content = get_site_record_or_404(
        db, SiteContent, content_id, label="Site content"
    )
    soft_delete_entity(db, content)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
