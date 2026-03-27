from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.data.store import USERS
from app.schemas.user import UserRead


router = APIRouter()


@router.get("", response_model=list[UserRead])
def list_users() -> list[UserRead]:
    return USERS


@router.get("/me", response_model=UserRead)
def read_current_user(current_user: UserRead = Depends(get_current_user)) -> UserRead:
    return current_user
