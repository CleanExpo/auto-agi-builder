from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import UUID
import json
import csv
import requests
from io import StringIO
from fastapi import HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import desc, asc

from app.db.session import get_db
from app.models.localization import GeographicalDataSource
from app.schemas.localization import (
    GeographicalDataSourceCreate,
    GeographicalDataSourceUpdate,
    GeographicalDataSourceResponse,
    GeographicalDataSourceListResponse
)

class GeographicalDataService:
    """Service for managing geographical data sources and operations"""
    
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db
        self._cached_data = {}  # Simple in-memory cache for fetched data
    
    async def create_geographical_data_source(
        self, data: GeographicalDataSourceCreate
    ) -> GeographicalDataSourceResponse:
        """Create a new geographical data source"""
        try:
            # Check if a source with the same name and type already exists
            existing = self.db.query(GeographicalDataSource).filter(
                GeographicalDataSource.name == data.name,
                GeographicalDataSource.type == data.type
            ).first()
            
            if existing:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Geographical data source with name '{data.name}' and type '{data.type}' already exists"
                )
            
            # Create new geographical data source
            db_obj = GeographicalDataSource(
                name=data.name,
                type=data.type,
                description=data.description,
                source_url=data.source_url,
                data_format=data.data_format,
                is_active=data.is_active,
                sync_frequency_hours=data.sync_frequency_hours,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            self.db.add(db_obj)
            self.db.commit()
            self.db.refresh(db_obj)
            return db_obj
            
        except IntegrityError as e:
            self.db.rollback()
            raise HTTPException(status_code=400, detail=f"Could not create geographical data source: {str(e)}")
        except Exception as e:
            self.db.rollback()
            raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    
    async def get_geographical_data_source(self, source_id: UUID) -> GeographicalDataSourceResponse:
        """Get geographical data source by ID"""
        db_obj = self.db.query(GeographicalDataSource).filter(GeographicalDataSource.id == source_id).first()
        if not db_obj:
            raise HTTPException(status_code=404, detail=f"Geographical data source with ID {source_id} not found")
            
        return db_obj
    
    async def get_geographical_data_source_by_name_and_type(
        self, name: str, source_type: str
    ) -> GeographicalDataSourceResponse:
        """Get geographical data source by name and type"""
        db_obj = self.db.query(GeographicalDataSource).filter(
            GeographicalDataSource.name == name,
            GeographicalDataSource.type == source_type
        ).first()
        
        if not db_obj:
            raise HTTPException(
                status_code=404, 
                detail=f"Geographical data source with name '{name}' and type '{source_type}' not found"
            )
            
        return db_obj
    
    async def update_geographical_data_source(
        self, source_id: UUID, data: GeographicalDataSourceUpdate
    ) -> GeographicalDataSourceResponse:
        """Update geographical data source"""
        db_obj = self.db.query(GeographicalDataSource).filter(GeographicalDataSource.id == source_id).first()
        if not db_obj:
            raise HTTPException(status_code=404, detail=f"Geographical data source with ID {source_id} not found")
        
        try:
            # Check for uniqueness if name and type are being updated
            if data.name and data.type:
                existing = self.db.query(GeographicalDataSource).filter(
                    GeographicalDataSource.name == data.name,
                    GeographicalDataSource.type == data.type,
                    GeographicalDataSource.id != source_id
                ).first()
                
                if existing:
                    raise HTTPException(
                        status_code=400, 
                        detail=f"Geographical data source with name '{data.name}' and type '{data.type}' already exists"
                    )
            
            # Update fields if provided in the update data
            update_data = data.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_obj, field, value)
            
            # Always update the timestamp
            db_obj.updated_at = datetime.utcnow()
            
            self.db.add(db_obj)
            self.db.commit()
            self.db.refresh(db_obj)
            
            # Clear cache for this source
            cache_key = f"{db_obj.name}_{db_obj.type}"
            if cache_key in self._cached_data:
                del self._cached_data[cache_key]
                
            return db_obj
            
        except IntegrityError as e:
            self.db.rollback()
            raise HTTPException(status_code=400, detail=f"Could not update geographical data source: {str(e)}")
        except Exception as e:
            self.db.rollback()
            raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    
    async def delete_geographical_data_source(self, source_id: UUID) -> bool:
        """Delete geographical data source"""
        db_obj = self.db.query(GeographicalDataSource).filter(GeographicalDataSource.id == source_id).first()
        if not db_obj:
            raise HTTPException(status_code=404, detail=f"Geographical data source with ID {source_id} not found")
        
        try:
            # Clear cache for this source
            cache_key = f"{db_obj.name}_{db_obj.type}"
            if cache_key in self._cached_data:
                del self._cached_data[cache_key]
                
            self.db.delete(db_obj)
            self.db.commit()
            return True
            
        except IntegrityError:
            self.db.rollback()
            # Instead of deleting, deactivate
            return await self.deactivate_geographical_data_source(source_id)
        except Exception as e:
            self.db.rollback()
            raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    
    async def deactivate_geographical_data_source(self, source_id: UUID) -> GeographicalDataSourceResponse:
        """Deactivate geographical data source instead of deleting (soft delete)"""
        db_obj = self.db.query(GeographicalDataSource).filter(GeographicalDataSource.id == source_id).first()
        if not db_obj:
            raise HTTPException(status_code=404, detail=f"Geographical data source with ID {source_id} not found")
        
        db_obj.is_active = False
        db_obj.updated_at = datetime.utcnow()
        
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj
    
    async def list_geographical_data_sources(
        self, 
        source_type: Optional[str] = None,
        page: int = 1, 
        size: int = 10, 
        active_only: bool = True,
        search: Optional[str] = None,
        sort_by: str = "name",
        sort_dir: str = "asc"
    ) -> GeographicalDataSourceListResponse:
        """List geographical data sources with pagination and filtering"""
        # Start with base query
        query = self.db.query(GeographicalDataSource)
        
        # Apply filters
        if source_type:
            query = query.filter(GeographicalDataSource.type == source_type)
            
        if active_only:
            query = query.filter(GeographicalDataSource.is_active == True)
            
        if search:
            query = query.filter(GeographicalDataSource.name.ilike(f"%{search}%") | 
                              GeographicalDataSource.description.ilike(f"%{search}%"))
        
        # Count total items for pagination
        total = query.count()
        
        # Apply sorting
        if sort_by not in ["name", "type", "created_at", "last_sync"]:
            sort_by = "name"  # Default sort by name
            
        if sort_dir.lower() == "desc":
            query = query.order_by(desc(getattr(GeographicalDataSource, sort_by)))
        else:
            query = query.order_by(asc(getattr(GeographicalDataSource, sort_by)))
        
        # Apply pagination
        query = query.offset((page - 1) * size).limit(size)
        
        # Execute query
        items = query.all()
        
        # Calculate pages
        pages = (total + size - 1) // size  # Ceiling division
        
        return GeographicalDataSourceListResponse(
            page=page,
            size=size,
            total=total,
            pages=pages,
            items=items
        )
    
    async def sync_data_source(self, source_id: UUID, background_tasks: BackgroundTasks) -> Dict[str, Any]:
        """
        Trigger a synchronization for a data source
        Can run in the background if needed for large sources
        """
        db_obj = self.db.query(GeographicalDataSource).filter(GeographicalDataSource.id == source_id).first()
        if not db_obj:
            raise HTTPException(status_code=404, detail=f"Geographical data source with ID {source_id} not found")
        
        if not db_obj.source_url:
            raise HTTPException(status_code=400, detail="Data source has no URL configured")
        
        try:
            # For large data sources, use background task
            if db_obj.type in ["countries", "cities", "postal_codes"]:
                background_tasks.add_task(self._sync_data_source_task, db_obj.id)
                return {
                    "status": "syncing",
                    "message": f"Sync started for data source '{db_obj.name}' in the background"
                }
            else:
                # For smaller sources, sync immediately
                await self._perform_sync(db_obj)
                return {
                    "status": "completed",
                    "message": f"Sync completed for data source '{db_obj.name}'"
                }
                
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Sync failed: {str(e)}")
    
    async def _sync_data_source_task(self, source_id: UUID) -> None:
        """Background task for syncing large data sources"""
        db_obj = self.db.query(GeographicalDataSource).filter(GeographicalDataSource.id == source_id).first()
        if db_obj:
            try:
                await self._perform_sync(db_obj)
            except Exception as e:
                # Log error but don't raise - this is a background task
                print(f"Error syncing data source {db_obj.name}: {str(e)}")
    
    async def _perform_sync(self, data_source: GeographicalDataSource) -> None:
        """Perform the actual data synchronization"""
        try:
            response = requests.get(str(data_source.source_url), timeout=30)
            response.raise_for_status()
            
            # Parse data based on format
            if data_source.data_format.lower() == "json":
                fetched_data = response.json()
            elif data_source.data_format.lower() == "csv":
                csv_data = StringIO(response.text)
                reader = csv.DictReader(csv_data)
                fetched_data = list(reader)
            else:
                # Treat as plain text
                fetched_data = response.text
            
            # Update cache
            cache_key = f"{data_source.name}_{data_source.type}"
            self._cached_data[cache_key] = fetched_data
            
            # Update data source metadata
            data_source.last_sync = datetime.utcnow()
            data_source.updated_at = datetime.utcnow()
            
            self.db.add(data_source)
            self.db.commit()
            
        except requests.RequestException as e:
            raise Exception(f"Failed to fetch data: {str(e)}")
        except json.JSONDecodeError:
            raise Exception("Failed to parse JSON data")
        except Exception as e:
            raise Exception(f"Sync error: {str(e)}")
    
    async def get_data(self, source_id: UUID, force_refresh: bool = False) -> Dict[str, Any]:
        """Get data from a source, using cache if available"""
        db_obj = self.db.query(GeographicalDataSource).filter(GeographicalDataSource.id == source_id).first()
        if not db_obj:
            raise HTTPException(status_code=404, detail=f"Geographical data source with ID {source_id} not found")
        
        cache_key = f"{db_obj.name}_{db_obj.type}"
        
        # Check if we need to refresh
        needs_refresh = (
            force_refresh or 
            cache_key not in self._cached_data or 
            (db_obj.last_sync is None) or
            (datetime.utcnow() - db_obj.last_sync).total_seconds() > db_obj.sync_frequency_hours * 3600
        )
        
        if needs_refresh and db_obj.source_url:
            try:
                await self._perform_sync(db_obj)
            except Exception as e:
                # If refresh fails, use cache if available
                if cache_key not in self._cached_data:
                    raise HTTPException(status_code=500, detail=f"Failed to fetch data: {str(e)}")
        
        # Return data from cache
        if cache_key in self._cached_data:
            return {
                "source": {
                    "id": str(db_obj.id),
                    "name": db_obj.name,
                    "type": db_obj.type,
                    "last_sync": db_obj.last_sync.isoformat() if db_obj.last_sync else None
                },
                "data": self._cached_data[cache_key]
            }
        else:
            raise HTTPException(status_code=404, detail="No data available for this source")
    
    async def search_geographical_data(
        self, source_id: UUID, query: str, field: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Search within a geographical data source"""
        # Get data first
        data_result = await self.get_data(source_id)
        data = data_result["data"]
        
        # Simple search implementation
        if not isinstance(data, list):
            raise HTTPException(status_code=400, detail="Data source is not searchable")
        
        results = []
        query = query.lower()
        
        for item in data:
            if field:
                # Search in specific field
                if field in item and str(item[field]).lower().find(query) != -1:
                    results.append(item)
            else:
                # Search in all fields
                for key, value in item.items():
                    if str(value).lower().find(query) != -1:
                        results.append(item)
                        break
        
        return results
    
    async def get_available_data_types(self) -> List[str]:
        """Get list of all data types in use"""
        types = self.db.query(GeographicalDataSource.type).distinct().all()
        return [t[0] for t in types]
