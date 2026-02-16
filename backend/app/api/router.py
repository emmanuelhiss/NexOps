from __future__ import annotations

from fastapi import APIRouter

from app.api.infrastructure import router as infrastructure_router
from app.api.services import router as services_router
from app.api.metrics import router as metrics_router
from app.api.alerts import router as alerts_router

api_router = APIRouter()

api_router.include_router(
    infrastructure_router,
    prefix="/infrastructure",
    tags=["infrastructure"],
)
api_router.include_router(
    services_router,
    prefix="/services",
    tags=["services"],
)
api_router.include_router(
    metrics_router,
    prefix="/metrics",
    tags=["metrics"],
)
api_router.include_router(
    alerts_router,
    prefix="/alerts",
    tags=["alerts"],
)
