from fastapi import APIRouter

from app.data.store import PRODUCTS
from app.schemas.product import ProductRead


router = APIRouter()


@router.get("", response_model=list[ProductRead])
def list_products() -> list[ProductRead]:
    return PRODUCTS
