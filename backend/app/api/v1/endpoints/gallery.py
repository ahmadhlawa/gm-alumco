from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import LargeBinary, cast, or_, select
from sqlalchemy.orm import Session

from app.api.dependencies import require_admin
from app.db.database import get_db
from app.models.admin import Admin
from app.models.gallery import GalleryImage
from app.schemas.gallery import (
    GalleryCreate, GalleryRead, GalleryUpdate,
    PhotoCategory, ProjectPhotoCreate, ProjectPhotoUpdate,
)
from app.services.audit_service import record_audit
from app.services.crud import (
    create_entity,
    soft_delete_entity,
    update_entity,
)


public_router = APIRouter()
admin_router = APIRouter()

# Explicit provenance in the existing category column keeps legacy records out
# of the new feature without rewriting data or changing the database schema.
PHOTO_CATEGORIES = {key: f"PROJECT_PHOTO_{key}" for key in ("LOCAL", "INTERNATIONAL")}


def is_project_photo_category():
    # Provenance tags require exact bytes, matching the Python write guard.
    # MySQL's inherited collation may ignore case, accents or trailing spaces;
    # those legacy spellings must never be admitted to the photo-only API.
    return cast(GalleryImage.category, LargeBinary).in_(
        tuple(value.encode("ascii") for value in PHOTO_CATEGORIES.values())
    )


def photo_statement():
    return select(GalleryImage).where(is_project_photo_category())


def photo_read(image: GalleryImage) -> GalleryRead:
    return GalleryRead.model_validate(image).model_copy(
        update={"category": image.category.removeprefix("PROJECT_PHOTO_")}
    )


def legacy_gallery_statement():
    # Keep existing nullable categories visible while excluding records owned by
    # the new project-photo API. SQL NOT IN alone also excludes NULL categories.
    return select(GalleryImage).where(or_(
        GalleryImage.category.is_(None),
        ~is_project_photo_category(),
    ))


def legacy_gallery_or_404(db: Session, image_id: int) -> GalleryImage:
    image = db.scalar(legacy_gallery_statement().where(GalleryImage.id == image_id))
    if image is None:
        raise HTTPException(status_code=404, detail="Not found")
    return image


def reject_reserved_legacy_category(category: str | None) -> None:
    if category in PHOTO_CATEGORIES.values():
        raise HTTPException(
            status_code=422,
            detail="Project photo categories must use the project-photos API",
        )


# Static routes must precede the legacy /{image_id} routes.
@public_router.get("/project-photos", response_model=list[GalleryRead])
def read_project_photos(
    category: PhotoCategory | None = None,
    db: Session = Depends(get_db),
) -> list[GalleryRead]:
    statement = photo_statement().where(GalleryImage.is_active.is_(True))
    if category is not None:
        statement = statement.where(GalleryImage.category == PHOTO_CATEGORIES[category])
    return [photo_read(image) for image in db.scalars(
        statement.order_by(GalleryImage.sort_order, GalleryImage.id)
    )]


@admin_router.get("/project-photos", response_model=list[GalleryRead])
def read_admin_project_photos(
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> list[GalleryRead]:
    return [photo_read(image) for image in db.scalars(
        photo_statement().order_by(GalleryImage.sort_order, GalleryImage.id)
    )]


@admin_router.post("/project-photos", response_model=GalleryRead, status_code=201)
def create_project_photo(
    data: ProjectPhotoCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
) -> GalleryRead:
    # Serialize creates on one existing row in MySQL. This protects URL-based
    # retry deduplication and ordering across workers/admins without a migration.
    db.scalar(select(Admin).order_by(Admin.id).limit(1).with_for_update())
    # Locking reads see the latest committed rows under MySQL REPEATABLE READ,
    # even when authentication already opened a snapshot before the lock wait.
    existing = db.scalar(photo_statement().where(
        GalleryImage.image_url == data.image_url
    ).order_by(GalleryImage.id).limit(1).with_for_update())
    if existing is not None:
        return photo_read(existing)
    last = db.scalar(photo_statement().order_by(
        GalleryImage.sort_order.desc(), GalleryImage.id.desc()
    ).limit(1).with_for_update())
    next_order = (last.sort_order if last is not None else 0) + 1
    image = GalleryImage(image_url=data.image_url, category=PHOTO_CATEGORIES[data.category],
                         sort_order=next_order, is_active=True)
    db.add(image)
    db.commit()
    db.refresh(image)
    record_audit(db, admin_id=current_admin.id, action="create",
                 entity_type="project_photo", entity_id=image.id)
    return photo_read(image)


@admin_router.put("/project-photos/{image_id}", response_model=GalleryRead)
def update_project_photo(
    image_id: int,
    data: ProjectPhotoUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
) -> GalleryRead:
    image = db.scalar(photo_statement().where(GalleryImage.id == image_id))
    if image is None:
        raise HTTPException(status_code=404, detail="Not found")
    patch = data.model_dump(exclude_unset=True)
    if "category" in patch:
        patch["category"] = PHOTO_CATEGORIES[patch["category"]]
    for field, value in patch.items():
        setattr(image, field, value)
    db.commit()
    db.refresh(image)
    record_audit(db, admin_id=current_admin.id, action="update",
                 entity_type="project_photo", entity_id=image.id)
    return photo_read(image)


@public_router.get("", response_model=list[GalleryRead])
def read_gallery(
    category: str | None = None,
    db: Session = Depends(get_db),
) -> list[GalleryImage]:
    statement = legacy_gallery_statement().where(GalleryImage.is_active.is_(True))
    if category is not None:
        statement = statement.where(GalleryImage.category == category)
    return list(db.scalars(statement.order_by(GalleryImage.sort_order, GalleryImage.id)))


@admin_router.get("", response_model=list[GalleryRead])
def read_admin_gallery(
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> list[GalleryImage]:
    return list(db.scalars(
        legacy_gallery_statement().order_by(GalleryImage.sort_order, GalleryImage.id)
    ))


@admin_router.get("/{image_id}", response_model=GalleryRead)
def read_admin_gallery_image(
    image_id: int,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> GalleryImage:
    return legacy_gallery_or_404(db, image_id)


@admin_router.post("", response_model=GalleryRead, status_code=status.HTTP_201_CREATED)
def create_gallery_image(
    data: GalleryCreate,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> GalleryImage:
    reject_reserved_legacy_category(data.category)
    return create_entity(db, GalleryImage, data)


@admin_router.put("/{image_id}", response_model=GalleryRead)
def update_gallery_image(
    image_id: int,
    data: GalleryUpdate,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> GalleryImage:
    image = legacy_gallery_or_404(db, image_id)
    reject_reserved_legacy_category(data.category)
    return update_entity(db, image, data)


@admin_router.delete("/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_gallery_image(
    image_id: int,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> Response:
    soft_delete_entity(db, legacy_gallery_or_404(db, image_id))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
