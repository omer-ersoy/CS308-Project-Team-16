from datetime import UTC, date, datetime, time, timedelta
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_sales_manager_user
from app.db.models import Order, OrderItem
from app.db.session import get_db
from app.schemas.analytics import ProfitLossSummaryRead, RevenueSummaryRead
from app.schemas.user import UserRead


router = APIRouter()


def start_of_day(value: date) -> datetime:
    return datetime.combine(value, time.min, tzinfo=UTC)


def start_of_next_day(value: date) -> datetime:
    return start_of_day(value) + timedelta(days=1)


def validate_date_range(start_date: date | None, end_date: date | None) -> None:
    if start_date is not None and end_date is not None and start_date > end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="start_date must be before or equal to end_date",
        )


def apply_date_filters(query, start_date: date | None, end_date: date | None):
    if start_date is not None:
        query = query.where(Order.created_at >= start_of_day(start_date))
    if end_date is not None:
        query = query.where(Order.created_at < start_of_next_day(end_date))
    return query


@router.get("/revenue", response_model=RevenueSummaryRead)
def get_revenue_summary(
    start_date: date | None = None,
    end_date: date | None = None,
    _: UserRead = Depends(get_sales_manager_user),
    db: Session = Depends(get_db),
) -> RevenueSummaryRead:
    validate_date_range(start_date, end_date)

    query = select(
        func.count(Order.id),
        func.coalesce(func.sum(Order.total_amount), 0),
    )
    query = apply_date_filters(query, start_date, end_date)
    order_count, total_revenue = db.execute(query).one()
    total_revenue = Decimal(total_revenue)
    average_order_value = (
        total_revenue / order_count if order_count else Decimal("0.00")
    )

    return RevenueSummaryRead(
        start_date=start_date,
        end_date=end_date,
        order_count=order_count,
        total_revenue=total_revenue,
        average_order_value=average_order_value,
    )


def get_orders_with_items(
    db: Session,
    start_date: date | None,
    end_date: date | None,
) -> list[Order]:
    query = select(Order).options(selectinload(Order.items))
    query = apply_date_filters(query, start_date, end_date)
    return db.scalars(query.order_by(Order.created_at.asc(), Order.id.asc())).all()


def summarize_line_items(items: list[OrderItem]) -> tuple[Decimal, Decimal, Decimal, Decimal]:
    total_revenue = Decimal("0.00")
    total_cost = Decimal("0.00")
    total_profit = Decimal("0.00")
    total_loss = Decimal("0.00")

    for item in items:
        line_revenue = item.unit_price * item.quantity
        line_cost = item.unit_cost * item.quantity
        line_margin = line_revenue - line_cost
        total_revenue += line_revenue
        total_cost += line_cost
        if line_margin >= 0:
            total_profit += line_margin
        else:
            total_loss += abs(line_margin)

    return total_revenue, total_cost, total_profit, total_loss


@router.get("/profit-loss", response_model=ProfitLossSummaryRead)
def get_profit_loss_summary(
    start_date: date | None = None,
    end_date: date | None = None,
    _: UserRead = Depends(get_sales_manager_user),
    db: Session = Depends(get_db),
) -> ProfitLossSummaryRead:
    validate_date_range(start_date, end_date)

    orders = get_orders_with_items(db, start_date, end_date)
    total_revenue = Decimal("0.00")
    total_cost = Decimal("0.00")
    total_profit = Decimal("0.00")
    total_loss = Decimal("0.00")

    for order in orders:
        revenue, cost, profit, loss = summarize_line_items(order.items)
        total_revenue += revenue
        total_cost += cost
        total_profit += profit
        total_loss += loss

    return ProfitLossSummaryRead(
        start_date=start_date,
        end_date=end_date,
        total_revenue=total_revenue,
        total_cost=total_cost,
        total_profit=total_profit,
        total_loss=total_loss,
        net_profit=total_revenue - total_cost,
    )
