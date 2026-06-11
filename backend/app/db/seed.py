from decimal import Decimal

from sqlalchemy import inspect, select, text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.db.base import Base
from app.db.models import Cart, Category, DeliveryListEntry, Product, User
from app.db.session import engine


def init_database() -> None:
    Base.metadata.create_all(bind=engine)
    with engine.begin() as connection:
        user_columns = {column["name"] for column in inspect(connection).get_columns("users")}
        if "tax_id" not in user_columns:
            connection.execute(text("ALTER TABLE users ADD COLUMN tax_id VARCHAR(64)"))
        if "address" not in user_columns:
            connection.execute(text("ALTER TABLE users ADD COLUMN address TEXT"))
        if connection.dialect.name == "postgresql":
            connection.execute(text("ALTER TABLE orders DROP CONSTRAINT IF EXISTS ck_orders_status"))
            connection.execute(
                text(
                    """
                    ALTER TABLE orders
                    ADD CONSTRAINT ck_orders_status
                    CHECK (status IN ('processing', 'in-transit', 'delivered', 'cancelled', 'refunded'))
                    """
                )
            )


def ensure_user(
    db: Session,
    *,
    full_name: str,
    email: str,
    role: str,
    password: str,
    tax_id: str | None = None,
    address: str | None = None,
) -> User:
    user = db.scalar(select(User).where(User.email == email.lower()))
    if user is not None:
        changed = False
        if tax_id and not user.tax_id:
            user.tax_id = tax_id
            changed = True
        if address and not user.address:
            user.address = address
            changed = True
        if changed:
            db.flush()
        return user

    user = User(
        full_name=full_name,
        email=email.lower(),
        tax_id=tax_id,
        address=address,
        role=role,
        hashed_password=hash_password(password),
    )
    db.add(user)
    db.flush()
    return user


def ensure_category(db: Session, *, category_id: int, name: str, description: str) -> Category:
    category = db.get(Category, category_id)
    if category is not None:
        return category

    category = Category(id=category_id, name=name, description=description)
    db.add(category)
    db.flush()
    return category


def ensure_product(
    db: Session,
    *,
    product_id: int,
    name: str,
    model: str,
    serial_number: str,
    description: str,
    quantity_in_stock: int,
    price: str,
    cost_price: str = "0.00",
    warranty_status: str,
    distributor_info: str,
    category_id: int,
) -> Product:
    product = db.get(Product, product_id)
    if product is not None:
        return product

    product = Product(
        id=product_id,
        name=name,
        model=model,
        serial_number=serial_number,
        description=description,
        quantity_in_stock=quantity_in_stock,
        price=Decimal(price),
        cost_price=Decimal(cost_price),
        warranty_status=warranty_status,
        distributor_info=distributor_info,
        category_id=category_id,
    )
    db.add(product)
    db.flush()
    return product


def ensure_cart(db: Session, *, cart_id: int, user_id: int | None = None) -> Cart:
    cart = db.get(Cart, cart_id)
    if cart is not None:
        return cart

    cart = Cart(id=cart_id, user_id=user_id)
    db.add(cart)
    db.flush()
    return cart


def backfill_delivery_addresses(db: Session) -> None:
    entries = db.scalars(
        select(DeliveryListEntry).where(DeliveryListEntry.delivery_address == "Address pending")
    ).all()
    for entry in entries:
        customer = db.get(User, entry.customer_id) if entry.customer_id is not None else None
        if customer and customer.address:
            entry.delivery_address = customer.address
        elif customer:
            entry.delivery_address = f"{customer.full_name} delivery address, Customer #{customer.id}"
    if entries:
        db.flush()


def sync_postgres_sequence(db: Session, table_name: str, column_name: str = "id") -> None:
    if db.bind is None or db.bind.dialect.name != "postgresql":
        return

    db.execute(
        text(
            """
            SELECT setval(
                pg_get_serial_sequence(:table_name, :column_name),
                COALESCE((SELECT MAX(id) FROM public.""" + table_name + """), 1),
                true
            )
            """
        ),
        {"table_name": table_name, "column_name": column_name},
    )


