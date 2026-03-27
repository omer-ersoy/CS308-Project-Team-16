from fastapi import APIRouter

from app.api.routes import carts, categories, products, users


api_router = APIRouter()
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(carts.router, prefix="/carts", tags=["carts"])
