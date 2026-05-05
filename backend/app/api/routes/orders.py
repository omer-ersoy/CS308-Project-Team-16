from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_delivery_user
from app.db.models import Order
from app.db.session import get_db
from app.schemas.order import OrderRead, OrderItemRead, OrderStatusUpdate
from app.schemas.user import UserRead


router = APIRouter()

ORDER_STATUSES = ["processing", "in-transit", "delivered"]


def serialize_order(order: Order) -> OrderRead:
    items = sorted(order.items, key=lambda i: i.id)
    item_reads = [
        OrderItemRead(
            id=item.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=item.unit_price,
        )
        for item in items
    ]
    total_amount = sum(
        (item.unit_price * item.quantity for item in items),
        start=Decimal("0.00"),
    )
    item_count = sum(item.quantity for item in items)
    return OrderRead(
        id=order.id,
        order_ref=order.order_ref,
        status=order.status,
        created_at=order.created_at.isoformat(),
        items=item_reads,
        total_amount=total_amount,
        item_count=item_count,
    )


@router.get("/", response_model=list[OrderRead])
def list_orders(
    _: UserRead = Depends(get_delivery_user),
    db: Session = Depends(get_db),
) -> list[OrderRead]:
    orders = db.scalars(
        select(Order)
        .options(selectinload(Order.items))
        .order_by(Order.created_at.desc())
    ).all()
    return [serialize_order(order) for order in orders]


@router.get("/{order_ref}", response_model=OrderRead)
def get_order(order_ref: str, db: Session = Depends(get_db)) -> OrderRead:
    order = db.scalar(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.order_ref == order_ref)
    )
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return serialize_order(order)


@router.patch("/{order_ref}", response_model=OrderRead)
def update_order_status(
    order_ref: str,
    payload: OrderStatusUpdate,
    _: UserRead = Depends(get_delivery_user),
    db: Session = Depends(get_db),
) -> OrderRead:
    order = db.scalar(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.order_ref == order_ref)
    )
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if payload.status not in ORDER_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(ORDER_STATUSES)}",
        )
    order.status = payload.status
    db.commit()
    db.refresh(order)
    return serialize_order(order)
