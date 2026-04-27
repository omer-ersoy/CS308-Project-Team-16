from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ProductReviewBase(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str = Field(min_length=1, max_length=2000)

    @field_validator("comment")
    @classmethod
    def strip_comment(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("Comment cannot be empty")
        return stripped


class ProductReviewCreate(ProductReviewBase):
    model_config = ConfigDict(extra="forbid")


class ProductReviewUpdate(BaseModel):
    rating: int | None = Field(default=None, ge=1, le=5)
    comment: str | None = Field(default=None, min_length=1, max_length=2000)

    model_config = ConfigDict(extra="forbid")

    @field_validator("comment")
    @classmethod
    def strip_comment(cls, value: str | None) -> str | None:
        if value is None:
            return value

        stripped = value.strip()
        if not stripped:
            raise ValueError("Comment cannot be empty")
        return stripped


class ProductReviewRead(ProductReviewBase):
    id: int
    product_id: int
    user_id: int
    user_full_name: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
