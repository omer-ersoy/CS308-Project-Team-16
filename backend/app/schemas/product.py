from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


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
    average_rating: float = 0.0
    rating_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class ProductCreate(ProductBase):
    price: Decimal = Field(gt=0)

    model_config = ConfigDict(extra="forbid")


class ProductUpdate(BaseModel):
    name: str | None = None
    model: str | None = None
    serial_number: str | None = None
    description: str | None = None
    quantity_in_stock: int | None = None
    price: Decimal | None = Field(default=None, gt=0)
    warranty_status: str | None = None
    distributor_info: str | None = None
    category_id: int | None = None

    model_config = ConfigDict(extra="forbid")


class ProductPriceUpdate(BaseModel):
    price: Decimal = Field(gt=0)

    model_config = ConfigDict(extra="forbid")