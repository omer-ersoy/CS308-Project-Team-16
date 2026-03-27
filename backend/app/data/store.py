from decimal import Decimal

from app.schemas.cart import CartRead
from app.schemas.category import CategoryRead
from app.schemas.product import ProductRead
from app.schemas.user import UserRead


USERS: list[UserRead] = [
    UserRead(id=1, full_name="Demo Customer", email="customer@example.com", role="customer"),
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
