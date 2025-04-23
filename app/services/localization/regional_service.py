from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import UUID
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import desc, asc

from app.db.session import get_db
from app.models.localization import RegionalSetting
from app.schemas.localization import (
    RegionalSettingCreate, 
    RegionalSettingUpdate,
    RegionalSettingResponse,
    RegionalSettingListResponse
)

class RegionalSettingService:
    """Service for managing regional settings"""
    
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db
    
    async def create_regional_setting(self, data: RegionalSettingCreate) -> RegionalSettingResponse:
        """Create a new regional setting"""
        try:
            # Check if a region with the same code already exists
            existing = self.db.query(RegionalSetting).filter(RegionalSetting.code == data.code).first()
            if existing:
                raise HTTPException(status_code=400, detail=f"Region with code '{data.code}' already exists")
                
            # Set default number format if not provided
            number_format = data.number_format or {
                "decimal_separator": ".",
                "thousands_separator": ",",
                "currency_symbol": "$",
                "currency_symbol_position": "prefix"
            }
                
            # Create new regional setting
            db_obj = RegionalSetting(
                name=data.name,
                code=data.code,
                date_format=data.date_format,
                time_format=data.time_format,
                timezone=data.timezone,
                number_format=number_format,
                measurement_system=data.measurement_system,
                week_start=data.week_start,
                is_active=data.is_active,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            self.db.add(db_obj)
            self.db.commit()
            self.db.refresh(db_obj)
            return db_obj
            
        except IntegrityError as e:
            self.db.rollback()
            raise HTTPException(status_code=400, detail=f"Could not create regional setting: {str(e)}")
        except Exception as e:
            self.db.rollback()
            raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    
    async def get_regional_setting(self, setting_id: UUID) -> RegionalSettingResponse:
        """Get regional setting by ID"""
        db_obj = self.db.query(RegionalSetting).filter(RegionalSetting.id == setting_id).first()
        if not db_obj:
            raise HTTPException(status_code=404, detail=f"Regional setting with ID {setting_id} not found")
            
        return db_obj
    
    async def get_regional_setting_by_code(self, code: str) -> RegionalSettingResponse:
        """Get regional setting by code"""
        db_obj = self.db.query(RegionalSetting).filter(RegionalSetting.code == code).first()
        if not db_obj:
            raise HTTPException(status_code=404, detail=f"Regional setting with code {code} not found")
            
        return db_obj
    
    async def update_regional_setting(self, setting_id: UUID, data: RegionalSettingUpdate) -> RegionalSettingResponse:
        """Update regional setting"""
        db_obj = self.db.query(RegionalSetting).filter(RegionalSetting.id == setting_id).first()
        if not db_obj:
            raise HTTPException(status_code=404, detail=f"Regional setting with ID {setting_id} not found")
        
        try:
            # Check for code uniqueness if code is being updated
            if data.code and data.code != db_obj.code:
                existing = self.db.query(RegionalSetting).filter(RegionalSetting.code == data.code).first()
                if existing:
                    raise HTTPException(status_code=400, detail=f"Region with code '{data.code}' already exists")
            
            # Update fields if provided in the update data
            update_data = data.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_obj, field, value)
            
            # Always update the timestamp
            db_obj.updated_at = datetime.utcnow()
            
            self.db.add(db_obj)
            self.db.commit()
            self.db.refresh(db_obj)
            return db_obj
            
        except IntegrityError as e:
            self.db.rollback()
            raise HTTPException(status_code=400, detail=f"Could not update regional setting: {str(e)}")
        except Exception as e:
            self.db.rollback()
            raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    
    async def delete_regional_setting(self, setting_id: UUID) -> bool:
        """Delete regional setting"""
        db_obj = self.db.query(RegionalSetting).filter(RegionalSetting.id == setting_id).first()
        if not db_obj:
            raise HTTPException(status_code=404, detail=f"Regional setting with ID {setting_id} not found")
        
        try:
            # Check if there are any dependencies before deleting
            # For example, check if any users have this region set as their preference
            # This would need additional queries to check relationships
            
            self.db.delete(db_obj)
            self.db.commit()
            return True
            
        except IntegrityError:
            self.db.rollback()
            # Instead of deleting, deactivate the setting
            return await self.deactivate_regional_setting(setting_id)
        except Exception as e:
            self.db.rollback()
            raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    
    async def deactivate_regional_setting(self, setting_id: UUID) -> RegionalSettingResponse:
        """Deactivate regional setting instead of deleting (soft delete)"""
        db_obj = self.db.query(RegionalSetting).filter(RegionalSetting.id == setting_id).first()
        if not db_obj:
            raise HTTPException(status_code=404, detail=f"Regional setting with ID {setting_id} not found")
        
        db_obj.is_active = False
        db_obj.updated_at = datetime.utcnow()
        
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj
    
    async def list_regional_settings(
        self, 
        page: int = 1, 
        size: int = 10, 
        active_only: bool = True,
        search: Optional[str] = None,
        sort_by: str = "name",
        sort_dir: str = "asc"
    ) -> RegionalSettingListResponse:
        """List regional settings with pagination and filtering"""
        # Start with base query
        query = self.db.query(RegionalSetting)
        
        # Apply filters
        if active_only:
            query = query.filter(RegionalSetting.is_active == True)
            
        if search:
            query = query.filter(RegionalSetting.name.ilike(f"%{search}%") | 
                               RegionalSetting.code.ilike(f"%{search}%"))
        
        # Count total items for pagination
        total = query.count()
        
        # Apply sorting
        if sort_by not in ["name", "code", "created_at", "updated_at"]:
            sort_by = "name"  # Default sort by name
            
        if sort_dir.lower() == "desc":
            query = query.order_by(desc(getattr(RegionalSetting, sort_by)))
        else:
            query = query.order_by(asc(getattr(RegionalSetting, sort_by)))
        
        # Apply pagination
        query = query.offset((page - 1) * size).limit(size)
        
        # Execute query
        items = query.all()
        
        # Calculate pages
        pages = (total + size - 1) // size  # Ceiling division
        
        return RegionalSettingListResponse(
            page=page,
            size=size,
            total=total,
            pages=pages,
            items=items
        )
    
    async def get_supported_timezones(self) -> List[Dict[str, Any]]:
        """Get list of supported timezones"""
        # Return a list of common timezones with metadata
        import pytz
        
        common_timezones = [
            {"code": tz, "name": tz.replace("_", " "), "offset": self._get_timezone_offset(tz)}
            for tz in pytz.common_timezones
        ]
        
        return sorted(common_timezones, key=lambda x: x["code"])
    
    def _get_timezone_offset(self, tz_name: str) -> str:
        """Helper to get timezone offset string (e.g., +08:00)"""
        import pytz
        from datetime import datetime
        
        try:
            tz = pytz.timezone(tz_name)
            offset = tz.utcoffset(datetime.utcnow())
            hours, remainder = divmod(offset.total_seconds(), 3600)
            minutes, _ = divmod(remainder, 60)
            sign = "+" if hours >= 0 else "-"
            return f"{sign}{int(abs(hours)):02d}:{int(abs(minutes)):02d}"
        except Exception:
            return "UTC"
