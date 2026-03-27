from pydantic import BaseModel, ConfigDict


class CategoryBase(BaseModel):
    name: str
    description: str | None = None


class CategoryRead(CategoryBase):
    id: int

    model_config = ConfigDict()
