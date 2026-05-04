from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class CartItemRead(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: Decimal

    model_config = ConfigDict(from_attributes=True)


class CartAddItem(BaseModel):
    product_id: int
    quantity: int = 1


class CartRead(BaseModel):
    id: int
    user_id: int | None = None
    items: list[CartItemRead]
    total_amount: Decimal

    model_config = ConfigDict(from_attributes=True)
