from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_admin_user
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
    entry = db.scalar(select(DeliveryListEntry).where(DeliveryListEntry.id == delivery_id))
    if entry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Delivery entry not found")
    return entry


@router.get("/{delivery_id}", response_model=DeliveryListEntryRead)
def get_delivery_entry_endpoint(
    delivery_id: int, _: UserRead = Depends(get_admin_user), db: Session = Depends(get_db)
) -> DeliveryListEntry:
    return get_delivery_entry(db, delivery_id)


@router.get("/order/{order_id}", response_model=list[DeliveryListEntryRead])
def list_delivery_entries_by_order(
    order_id: int, _: UserRead = Depends(get_admin_user), db: Session = Depends(get_db)
) -> list[DeliveryListEntry]:
    order = db.get(Order, order_id)
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    return db.scalars(
        select(DeliveryListEntry).where(DeliveryListEntry.order_id == order_id).order_by(DeliveryListEntry.id)
    ).all()


@router.patch("/{delivery_id}/completion", response_model=DeliveryListEntryRead)
def update_delivery_completion(
    delivery_id: int, payload: DeliveryCompletionUpdate, _: UserRead = Depends(get_admin_user), db: Session = Depends(get_db)
) -> DeliveryListEntry:
    """Update delivery completion status and sync with order status.

    When all delivery entries for an order are marked as completed,
    the order status is automatically updated to 'delivered'. If any
    delivery entry is not completed and the order is currently 'delivered',
    the order will be moved back to 'in-transit'.
    """
    entry = get_delivery_entry(db, delivery_id)
    entry.completion_status = payload.completion_status
    db.commit()
    db.refresh(entry)

    # Sync order status
    order = db.get(Order, entry.order_id)
    if order is not None:
        all_entries = db.scalars(select(DeliveryListEntry).where(DeliveryListEntry.order_id == order.id)).all()
        if all_entries and all(e.completion_status for e in all_entries):
            order.status = "delivered"
            db.commit()
        else:
            # If not all completed and order is marked delivered, revert to in-transit
            if order.status == "delivered":
                order.status = "in-transit"
                db.commit()

    return entry


@router.patch("/{delivery_id}", response_model=DeliveryListEntryRead)
def update_delivery_entry(
    delivery_id: int, payload: DeliveryListEntryUpdate, _: UserRead = Depends(get_admin_user), db: Session = Depends(get_db)
) -> DeliveryListEntry:
    """Update delivery entry details (address and/or completion status)."""
    entry = get_delivery_entry(db, delivery_id)

    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(entry, field, value)

    db.commit()
    db.refresh(entry)

    # If completion_status was changed, sync order status as above
    if "completion_status" in updates:
        order = db.get(Order, entry.order_id)
        if order is not None:
            all_entries = db.scalars(select(DeliveryListEntry).where(DeliveryListEntry.order_id == order.id)).all()
            if all_entries and all(e.completion_status for e in all_entries):
                order.status = "delivered"
                db.commit()
            else:
                if order.status == "delivered":
                    order.status = "in-transit"
                    db.commit()

    return entry
