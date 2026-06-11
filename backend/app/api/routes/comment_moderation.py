from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_product_manager_user
from app.db.models import ProductReview
from app.db.session import get_db
from app.schemas.review import ProductReviewAdminUpdate, ProductReviewRead
from app.schemas.user import UserRead


router = APIRouter()


@router.get("", response_model=list[ProductReviewRead])
def list_pending_comments(
    status_filter: str = "pending",
    _: UserRead = Depends(get_product_manager_user),
    db: Session = Depends(get_db),
) -> list[ProductReview]:
    """
    List comments for moderation.
    Filters by status: 'pending', 'approved', 'rejected', or 'all'.
    """
    query = select(ProductReview).options(selectinload(ProductReview.user))

    if status_filter != "all":
        query = query.where(ProductReview.status == status_filter)

    return db.scalars(
        query.order_by(ProductReview.created_at.desc(), ProductReview.id.desc())
    ).all()


@router.patch("/{review_id}", response_model=ProductReviewRead)
def moderate_comment(
    review_id: int,
    payload: ProductReviewAdminUpdate,
    _: UserRead = Depends(get_product_manager_user),
    db: Session = Depends(get_db),
) -> ProductReview:
    """
    Update comment status (approve, reject, or revert to pending).
    """
    review = db.scalar(
        select(ProductReview)
        .options(selectinload(ProductReview.user))
        .where(ProductReview.id == review_id)
    )

    if review is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found",
        )

    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(review, field, value)

    db.commit()
    db.refresh(review)

    return review
