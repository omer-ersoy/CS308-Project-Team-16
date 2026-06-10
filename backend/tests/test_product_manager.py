from decimal import Decimal

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from conftest import auth_headers
from app.core.security import hash_password
from app.db.models import User


def create_product_manager(db_session: Session) -> User:
    manager = User(
        full_name="Product Manager",
        email="product.manager@example.com",
        role="product_manager",
        hashed_password=hash_password("password123"),
    )
    db_session.add(manager)
    db_session.commit()
    return manager


def product_payload(category_id: int, serial_number: str = "PM-001") -> dict[str, object]:
    return {
        "name": "Manager Product",
        "model": "Model PM",
        "serial_number": serial_number,
        "description": "Created by product manager",
        "quantity_in_stock": 7,
        "price": "79.90",
        "warranty_status": "Valid",
        "distributor_info": "Manager Distributor",
        "category_id": category_id,
    }


def test_product_manager_can_manage_products(
    client: TestClient,
    db_session: Session,
    sample_data: dict[str, object],
) -> None:
    manager = create_product_manager(db_session)
    category = sample_data["category"]
    headers = auth_headers(manager)

    create_response = client.post(
        "/api/product-manager/products",
        json=product_payload(category.id),
        headers=headers,
    )
    assert create_response.status_code == 201
    created = create_response.json()
    assert created["name"] == "Manager Product"
    assert created["quantity_in_stock"] == 7

    update_response = client.patch(
        f"/api/product-manager/products/{created['id']}",
        json={"name": "Updated Manager Product", "price": "84.50"},
        headers=headers,
    )
    assert update_response.status_code == 200
    assert update_response.json()["name"] == "Updated Manager Product"
    assert Decimal(update_response.json()["price"]) == Decimal("84.50")

    list_response = client.get("/api/product-manager/products", headers=headers)
    assert list_response.status_code == 200
    assert created["id"] in [product["id"] for product in list_response.json()]

    delete_response = client.delete(
        f"/api/product-manager/products/{created['id']}",
        headers=headers,
    )
    assert delete_response.status_code == 204


def test_customer_cannot_manage_products(
    client: TestClient,
    sample_data: dict[str, object],
) -> None:
    customer = sample_data["customer"]
    category = sample_data["category"]

    response = client.post(
        "/api/product-manager/products",
        json=product_payload(category.id),
        headers=auth_headers(customer),
    )

    assert response.status_code == 403


def test_product_manager_product_update_rejects_stock_changes(
    client: TestClient,
    db_session: Session,
    sample_data: dict[str, object],
) -> None:
    manager = create_product_manager(db_session)
    product = sample_data["product"]

    response = client.patch(
        f"/api/product-manager/products/{product.id}",
        json={"quantity_in_stock": 99},
        headers=auth_headers(manager),
    )

    assert response.status_code == 422
