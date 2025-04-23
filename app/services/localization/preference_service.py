from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import UUID
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import desc, asc

from app.db.session import get_db
from app.models.localization import LocalizationPreference, RegionalSetting
from app.schemas.localization import (
    LocalizationPreferenceCreate,
    LocalizationPreferenceUpdate,
    LocalizationPreferenceResponse
)

class LocalizationPreferenceService:
    """Service for managing user localization preferences"""
    
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db
    
    async def create_preference(self, data: LocalizationPreferenceCreate) -> LocalizationPreferenceResponse:
        """Create a new localization preference for a user"""
        try:
            # Check if a preference already exists for this user
            existing = self.db.query(LocalizationPreference).filter(
                LocalizationPreference.user_id == data.user_id
            ).first()
            
            if existing:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Localization preference already exists for user {data.user_id}. Use update instead."
                )
            
            # Verify that the region exists
            region = self.db.query(RegionalSetting).filter(
                RegionalSetting.id == data.region_id,
                RegionalSetting.is_active == True
            ).first()
            
            if not region:
                raise HTTPException(
                    status_code=404, 
                    detail=f"Regional setting with ID {data.region_id} not found or is inactive"
                )
            
            # Create new localization preference
            db_obj = LocalizationPreference(
                user_id=data.user_id,
                region_id=data.region_id,
                use_browser_locale=data.use_browser_locale,
                override_date_format=data.override_date_format,
                override_time_format=data.override_time_format,
                override_timezone=data.override_timezone,
                override_number_format=data.override_number_format,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            self.db.add(db_obj)
            self.db.commit()
            self.db.refresh(db_obj)
            return db_obj
            
        except IntegrityError as e:
            self.db.rollback()
            raise HTTPException(status_code=400, detail=f"Could not create localization preference: {str(e)}")
        except Exception as e:
            self.db.rollback()
            raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    
    async def get_preference(self, preference_id: UUID) -> LocalizationPreferenceResponse:
        """Get localization preference by ID"""
        db_obj = self.db.query(LocalizationPreference).filter(LocalizationPreference.id == preference_id).first()
        if not db_obj:
            raise HTTPException(status_code=404, detail=f"Localization preference with ID {preference_id} not found")
            
        return db_obj
    
    async def get_preference_by_user(self, user_id: UUID) -> LocalizationPreferenceResponse:
        """Get localization preference by user ID"""
        db_obj = self.db.query(LocalizationPreference).filter(LocalizationPreference.user_id == user_id).first()
        if not db_obj:
            raise HTTPException(status_code=404, detail=f"Localization preference for user {user_id} not found")
            
        return db_obj
    
    async def update_preference(
        self, preference_id: UUID, data: LocalizationPreferenceUpdate
    ) -> LocalizationPreferenceResponse:
        """Update localization preference"""
        db_obj = self.db.query(LocalizationPreference).filter(LocalizationPreference.id == preference_id).first()
        if not db_obj:
            raise HTTPException(status_code=404, detail=f"Localization preference with ID {preference_id} not found")
        
        try:
            # Verify that the region exists if it's being updated
            if data.region_id:
                region = self.db.query(RegionalSetting).filter(
                    RegionalSetting.id == data.region_id,
                    RegionalSetting.is_active == True
                ).first()
                
                if not region:
                    raise HTTPException(
                        status_code=404, 
                        detail=f"Regional setting with ID {data.region_id} not found or is inactive"
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
            return db_obj
            
        except IntegrityError as e:
            self.db.rollback()
            raise HTTPException(status_code=400, detail=f"Could not update localization preference: {str(e)}")
        except Exception as e:
            self.db.rollback()
            raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    
    async def update_preference_by_user(
        self, user_id: UUID, data: LocalizationPreferenceUpdate
    ) -> LocalizationPreferenceResponse:
        """Update localization preference by user ID"""
        db_obj = self.db.query(LocalizationPreference).filter(LocalizationPreference.user_id == user_id).first()
        
        if not db_obj:
            # If no preference exists, create one if we have region_id
            if data.region_id:
                create_data = LocalizationPreferenceCreate(
                    user_id=user_id,
                    region_id=data.region_id,
                    use_browser_locale=data.use_browser_locale if data.use_browser_locale is not None else True,
                    override_date_format=data.override_date_format,
                    override_time_format=data.override_time_format,
                    override_timezone=data.override_timezone,
                    override_number_format=data.override_number_format
                )
                return await self.create_preference(create_data)
            else:
                raise HTTPException(
                    status_code=404, 
                    detail=f"Localization preference for user {user_id} not found and region_id is required to create"
                )
        
        # Otherwise, update existing preference
        return await self.update_preference(db_obj.id, data)
    
    async def delete_preference(self, preference_id: UUID) -> bool:
        """Delete localization preference"""
        db_obj = self.db.query(LocalizationPreference).filter(LocalizationPreference.id == preference_id).first()
        if not db_obj:
            raise HTTPException(status_code=404, detail=f"Localization preference with ID {preference_id} not found")
        
        try:
            self.db.delete(db_obj)
            self.db.commit()
            return True
            
        except Exception as e:
            self.db.rollback()
            raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    
    async def delete_preference_by_user(self, user_id: UUID) -> bool:
        """Delete localization preference by user ID"""
        db_obj = self.db.query(LocalizationPreference).filter(LocalizationPreference.user_id == user_id).first()
        if not db_obj:
            raise HTTPException(status_code=404, detail=f"Localization preference for user {user_id} not found")
        
        try:
            self.db.delete(db_obj)
            self.db.commit()
            return True
            
        except Exception as e:
            self.db.rollback()
            raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    
    async def reset_preference(self, preference_id: UUID) -> LocalizationPreferenceResponse:
        """Reset preference overrides while keeping the region setting"""
        db_obj = self.db.query(LocalizationPreference).filter(LocalizationPreference.id == preference_id).first()
        if not db_obj:
            raise HTTPException(status_code=404, detail=f"Localization preference with ID {preference_id} not found")
        
        try:
            # Reset all override fields
            db_obj.override_date_format = None
            db_obj.override_time_format = None
            db_obj.override_timezone = None
            db_obj.override_number_format = None
            db_obj.use_browser_locale = True
            db_obj.updated_at = datetime.utcnow()
            
            self.db.add(db_obj)
            self.db.commit()
            self.db.refresh(db_obj)
            return db_obj
            
        except Exception as e:
            self.db.rollback()
            raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    
    async def get_effective_settings(self, user_id: UUID, browser_locale: Optional[str] = None) -> Dict[str, Any]:
        """
        Get effective localization settings for a user
        Takes into account user preferences, region settings, and browser locale
        """
        # Try to get user preference
        preference = self.db.query(LocalizationPreference).filter(
            LocalizationPreference.user_id == user_id
        ).first()
        
        if not preference:
            # If no preference exists, use default region (e.g., en-US)
            default_region = self.db.query(RegionalSetting).filter(
                RegionalSetting.code == "en-US",
                RegionalSetting.is_active == True
            ).first()
            
            if not default_region:
                # Fall back to any active region
                default_region = self.db.query(RegionalSetting).filter(
                    RegionalSetting.is_active == True
                ).first()
                
                if not default_region:
                    raise HTTPException(status_code=404, detail="No active regional settings found")
            
            # Return default settings
            return {
                "date_format": default_region.date_format,
                "time_format": default_region.time_format,
                "timezone": default_region.timezone,
                "number_format": default_region.number_format,
                "measurement_system": default_region.measurement_system,
                "week_start": default_region.week_start,
                "region_code": default_region.code,
                "region_name": default_region.name,
                "source": "default_region"
            }
        
        # Get the region from user preference
        region = self.db.query(RegionalSetting).filter(
            RegionalSetting.id == preference.region_id,
            RegionalSetting.is_active == True
        ).first()
        
        if not region:
            # Fall back to default if the saved region is inactive
            default_region = self.db.query(RegionalSetting).filter(
                RegionalSetting.code == "en-US",
                RegionalSetting.is_active == True
            ).first() or self.db.query(RegionalSetting).filter(
                RegionalSetting.is_active == True
            ).first()
            
            if not default_region:
                raise HTTPException(status_code=404, detail="No active regional settings found")
            
            region = default_region
        
        # Apply browser locale if enabled and provided
        if preference.use_browser_locale and browser_locale:
            # Try to find a region that matches the browser locale
            browser_region = self.db.query(RegionalSetting).filter(
                RegionalSetting.code == browser_locale,
                RegionalSetting.is_active == True
            ).first()
            
            if browser_region:
                region = browser_region
        
        # Start with region settings
        settings = {
            "date_format": region.date_format,
            "time_format": region.time_format,
            "timezone": region.timezone,
            "number_format": region.number_format,
            "measurement_system": region.measurement_system,
            "week_start": region.week_start,
            "region_code": region.code,
            "region_name": region.name,
            "source": "region_setting"
        }
        
        # Apply preference overrides if they exist
        if preference.override_date_format:
            settings["date_format"] = preference.override_date_format
            settings["source"] = "user_preference"
            
        if preference.override_time_format:
            settings["time_format"] = preference.override_time_format
            settings["source"] = "user_preference"
            
        if preference.override_timezone:
            settings["timezone"] = preference.override_timezone
            settings["source"] = "user_preference"
            
        if preference.override_number_format:
            settings["number_format"] = preference.override_number_format
            settings["source"] = "user_preference"
        
        return settings
