from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_admin_user
from app.db.models import Category, Product, User
from app.db.session import get_db
from app.schemas.category import CategoryCreate, CategoryRead, CategoryUpdate
from app.schemas.product import ProductCreate, ProductRead, ProductUpdate
from app.schemas.user import UserRead, UserUpdate


router = APIRouter()


def require_category(db: Session, category_id: int) -> Category:
    category = db.get(Category, category_id)
    if category is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category not found")
    return category


@router.get("/products", response_model=list[ProductRead])
def list_admin_products(_: UserRead = Depends(get_admin_user), db: Session = Depends(get_db)) -> list[Product]:
    return db.scalars(select(Product).order_by(Product.id)).all()


@router.post("/products", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
def create_product(
    payload: ProductCreate,
    _: UserRead = Depends(get_admin_user),
    db: Session = Depends(get_db),
) -> Product:
    require_category(db, payload.category_id)
    product = Product(**payload.model_dump())
    db.add(product)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Product serial number must be unique")
    db.refresh(product)
    return product


@router.patch("/products/{product_id}", response_model=ProductRead)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    _: UserRead = Depends(get_admin_user),
    db: Session = Depends(get_db),
) -> Product:
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    updates = payload.model_dump(exclude_unset=True)
    if "category_id" in updates:
        require_category(db, updates["category_id"])

    for field, value in updates.items():
        setattr(product, field, value)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Product serial number must be unique")
    db.refresh(product)
    return product


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    _: UserRead = Depends(get_admin_user),
    db: Session = Depends(get_db),
) -> None:
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    db.delete(product)
    db.commit()


@router.get("/categories", response_model=list[CategoryRead])
def list_admin_categories(_: UserRead = Depends(get_admin_user), db: Session = Depends(get_db)) -> list[Category]:
    return db.scalars(select(Category).order_by(Category.id)).all()


@router.post("/categories", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
def create_category(
    payload: CategoryCreate,
    _: UserRead = Depends(get_admin_user),
    db: Session = Depends(get_db),
) -> Category:
    category = Category(**payload.model_dump())
    db.add(category)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Category name must be unique")
    db.refresh(category)
    return category


@router.patch("/categories/{category_id}", response_model=CategoryRead)
def update_category(
    category_id: int,
    payload: CategoryUpdate,
    _: UserRead = Depends(get_admin_user),
    db: Session = Depends(get_db),
) -> Category:
    category = db.get(Category, category_id)
    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(category, field, value)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Category name must be unique")
    db.refresh(category)
    return category


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    _: UserRead = Depends(get_admin_user),
    db: Session = Depends(get_db),
) -> None:
    category = db.get(Category, category_id)
    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    has_products = db.scalar(select(func.count(Product.id)).where(Product.category_id == category_id)) or 0
    if has_products > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Category cannot be deleted while products still reference it",
        )

    db.delete(category)
    db.commit()


@router.get("/users", response_model=list[UserRead])
def list_admin_users(_: UserRead = Depends(get_admin_user), db: Session = Depends(get_db)) -> list[User]:
    return db.scalars(select(User).order_by(User.id)).all()


@router.patch("/users/{user_id}", response_model=UserRead)
def update_user(
    user_id: int,
    payload: UserUpdate,
    current_admin: UserRead = Depends(get_admin_user),
    db: Session = Depends(get_db),
) -> User:
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    updates = payload.model_dump(exclude_unset=True)
    if "role" in updates and updates["role"] != "admin" and user.role == "admin":
        admin_count = db.scalar(select(func.count(User.id)).where(User.role == "admin")) or 0
        if admin_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="At least one admin account must remain",
            )
        if current_admin.id == user.id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Current admin account cannot remove its own admin access",
            )

    if "email" in updates:
        updates["email"] = str(updates["email"]).lower()

    for field, value in updates.items():
        setattr(user, field, value)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email is already registered")
    db.refresh(user)
    return user
