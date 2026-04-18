from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.db.base import Base
from app.db.models import Cart, Category, Product, User
from app.db.session import engine


def init_database() -> None:
    Base.metadata.create_all(bind=engine)


def seed_database(db: Session) -> None:
    if db.scalar(select(User.id).limit(1)) is not None:
        return

    customer = User(
        full_name="Demo Customer",
        email="customer@example.com",
        role="customer",
        hashed_password=hash_password("password123"),
    )
    admin = User(
        full_name="Admin User",
        email=settings.seed_admin_email,
        role="admin",
        hashed_password=hash_password(settings.seed_admin_password),
    )
    db.add_all([customer, admin])
    db.flush()

    categories = [
        Category(id=1, name="Woody", description="Deep woods, amber, and aromatic blends"),
        Category(id=2, name="Fresh", description="Citrus, marine, and everyday fragrances"),
        Category(id=3, name="Warm", description="Spiced, smoky, and evening scents"),
        Category(id=4, name="Gift Sets", description="Ready-to-gift fragrance selections"),
    ]
    db.add_all(categories)
    db.flush()

    products = [
        Product(
            id=1,
            name="Bleu de Chanel",
            model="100 ml / 3.38 fl. oz.",
            serial_number="FRAG-BDC-100",
            description=(
                "Bleu de Chanel is a woody, spicy fragrance for everyday wear and evening occasions."
            ),
            quantity_in_stock=8,
            price=Decimal("210.00"),
            warranty_status="Authenticity guaranteed",
            distributor_info="Fragrance shop demo catalog",
            category_id=1,
        ),
        Product(
            id=2,
            name="Dior Sauvage",
            model="100 ml / 3.38 fl. oz.",
            serial_number="FRAG-DSG-100",
            description="Dior Sauvage is a fresh, spicy fragrance built around bergamot and amberwood.",
            quantity_in_stock=10,
            price=Decimal("165.00"),
            warranty_status="Authenticity guaranteed",
            distributor_info="Fragrance shop demo catalog",
            category_id=2,
        ),
        Product(
            id=3,
            name="Tom Ford Noir Extreme",
            model="50 ml / 1.7 fl. oz.",
            serial_number="FRAG-TFNE-050",
            description="Tom Ford Noir Extreme is a warm, spicy scent with amber and vanilla notes.",
            quantity_in_stock=5,
            price=Decimal("195.00"),
            warranty_status="Authenticity guaranteed",
            distributor_info="Fragrance shop demo catalog",
            category_id=3,
        ),
        Product(
            id=4,
            name="Discovery Gift Set",
            model="5 x 10 ml / 0.34 fl. oz.",
            serial_number="FRAG-GIFT-SET",
            description="A curated discovery set for trying multiple signature scents before choosing a bottle.",
            quantity_in_stock=14,
            price=Decimal("89.00"),
            warranty_status="Authenticity guaranteed",
            distributor_info="Fragrance shop demo catalog",
            category_id=4,
        ),
    ]
    db.add_all(products)
    db.add(Cart(id=1, user_id=None))
    db.commit()
