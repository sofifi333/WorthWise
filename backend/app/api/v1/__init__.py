"""
API v1 Routes
All version 1 API endpoints
"""

from fastapi import APIRouter

from app.api.v1 import health, options, compute, export, summarize

api_router = APIRouter()

# Include all route modules
api_router.include_router(health.router, tags=["health"])
api_router.include_router(options.router, prefix="/options", tags=["options"])
api_router.include_router(compute.router, tags=["compute"])
api_router.include_router(export.router, prefix="/export", tags=["export"])
api_router.include_router(summarize.router, tags=["summarize"])

