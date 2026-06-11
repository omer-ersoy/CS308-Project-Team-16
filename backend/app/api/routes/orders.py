from datetime import UTC, date, datetime, time, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_user, get_sales_manager_user
from app.db.models import Order, OrderItem, Product
from app.db.session import get_db
from app.schemas.order import OrderRead
from app.schemas.user import UserRead


router = APIRouter()


def start_of_day(value: date) -> datetime:
    return datetime.combine(value, time.min, tzinfo=UTC)


def start_of_next_day(value: date) -> datetime:
    return start_of_day(value) + timedelta(days=1)


@router.get("/mine", response_model=list[OrderRead])
def list_my_orders(
    current_user: UserRead = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Order]:
    return db.scalars(
        select(Order)
        .options(selectinload(Order.items).selectinload(OrderItem.return_requests))
        .where(Order.user_id == current_user.id)
        .order_by(Order.id.desc())
    ).all()


@router.post("/{order_id}/cancel", response_model=OrderRead)
def cancel_my_order(
    order_id: int,
    current_user: UserRead = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Order:
    order = db.scalar(
        select(Order)
        .options(selectinload(Order.items).selectinload(OrderItem.return_requests))
        .where(Order.id == order_id, Order.user_id == current_user.id)
    )
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    # Allow cancellation only for initial statuses (business rule SCRUM-183)
    allowed_statuses = {"pending", "processing"}
    if order.status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Only orders with status in {', '.join(sorted(allowed_statuses))} can be cancelled.",
        )

    # Restore stock for each order item with an associated product
    for item in order.items:
        if item.product_id is None:
            continue
        product = db.get(Product, item.product_id)
        if product is not None:
            product.quantity_in_stock += item.quantity

    order.status = "cancelled"
    db.commit()

    return db.scalar(
        select(Order)
        .options(selectinload(Order.items).selectinload(OrderItem.return_requests))
        .where(Order.id == order_id)
    )


@router.get("/invoices", response_model=list[OrderRead])
def list_sales_manager_invoices(
    start_date: date | None = None,
    end_date: date | None = None,
    _: UserRead = Depends(get_sales_manager_user),
    db: Session = Depends(get_db),
) -> list[Order]:
    if start_date is not None and end_date is not None and start_date > end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="start_date must be before or equal to end_date",
        )

    query = select(Order).options(selectinload(Order.items).selectinload(OrderItem.return_requests))
    if start_date is not None:
        query = query.where(Order.created_at >= start_of_day(start_date))
    if end_date is not None:
        query = query.where(Order.created_at < start_of_next_day(end_date))

    return db.scalars(query.order_by(Order.created_at.desc(), Order.id.desc())).all()
