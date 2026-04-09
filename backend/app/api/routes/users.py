from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.data.store import USERS
from app.schemas.user import UserRead


router = APIRouter()


@router.get("", response_model=list[UserRead])
def list_users() -> list[UserRead]:
    return USERS


@router.post("", response_model=UserRead, status_code=201)
def create_user(payload: UserCreate) -> UserRead:
    user = UserRead(id=len(USERS) + 1, full_name=payload.full_name, email=payload.email, role=payload.role)
    USERS.append(user)
    return user
