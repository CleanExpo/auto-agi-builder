from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
import os
import json
import tempfile
import uuid
from datetime import datetime
from app.core.auth.jwt import get_current_user
from app.models.user import User
from app.db.session import get_db
from sqlalchemy.orm import Session


router = APIRouter()


class ExportRequest(BaseModel):
    """Request model for export operations"""
    project_id: str
    export_type: str = "pdf"  # pdf, excel, csv, json
    content_type: str = "project"  # project, requirements, roi, timeline
    filename: Optional[str] = None
    options: Optional[Dict[str, Any]] = None


class ExportResponse(BaseModel):
    """Response model for export operations"""
    export_id: str
    filename: str
    file_size: int
    content_type: str
    export_type: str
    download_url: str
    created_at: datetime


@router.post("/export", response_model=ExportResponse)
async def create_export(
    request: ExportRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate an export of project data in the specified format
    
    This endpoint initiates the export process and returns metadata about the export.
    For larger exports, the generation is done in the background.
    """
    # Validate project access
    # TODO: Implement project access validation
    
    # Create a unique ID for this export
    export_id = str(uuid.uuid4())
    
    # Create temporary export directory if it doesn't exist
    export_dir = "app/static/exports"
    os.makedirs(export_dir, exist_ok=True)
    
    # Generate default filename if not provided
    if not request.filename:
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        request.filename = f"{request.content_type}_{timestamp}.{request.export_type}"
    
    # The path where the export will be saved
    filepath = os.path.join(export_dir, f"{export_id}_{request.filename}")
    
    # Add export generation to background tasks
    background_tasks.add_task(
        generate_export,
        request.project_id,
        request.export_type,
        request.content_type,
        filepath,
        request.options
    )
    
    # Create and return the response
    return ExportResponse(
        export_id=export_id,
        filename=request.filename,
        file_size=0,  # Will be updated when file is generated
        content_type=request.content_type,
        export_type=request.export_type,
        download_url=f"/api/v1/exports/{export_id}/download",
        created_at=datetime.now()
    )


@router.get("/exports", response_model=List[ExportResponse])
async def list_exports(
    project_id: Optional[str] = None,
    export_type: Optional[str] = None,
    content_type: Optional[str] = None,
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List available exports with optional filtering
    
    Returns a list of exports matching the specified criteria.
    """
    # TODO: Implement database query to fetch exports
    # For now, return a mock response
    
    # Mock export data
    exports = [
        ExportResponse(
            export_id=str(uuid.uuid4()),
            filename="project_export.pdf",
            file_size=1024 * 1024,  # 1MB
            content_type="project",
            export_type="pdf",
            download_url=f"/api/v1/exports/{uuid.uuid4()}/download",
            created_at=datetime.now()
        ),
        ExportResponse(
            export_id=str(uuid.uuid4()),
            filename="requirements_export.xlsx",
            file_size=512 * 1024,  # 512KB
            content_type="requirements",
            export_type="excel",
            download_url=f"/api/v1/exports/{uuid.uuid4()}/download",
            created_at=datetime.now()
        )
    ]
    
    return exports


@router.get("/exports/{export_id}")
async def get_export(
    export_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get metadata about a specific export
    
    Returns details about the export with the specified ID.
    """
    # TODO: Implement database query to fetch export metadata
    # For now, return a mock response
    
    return ExportResponse(
        export_id=export_id,
        filename="project_export.pdf",
        file_size=1024 * 1024,  # 1MB
        content_type="project",
        export_type="pdf",
        download_url=f"/api/v1/exports/{export_id}/download",
        created_at=datetime.now()
    )


@router.get("/exports/{export_id}/download")
async def download_export(
    export_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Download an export file
    
    Returns the actual export file for download.
    """
    # TODO: Implement file retrieval
    # For now, create a temporary file
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp:
        temp.write(b"This is a mock PDF file")
        temp_path = temp.name
    
    # In a real implementation, we would check if the file exists
    # and validate the user's permission to access it
    
    return FileResponse(
        temp_path,
        filename="project_export.pdf",
        media_type="application/pdf"
    )


@router.delete("/exports/{export_id}")
async def delete_export(
    export_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete an export
    
    Removes the export file and its metadata from the system.
    """
    # TODO: Implement export deletion
    # For now, return a success message
    
    return {"message": f"Export {export_id} deleted successfully"}


# Helper functions

async def generate_export(
    project_id: str,
    export_type: str,
    content_type: str,
    filepath: str,
    options: Optional[Dict[str, Any]] = None
):
    """
    Background task to generate the export file
    
    This function is called asynchronously to generate the export
    without blocking the API response.
    """
    try:
        # Fetch data based on content_type
        data = await fetch_export_data(project_id, content_type)
        
        # Generate the export based on export_type
        if export_type == "pdf":
            await generate_pdf_export(data, filepath, options)
        elif export_type == "excel":
            await generate_excel_export(data, filepath, options)
        elif export_type == "csv":
            await generate_csv_export(data, filepath, options)
        elif export_type == "json":
            await generate_json_export(data, filepath, options)
        else:
            raise ValueError(f"Unsupported export type: {export_type}")
        
        # TODO: Update export metadata in database with file size and status
        
    except Exception as e:
        # TODO: Log the error and update export status in database
        print(f"Error generating export: {str(e)}")


async def fetch_export_data(project_id: str, content_type: str) -> Dict[str, Any]:
    """Fetch data for the export based on content_type"""
    # Mock data fetching for different content types
    if content_type == "project":
        return {
            "id": project_id,
            "name": "Project Name",
            "description": "Project description",
            "status": "In Progress",
            "progress": 75,
            "team": [
                {"name": "John Doe", "role": "Project Manager"},
                {"name": "Jane Smith", "role": "Developer"}
            ]
        }
    elif content_type == "requirements":
        return [
            {
                "id": "REQ-001",
                "name": "User Authentication",
                "description": "Users should be able to log in securely",
                "priority": "high",
                "status": "completed"
            },
            {
                "id": "REQ-002",
                "name": "Data Export",
                "description": "Support multiple export formats",
                "priority": "medium",
                "status": "in-progress"
            }
        ]
    elif content_type == "roi":
        return {
            "summary": {
                "initialCost": 150000,
                "ongoingCosts": 25000,
                "totalBenefits": 450000,
                "roi": 200,
                "paybackPeriod": 14
            },
            "costs": [
                {"category": "Development", "amount": 100000},
                {"category": "Infrastructure", "amount": 50000}
            ],
            "benefits": [
                {"category": "Productivity", "amount": 200000},
                {"category": "Revenue", "amount": 250000}
            ]
        }
    elif content_type == "timeline":
        return {
            "milestones": [
                {"name": "Project Start", "date": "2025-01-15", "completed": True},
                {"name": "Alpha Release", "date": "2025-03-01", "completed": True},
                {"name": "Beta Release", "date": "2025-04-15", "completed": False},
                {"name": "Final Release", "date": "2025-06-01", "completed": False}
            ],
            "tasks": [
                {"name": "Requirements Gathering", "startDate": "2025-01-15", "endDate": "2025-01-30", "status": "completed"},
                {"name": "Development Phase 1", "startDate": "2025-02-01", "endDate": "2025-02-28", "status": "completed"},
                {"name": "Development Phase 2", "startDate": "2025-03-01", "endDate": "2025-04-15", "status": "in-progress"},
                {"name": "Testing", "startDate": "2025-04-16", "endDate": "2025-05-15", "status": "not-started"},
                {"name": "Deployment", "startDate": "2025-05-16", "endDate": "2025-06-01", "status": "not-started"}
            ]
        }
    else:
        raise ValueError(f"Unsupported content type: {content_type}")


async def generate_pdf_export(data: Dict[str, Any], filepath: str, options: Optional[Dict[str, Any]] = None):
    """Generate a PDF export"""
    # In a real implementation, this would use a PDF generation library
    # For now, just create a simple text file with "PDF" content
    with open(filepath, "w") as f:
        f.write("PDF EXPORT\n\n")
        f.write(json.dumps(data, indent=2))


async def generate_excel_export(data: Dict[str, Any], filepath: str, options: Optional[Dict[str, Any]] = None):
    """Generate an Excel export"""
    # In a real implementation, this would use an Excel generation library
    # For now, just create a simple text file with "EXCEL" content
    with open(filepath, "w") as f:
        f.write("EXCEL EXPORT\n\n")
        f.write(json.dumps(data, indent=2))


async def generate_csv_export(data: Dict[str, Any], filepath: str, options: Optional[Dict[str, Any]] = None):
    """Generate a CSV export"""
    # In a real implementation, this would properly format the data as CSV
    # For now, just create a simple text file with "CSV" content
    with open(filepath, "w") as f:
        f.write("CSV EXPORT\n\n")
        
        # Simple CSV generation logic for different content types
        if isinstance(data, list):
            # For list data (like requirements)
            if data and isinstance(data[0], dict):
                # Get headers from the first item's keys
                headers = list(data[0].keys())
                f.write(",".join(headers) + "\n")
                
                # Write each row
                for item in data:
                    row = [str(item.get(header, "")) for header in headers]
                    f.write(",".join(row) + "\n")
        else:
            # For nested dictionary data, flatten it for CSV
            f.write("key,value\n")
            for key, value in flatten_dict(data).items():
                f.write(f"{key},{value}\n")


async def generate_json_export(data: Dict[str, Any], filepath: str, options: Optional[Dict[str, Any]] = None):
    """Generate a JSON export"""
    # Simply write the data as JSON
    with open(filepath, "w") as f:
        json.dump(data, f, indent=2)


def flatten_dict(d: Dict[str, Any], parent_key: str = '', sep: str = '.') -> Dict[str, Any]:
    """
    Flatten a nested dictionary into a single-level dictionary with keys
    representing the hierarchy using dot notation.
    """
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key, sep=sep).items())
        else:
            items.append((new_key, v))
    return dict(items)
