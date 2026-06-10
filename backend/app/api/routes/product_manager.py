from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_product_manager_user
from app.db.models import Category, Product
from app.db.session import get_db
from app.schemas.category import CategoryCreate, CategoryRead
from app.schemas.product import ProductCreate, ProductManagerProductUpdate, ProductRead
from app.schemas.user import UserRead


router = APIRouter()


def require_category(db: Session, category_id: int) -> None:
    if db.get(Category, category_id) is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category not found",
        )


def require_product(db: Session, product_id: int) -> Product:
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
    return product


def commit_product(db: Session, product: Product) -> Product:
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Product serial number must be unique",
        )
    db.refresh(product)
    return product


@router.get("/categories", response_model=list[CategoryRead])
def list_categories(
    _: UserRead = Depends(get_product_manager_user),
    db: Session = Depends(get_db),
) -> list[Category]:
    return db.scalars(select(Category).order_by(Category.id)).all()


@router.post(
    "/categories",
    response_model=CategoryRead,
    status_code=status.HTTP_201_CREATED,
)
def create_category(
    payload: CategoryCreate,
    _: UserRead = Depends(get_product_manager_user),
    db: Session = Depends(get_db),
) -> Category:
    category = Category(**payload.model_dump())
    db.add(category)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Category name must be unique",
        )
    db.refresh(category)
    return category


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    _: UserRead = Depends(get_product_manager_user),
    db: Session = Depends(get_db),
) -> None:
    category = db.get(Category, category_id)
    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    product_count = db.scalar(
        select(func.count(Product.id)).where(Product.category_id == category_id)
    )
    if product_count:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Category cannot be deleted while products still reference it",
        )

    db.delete(category)
    db.commit()


@router.get("/products", response_model=list[ProductRead])
def list_products(
    _: UserRead = Depends(get_product_manager_user),
    db: Session = Depends(get_db),
) -> list[Product]:
    return db.scalars(
        select(Product)
        .options(selectinload(Product.reviews))
        .order_by(Product.id)
    ).all()


@router.post(
    "/products",
    response_model=ProductRead,
    status_code=status.HTTP_201_CREATED,
)
def create_product(
    payload: ProductCreate,
    _: UserRead = Depends(get_product_manager_user),
    db: Session = Depends(get_db),
) -> Product:
    require_category(db, payload.category_id)
    product = Product(**payload.model_dump())
    db.add(product)
    return commit_product(db, product)


@router.patch("/products/{product_id}", response_model=ProductRead)
def update_product(
    product_id: int,
    payload: ProductManagerProductUpdate,
    _: UserRead = Depends(get_product_manager_user),
    db: Session = Depends(get_db),
) -> Product:
    product = require_product(db, product_id)
    updates = payload.model_dump(exclude_unset=True)
    if "category_id" in updates:
        require_category(db, updates["category_id"])

    for field, value in updates.items():
        setattr(product, field, value)

    return commit_product(db, product)


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    _: UserRead = Depends(get_product_manager_user),
    db: Session = Depends(get_db),
) -> None:
    product = require_product(db, product_id)
    db.delete(product)
    db.commit()
