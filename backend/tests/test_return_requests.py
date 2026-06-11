from decimal import Decimal
from datetime import UTC, datetime, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.exc import IntegrityError

from app.core.security import hash_password
from app.db.models import Order, OrderItem, ReturnRequest, User
from tests.conftest import auth_headers


def create_sales_manager(db_session) -> User:
    sales_manager = User(
        full_name="Sales Manager",
        email="sales@example.com",
        role="sales_manager",
        hashed_password=hash_password("password123"),
    )
    db_session.add(sales_manager)
    db_session.commit()
    return sales_manager


def create_pending_return_request(db_session, sample_data: dict[str, object]) -> ReturnRequest:
    customer = sample_data["customer"]
    product = sample_data["product"]
    order = db_session.query(Order).filter_by(user_id=customer.id, status="delivered").one()
    order_item = db_session.query(OrderItem).filter_by(order_id=order.id).one()
    return_request = ReturnRequest(
        order_id=order.id,
        order_item_id=order_item.id,
        customer_id=customer.id,
        product_id=product.id,
        quantity=order_item.quantity,
        reason="Damaged package.",
        refund_amount=order_item.unit_price * order_item.quantity,
    )
    db_session.add(return_request)
    db_session.commit()
    db_session.refresh(return_request)
    return return_request


def test_return_request_model_links_to_purchased_order_item(
    db_session,
    sample_data: dict[str, object],
) -> None:
    customer = sample_data["customer"]
    product = sample_data["product"]
    order = db_session.query(Order).filter_by(user_id=customer.id, status="delivered").one()
    order_item = db_session.query(OrderItem).filter_by(order_id=order.id).one()
    refund_amount = order_item.unit_price * order_item.quantity

    return_request = ReturnRequest(
        order_id=order.id,
        order_item_id=order_item.id,
        customer_id=customer.id,
        product_id=product.id,
        quantity=order_item.quantity,
        reason="Package was damaged.",
        refund_amount=refund_amount,
    )
    db_session.add(return_request)
    db_session.commit()
    db_session.refresh(return_request)

    assert return_request.status == "pending"
    assert return_request.order.id == order.id
    assert return_request.order_item.id == order_item.id
    assert return_request.customer.id == customer.id
    assert return_request.product.id == product.id
    assert return_request.refund_amount == Decimal("129.99")


def test_return_request_model_rejects_duplicate_order_item_request(
    db_session,
    sample_data: dict[str, object],
) -> None:
    customer = sample_data["customer"]
    product = sample_data["product"]
    order = db_session.query(Order).filter_by(user_id=customer.id, status="delivered").one()
    order_item = db_session.query(OrderItem).filter_by(order_id=order.id).one()

    db_session.add(
        ReturnRequest(
            order_id=order.id,
            order_item_id=order_item.id,
            customer_id=customer.id,
            product_id=product.id,
            quantity=1,
            refund_amount=order_item.unit_price,
        )
    )
    db_session.commit()

    db_session.add(
        ReturnRequest(
            order_id=order.id,
            order_item_id=order_item.id,
            customer_id=customer.id,
            product_id=product.id,
            quantity=1,
            refund_amount=order_item.unit_price,
        )
    )

    with pytest.raises(IntegrityError):
        db_session.commit()


