from datetime import UTC, datetime, timedelta
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_user, get_sales_manager_user
from app.db.models import OrderItem, ReturnRequest
from app.db.session import get_db
from app.schemas.return_request import ReturnRequestCreate, ReturnRequestDecision, ReturnRequestRead
from app.schemas.user import UserRead


router = APIRouter()
RETURN_WINDOW_DAYS = 30


def as_aware_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)


def return_request_options():
    return (
        selectinload(ReturnRequest.order),
        selectinload(ReturnRequest.order_item),
        selectinload(ReturnRequest.customer),
    )


def get_return_request_for_evaluation(db: Session, request_id: int) -> ReturnRequest:
    return_request = db.scalar(
        select(ReturnRequest)
        .options(*return_request_options())
        .where(ReturnRequest.id == request_id)
    )
    if return_request is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Return request not found")
    if return_request.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Only pending return requests can be evaluated.",
        )
    return return_request


@router.get("", response_model=list[ReturnRequestRead])
def list_return_requests(
    status_filter: str | None = "pending",
    _: UserRead = Depends(get_sales_manager_user),
    db: Session = Depends(get_db),
) -> list[ReturnRequest]:
    if status_filter is not None and status_filter not in ("pending", "approved", "rejected"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="status_filter must be one of: pending, approved, rejected",
        )

    query = select(ReturnRequest).options(*return_request_options())
    if status_filter is not None:
        query = query.where(ReturnRequest.status == status_filter)
    return db.scalars(query.order_by(ReturnRequest.created_at.desc(), ReturnRequest.id.desc())).all()


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


@router.post("/{request_id}/approve", response_model=ReturnRequestRead)
def approve_return_request(
    request_id: int,
    payload: ReturnRequestDecision | None = None,
    current_user: UserRead = Depends(get_sales_manager_user),
    db: Session = Depends(get_db),
) -> ReturnRequest:
    return_request = get_return_request_for_evaluation(db, request_id)
    return_request.status = "approved"
    return_request.decision_note = payload.decision_note if payload else None
    return_request.evaluated_by_id = current_user.id
    return_request.evaluated_at = datetime.now(UTC)
    db.commit()

    return db.scalar(
        select(ReturnRequest)
        .options(*return_request_options())
        .where(ReturnRequest.id == request_id)
    )


@router.post("/{request_id}/reject", response_model=ReturnRequestRead)
def reject_return_request(
    request_id: int,
    payload: ReturnRequestDecision | None = None,
    current_user: UserRead = Depends(get_sales_manager_user),
    db: Session = Depends(get_db),
) -> ReturnRequest:
    return_request = get_return_request_for_evaluation(db, request_id)
    return_request.status = "rejected"
    return_request.decision_note = payload.decision_note if payload else None
    return_request.evaluated_by_id = current_user.id
    return_request.evaluated_at = datetime.now(UTC)
    db.commit()

    return db.scalar(
        select(ReturnRequest)
        .options(*return_request_options())
        .where(ReturnRequest.id == request_id)
    )
