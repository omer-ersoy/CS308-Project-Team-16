from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from fastapi import APIRouter, Depends

from app.db.models import Product
from app.db.session import get_db
from app.schemas.product import ProductRead


router = APIRouter()


@router.get("", response_model=list[ProductRead])
def list_products(
    category_id: int | None = None,
    db: Session = Depends(get_db),
) -> list[Product]:
    query = select(Product).options(selectinload(Product.reviews))
    if category_id is not None:
        query = query.where(Product.category_id == category_id)
    return db.scalars(query.order_by(Product.id)).all()
