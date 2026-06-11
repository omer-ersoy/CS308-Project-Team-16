from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict

DeliveryOrderStatus = Literal["processing", "in-transit", "delivered", "cancelled", "refunded"]
DeliveryOrderStatusRead = Literal["processing", "in-transit", "delivered", "cancelled", "refunded"]


class DeliveryCompletionUpdate(BaseModel):
    completion_status: bool

    model_config = ConfigDict(extra="forbid")


class DeliveryListEntryUpdate(BaseModel):
    delivery_address: str | None = None
    completion_status: bool | None = None
    order_status: DeliveryOrderStatus | None = None
    order_created_at: datetime | None = None

    model_config = ConfigDict(extra="forbid")


class DeliveryListEntryRead(BaseModel):
    id: int
    order_id: int
    customer_id: int | None
    product_id: int | None
    product_name: str | None
    quantity: int
    total_price: Decimal
    delivery_address: str
    completion_status: bool
    order_status: DeliveryOrderStatusRead
    order_created_at: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
