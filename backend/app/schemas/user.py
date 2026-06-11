from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


UserRole = Literal["customer", "sales_manager", "product_manager", "admin"]


class UserBase(BaseModel):
    full_name: str
    email: EmailStr


class UserRegister(UserBase):
    tax_id: str = Field(min_length=4, max_length=64)
    address: str = Field(min_length=8, max_length=500)
    password: str = Field(min_length=8)

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, value: str) -> str:
        cleaned = value.strip()
        if len(cleaned) < 2:
            raise ValueError("Full name must contain at least 2 characters")
        return cleaned

    @field_validator("tax_id", "address")
    @classmethod
    def validate_required_customer_text(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("This field is required")
        return cleaned

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        if value.strip() != value or any(character.isspace() for character in value):
            raise ValueError("Password cannot contain spaces")
        if not any(character.isalpha() for character in value):
            raise ValueError("Password must contain at least one letter")
        if not any(character.isdigit() for character in value):
            raise ValueError("Password must contain at least one number")
        return value


class UserRead(UserBase):
    id: int
    tax_id: str | None = None
    address: str | None = None
    role: UserRole = "customer"

    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None
    tax_id: str | None = None
    address: str | None = None
    role: UserRole | None = None

    model_config = ConfigDict(extra="forbid")