def seed_database(db: Session) -> None:
    ensure_user(
        db,
        full_name="Demo Customer",
        email="customer@example.com",
        role="customer",
        password="password123",
        tax_id="11111111110",
        address="Demo Customer Home, Sabanci University, Orta Mahalle, Tuzla, Istanbul",
    )
    ensure_user(
        db,
        full_name="Admin User",
        email=settings.seed_admin_email,
        role="admin",
        password=settings.seed_admin_password,
        tax_id="00000000001",
        address="Admin Office, Sabanci University, Tuzla, Istanbul",
    )
    ensure_user(
        db,
        full_name="Sales Manager",
        email="sales.manager@example.com",
        role="sales_manager",
        password="password123",
        tax_id="00000000002",
        address="Sales Office, Sabanci University, Tuzla, Istanbul",
    )
    ensure_user(
        db,
        full_name="Product Manager",
        email="product.manager@example.com",
        role="product_manager",
        password="password123",
        tax_id="00000000003",
        address="Product Office, Sabanci University, Tuzla, Istanbul",
    )
    backfill_delivery_addresses(db)

    ensure_category(
        db,
        category_id=1,
        name="Woody",
        description="Deep woods, amber, and aromatic blends",
    )
    ensure_category(
        db,
        category_id=2,
        name="Fresh",
        description="Citrus, marine, and everyday fragrances",
    )
    ensure_category(
        db,
        category_id=3,
        name="Warm",
        description="Spiced, smoky, and evening scents",
    )
    ensure_category(
        db,
        category_id=4,
        name="Gift Sets",
        description="Ready-to-gift fragrance selections",
    )

    ensure_product(
        db,
        product_id=1,
        name="Bleu de Chanel",
        model="100 ml / 3.38 fl. oz.",
        serial_number="FRAG-BDC-100",
        description="Bleu de Chanel is a woody, spicy fragrance for everyday wear and evening occasions.",
        quantity_in_stock=8,
        price="210.00",
        cost_price="140.00",
        warranty_status="Authenticity guaranteed",
        distributor_info="Fragrance shop demo catalog",
        category_id=1,
    )
    ensure_product(
        db,
        product_id=2,
        name="Dior Sauvage",
        model="100 ml / 3.38 fl. oz.",
        serial_number="FRAG-DSG-100",
        description="Dior Sauvage is a fresh, spicy fragrance built around bergamot and amberwood.",
        quantity_in_stock=10,
        price="165.00",
        cost_price="110.00",
        warranty_status="Authenticity guaranteed",
        distributor_info="Fragrance shop demo catalog",
        category_id=2,
    )
    ensure_product(
        db,
        product_id=3,
        name="Tom Ford Noir Extreme",
        model="50 ml / 1.7 fl. oz.",
        serial_number="FRAG-TFNE-050",
        description="Tom Ford Noir Extreme is a warm, spicy scent with amber and vanilla notes.",
        quantity_in_stock=5,
        price="195.00",
        cost_price="130.00",
        warranty_status="Authenticity guaranteed",
        distributor_info="Fragrance shop demo catalog",
        category_id=3,
    )
    ensure_product(
        db,
        product_id=4,
        name="Discovery Gift Set",
        model="5 x 10 ml / 0.34 fl. oz.",
        serial_number="FRAG-GIFT-SET",
        description="A curated discovery set for trying multiple signature scents before choosing a bottle.",
        quantity_in_stock=14,
        price="89.00",
        cost_price="55.00",
        warranty_status="Authenticity guaranteed",
        distributor_info="Fragrance shop demo catalog",
        category_id=4,
    )

    ensure_cart(db, cart_id=1, user_id=None)
    for table_name in ("users", "categories", "products", "carts"):
        sync_postgres_sequence(db, table_name)
    db.commit()
