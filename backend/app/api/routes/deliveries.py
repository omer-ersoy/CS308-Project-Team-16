from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_product_manager_user
from app.db.session import get_db
from app.db.models import DeliveryListEntry, Order
from app.schemas.delivery import (
    DeliveryCompletionUpdate,
    DeliveryListEntryRead,
    DeliveryListEntryUpdate,
)
from app.schemas.user import UserRead


router = APIRouter()


def get_delivery_entry(db: Session, delivery_id: int) -> DeliveryListEntry:
    entry = db.scalar(
        select(DeliveryListEntry)
        .options(selectinload(DeliveryListEntry.order), selectinload(DeliveryListEntry.product))
        .where(DeliveryListEntry.id == delivery_id)
    )
    if entry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Delivery entry not found")
    return entry


def sync_order_status_from_completion(db: Session, order: Order) -> None:
    all_entries = db.scalars(select(DeliveryListEntry).where(DeliveryListEntry.order_id == order.id)).all()
    if all_entries and all(e.completion_status for e in all_entries):
        order.status = "delivered"
    elif order.status == "delivered":
        order.status = "in-transit"


@router.get("/{delivery_id}", response_model=DeliveryListEntryRead)
def get_delivery_entry_endpoint(
    delivery_id: int, _: UserRead = Depends(get_product_manager_user), db: Session = Depends(get_db)
) -> DeliveryListEntry:
    return get_delivery_entry(db, delivery_id)


@router.get("", response_model=list[DeliveryListEntryRead])
def list_delivery_entries(
    _: UserRead = Depends(get_product_manager_user),
    db: Session = Depends(get_db),
) -> list[DeliveryListEntry]:
    return db.scalars(
        select(DeliveryListEntry)
        .options(selectinload(DeliveryListEntry.order), selectinload(DeliveryListEntry.product))
        .order_by(DeliveryListEntry.id.desc())
    ).all()


@router.get("/order/{order_id}", response_model=list[DeliveryListEntryRead])
def list_delivery_entries_by_order(
    order_id: int, _: UserRead = Depends(get_product_manager_user), db: Session = Depends(get_db)
) -> list[DeliveryListEntry]:
    order = db.get(Order, order_id)
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    return db.scalars(
        select(DeliveryListEntry)
        .options(selectinload(DeliveryListEntry.order), selectinload(DeliveryListEntry.product))
        .where(DeliveryListEntry.order_id == order_id)
        .order_by(DeliveryListEntry.id)
    ).all()


@router.patch("/{delivery_id}/completion", response_model=DeliveryListEntryRead)
def update_delivery_completion(
    delivery_id: int, payload: DeliveryCompletionUpdate, _: UserRead = Depends(get_product_manager_user), db: Session = Depends(get_db)
) -> DeliveryListEntry:
    """Update delivery completion status and sync with order status.

    When all delivery entries for an order are marked as completed,
    the order status is automatically updated to 'delivered'. If any
    delivery entry is not completed and the order is currently 'delivered',
    the order will be moved back to 'in-transit'.
    """
    entry = get_delivery_entry(db, delivery_id)
    entry.completion_status = payload.completion_status
    order = db.get(Order, entry.order_id)
    if order is not None:
        sync_order_status_from_completion(db, order)

    db.commit()
    return get_delivery_entry(db, delivery_id)


@router.patch("/{delivery_id}", response_model=DeliveryListEntryRead)
def update_delivery_entry(
    delivery_id: int, payload: DeliveryListEntryUpdate, _: UserRead = Depends(get_product_manager_user), db: Session = Depends(get_db)
) -> DeliveryListEntry:
    """Update delivery entry details and sync the customer-visible order status."""
    entry = get_delivery_entry(db, delivery_id)

    updates = payload.model_dump(exclude_unset=True)
    order_status = updates.pop("order_status", None)
    order_created_at = updates.pop("order_created_at", None)
    for field, value in updates.items():
        setattr(entry, field, value)

    order = db.get(Order, entry.order_id)
    if order is not None:
        if order_created_at is not None:
            order.created_at = order_created_at
        if order_status is not None:
            order.status = order_status
            entry.completion_status = order_status == "delivered"
        elif "completion_status" in updates:
            sync_order_status_from_completion(db, order)

    db.commit()
    return get_delivery_entry(db, delivery_id)
