from decimal import Decimal

from sqlalchemy.orm import Session, selectinload

from fastapi import APIRouter, Depends, HTTPException, status

from app.db.models import Cart, CartItem, Product
from app.db.session import get_db
from app.schemas.cart import CartAddItem, CartItemRead, CartRead


router = APIRouter()


def calculate_total(cart: Cart) -> Decimal:
    return sum((item.unit_price * item.quantity for item in cart.items), start=Decimal("0.00"))


def serialize_cart(cart: Cart) -> CartRead:
    return CartRead(
        id=cart.id,
        user_id=cart.user_id,
        items=[
            CartItemRead.model_validate(item)
            for item in sorted(cart.items, key=lambda cart_item: cart_item.id)
        ],
        total_amount=calculate_total(cart),
    )


def get_or_create_cart(db: Session, cart_id: int) -> Cart:
    cart = (
        db.query(Cart)
        .options(selectinload(Cart.items))
        .filter(Cart.id == cart_id)
        .first()
    )
    if cart is None:
        cart = Cart(id=cart_id, user_id=None)
        db.add(cart)
        db.commit()

    return (
        db.query(Cart)
        .options(selectinload(Cart.items))
        .filter(Cart.id == cart_id)
        .first()
    )


@router.get("/{cart_id}", response_model=CartRead)
def get_cart(cart_id: int, db: Session = Depends(get_db)) -> CartRead:
    return serialize_cart(get_or_create_cart(db, cart_id))


@router.post("/{cart_id}/items", response_model=CartRead)
def add_item_to_cart(
    cart_id: int,
    payload: CartAddItem,
    db: Session = Depends(get_db),
) -> CartRead:
    cart = get_or_create_cart(db, cart_id)
    product = db.get(Product, payload.product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    db.add(
        CartItem(
            cart_id=cart.id,
            product_id=product.id,
            quantity=payload.quantity,
            unit_price=product.price,
        )
    )
    db.commit()
    return serialize_cart(get_or_create_cart(db, cart_id))


@router.delete("/{cart_id}/items/{item_id}", response_model=CartRead)
def remove_item_from_cart(cart_id: int, item_id: int, db: Session = Depends(get_db)) -> CartRead:
    cart = get_or_create_cart(db, cart_id)
    item = next((cart_item for cart_item in cart.items if cart_item.id == item_id), None)
    if item is not None:
        db.delete(item)
        db.commit()
    return serialize_cart(get_or_create_cart(db, cart_id))
