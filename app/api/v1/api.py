from fastapi import APIRouter

from app.api.v1.endpoints import (
    prototype,
    requirements,
    roi,
    export,  # Import our new export endpoints
    clients,  # Import our new client management endpoints
    localization,  # Import our new localization endpoints
    notifications  # Import our new notifications endpoints
)

api_router = APIRouter()

# Include routers for all endpoint modules
api_router.include_router(prototype.router, prefix="/prototype", tags=["prototype"])
api_router.include_router(requirements.router, prefix="/requirements", tags=["requirements"])
api_router.include_router(roi.router, prefix="/roi", tags=["roi"])
api_router.include_router(export.router, prefix="/exports", tags=["exports"])
api_router.include_router(clients.router, prefix="/clients", tags=["clients"])
api_router.include_router(localization.router, prefix="/localization", tags=["localization"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
