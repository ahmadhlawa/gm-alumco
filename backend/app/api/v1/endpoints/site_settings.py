from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.api.dependencies import require_admin
from app.db.database import get_db
from app.models.admin import Admin
from app.models.site_settings import SiteSettings
from app.schemas.site_content import (
    SiteSettingCreate,
    SiteSettingRead,
    SiteSettingUpdate,
)
from app.services.site_content_service import (
    create_unique_record,
    get_site_record_or_404,
    hard_delete_site_record,
    list_site_settings,
    update_unique_record,
)


public_router = APIRouter()
admin_router = APIRouter()


@public_router.get("", response_model=list[SiteSettingRead])
def read_public_site_settings(db: Session = Depends(get_db)) -> list[SiteSettings]:
    return list_site_settings(db)


@admin_router.get("", response_model=list[SiteSettingRead])
def read_admin_site_settings(
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> list[SiteSettings]:
    return list_site_settings(db)


@admin_router.get("/{setting_id}", response_model=SiteSettingRead)
def read_admin_site_setting(
    setting_id: int,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> SiteSettings:
    return get_site_record_or_404(
        db, SiteSettings, setting_id, label="Site setting"
    )


@admin_router.post(
    "",
    response_model=SiteSettingRead,
    status_code=status.HTTP_201_CREATED,
)
def create_site_setting(
    data: SiteSettingCreate,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> SiteSettings:
    return create_unique_record(
        db,
        SiteSettings,
        data,
        conflict_detail="Setting key already exists",
    )


@admin_router.put("/{setting_id}", response_model=SiteSettingRead)
def update_site_setting(
    setting_id: int,
    data: SiteSettingUpdate,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> SiteSettings:
    setting = get_site_record_or_404(
        db, SiteSettings, setting_id, label="Site setting"
    )
    return update_unique_record(
        db,
        setting,
        data,
        conflict_detail="Setting key already exists",
    )


@admin_router.delete("/{setting_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_site_setting(
    setting_id: int,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> Response:
    setting = get_site_record_or_404(
        db, SiteSettings, setting_id, label="Site setting"
    )
    hard_delete_site_record(db, setting)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
