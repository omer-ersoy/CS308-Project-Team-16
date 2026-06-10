from decimal import Decimal

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from conftest import auth_headers
from app.db.models import Category, Product


def test_product_list_can_filter_by_category(
    client: TestClient,
    db_session: Session,
    sample_data: dict[str, object],
) -> None:
    base_product = sample_data["product"]
    second_category = Category(name="Gift Sets", description="Giftable products")
    db_session.add(second_category)
    db_session.flush()

    second_product = Product(
        name="Discovery Set",
        model="5 x 10 ml",
        serial_number="DISC-001",
        description="Discovery fragrance set",
        quantity_in_stock=4,
        price=Decimal("89.00"),
        warranty_status="Valid",
        distributor_info="Demo Distributor",
        category_id=second_category.id,
    )
    db_session.add(second_product)
    db_session.commit()

    response = client.get(f"/api/products?category_id={base_product.category_id}")

    assert response.status_code == 200
    products = response.json()
    assert [product["id"] for product in products] == [base_product.id]


def test_sales_manager_can_apply_discount_to_selected_products(
    client: TestClient,
    db_session: Session,
    sample_data: dict[str, object],
) -> None:
    admin = sample_data["admin"]
    base_product = sample_data["product"]
    second_product = Product(
        name="Discovery Set",
        model="5 x 10 ml",
        serial_number="DISC-002",
        description="Discovery fragrance set",
        quantity_in_stock=4,
        price=Decimal("89.00"),
        warranty_status="Valid",
        distributor_info="Demo Distributor",
        category_id=base_product.category_id,
    )
    db_session.add(second_product)
    db_session.commit()

    response = client.patch(
        "/api/products/discounts",
        json={
            "product_ids": [base_product.id, second_product.id],
            "discount_rate": 15,
        },
        headers=auth_headers(admin),
    )

    assert response.status_code == 200
    data = response.json()
    updated_products = data["updated_products"]
    assert [item["product"]["id"] for item in updated_products] == [
        base_product.id,
        second_product.id,
    ]
    assert updated_products[0]["original_price"] == "129.99"
    assert updated_products[0]["discounted_price"] == "110.49"
    assert updated_products[0]["product"]["price"] == "110.49"
    assert updated_products[1]["original_price"] == "89.00"
    assert updated_products[1]["discounted_price"] == "75.65"
    assert updated_products[1]["product"]["price"] == "75.65"

    db_session.refresh(base_product)
    db_session.refresh(second_product)
    assert base_product.price == Decimal("110.49")
    assert second_product.price == Decimal("75.65")


def test_customer_cannot_apply_product_discounts(
    client: TestClient,
    sample_data: dict[str, object],
) -> None:
    customer = sample_data["customer"]
    product = sample_data["product"]

    response = client.patch(
        "/api/products/discounts",
        json={
            "product_ids": [product.id],
            "discount_rate": 10,
        },
        headers=auth_headers(customer),
    )

    assert response.status_code == 403


def test_discount_returns_404_for_missing_products(
    client: TestClient,
    sample_data: dict[str, object],
) -> None:
    admin = sample_data["admin"]

    response = client.patch(
        "/api/products/discounts",
        json={
            "product_ids": [999],
            "discount_rate": 10,
        },
        headers=auth_headers(admin),
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Products not found: 999"
