from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class ProductBase(BaseModel):
    name: str
    model: str
    serial_number: str
    description: str
    quantity_in_stock: int
    price: Decimal
    warranty_status: str
    distributor_info: str
    category_id: int


class ProductRead(ProductBase):
    id: int

    model_config = ConfigDict()
