from fastapi import APIRouter

from app.data.store import CARTS, PRODUCTS
from app.schemas.cart import CartAddItem, CartItemRead, CartRead


router = APIRouter()


def calculate_total(cart: CartRead):
    return sum(item.unit_price * item.quantity for item in cart.items)


@router.get("/{cart_id}", response_model=CartRead)
def get_cart(cart_id: int) -> CartRead:
    cart = CARTS.get(cart_id)
    if cart is None:
        cart = CartRead(id=cart_id, user_id=None, items=[], total_amount=0)
        CARTS[cart_id] = cart
    return cart


@router.post("/{cart_id}/items", response_model=CartRead)
def add_item_to_cart(cart_id: int, payload: CartAddItem) -> CartRead:
    cart = CARTS.get(cart_id)
    if cart is None:
        cart = CartRead(id=cart_id, user_id=None, items=[], total_amount=0)

    product = next((item for item in PRODUCTS if item.id == payload.product_id), None)
    if product is None:
        return cart

    cart.items.append(
        CartItemRead(
            id=len(cart.items) + 1,
            product_id=product.id,
            quantity=payload.quantity,
            unit_price=product.price,
        )
    )
    cart.total_amount = calculate_total(cart)
    CARTS[cart_id] = cart
    return cart


@router.delete("/{cart_id}/items/{item_id}", response_model=CartRead)
def remove_item_from_cart(cart_id: int, item_id: int) -> CartRead:
    cart = CARTS.get(cart_id)
    if cart is None:
        cart = CartRead(id=cart_id, user_id=None, items=[], total_amount=0)

    cart.items = [item for item in cart.items if item.id != item_id]
    cart.total_amount = calculate_total(cart)
    CARTS[cart_id] = cart
    return cart
