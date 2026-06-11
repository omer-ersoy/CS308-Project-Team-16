from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import case, select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_product_manager_user
from app.db.models import ProductReview
from app.db.session import get_db
from app.schemas.review import ProductReviewRead, ProductReviewAdminUpdate
from app.schemas.user import UserRead

router = APIRouter()


def get_review(db: Session, review_id: int) -> ProductReview:
    review = db.scalar(
        select(ProductReview)
        .options(selectinload(ProductReview.user))
        .where(ProductReview.id == review_id)
    )
    if review is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    return review


@router.get("/reviews", response_model=list[ProductReviewRead])
def list_reviews(
    db: Session = Depends(get_db),
    _: UserRead = Depends(get_product_manager_user),
) -> list[ProductReview]:
    return db.scalars(
        select(ProductReview)
        .options(selectinload(ProductReview.user))
        .order_by(
            case((ProductReview.status == "pending", 0), else_=1),
            ProductReview.created_at.desc(),
            ProductReview.id.desc(),
        )
    ).all()


@router.get("/reviews/pending", response_model=list[ProductReviewRead])
def list_pending_reviews(
    db: Session = Depends(get_db),
    _: UserRead = Depends(get_product_manager_user),
) -> list[ProductReview]:
    return db.scalars(
        select(ProductReview)
        .options(selectinload(ProductReview.user))
        .where(ProductReview.status == "pending")
        .order_by(ProductReview.created_at.desc(), ProductReview.id.desc())
    ).all()


@router.patch("/reviews/{review_id}", response_model=ProductReviewRead)
def update_review_status(
    review_id: int,
    payload: ProductReviewAdminUpdate,
    db: Session = Depends(get_db),
    _: UserRead = Depends(get_product_manager_user),
) -> ProductReview:
    review = get_review(db, review_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(review, field, value)

    db.commit()
    return get_review(db, review_id)
