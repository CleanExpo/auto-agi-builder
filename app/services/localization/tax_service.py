from typing import List, Optional
from datetime import datetime
from uuid import UUID
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import desc, asc

from app.db.session import get_db
from app.models.localization import TaxConfiguration
from app.schemas.localization import (
    TaxConfigurationCreate,
    TaxConfigurationUpdate,
    TaxConfigurationResponse,
    TaxConfigurationListResponse
)

class TaxConfigurationService:
    """Service for managing tax configurations"""
    
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db
    
    async def create_tax_configuration(self, data: TaxConfigurationCreate) -> TaxConfigurationResponse:
        """Create a new tax configuration"""
        try:
            # Check if the same tax code already exists for this region
            existing = self.db.query(TaxConfiguration).filter(
                TaxConfiguration.region_id == data.region_id,
                TaxConfiguration.code == data.code
            ).first()
            
            if existing:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Tax configuration with code '{data.code}' already exists for this region"
                )
            
            # If this is set as default, unset any other defaults for this region
            if data.is_default:
                self._unset_default_tax_configurations(data.region_id)
            
            # Set effective date if not provided
            effective_date = data.effective_date or datetime.utcnow()
            
            # Create new tax configuration
            db_obj = TaxConfiguration(
                region_id=data.region_id,
                name=data.name,
                code=data.code,
                description=data.description,
                rate=data.rate,
                is_default=data.is_default,
                is_active=data.is_active,
                applies_to_digital=data.applies_to_digital,
                applies_to_physical=data.applies_to_physical,
                applies_to_services=data.applies_to_services,
                threshold_amount=data.threshold_amount,
                effective_date=effective_date,
                expiry_date=data.expiry_date,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            self.db.add(db_obj)
            self.db.commit()
            self.db.refresh(db_obj)
            return db_obj
            
        except IntegrityError as e:
            self.db.rollback()
            raise HTTPException(status_code=400, detail=f"Could not create tax configuration: {str(e)}")
        except Exception as e:
            self.db.rollback()
            raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    
    def _unset_default_tax_configurations(self, region_id: UUID) -> None:
        """Helper to unset default flag on all tax configurations for a region"""
        self.db.query(TaxConfiguration).filter(
            TaxConfiguration.region_id == region_id,
            TaxConfiguration.is_default == True
        ).update({TaxConfiguration.is_default: False})
    
    async def get_tax_configuration(self, config_id: UUID) -> TaxConfigurationResponse:
        """Get tax configuration by ID"""
        db_obj = self.db.query(TaxConfiguration).filter(TaxConfiguration.id == config_id).first()
        if not db_obj:
            raise HTTPException(status_code=404, detail=f"Tax configuration with ID {config_id} not found")
            
        return db_obj
    
    async def get_tax_configuration_by_code(self, region_id: UUID, code: str) -> TaxConfigurationResponse:
        """Get tax configuration by region and code"""
        db_obj = self.db.query(TaxConfiguration).filter(
            TaxConfiguration.region_id == region_id,
            TaxConfiguration.code == code
        ).first()
        
        if not db_obj:
            raise HTTPException(
                status_code=404, 
                detail=f"Tax configuration with code {code} not found for the specified region"
            )
            
        return db_obj
    
    async def get_default_tax_configuration(self, region_id: UUID) -> Optional[TaxConfigurationResponse]:
        """Get default tax configuration for a region"""
        db_obj = self.db.query(TaxConfiguration).filter(
            TaxConfiguration.region_id == region_id,
            TaxConfiguration.is_default == True,
            TaxConfiguration.is_active == True
        ).first()
        
        return db_obj
    
    async def update_tax_configuration(
        self, config_id: UUID, data: TaxConfigurationUpdate
    ) -> TaxConfigurationResponse:
        """Update tax configuration"""
        db_obj = self.db.query(TaxConfiguration).filter(TaxConfiguration.id == config_id).first()
        if not db_obj:
            raise HTTPException(status_code=404, detail=f"Tax configuration with ID {config_id} not found")
        
        try:
            # Check if updating the code and it already exists
            if data.code and data.code != db_obj.code and data.region_id:
                existing = self.db.query(TaxConfiguration).filter(
                    TaxConfiguration.region_id == data.region_id,
                    TaxConfiguration.code == data.code,
                    TaxConfiguration.id != config_id
                ).first()
                
                if existing:
                    raise HTTPException(
                        status_code=400, 
                        detail=f"Tax configuration with code '{data.code}' already exists for this region"
                    )
            
            # If setting as default, unset other defaults
            if data.is_default and data.is_default != db_obj.is_default:
                region_id = data.region_id or db_obj.region_id
                self._unset_default_tax_configurations(region_id)
            
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
            raise HTTPException(status_code=400, detail=f"Could not update tax configuration: {str(e)}")
        except Exception as e:
            self.db.rollback()
            raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    
    async def delete_tax_configuration(self, config_id: UUID) -> bool:
        """Delete tax configuration"""
        db_obj = self.db.query(TaxConfiguration).filter(TaxConfiguration.id == config_id).first()
        if not db_obj:
            raise HTTPException(status_code=404, detail=f"Tax configuration with ID {config_id} not found")
        
        try:
            # Check if there are any dependencies before deleting
            # This would need additional queries to check relationships
            
            self.db.delete(db_obj)
            self.db.commit()
            return True
            
        except IntegrityError:
            self.db.rollback()
            # Instead of deleting, deactivate
            return await self.deactivate_tax_configuration(config_id)
        except Exception as e:
            self.db.rollback()
            raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    
    async def deactivate_tax_configuration(self, config_id: UUID) -> TaxConfigurationResponse:
        """Deactivate tax configuration instead of deleting (soft delete)"""
        db_obj = self.db.query(TaxConfiguration).filter(TaxConfiguration.id == config_id).first()
        if not db_obj:
            raise HTTPException(status_code=404, detail=f"Tax configuration with ID {config_id} not found")
        
        db_obj.is_active = False
        db_obj.updated_at = datetime.utcnow()
        
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj
    
    async def list_tax_configurations(
        self, 
        region_id: Optional[UUID] = None,
        page: int = 1, 
        size: int = 10, 
        active_only: bool = True,
        search: Optional[str] = None,
        sort_by: str = "name",
        sort_dir: str = "asc"
    ) -> TaxConfigurationListResponse:
        """List tax configurations with pagination and filtering"""
        # Start with base query
        query = self.db.query(TaxConfiguration)
        
        # Apply filters
        if region_id:
            query = query.filter(TaxConfiguration.region_id == region_id)
            
        if active_only:
            query = query.filter(TaxConfiguration.is_active == True)
            
        if search:
            query = query.filter(TaxConfiguration.name.ilike(f"%{search}%") | 
                              TaxConfiguration.code.ilike(f"%{search}%") |
                              TaxConfiguration.description.ilike(f"%{search}%"))
        
        # Count total items for pagination
        total = query.count()
        
        # Apply sorting
        if sort_by not in ["name", "code", "rate", "effective_date", "created_at"]:
            sort_by = "name"  # Default sort by name
            
        if sort_dir.lower() == "desc":
            query = query.order_by(desc(getattr(TaxConfiguration, sort_by)))
        else:
            query = query.order_by(asc(getattr(TaxConfiguration, sort_by)))
        
        # Apply pagination
        query = query.offset((page - 1) * size).limit(size)
        
        # Execute query
        items = query.all()
        
        # Calculate pages
        pages = (total + size - 1) // size  # Ceiling division
        
        return TaxConfigurationListResponse(
            page=page,
            size=size,
            total=total,
            pages=pages,
            items=items
        )
    
    async def get_tax_rate(
        self, 
        region_id: UUID, 
        product_type: str = "digital", 
        amount: Optional[float] = None
    ) -> float:
        """
        Get applicable tax rate for a product type and amount
        This can be used by checkout and pricing calculations
        """
        # Map product type to the appropriate filter
        filters = {
            "digital": TaxConfiguration.applies_to_digital == True,
            "physical": TaxConfiguration.applies_to_physical == True,
            "service": TaxConfiguration.applies_to_services == True
        }
        
        if product_type not in filters:
            product_type = "digital"  # Default to digital
        
        # Build query
        query = self.db.query(TaxConfiguration).filter(
            TaxConfiguration.region_id == region_id,
            TaxConfiguration.is_active == True,
            filters[product_type]
        )
        
        # Add threshold filter if amount is provided
        if amount is not None:
            query = query.filter(
                (TaxConfiguration.threshold_amount.is_(None)) | 
                (TaxConfiguration.threshold_amount <= amount)
            )
        
        # Try to get default first
        tax_config = query.filter(TaxConfiguration.is_default == True).first()
        
        # If no default, get any matching configuration
        if not tax_config:
            tax_config = query.first()
        
        # Return tax rate or 0 if no configuration found
        return tax_config.rate if tax_config else 0.0
