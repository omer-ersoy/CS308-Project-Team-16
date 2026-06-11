from datetime import UTC, datetime, timedelta
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_user
from app.db.models import Order, OrderItem, ReturnRequest
from app.db.session import get_db
from app.schemas.return_request import ReturnRequestCreate, ReturnRequestRead
from app.schemas.user import UserRead


router = APIRouter()
RETURN_WINDOW_DAYS = 30


def as_aware_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)


@router.post("", response_model=ReturnRequestRead, status_code=status.HTTP_201_CREATED)
def create_return_request(
    payload: ReturnRequestCreate,
    current_user: UserRead = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ReturnRequest:
    order_item = db.scalar(
        select(OrderItem)
        .options(selectinload(OrderItem.order), selectinload(OrderItem.return_requests))
        .where(OrderItem.id == payload.order_item_id)
    )
    if order_item is None or order_item.order.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Purchased product not found")
    if order_item.order.status != "delivered":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Only delivered products can be returned.",
        )
    if as_aware_utc(order_item.order.created_at) + timedelta(days=RETURN_WINDOW_DAYS) < datetime.now(UTC):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Return window has expired.",
        )
    if payload.quantity > order_item.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Return quantity cannot exceed purchased quantity.",
        )
    if order_item.return_requests:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A return request already exists for this product.",
        )

    return_request = ReturnRequest(
        order_id=order_item.order_id,
        order_item_id=order_item.id,
        customer_id=current_user.id,
        product_id=order_item.product_id,
        quantity=payload.quantity,
        reason=payload.reason,
        refund_amount=order_item.unit_price * Decimal(payload.quantity),
    )
    db.add(return_request)
    db.commit()
    db.refresh(return_request)
    return return_request
