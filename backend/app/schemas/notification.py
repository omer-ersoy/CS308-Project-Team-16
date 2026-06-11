from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.schemas.product import ProductRead


class DiscountNotificationRead(BaseModel):
    id: int
    product_id: int
    product_name: str
    discount_rate: Decimal
    original_price: Decimal
    discounted_price: Decimal
    is_read: bool
    created_at: datetime
    product: ProductRead

    model_config = ConfigDict(from_attributes=True)


class RefundNotificationRead(BaseModel):
    id: int
    return_request_id: int
    product_name: str
    refund_amount: Decimal
    status: str
    decision_note: str | None = None
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
