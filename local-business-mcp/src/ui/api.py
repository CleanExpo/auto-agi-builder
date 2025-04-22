"""
API module for the Local Business MCP application.
Provides RESTful endpoints for business discovery, analysis, and export.
"""
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Query, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field, validator
import os
import tempfile
from datetime import datetime

from src.config.settings import API_HOST, API_PORT
from src.data_collection.google_places import discover_businesses
from src.analysis.performance_analyzer import analyze_business_performance, analyze_businesses_in_area
from src.export.exporters import export_businesses
from src.utils.geo_utils import geocode_address
from src.models import BusinessType

# API models for request/response validation

class LocationModel(BaseModel):
    """Model for location data in requests."""
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    
    @validator('latitude', 'longitude', pre=True, always=True)
    def check_location_data(cls, v, values):
        """Validate that either coordinates or address is provided."""
        if not v and 'latitude' in values and 'longitude' in values and not (values['latitude'] and values['longitude']) and not values.get('address') and not (values.get('city') and values.get('state')):
            raise ValueError("Either coordinates (latitude, longitude) or address or city/state must be provided")
        return v


class SearchRequest(BaseModel):
    """Model for business search requests."""
    location: LocationModel
    radius_km: float = Field(default=20.0, ge=0.1, le=50.0)
    keywords: Optional[List[str]] = None
    business_types: Optional[List[str]] = None
    max_results: int = Field(default=100, ge=1, le=1000)


class AnalysisRequest(BaseModel):
    """Model for business analysis requests."""
    business_ids: Optional[List[int]] = None
    city: Optional[str] = None
    state: Optional[str] = None
    max_score: Optional[float] = None
    max_results: int = Field(default=100, ge=1, le=1000)


class ExportRequest(BaseModel):
    """Model for export requests."""
    format: str = Field(..., regex='^(csv|json|excel|html)$')
    business_ids: Optional[List[int]] = None
    city: Optional[str] = None
    state: Optional[str] = None
    max_results: int = Field(default=100, ge=1, le=1000)


# Create FastAPI application
app = FastAPI(
    title="Local Business MCP API",
    description="API for discovering, analyzing, and assisting struggling local businesses",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# API routes

@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "Local Business MCP API",
        "version": "1.0.0",
        "documentation": "/docs",
        "endpoints": [
            {"path": "/search", "method": "POST", "description": "Search for businesses in a geographic area"},
            {"path": "/businesses", "method": "GET", "description": "Get businesses with their performance scores"},
            {"path": "/analyze/{business_id}", "method": "POST", "description": "Analyze a specific business"},
            {"path": "/analyze", "method": "POST", "description": "Analyze multiple businesses in an area"},
            {"path": "/export", "method": "POST", "description": "Export business data in various formats"}
        ]
    }


@app.post("/search")
async def search_businesses(request: SearchRequest):
    """
    Search for businesses in a specified geographic area.
    
    Args:
        request: Search parameters including location, radius, and filters.
        
    Returns:
        List of discovered business IDs.
    """
    try:
        # Process location parameter
        location = None
        
        if request.location.latitude is not None and request.location.longitude is not None:
            location = (request.location.latitude, request.location.longitude)
        elif request.location.address:
            location = request.location.address
        elif request.location.city and request.location.state:
            location = f"{request.location.city}, {request.location.state}"
        else:
            raise HTTPException(status_code=400, detail="Valid location must be provided")
        
        # Call discovery function
        business_ids = discover_businesses(
            location=location,
            radius_km=request.radius_km,
            keywords=request.keywords,
            business_types=request.business_types,
            max_results=request.max_results
        )
        
        return {
            "business_ids": business_ids,
            "count": len(business_ids),
            "search_params": {
                "location": str(location),
                "radius_km": request.radius_km,
                "keywords": request.keywords,
                "business_types": request.business_types
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze/{business_id}")
async def analyze_business(business_id: int):
    """
    Analyze a specific business by ID.
    
    Args:
        business_id: ID of the business to analyze.
        
    Returns:
        Analysis results with performance scores and recommendations.
    """
    try:
        result = analyze_business_performance(business_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze")
async def analyze_businesses(request: AnalysisRequest):
    """
    Analyze multiple businesses in a specific area.
    
    Args:
        request: Analysis parameters including location and filters.
        
    Returns:
        List of analysis results for businesses in the area.
    """
    try:
        if not request.city or not request.state:
            raise HTTPException(status_code=400, detail="City and state are required")
        
        results = analyze_businesses_in_area(
            city=request.city,
            state=request.state,
            max_businesses=request.max_results,
            max_score=request.max_score
        )
        
        return {
            "results": results,
            "count": len(results),
            "analysis_params": {
                "city": request.city,
                "state": request.state,
                "max_score": request.max_score,
                "max_results": request.max_results
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/export")
async def export_data(request: ExportRequest, background_tasks: BackgroundTasks):
    """
    Export business data in the specified format.
    
    Args:
        request: Export parameters including format and filters.
        
    Returns:
        URL of the exported file for download.
    """
    try:
        # Create a temporary file with the appropriate extension
        temp_dir = tempfile.gettempdir()
        file_extensions = {
            "csv": ".csv",
            "json": ".json",
            "excel": ".xlsx",
            "html": ".html"
        }
        
        ext = file_extensions.get(request.format.lower())
        if not ext:
            raise HTTPException(status_code=400, detail=f"Unsupported format: {request.format}")
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"businesses_export_{timestamp}{ext}"
        filepath = os.path.join(temp_dir, filename)
        
        # Export the data
        export_businesses(
            export_format=request.format,
            output_path=filepath,
            business_ids=request.business_ids,
            city=request.city,
            state=request.state,
            max_results=request.max_results
        )
        
        # Set up cleanup task
        def remove_export_file():
            try:
                if os.path.exists(filepath):
                    os.remove(filepath)
            except Exception:
                pass
        
        # Schedule file cleanup after some time (e.g., 1 hour)
        background_tasks.add_task(remove_export_file)
        
        # Return the file
        return FileResponse(
            path=filepath,
            filename=filename,
            media_type={
                "csv": "text/csv",
                "json": "application/json",
                "excel": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "html": "text/html"
            }.get(request.format.lower())
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/business_types")
async def get_business_types():
    """Get all available business types."""
    return {
        "business_types": [bt.value for bt in BusinessType]
    }


def start_api_server():
    """Start the API server using uvicorn."""
    import uvicorn
    uvicorn.run(app, host=API_HOST, port=API_PORT)


if __name__ == "__main__":
    start_api_server()
