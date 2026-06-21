from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.product import Product


def product_payload(**overrides) -> dict:
    payload = {
        "title_ar": "منتج",
        "title_en": "Product",
        "title_he": "מוצר",
        "description_ar": None,
        "description_en": "Description",
        "description_he": None,
        "image_url": "https://drive.google.com/product.jpg",
        "sort_order": 1,
        "is_active": True,
    }
    payload.update(overrides)
    return payload


def test_public_products_only_return_active_sorted(client: TestClient, db: Session) -> None:
    db.add_all(
        [
            Product(**product_payload(title_en="Second", sort_order=2)),
            Product(**product_payload(title_en="First", sort_order=1)),
            Product(**product_payload(title_en="Hidden", sort_order=0, is_active=False)),
        ]
    )
    db.commit()
    response = client.get("/api/v1/products")
    assert response.status_code == 200
    assert [item["title_en"] for item in response.json()] == ["First", "Second"]


def test_admin_can_crud_product_and_read_inactive(client: TestClient, auth_headers) -> None:
    headers = auth_headers()
    created = client.post(
        "/api/v1/admin/products",
        headers=headers,
        json=product_payload(is_active=False),
    )
    assert created.status_code == 201
    product_id = created.json()["id"]
    assert client.get("/api/v1/admin/products", headers=headers).status_code == 200
    assert client.get(f"/api/v1/admin/products/{product_id}", headers=headers).status_code == 200
    updated = client.put(
        f"/api/v1/admin/products/{product_id}",
        headers=headers,
        json={"title_en": "Updated"},
    )
    assert updated.json()["title_en"] == "Updated"
    assert client.delete(f"/api/v1/admin/products/{product_id}", headers=headers).status_code == 204
    assert client.get(f"/api/v1/products/{product_id}").status_code == 404


def test_product_validates_url_and_auth(client: TestClient, auth_headers) -> None:
    response = client.post(
        "/api/v1/admin/products",
        headers=auth_headers(),
        json=product_payload(image_url="not-a-url"),
    )
    assert response.status_code == 422
    assert client.get("/api/v1/admin/products").status_code == 401
