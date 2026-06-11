from decimal import Decimal

from fastapi.testclient import TestClient

from app.db.models import Order, OrderItem
from tests.conftest import auth_headers


def test_customer_can_cancel_processing_order_and_restore_stock(
    client: TestClient,
    db_session,
    sample_data: dict[str, object],
) -> None:
    customer = sample_data["customer"]
    product = sample_data["product"]
    product.quantity_in_stock = 4
    order = Order(user_id=customer.id, status="processing", total_amount=Decimal("259.98"))
    db_session.add(order)
    db_session.flush()
    db_session.add(
        OrderItem(
            order_id=order.id,
            product_id=product.id,
            product_name=product.name,
            quantity=2,
            unit_price=Decimal("129.99"),
            unit_cost=product.cost_price,
        )
    )
    db_session.commit()

    response = client.post(f"/api/orders/{order.id}/cancel", headers=auth_headers(customer))

    assert response.status_code == 200
    assert response.json()["status"] == "cancelled"
    db_session.refresh(product)
    db_session.refresh(order)
    assert product.quantity_in_stock == 6
    assert order.status == "cancelled"


def test_customer_cannot_cancel_another_customers_order(
    client: TestClient,
    db_session,
    sample_data: dict[str, object],
) -> None:
    customer = sample_data["customer"]
    other_customer = sample_data["other_customer"]
    other_customer_order = db_session.query(Order).filter_by(user_id=other_customer.id).one()

    response = client.post(f"/api/orders/{other_customer_order.id}/cancel", headers=auth_headers(customer))

    assert response.status_code == 404


def test_customer_cannot_cancel_delivered_order(
    client: TestClient,
    db_session,
    sample_data: dict[str, object],
) -> None:
    customer = sample_data["customer"]
    delivered_order = db_session.query(Order).filter_by(user_id=customer.id, status="delivered").one()

    cancel_response = client.post(f"/api/orders/{delivered_order.id}/cancel", headers=auth_headers(customer))

    assert cancel_response.status_code == 409
    assert cancel_response.json()["detail"] == "Only processing orders can be cancelled."
