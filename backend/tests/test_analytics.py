from datetime import UTC, datetime
from decimal import Decimal

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from conftest import auth_headers
from app.core.security import hash_password
from app.db.models import Order, OrderItem, User


def create_sales_manager(db_session: Session) -> User:
    sales_manager = User(
        full_name="Sales Manager",
        email="sales.manager.analytics@example.com",
        role="sales_manager",
        hashed_password=hash_password("password123"),
    )
    db_session.add(sales_manager)
    db_session.commit()
    return sales_manager


def create_order(
    db_session: Session,
    *,
    user_id: int,
    created_at: datetime,
    total_amount: Decimal = Decimal("100.00"),
) -> Order:
    order = Order(
        user_id=user_id,
        status="processing",
        total_amount=total_amount,
        created_at=created_at,
    )
    db_session.add(order)
    db_session.commit()
    return order


def test_revenue_summary_aggregates_orders_in_date_range(
    client: TestClient,
    db_session: Session,
    sample_data: dict[str, object],
) -> None:
    customer = sample_data["customer"]
    sales_manager = create_sales_manager(db_session)

    create_order(
        db_session,
        user_id=customer.id,
        created_at=datetime(2026, 4, 15, 12, 0, tzinfo=UTC),
        total_amount=Decimal("100.00"),
    )
    create_order(
        db_session,
        user_id=customer.id,
        created_at=datetime(2026, 4, 20, 9, 30, tzinfo=UTC),
        total_amount=Decimal("150.00"),
    )
    create_order(
        db_session,
        user_id=customer.id,
        created_at=datetime(2026, 4, 22, 23, 59, tzinfo=UTC),
        total_amount=Decimal("50.00"),
    )
    create_order(
        db_session,
        user_id=customer.id,
        created_at=datetime(2026, 4, 23, 0, 0, tzinfo=UTC),
        total_amount=Decimal("200.00"),
    )

    response = client.get(
        "/api/orders/analytics/revenue?start_date=2026-04-20&end_date=2026-04-22",
        headers=auth_headers(sales_manager),
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["order_count"] == 2
    assert Decimal(payload["total_revenue"]) == Decimal("200.00")
    assert Decimal(payload["average_order_value"]) == Decimal("100.00")
    assert payload["start_date"] == "2026-04-20"
    assert payload["end_date"] == "2026-04-22"


def test_revenue_summary_returns_zeros_when_no_orders_match(
    client: TestClient,
    db_session: Session,
    sample_data: dict[str, object],
) -> None:
    sales_manager = create_sales_manager(db_session)

    response = client.get(
        "/api/orders/analytics/revenue?start_date=2026-01-01&end_date=2026-01-31",
        headers=auth_headers(sales_manager),
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["order_count"] == 0
    assert Decimal(payload["total_revenue"]) == Decimal("0.00")
    assert Decimal(payload["average_order_value"]) == Decimal("0.00")


def test_revenue_summary_rejects_invalid_date_range(
    client: TestClient,
    db_session: Session,
) -> None:
    sales_manager = create_sales_manager(db_session)

    response = client.get(
        "/api/orders/analytics/revenue?start_date=2026-04-23&end_date=2026-04-20",
        headers=auth_headers(sales_manager),
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "start_date must be before or equal to end_date"


def test_customer_cannot_access_revenue_summary(
    client: TestClient,
    sample_data: dict[str, object],
) -> None:
    customer = sample_data["customer"]

    response = client.get(
        "/api/orders/analytics/revenue?start_date=2026-04-20&end_date=2026-04-22",
        headers=auth_headers(customer),
    )

    assert response.status_code == 403


def create_order_with_items(
    db_session: Session,
    *,
    user_id: int,
    created_at: datetime,
    unit_price: Decimal,
    unit_cost: Decimal,
    quantity: int = 1,
) -> Order:
    order = Order(
        user_id=user_id,
        status="processing",
        total_amount=unit_price * quantity,
        created_at=created_at,
    )
    db_session.add(order)
    db_session.flush()
    db_session.add(
        OrderItem(
            order_id=order.id,
            product_id=None,
            product_name="Analytics Product",
            quantity=quantity,
            unit_price=unit_price,
            unit_cost=unit_cost,
        )
    )
    db_session.commit()
    return order


def test_profit_loss_summary_calculates_margin_and_loss(
    client: TestClient,
    db_session: Session,
    sample_data: dict[str, object],
) -> None:
    customer = sample_data["customer"]
    sales_manager = create_sales_manager(db_session)

    create_order_with_items(
        db_session,
        user_id=customer.id,
        created_at=datetime(2026, 5, 1, 10, 0, tzinfo=UTC),
        unit_price=Decimal("100.00"),
        unit_cost=Decimal("60.00"),
    )
    create_order_with_items(
        db_session,
        user_id=customer.id,
        created_at=datetime(2026, 5, 2, 10, 0, tzinfo=UTC),
        unit_price=Decimal("40.00"),
        unit_cost=Decimal("50.00"),
    )

    response = client.get(
        "/api/orders/analytics/profit-loss?start_date=2026-05-01&end_date=2026-05-02",
        headers=auth_headers(sales_manager),
    )

    assert response.status_code == 200
    payload = response.json()
    assert Decimal(payload["total_revenue"]) == Decimal("140.00")
    assert Decimal(payload["total_cost"]) == Decimal("110.00")
    assert Decimal(payload["total_profit"]) == Decimal("40.00")
    assert Decimal(payload["total_loss"]) == Decimal("10.00")
    assert Decimal(payload["net_profit"]) == Decimal("30.00")


def test_profit_loss_summary_rejects_invalid_date_range(
    client: TestClient,
    db_session: Session,
) -> None:
    sales_manager = create_sales_manager(db_session)

    response = client.get(
        "/api/orders/analytics/profit-loss?start_date=2026-05-03&end_date=2026-05-01",
        headers=auth_headers(sales_manager),
    )

    assert response.status_code == 400


def test_customer_cannot_access_profit_loss_summary(
    client: TestClient,
    sample_data: dict[str, object],
) -> None:
    customer = sample_data["customer"]

    response = client.get(
        "/api/orders/analytics/profit-loss?start_date=2026-05-01&end_date=2026-05-02",
        headers=auth_headers(customer),
    )

    assert response.status_code == 403


def test_timeseries_returns_daily_points(
    client: TestClient,
    db_session: Session,
    sample_data: dict[str, object],
) -> None:
    customer = sample_data["customer"]
    sales_manager = create_sales_manager(db_session)

    create_order_with_items(
        db_session,
        user_id=customer.id,
        created_at=datetime(2026, 6, 1, 10, 0, tzinfo=UTC),
        unit_price=Decimal("100.00"),
        unit_cost=Decimal("60.00"),
    )
    create_order_with_items(
        db_session,
        user_id=customer.id,
        created_at=datetime(2026, 6, 2, 10, 0, tzinfo=UTC),
        unit_price=Decimal("80.00"),
        unit_cost=Decimal("50.00"),
    )

    response = client.get(
        "/api/orders/analytics/timeseries?start_date=2026-06-01&end_date=2026-06-02",
        headers=auth_headers(sales_manager),
    )

    assert response.status_code == 200
    points = response.json()["points"]
    assert len(points) == 2
    assert points[0]["period"] == "2026-06-01"
    assert Decimal(points[0]["revenue"]) == Decimal("100.00")
    assert Decimal(points[1]["profit"]) == Decimal("30.00")


def test_timeseries_rejects_unsupported_granularity(
    client: TestClient,
    db_session: Session,
) -> None:
    sales_manager = create_sales_manager(db_session)

    response = client.get(
        "/api/orders/analytics/timeseries?granularity=month",
        headers=auth_headers(sales_manager),
    )

    assert response.status_code == 400
