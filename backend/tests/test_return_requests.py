from decimal import Decimal

import pytest
from sqlalchemy.exc import IntegrityError

from app.db.models import Order, OrderItem, ReturnRequest


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
