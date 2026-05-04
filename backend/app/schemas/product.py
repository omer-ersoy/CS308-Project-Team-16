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

    model_config = ConfigDict(from_attributes=True)


class ProductCreate(ProductBase):
    model_config = ConfigDict(extra="forbid")


class ProductUpdate(BaseModel):
    name: str | None = None
    model: str | None = None
    serial_number: str | None = None
    description: str | None = None
    quantity_in_stock: int | None = None
    price: Decimal | None = None
    warranty_status: str | None = None
    distributor_info: str | None = None
    category_id: int | None = None

    model_config = ConfigDict(extra="forbid")
