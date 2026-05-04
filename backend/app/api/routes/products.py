from sqlalchemy import select
from sqlalchemy.orm import Session

from fastapi import APIRouter, Depends

from app.db.models import Product
from app.db.session import get_db
from app.schemas.product import ProductRead


router = APIRouter()


@router.get("", response_model=list[ProductRead])
def list_products(db: Session = Depends(get_db)) -> list[Product]:
    return db.scalars(select(Product).order_by(Product.id)).all()
