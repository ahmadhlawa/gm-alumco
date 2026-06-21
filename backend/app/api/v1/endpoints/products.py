from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.api.dependencies import require_admin
from app.db.database import get_db
from app.models.admin import Admin
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductRead, ProductUpdate
from app.services.crud import (
    create_entity,
    get_entity_or_404,
    list_entities,
    soft_delete_entity,
    update_entity,
)


public_router = APIRouter()
admin_router = APIRouter()


@public_router.get("", response_model=list[ProductRead])
def read_products(db: Session = Depends(get_db)) -> list[Product]:
    return list_entities(db, Product, active_only=True)


@public_router.get("/{product_id}", response_model=ProductRead)
def read_product(product_id: int, db: Session = Depends(get_db)) -> Product:
    return get_entity_or_404(db, Product, product_id, active_only=True)


@admin_router.get("", response_model=list[ProductRead])
def read_admin_products(
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> list[Product]:
    return list_entities(db, Product)


@admin_router.get("/{product_id}", response_model=ProductRead)
def read_admin_product(
    product_id: int,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> Product:
    return get_entity_or_404(db, Product, product_id)


@admin_router.post("", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
def create_product(
    data: ProductCreate,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> Product:
    return create_entity(db, Product, data)


@admin_router.put("/{product_id}", response_model=ProductRead)
def update_product(
    product_id: int,
    data: ProductUpdate,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> Product:
    return update_entity(db, get_entity_or_404(db, Product, product_id), data)


@admin_router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> Response:
    soft_delete_entity(db, get_entity_or_404(db, Product, product_id))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
