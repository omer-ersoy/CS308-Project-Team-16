from fastapi import APIRouter

from app.data.store import CATEGORIES
from app.schemas.category import CategoryRead


router = APIRouter()


@router.get("", response_model=list[CategoryRead])
def list_categories() -> list[CategoryRead]:
    return CATEGORIES
