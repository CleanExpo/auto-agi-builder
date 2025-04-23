"""
Export Service

This module provides business logic services for export operations.
It acts as an intermediary between API endpoints and database models.
"""

import os
import json
import uuid
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
import asyncio
import logging
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_, or_
from fastapi import HTTPException, BackgroundTasks

from app.models.export import Export, ExportStatus, ExportType, ContentType
from app.schemas.export import ExportCreateRequest, ExportUpdateRequest, ExportList, ExportDetail
from app.core.security import get_current_user_id

# Configure logging
logger = logging.getLogger("auto-agi-builder")


class ExportService:
    """
    Service for handling export operations.
    
    Provides methods for creating, retrieving, updating and deleting exports,
    as well as generating export files.
    """
    
    def __init__(self, db: Session):
        """Initialize with database session."""
        self.db = db
        
        # Ensure exports directory exists
        self.exports_dir = os.path.join("app", "static", "exports")
        os.makedirs(self.exports_dir, exist_ok=True)
    
    async def create_export(
        self, 
        request: ExportCreateRequest, 
        user_id: str,
        background_tasks: BackgroundTasks
    ) -> Export:
        """
        Create a new export record and queue the export generation.
        
        Args:
            request: Export creation request data
            user_id: ID of the user creating the export
            background_tasks: FastAPI background tasks manager
            
        Returns:
            Created export entity
        """
        # Generate a unique ID for the export
        export_id = str(uuid.uuid4())
        
        # Create default filename if not provided
        if not request.filename:
            timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
            request.filename = f"{request.content_type}_{timestamp}.{request.export_type}"
        
        # Path where the export file will be saved
        file_path = os.path.join(self.exports_dir, f"{export_id}_{request.filename}")
        
        # Convert options to JSON string if provided
        options_json = json.dumps(request.options) if request.options else None
        
        # Create new export record
        new_export = Export(
            id=export_id,
            filename=request.filename,
            file_path=file_path,
            export_type=request.export_type,
            content_type=request.content_type,
            status=ExportStatus.PENDING,
            options=options_json,
            project_id=request.project_id,
            user_id=user_id,
            created_at=datetime.utcnow()
        )
        
        # Save to database
        self.db.add(new_export)
        self.db.commit()
        self.db.refresh(new_export)
        
        # Queue export generation task
        background_tasks.add_task(
            self.generate_export_file,
            export_id=export_id,
            project_id=request.project_id,
            export_type=request.export_type,
            content_type=request.content_type,
            file_path=file_path,
            options=request.options
        )
        
        return new_export
    
    async def get_export(self, export_id: str, user_id: str) -> Export:
        """
        Get export by ID.
        
        Args:
            export_id: ID of the export to retrieve
            user_id: ID of the user requesting the export
            
        Returns:
            Export entity if found
            
        Raises:
            HTTPException: If export not found or user doesn't have access
        """
        export = self.db.query(Export).filter(Export.id == export_id).first()
        
        if not export:
            raise HTTPException(status_code=404, detail="Export not found")
        
        # Check if user has access to this export
        # (either they created it or they have access to the project)
        # TODO: Implement proper project access control
        if export.user_id != user_id:
            # Check if user has access to the project
            # For now, we'll allow access if the user is requesting their own export
            raise HTTPException(status_code=403, detail="You don't have access to this export")
        
        return export
    
    async def list_exports(
        self,
        user_id: str,
        project_id: Optional[str] = None,
        export_type: Optional[str] = None,
        content_type: Optional[str] = None,
        status: Optional[str] = None,
        page: int = 1,
        size: int = 10,
        include_deleted: bool = False
    ) -> ExportList:
        """
        List exports with optional filtering.
        
        Args:
            user_id: ID of the user requesting the exports
            project_id: Optional filter by project ID
            export_type: Optional filter by export type
            content_type: Optional filter by content type
            status: Optional filter by status
            page: Page number (1-indexed)
            size: Page size
            include_deleted: Whether to include deleted exports
            
        Returns:
            Paginated list of exports
        """
        # Base query
        query = self.db.query(Export)
        
        # Apply filters
        if project_id:
            query = query.filter(Export.project_id == project_id)
        
        if export_type:
            query = query.filter(Export.export_type == export_type)
            
        if content_type:
            query = query.filter(Export.content_type == content_type)
            
        if status:
            query = query.filter(Export.status == status)
        
        # Check user access
        # TODO: Implement proper project access control
        # For now, only show exports created by the user
        query = query.filter(Export.user_id == user_id)
        
        # Filter out deleted exports unless explicitly requested
        if not include_deleted:
            query = query.filter(Export.is_deleted == False)
        
        # Count total matching exports
        total = query.count()
        
        # Apply pagination
        query = query.order_by(desc(Export.created_at))
        query = query.offset((page - 1) * size).limit(size)
        
        # Execute query
        exports = query.all()
        
        # Calculate total pages
        pages = (total + size - 1) // size  # Ceiling division
        
        # Return paginated response
        return ExportList(
            items=exports,
            total=total,
            page=page,
            size=size,
            pages=pages
        )
    
    async def update_export(self, export_id: str, user_id: str, update_data: ExportUpdateRequest) -> Export:
        """
        Update an export's metadata.
        
        Args:
            export_id: ID of the export to update
            user_id: ID of the user requesting the update
            update_data: Data to update
            
        Returns:
            Updated export entity
            
        Raises:
            HTTPException: If export not found or user doesn't have access
        """
        # Get the export
        export = await self.get_export(export_id, user_id)
        
        # Update fields
        if update_data.filename is not None:
            export.filename = update_data.filename
        
        if update_data.is_deleted is not None and update_data.is_deleted != export.is_deleted:
            export.is_deleted = update_data.is_deleted
            export.deleted_at = datetime.utcnow() if update_data.is_deleted else None
        
        # Save changes
        self.db.commit()
        self.db.refresh(export)
        
        return export
    
    async def delete_export(self, export_id: str, user_id: str, permanent: bool = False) -> Dict[str, str]:
        """
        Delete an export.
        
        Args:
            export_id: ID of the export to delete
            user_id: ID of the user requesting the deletion
            permanent: Whether to permanently delete the export
            
        Returns:
            Message confirming deletion
            
        Raises:
            HTTPException: If export not found or user doesn't have access
        """
        # Get the export
        export = await self.get_export(export_id, user_id)
        
        if permanent:
            # Permanently delete the export
            # First, delete the file if it exists
            if export.file_path and os.path.exists(export.file_path):
                os.remove(export.file_path)
            
            # Then delete the database record
            self.db.delete(export)
            self.db.commit()
            
            return {"message": "Export permanently deleted"}
        else:
            # Soft delete the export
            export.is_deleted = True
            export.deleted_at = datetime.utcnow()
            self.db.commit()
            
            return {"message": "Export deleted"}
    
    async def track_export_download(self, export_id: str, user_id: str) -> None:
        """
        Track when an export is downloaded.
        
        Args:
            export_id: ID of the export being downloaded
            user_id: ID of the user downloading the export
            
        Raises:
            HTTPException: If export not found or user doesn't have access
        """
        # Get the export
        export = await self.get_export(export_id, user_id)
        
        # Update download count and timestamp
        export.download_count += 1
        export.last_downloaded_at = datetime.utcnow()
        
        # Save changes
        self.db.commit()
    
    async def generate_export_file(
        self,
        export_id: str,
        project_id: str,
        export_type: str,
        content_type: str,
        file_path: str,
        options: Optional[Dict[str, Any]] = None
    ) -> None:
        """
        Background task to generate an export file.
        
        Args:
            export_id: ID of the export
            project_id: ID of the project
            export_type: Type of export (pdf, excel, csv, json)
            content_type: Type of content (project, requirements, roi, timeline)
            file_path: Path where the export file will be saved
            options: Optional export options
        """
        try:
            # Update export status to processing
            export = self.db.query(Export).filter(Export.id == export_id).first()
            if not export:
                logger.error(f"Export {export_id} not found when generating file")
                return
            
            export.status = ExportStatus.PROCESSING
            export.started_at = datetime.utcnow()
            self.db.commit()
            
            # Fetch data based on content type
            data = await self._fetch_export_data(project_id, content_type)
            
            # Generate appropriate export file
            file_size = await self._generate_file(export_type, data, file_path, options)
            
            # Update export status to completed
            export.status = ExportStatus.COMPLETED
            export.completed_at = datetime.utcnow()
            export.file_size = file_size
            self.db.commit()
            
            logger.info(f"Export {export_id} successfully generated: {file_path}")
            
        except Exception as e:
            # Update export status to failed
            export = self.db.query(Export).filter(Export.id == export_id).first()
            if export:
                export.status = ExportStatus.FAILED
                export.error_message = str(e)
                self.db.commit()
            
            logger.error(f"Error generating export {export_id}: {str(e)}")
    
    async def _fetch_export_data(self, project_id: str, content_type: str) -> Dict[str, Any]:
        """
        Fetch data for the export based on content type.
        
        Args:
            project_id: ID of the project
            content_type: Type of content to export
            
        Returns:
            Data for the export
            
        Raises:
            ValueError: If content type is unsupported
        """
        # TODO: Implement proper data fetching from database
        # For now, return mock data
        
        if content_type == ContentType.PROJECT.value:
            return {
                "id": project_id,
                "name": "Sample Project",
                "description": "A sample project for export",
                "status": "In Progress",
                "progress": 65,
                "team": [
                    {"name": "John Doe", "role": "Project Manager"},
                    {"name": "Jane Smith", "role": "Developer"}
                ]
            }
        elif content_type == ContentType.REQUIREMENTS.value:
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
        elif content_type == ContentType.ROI.value:
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
        elif content_type == ContentType.TIMELINE.value:
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
                    {"name": "Development Phase 2", "startDate": "2025-03-01", "endDate": "2025-04-15", "status": "in-progress"}
                ]
            }
        else:
            raise ValueError(f"Unsupported content type: {content_type}")
    
    async def _generate_file(
        self,
        export_type: str,
        data: Dict[str, Any],
        file_path: str,
        options: Optional[Dict[str, Any]] = None
    ) -> int:
        """
        Generate export file based on type.
        
        Args:
            export_type: Type of export (pdf, excel, csv, json)
            data: Data to export
            file_path: Path where to save the file
            options: Optional export options
            
        Returns:
            Size of the generated file in bytes
            
        Raises:
            ValueError: If export type is unsupported
        """
        if export_type == ExportType.PDF.value:
            return await self._generate_pdf(data, file_path, options)
        elif export_type == ExportType.EXCEL.value:
            return await self._generate_excel(data, file_path, options)
        elif export_type == ExportType.CSV.value:
            return await self._generate_csv(data, file_path, options)
        elif export_type == ExportType.JSON.value:
            return await self._generate_json(data, file_path, options)
        else:
            raise ValueError(f"Unsupported export type: {export_type}")
    
    async def _generate_pdf(
        self,
        data: Dict[str, Any],
        file_path: str,
        options: Optional[Dict[str, Any]] = None
    ) -> int:
        """
        Generate PDF export.
        
        Args:
            data: Data to export
            file_path: Path where to save the file
            options: Optional export options
            
        Returns:
            Size of the generated file in bytes
        """
        # TODO: Implement proper PDF generation using a library like ReportLab or WeasyPrint
        # For now, just write data as text
        with open(file_path, "w") as f:
            f.write("PDF EXPORT\n\n")
            f.write(json.dumps(data, indent=2))
        
        # Return file size
        return os.path.getsize(file_path)
    
    async def _generate_excel(
        self,
        data: Dict[str, Any],
        file_path: str,
        options: Optional[Dict[str, Any]] = None
    ) -> int:
        """
        Generate Excel export.
        
        Args:
            data: Data to export
            file_path: Path where to save the file
            options: Optional export options
            
        Returns:
            Size of the generated file in bytes
        """
        # TODO: Implement proper Excel generation using a library like openpyxl
        # For now, just write data as text
        with open(file_path, "w") as f:
            f.write("EXCEL EXPORT\n\n")
            f.write(json.dumps(data, indent=2))
        
        # Return file size
        return os.path.getsize(file_path)
    
    async def _generate_csv(
        self,
        data: Union[List[Dict[str, Any]], Dict[str, Any]],
        file_path: str,
        options: Optional[Dict[str, Any]] = None
    ) -> int:
        """
        Generate CSV export.
        
        Args:
            data: Data to export
            file_path: Path where to save the file
            options: Optional export options
            
        Returns:
            Size of the generated file in bytes
        """
        # TODO: Implement proper CSV generation using a library like csv
        with open(file_path, "w") as f:
            f.write("CSV EXPORT\n\n")
            
            # Handle list data (like requirements)
            if isinstance(data, list) and data:
                # Get headers from first item
                headers = list(data[0].keys())
                f.write(",".join(headers) + "\n")
                
                # Write rows
                for item in data:
                    row = [str(item.get(header, "")) for header in headers]
                    f.write(",".join(row) + "\n")
            # Handle dictionary data
            elif isinstance(data, dict):
                # Flatten dictionary for CSV
                f.write("key,value\n")
                for key, value in self._flatten_dict(data).items():
                    f.write(f"{key},{value}\n")
            else:
                f.write("No data to export")
        
        # Return file size
        return os.path.getsize(file_path)
    
    async def _generate_json(
        self,
        data: Dict[str, Any],
        file_path: str,
        options: Optional[Dict[str, Any]] = None
    ) -> int:
        """
        Generate JSON export.
        
        Args:
            data: Data to export
            file_path: Path where to save the file
            options: Optional export options
            
        Returns:
            Size of the generated file in bytes
        """
        # Write data as JSON
        with open(file_path, "w") as f:
            json.dump(data, f, indent=2)
        
        # Return file size
        return os.path.getsize(file_path)
    
    def _flatten_dict(self, d: Dict[str, Any], parent_key: str = '', sep: str = '.') -> Dict[str, Any]:
        """
        Flatten a nested dictionary.
        
        Args:
            d: Dictionary to flatten
            parent_key: Parent key for nested dictionaries
            sep: Separator for nested keys
            
        Returns:
            Flattened dictionary
        """
        items = []
        for k, v in d.items():
            new_key = f"{parent_key}{sep}{k}" if parent_key else k
            if isinstance(v, dict):
                items.extend(self._flatten_dict(v, new_key, sep=sep).items())
            else:
                items.append((new_key, v))
        return dict(items)
