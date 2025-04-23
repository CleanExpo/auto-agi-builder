"""
Main FastAPI application for Auto AGI Builder.
This file configures the API and includes middleware and routes.
"""

import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import time
import uuid
from app.core.error_handling import configure_exception_handlers

# Import API router
from app.api.v1.api import api_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("auto-agi-builder")

# Initialize FastAPI app
app = FastAPI(
    title="Auto AGI Builder API",
    description="API for the Auto AGI Builder platform",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# Configure CORS
allowed_origins = [
    # Vercel production domain
    "https://auto-agi-builder.vercel.app",
    # Vercel preview domains (for deployments from PRs)
    "https://*.vercel.app",
    # For local development
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    # Custom domains if applicable
    "https://yourdomain.com",
    "https://www.yourdomain.com",
]

# Allow additional origins from environment variable
extra_origins = os.getenv("ALLOWED_ORIGINS")
if extra_origins:
    allowed_origins.extend(extra_origins.split(","))

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],  # For file downloads
)

# Configure exception handlers for standardized error responses
configure_exception_handlers(app)

# Request ID middleware
@app.middleware("http")
async def add_request_id(request: Request, call_next):
    """Add a unique request ID to each request for tracking."""
    request_id = str(uuid.uuid4())
    # Start timer
    start_time = time.time()
    
    # Add request ID to request state
    request.state.request_id = request_id
    
    # Process request
    try:
        response = await call_next(request)
        # Add request ID to response headers
        response.headers["X-Request-ID"] = request_id
        
        # Calculate and add processing time
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        
        # Log request details
        logger.info(
            f"Request {request_id}: {request.method} {request.url.path} "
            f"- Status: {response.status_code} - Time: {process_time:.4f}s"
        )
        
        return response
    except Exception as e:
        # Log error
        logger.error(
            f"Request {request_id}: {request.method} {request.url.path} "
            f"- Error: {str(e)}"
        )
        
        # Return error response
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error", "request_id": request_id}
        )

# Include API router
app.include_router(api_router, prefix="/api/v1")

# Health check endpoint
@app.get("/health-check")
async def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "ok",
        "version": app.version,
        "environment": os.getenv("ENVIRONMENT", "development")
    }

# Include other API routers
from app.api.demo_data.routes import router as demo_data_router
app.include_router(demo_data_router, prefix="/api/demo-data", tags=["demo-data"])

# If running this file directly, start the server
if __name__ == "__main__":
    import uvicorn
    
    # Get host and port from environment variables or use defaults
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    
    # Start server
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=os.getenv("ENVIRONMENT") != "production"
    )
