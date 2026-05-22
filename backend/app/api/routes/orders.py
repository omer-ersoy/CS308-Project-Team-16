from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.db.models import Order
from app.db.session import get_db
from app.schemas.order import OrderRead
from app.schemas.user import UserRead


router = APIRouter()


@router.get("/mine", response_model=list[OrderRead])
def list_my_orders(
    current_user: UserRead = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Order]:
    return db.scalars(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.user_id == current_user.id)
        .order_by(Order.id.desc())
    ).all()
