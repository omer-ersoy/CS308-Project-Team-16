from fastapi import FastAPI

from app.api.api_router import api_router
from app.core.config import settings


app = FastAPI(title=settings.app_name)
app.include_router(api_router, prefix="/api")


@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}
