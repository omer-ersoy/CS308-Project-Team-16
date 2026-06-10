from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_sales_manager_user
from app.db.models import Product
from app.db.session import get_db
from app.schemas.product import ProductPriceUpdate, ProductRead
from app.schemas.user import UserRead


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


@router.patch("/{product_id}/price", response_model=ProductRead)
def update_product_price(
    product_id: int,
    payload: ProductPriceUpdate,
    _: UserRead = Depends(get_sales_manager_user),
    db: Session = Depends(get_db),
) -> Product:
    product = db.scalar(
        select(Product)
        .options(selectinload(Product.reviews))
        .where(Product.id == product_id)
    )

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    product.price = payload.price
    db.commit()
    db.refresh(product)

    return product