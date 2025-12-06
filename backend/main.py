"""
FastAPI Main Application
Entry point for the WorthWise College ROI Planner API
"""

from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
import traceback

from app.config import settings
from app.database import check_db_connection
from app.api.v1 import api_router
from app.utils.exceptions import WorthWiseException

# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="College ROI Planner API - Compute ROI, debt, earnings, and financial metrics for college programs",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# =============================================================================
# CORS Configuration
# =============================================================================

cors_config = settings.get_cors_config()

app.add_middleware(
    CORSMiddleware,
    **cors_config
)

# =============================================================================
# Exception Handlers
# =============================================================================

@app.exception_handler(WorthWiseException)
async def worthwise_exception_handler(request: Request, exc: WorthWiseException):
    """Handle custom application exceptions"""
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "detail": exc.message,
            "error_code": exc.error_code,
            "timestamp": datetime.utcnow().isoformat()
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle Pydantic validation errors"""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Validation error",
            "errors": exc.errors(),
            "timestamp": datetime.utcnow().isoformat()
        }
    )


@app.exception_handler(SQLAlchemyError)
async def database_exception_handler(request: Request, exc: SQLAlchemyError):
    """Handle database errors"""
    if settings.debug:
        error_detail = str(exc)
    else:
        error_detail = "Database error occurred"
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": error_detail,
            "error_code": "DATABASE_ERROR",
            "timestamp": datetime.utcnow().isoformat()
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle all other exceptions"""
    if settings.debug:
        error_detail = {
            "message": str(exc),
            "type": exc.__class__.__name__,
            "traceback": traceback.format_exc()
        }
    else:
        error_detail = "Internal server error"
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": error_detail,
            "error_code": "INTERNAL_ERROR",
            "timestamp": datetime.utcnow().isoformat()
        }
    )

# =============================================================================
# Middleware
# =============================================================================

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Add security headers to all responses"""
    response = await call_next(request)
    
    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    
    # HSTS for production
    if settings.is_production:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    
    return response

# =============================================================================
# Startup and Shutdown Events
# =============================================================================

@app.on_event("startup")
async def startup_event():
    """Execute on application startup"""
    print(f"[Startup] {settings.app_name} v{settings.app_version}")
    print(f"[Startup] Environment: {settings.environment}")
    print(f"[Startup] Debug mode: {settings.debug}")
    
    # Check database connection
    db_connected = check_db_connection()
    if db_connected:
        print("[Startup] ✓ MySQL connection successful")
    else:
        print("[Startup] ✗ MySQL connection failed")
    
    # Check DuckDB
    from app.duckdb_client import duckdb_client
    duckdb_status = duckdb_client.healthcheck()
    if duckdb_status.get("status") == "healthy":
        print("[Startup] ✓ DuckDB connection successful")
    else:
        print(f"[Startup] ✗ DuckDB connection failed: {duckdb_status.get('error')}")
    
    print(f"[Startup] CORS: {settings.environment} mode")
    print("[Startup] Ready to accept requests")


@app.on_event("shutdown")
async def shutdown_event():
    """Execute on application shutdown"""
    print("[Shutdown] Closing database connections...")
    
    # Close DuckDB connection
    from app.duckdb_client import duckdb_client
    duckdb_client.close()
    
    print("[Shutdown] Shutdown complete")

# =============================================================================
# API Routes
# =============================================================================

# Include API v1 routes
app.include_router(
    api_router,
    prefix=settings.api_v1_prefix
)

# Root endpoint
@app.get("/", tags=["root"])
async def root():
    """Root endpoint - API information"""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "status": "running",
        "environment": settings.environment,
        "docs_url": f"{settings.api_v1_prefix}/docs" if settings.debug else None,
        "api_version": "v1",
        "endpoints": {
            "health": f"{settings.api_v1_prefix}/health",
            "options": f"{settings.api_v1_prefix}/options",
            "compute": f"{settings.api_v1_prefix}/compute",
            "compare": f"{settings.api_v1_prefix}/compare",
            "export": f"{settings.api_v1_prefix}/export",
            "summarize": f"{settings.api_v1_prefix}/summarize"
        }
    }
