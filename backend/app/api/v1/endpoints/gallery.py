from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.api.dependencies import require_admin
from app.db.database import get_db
from app.models.admin import Admin
from app.models.gallery import GalleryImage
from app.schemas.gallery import GalleryCreate, GalleryRead, GalleryUpdate
from app.services.crud import (
    create_entity,
    get_entity_or_404,
    list_entities,
    soft_delete_entity,
    update_entity,
)


public_router = APIRouter()
admin_router = APIRouter()


@public_router.get("", response_model=list[GalleryRead])
def read_gallery(
    category: str | None = None,
    db: Session = Depends(get_db),
) -> list[GalleryImage]:
    return list_entities(
        db,
        GalleryImage,
        active_only=True,
        filters={"category": category},
    )


@admin_router.get("", response_model=list[GalleryRead])
def read_admin_gallery(
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> list[GalleryImage]:
    return list_entities(db, GalleryImage)


@admin_router.get("/{image_id}", response_model=GalleryRead)
def read_admin_gallery_image(
    image_id: int,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> GalleryImage:
    return get_entity_or_404(db, GalleryImage, image_id)


@admin_router.post("", response_model=GalleryRead, status_code=status.HTTP_201_CREATED)
def create_gallery_image(
    data: GalleryCreate,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> GalleryImage:
    return create_entity(db, GalleryImage, data)


@admin_router.put("/{image_id}", response_model=GalleryRead)
def update_gallery_image(
    image_id: int,
    data: GalleryUpdate,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> GalleryImage:
    return update_entity(db, get_entity_or_404(db, GalleryImage, image_id), data)


@admin_router.delete("/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_gallery_image(
    image_id: int,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> Response:
    soft_delete_entity(db, get_entity_or_404(db, GalleryImage, image_id))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