def test_customer_can_create_return_request_for_eligible_product(
    client: TestClient,
    db_session,
    sample_data: dict[str, object],
) -> None:
    customer = sample_data["customer"]
    order = db_session.query(Order).filter_by(user_id=customer.id, status="delivered").one()
    order_item = db_session.query(OrderItem).filter_by(order_id=order.id).one()
    order_item.unit_price = Decimal("99.50")
    db_session.commit()

    response = client.post(
        "/api/returns",
        headers=auth_headers(customer),
        json={
            "order_item_id": order_item.id,
            "quantity": 1,
            "reason": "Wrong size.",
        },
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["status"] == "pending"
    assert payload["refund_amount"] == "99.50"
    assert payload["order_item_id"] == order_item.id


def test_return_request_refund_uses_original_purchase_price(
    client: TestClient,
    db_session,
    sample_data: dict[str, object],
) -> None:
    customer = sample_data["customer"]
    product = sample_data["product"]
    order = db_session.query(Order).filter_by(user_id=customer.id, status="delivered").one()
    order_item = db_session.query(OrderItem).filter_by(order_id=order.id).one()
    order_item.unit_price = Decimal("79.99")
    product.price = Decimal("129.99")
    db_session.commit()

    response = client.post(
        "/api/returns",
        headers=auth_headers(customer),
        json={"order_item_id": order_item.id, "quantity": 1},
    )

    assert response.status_code == 201
    assert response.json()["refund_amount"] == "79.99"


def test_return_request_rejects_expired_return_window(
    client: TestClient,
    db_session,
    sample_data: dict[str, object],
) -> None:
    customer = sample_data["customer"]
    order = db_session.query(Order).filter_by(user_id=customer.id, status="delivered").one()
    order.created_at = datetime.now(UTC) - timedelta(days=31)
    order_item = db_session.query(OrderItem).filter_by(order_id=order.id).one()
    db_session.commit()

    response = client.post(
        "/api/returns",
        headers=auth_headers(customer),
        json={"order_item_id": order_item.id, "quantity": 1},
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "Return window has expired."


def test_return_request_rejects_duplicate_request(
    client: TestClient,
    db_session,
    sample_data: dict[str, object],
) -> None:
    customer = sample_data["customer"]
    order = db_session.query(Order).filter_by(user_id=customer.id, status="delivered").one()
    order_item = db_session.query(OrderItem).filter_by(order_id=order.id).one()

    first_response = client.post(
        "/api/returns",
        headers=auth_headers(customer),
        json={"order_item_id": order_item.id, "quantity": 1},
    )
    second_response = client.post(
        "/api/returns",
        headers=auth_headers(customer),
        json={"order_item_id": order_item.id, "quantity": 1},
    )

    assert first_response.status_code == 201
    assert second_response.status_code == 409
    assert second_response.json()["detail"] == "A return request already exists for this product."


def test_sales_manager_can_list_pending_return_requests(
    client: TestClient,
    db_session,
    sample_data: dict[str, object],
) -> None:
    sales_manager = create_sales_manager(db_session)
    return_request = create_pending_return_request(db_session, sample_data)

    response = client.get("/api/returns", headers=auth_headers(sales_manager))

    assert response.status_code == 200
    payload = response.json()
    assert len(payload) == 1
    assert payload[0]["id"] == return_request.id
    assert payload[0]["status"] == "pending"
    assert payload[0]["product_name"] == "Bleu de Chanel"
    assert payload[0]["customer_email"] == "customer@example.com"


def test_customer_cannot_list_return_requests_for_evaluation(
    client: TestClient,
    sample_data: dict[str, object],
) -> None:
    customer = sample_data["customer"]

    response = client.get("/api/returns", headers=auth_headers(customer))

    assert response.status_code == 403


def test_sales_manager_can_approve_return_request(
    client: TestClient,
    db_session,
    sample_data: dict[str, object],
) -> None:
    sales_manager = create_sales_manager(db_session)
    return_request = create_pending_return_request(db_session, sample_data)
    product = sample_data["product"]
    product.quantity_in_stock = 3
    db_session.commit()

    response = client.post(
        f"/api/returns/{return_request.id}/approve",
        headers=auth_headers(sales_manager),
        json={"decision_note": "Approved after review."},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "approved"
    assert payload["decision_note"] == "Approved after review."
    assert payload["evaluated_by_id"] == sales_manager.id
    assert payload["evaluated_at"] is not None
    db_session.refresh(return_request.order)
    assert return_request.order.status == "refunded"
    db_session.refresh(product)
    assert product.quantity_in_stock == 4


def test_sales_manager_can_reject_return_request(
    client: TestClient,
    db_session,
    sample_data: dict[str, object],
) -> None:
    sales_manager = create_sales_manager(db_session)
    return_request = create_pending_return_request(db_session, sample_data)

    response = client.post(
        f"/api/returns/{return_request.id}/reject",
        headers=auth_headers(sales_manager),
        json={"decision_note": "Outside policy."},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "rejected"
    assert payload["decision_note"] == "Outside policy."


def test_approved_return_request_cannot_be_evaluated_again(
    client: TestClient,
    db_session,
    sample_data: dict[str, object],
) -> None:
    sales_manager = create_sales_manager(db_session)
    return_request = create_pending_return_request(db_session, sample_data)
    return_request.status = "approved"
    db_session.commit()

    response = client.post(
        f"/api/returns/{return_request.id}/reject",
        headers=auth_headers(sales_manager),
        json={},
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "Only pending return requests can be evaluated."
