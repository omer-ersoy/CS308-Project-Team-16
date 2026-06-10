from collections.abc import Callable

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.models import User
from app.db.session import get_db
from app.schemas.user import UserRead


def get_current_user(token: str = Depends(decode_access_token), db: Session = Depends(get_db)) -> UserRead:
    user = db.get(User, int(token))
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )
    return UserRead.model_validate(user)


def require_roles(*allowed_roles: str) -> Callable[[UserRead], UserRead]:
    def dependency(current_user: UserRead = Depends(get_current_user)) -> UserRead:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource",
            )
        return current_user

    return dependency


def get_admin_user(current_user: UserRead = Depends(require_roles("admin"))) -> UserRead:
    return current_user


def get_sales_manager_user(
    current_user: UserRead = Depends(require_roles("sales_manager", "admin")),
) -> UserRead:
    return current_user


def get_product_manager_user(
    current_user: UserRead = Depends(require_roles("product_manager", "admin")),
) -> UserRead:
    return current_user


def get_staff_user(
    current_user: UserRead = Depends(require_roles("sales_manager", "product_manager", "admin")),
) -> UserRead:
    return current_user