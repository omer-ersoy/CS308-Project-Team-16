from datetime import date
from decimal import Decimal

from pydantic import BaseModel


class RevenueSummaryRead(BaseModel):
    start_date: date | None
    end_date: date | None
    order_count: int
    total_revenue: Decimal
    average_order_value: Decimal
