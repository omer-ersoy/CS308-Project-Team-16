from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class ReturnRequestCreate(BaseModel):
    order_item_id: int
    quantity: int = Field(gt=0)
    reason: str | None = None

    model_config = ConfigDict(extra="forbid")


class ReturnRequestDecision(BaseModel):
    decision_note: str | None = None

    model_config = ConfigDict(extra="forbid")


class ReturnRequestRead(BaseModel):
    id: int
    order_id: int
    order_item_id: int
    customer_id: int | None
    product_id: int | None
    quantity: int
    reason: str | None
    status: str
    refund_amount: Decimal
    decision_note: str | None
    evaluated_by_id: int | None
    evaluated_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
