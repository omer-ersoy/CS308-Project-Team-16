from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_user
from app.db.models import Product, ProductReview
from app.db.session import get_db
from app.schemas.review import ProductReviewCreate, ProductReviewRead, ProductReviewUpdate
from app.schemas.user import UserRead


router = APIRouter()


def require_product(db: Session, product_id: int) -> Product:
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


def get_product_review(db: Session, product_id: int, review_id: int) -> ProductReview:
    review = db.scalar(
        select(ProductReview)
        .options(selectinload(ProductReview.user))
        .where(ProductReview.product_id == product_id, ProductReview.id == review_id)
    )
    if review is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    return review


@router.get("/{product_id}/reviews", response_model=list[ProductReviewRead])
def list_product_reviews(product_id: int, db: Session = Depends(get_db)) -> list[ProductReview]:
    require_product(db, product_id)
    return db.scalars(
        select(ProductReview)
        .options(selectinload(ProductReview.user))
        .where(ProductReview.product_id == product_id)
        .order_by(ProductReview.created_at.desc(), ProductReview.id.desc())
    ).all()


@router.post("/{product_id}/reviews", response_model=ProductReviewRead, status_code=status.HTTP_201_CREATED)
def create_product_review(
    product_id: int,
    payload: ProductReviewCreate,
    current_user: UserRead = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProductReview:
    require_product(db, product_id)
    review = ProductReview(
        product_id=product_id,
        user_id=current_user.id,
        rating=payload.rating,
        comment=payload.comment,
    )
    db.add(review)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already reviewed this product",
        )

    db.refresh(review)
    return get_product_review(db, product_id, review.id)


@router.patch("/{product_id}/reviews/{review_id}", response_model=ProductReviewRead)
def update_product_review(
    product_id: int,
    review_id: int,
    payload: ProductReviewUpdate,
    current_user: UserRead = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProductReview:
    review = get_product_review(db, product_id, review_id)
    if review.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Review can only be edited by its author")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(review, field, value)

    db.commit()
    return get_product_review(db, product_id, review_id)


@router.delete("/{product_id}/reviews/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product_review(
    product_id: int,
    review_id: int,
    current_user: UserRead = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    review = get_product_review(db, product_id, review_id)
    if review.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Review can only be deleted by its author")

    db.delete(review)
    db.commit()
