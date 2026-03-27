from fastapi import APIRouter, HTTPException, status

from app.core.security import create_access_token, hash_password, verify_password
from app.data.store import add_user, find_user_auth_by_email, find_user_by_email
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.user import UserCreate, UserRead


router = APIRouter()


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate) -> UserRead:
    existing_user = find_user_by_email(payload.email)
    if existing_user is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email is already registered")

    return add_user(
        full_name=payload.full_name,
        email=str(payload.email),
        role=payload.role,
        hashed_password=hash_password(payload.password),
    )


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest) -> TokenResponse:
    auth_user = find_user_auth_by_email(payload.email)
    if auth_user is None or not verify_password(payload.password, auth_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    access_token = create_access_token(auth_user.email)
    return TokenResponse(access_token=access_token)
