from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.api.dependencies import require_admin
from app.db.database import get_db
from app.models.admin import Admin
from app.models.testimonial import Testimonial
from app.schemas.testimonial import (
    TestimonialCreate,
    TestimonialRead,
    TestimonialUpdate,
)
from app.services.crud import (
    create_entity,
    delete_entity,
    get_entity_or_404,
    list_entities,
    update_entity,
)


public_router = APIRouter()
admin_router = APIRouter()


@public_router.get("", response_model=list[TestimonialRead])
def read_testimonials(db: Session = Depends(get_db)) -> list[Testimonial]:
    return list_entities(db, Testimonial, active_only=True)


@admin_router.get("", response_model=list[TestimonialRead])
def read_admin_testimonials(
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> list[Testimonial]:
    return list_entities(db, Testimonial)


@admin_router.get("/{testimonial_id}", response_model=TestimonialRead)
def read_admin_testimonial(
    testimonial_id: int,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> Testimonial:
    return get_entity_or_404(db, Testimonial, testimonial_id)


@admin_router.post(
    "",
    response_model=TestimonialRead,
    status_code=status.HTTP_201_CREATED,
)
def create_testimonial(
    data: TestimonialCreate,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> Testimonial:
    return create_entity(db, Testimonial, data)


@admin_router.put("/{testimonial_id}", response_model=TestimonialRead)
def update_testimonial(
    testimonial_id: int,
    data: TestimonialUpdate,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> Testimonial:
    return update_entity(db, get_entity_or_404(db, Testimonial, testimonial_id), data)


@admin_router.delete("/{testimonial_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_testimonial(
    testimonial_id: int,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> Response:
    delete_entity(db, get_entity_or_404(db, Testimonial, testimonial_id))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
