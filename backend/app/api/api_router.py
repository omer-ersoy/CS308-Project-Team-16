from fastapi import APIRouter

from app.api.routes import admin, analytics, auth, carts, categories, notifications, orders, product_manager, product_manager_reviews, products, returns, reviews, users, wishlist


api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(reviews.router, prefix="/products", tags=["reviews"])
api_router.include_router(wishlist.router, prefix="/wishlist", tags=["wishlist"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(carts.router, prefix="/carts", tags=["carts"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(returns.router, prefix="/returns", tags=["returns"])
api_router.include_router(
    analytics.router,
    prefix="/orders/analytics",
    tags=["analytics"],
)
api_router.include_router(
    product_manager.router,
    prefix="/product-manager",
    tags=["product-manager"],
)
api_router.include_router(
    product_manager_reviews.router,
    prefix="/product-manager",
    tags=["product-manager"],
)
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
