from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_product_manager_user, get_db
from app.db.models import ProductReview
from app.schemas.review import ProductReviewRead, ProductReviewAdminUpdate

router = APIRouter()


@router.get("/reviews/pending", response_model=list[ProductReviewRead])
def list_pending_reviews(
    db: Session = Depends(get_db),
    _: None = Depends(get_product_manager_user),
) -> list[ProductReview]:
    reviews = db.scalars(select(ProductReview).where(ProductReview.status == "pending")).all()
    return reviews


@router.patch("/reviews/{review_id}", response_model=ProductReviewRead)
def update_review_status(
    review_id: int,
    payload: ProductReviewAdminUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(get_product_manager_user),
) -> ProductReview:
    review = db.scalar(select(ProductReview).where(ProductReview.id == review_id))
    if review is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")

    if payload.status is not None:
        if payload.status not in ("pending", "approved", "rejected"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid status")
        review.status = payload.status

    if payload.rating is not None:
        review.rating = payload.rating
    if payload.comment is not None:
        review.comment = payload.comment

    db.commit()
    db.refresh(review)
    return review
