from decimal import Decimal

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

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
