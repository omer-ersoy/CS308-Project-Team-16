from decimal import Decimal

from pydantic import EmailStr

from app.core.security import hash_password
from app.schemas.cart import CartRead
from app.schemas.category import CategoryRead
from app.schemas.product import ProductRead
from app.schemas.user import UserRead


class UserAuthRecord(UserRead):
    hashed_password: str


USERS: list[UserRead] = [
    UserRead(id=1, full_name="Demo Customer", email="customer@example.com", role="customer"),
]

USER_AUTH_RECORDS: list[UserAuthRecord] = [
    UserAuthRecord(
        id=1,
        full_name="Demo Customer",
        email="customer@example.com",
        role="customer",
        hashed_password=hash_password("password123"),
    ),
]

CATEGORIES: list[CategoryRead] = [
    CategoryRead(id=1, name="Audio", description="Headphones, speakers, and accessories"),
    CategoryRead(id=2, name="Displays", description="Monitors and related hardware"),
]

PRODUCTS: list[ProductRead] = [
    ProductRead(
        id=1,
        name="Noise-Cancelling Headphones",
        model="NC-500",
        serial_number="SN-1001",
        description="Wireless headphones with active noise cancellation.",
        quantity_in_stock=12,
        price=Decimal("199.00"),
        warranty_status="2 years",
        distributor_info="Tech Distribution A.S.",
        category_id=1,
    ),
    ProductRead(
        id=2,
        name="4K Monitor",
        model="DisplayPro 27",
        serial_number="SN-1002",
        description="27-inch UHD monitor for work and entertainment.",
        quantity_in_stock=6,
        price=Decimal("349.00"),
        warranty_status="3 years",
        distributor_info="Vision Supply Ltd.",
        category_id=2,
    ),
]

CARTS: dict[int, CartRead] = {}


def find_user_by_email(email: str | EmailStr) -> UserRead | None:
    target_email = str(email).lower()
    return next((user for user in USERS if user.email.lower() == target_email), None)


def find_user_auth_by_email(email: str | EmailStr) -> UserAuthRecord | None:
    target_email = str(email).lower()
    return next((user for user in USER_AUTH_RECORDS if user.email.lower() == target_email), None)


def add_user(full_name: str, email: str, role: str, hashed_password: str) -> UserRead:
    user = UserRead(id=len(USERS) + 1, full_name=full_name, email=email, role=role)
    auth_record = UserAuthRecord(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        role=user.role,
        hashed_password=hashed_password,
    )
    USERS.append(user)
    USER_AUTH_RECORDS.append(auth_record)
    return user
