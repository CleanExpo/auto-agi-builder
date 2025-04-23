from typing import List, Optional
from datetime import datetime
from uuid import UUID
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import desc, asc

from app.db.session import get_db
from app.models.localization import RegulatoryCompliance
from app.schemas.localization import (
    RegulatoryComplianceCreate,
    RegulatoryComplianceUpdate,
    RegulatoryComplianceResponse,
    RegulatoryComplianceListResponse
)

class RegulatoryComplianceService:
    """Service for managing regulatory compliance rules"""
    
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db
    
    async def create_regulatory_compliance(self, data: RegulatoryComplianceCreate) -> RegulatoryComplianceResponse:
        """Create a new regulatory compliance record"""
        try:
            # Check if a similar compliance record already exists for this region
            existing = self.db.query(RegulatoryCompliance).filter(
                RegulatoryCompliance.region_id == data.region_id,
                RegulatoryCompliance.name == data.name,
                RegulatoryCompliance.type == data.type
            ).first()
            
            if existing:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Regulatory compliance record with name '{data.name}' and type '{data.type}' already exists for this region"
                )
            
            # Set effective date if not provided
            effective_date = data.effective_date or datetime.utcnow()
            
            # Create new regulatory compliance
            db_obj = RegulatoryCompliance(
                region_id=data.region_id,
                name=data.name,
                type=data.type,
                description=data.description,
                requirements=data.requirements,
                documentation_url=data.documentation_url,
                is_mandatory=data.is_mandatory,
                is_active=data.is_active,
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
            raise HTTPException(status_code=400, detail=f"Could not create regulatory compliance record: {str(e)}")
        except Exception as e:
            self.db.rollback()
            raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    
    async def get_regulatory_compliance(self, compliance_id: UUID) -> RegulatoryComplianceResponse:
        """Get regulatory compliance by ID"""
        db_obj = self.db.query(RegulatoryCompliance).filter(RegulatoryCompliance.id == compliance_id).first()
        if not db_obj:
            raise HTTPException(status_code=404, detail=f"Regulatory compliance with ID {compliance_id} not found")
            
        return db_obj
    
    async def get_regulatory_compliances_by_region_and_type(
        self, region_id: UUID, compliance_type: str
    ) -> List[RegulatoryComplianceResponse]:
        """Get regulatory compliances by region and type"""
        db_objs = self.db.query(RegulatoryCompliance).filter(
            RegulatoryCompliance.region_id == region_id,
            RegulatoryCompliance.type == compliance_type,
            RegulatoryCompliance.is_active == True
        ).all()
        
        return db_objs
    
    async def update_regulatory_compliance(
        self, compliance_id: UUID, data: RegulatoryComplianceUpdate
    ) -> RegulatoryComplianceResponse:
        """Update regulatory compliance"""
        db_obj = self.db.query(RegulatoryCompliance).filter(RegulatoryCompliance.id == compliance_id).first()
        if not db_obj:
            raise HTTPException(status_code=404, detail=f"Regulatory compliance with ID {compliance_id} not found")
        
        try:
            # Check for uniqueness if name and type are being updated
            if (data.name or data.type) and data.region_id:
                name_to_check = data.name or db_obj.name
                type_to_check = data.type or db_obj.type
                
                existing = self.db.query(RegulatoryCompliance).filter(
                    RegulatoryCompliance.region_id == data.region_id,
                    RegulatoryCompliance.name == name_to_check,
                    RegulatoryCompliance.type == type_to_check,
                    RegulatoryCompliance.id != compliance_id
                ).first()
                
                if existing:
                    raise HTTPException(
                        status_code=400, 
                        detail=f"Regulatory compliance with name '{name_to_check}' and type '{type_to_check}' already exists for this region"
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
            raise HTTPException(status_code=400, detail=f"Could not update regulatory compliance: {str(e)}")
        except Exception as e:
            self.db.rollback()
            raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    
    async def delete_regulatory_compliance(self, compliance_id: UUID) -> bool:
        """Delete regulatory compliance"""
        db_obj = self.db.query(RegulatoryCompliance).filter(RegulatoryCompliance.id == compliance_id).first()
        if not db_obj:
            raise HTTPException(status_code=404, detail=f"Regulatory compliance with ID {compliance_id} not found")
        
        try:
            # Check if there are any dependencies before deleting
            # This would need additional queries to check relationships
            
            self.db.delete(db_obj)
            self.db.commit()
            return True
            
        except IntegrityError:
            self.db.rollback()
            # Instead of deleting, deactivate
            return await self.deactivate_regulatory_compliance(compliance_id)
        except Exception as e:
            self.db.rollback()
            raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    
    async def deactivate_regulatory_compliance(self, compliance_id: UUID) -> RegulatoryComplianceResponse:
        """Deactivate regulatory compliance instead of deleting (soft delete)"""
        db_obj = self.db.query(RegulatoryCompliance).filter(RegulatoryCompliance.id == compliance_id).first()
        if not db_obj:
            raise HTTPException(status_code=404, detail=f"Regulatory compliance with ID {compliance_id} not found")
        
        db_obj.is_active = False
        db_obj.updated_at = datetime.utcnow()
        
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj
    
    async def list_regulatory_compliances(
        self, 
        region_id: Optional[UUID] = None,
        compliance_type: Optional[str] = None,
        is_mandatory: Optional[bool] = None,
        page: int = 1, 
        size: int = 10, 
        active_only: bool = True,
        search: Optional[str] = None,
        sort_by: str = "name",
        sort_dir: str = "asc"
    ) -> RegulatoryComplianceListResponse:
        """List regulatory compliances with pagination and filtering"""
        # Start with base query
        query = self.db.query(RegulatoryCompliance)
        
        # Apply filters
        if region_id:
            query = query.filter(RegulatoryCompliance.region_id == region_id)
            
        if compliance_type:
            query = query.filter(RegulatoryCompliance.type == compliance_type)
            
        if is_mandatory is not None:
            query = query.filter(RegulatoryCompliance.is_mandatory == is_mandatory)
            
        if active_only:
            query = query.filter(RegulatoryCompliance.is_active == True)
            
        if search:
            query = query.filter(RegulatoryCompliance.name.ilike(f"%{search}%") | 
                              RegulatoryCompliance.description.ilike(f"%{search}%"))
        
        # Count total items for pagination
        total = query.count()
        
        # Apply sorting
        if sort_by not in ["name", "type", "effective_date", "created_at"]:
            sort_by = "name"  # Default sort by name
            
        if sort_dir.lower() == "desc":
            query = query.order_by(desc(getattr(RegulatoryCompliance, sort_by)))
        else:
            query = query.order_by(asc(getattr(RegulatoryCompliance, sort_by)))
        
        # Apply pagination
        query = query.offset((page - 1) * size).limit(size)
        
        # Execute query
        items = query.all()
        
        # Calculate pages
        pages = (total + size - 1) // size  # Ceiling division
        
        return RegulatoryComplianceListResponse(
            page=page,
            size=size,
            total=total,
            pages=pages,
            items=items
        )
    
    async def get_compliance_by_requirement(self, requirement_text: str) -> List[RegulatoryComplianceResponse]:
        """Find compliance records that have a specific requirement text"""
        # This would typically need a more complex query or a full-text search capability
        # Here's a simple implementation that checks if the requirement_text is in the requirements list
        result = []
        all_compliances = self.db.query(RegulatoryCompliance).filter(RegulatoryCompliance.is_active == True).all()
        
        for compliance in all_compliances:
            if any(requirement_text.lower() in req.lower() for req in compliance.requirements):
                result.append(compliance)
        
        return result
    
    async def get_compliance_types(self) -> List[str]:
        """Get list of all compliance types in use"""
        types = self.db.query(RegulatoryCompliance.type).distinct().all()
        return [t[0] for t in types]
    
    async def check_compliance_requirements(self, region_id: UUID) -> dict:
        """
        Check all compliance requirements for a region
        Returns a dictionary with stats on mandatory vs optional requirements
        """
        # Get all active compliance records for the region
        compliances = self.db.query(RegulatoryCompliance).filter(
            RegulatoryCompliance.region_id == region_id,
            RegulatoryCompliance.is_active == True
        ).all()
        
        # Calculate stats
        total_compliances = len(compliances)
        mandatory_compliances = sum(1 for c in compliances if c.is_mandatory)
        optional_compliances = total_compliances - mandatory_compliances
        
        total_requirements = sum(len(c.requirements) for c in compliances)
        
        # Group by type
        compliance_by_type = {}
        for compliance in compliances:
            if compliance.type not in compliance_by_type:
                compliance_by_type[compliance.type] = {
                    "count": 0,
                    "mandatory": 0,
                    "requirements": 0
                }
            
            compliance_by_type[compliance.type]["count"] += 1
            if compliance.is_mandatory:
                compliance_by_type[compliance.type]["mandatory"] += 1
            compliance_by_type[compliance.type]["requirements"] += len(compliance.requirements)
        
        return {
            "total_compliances": total_compliances,
            "mandatory_compliances": mandatory_compliances,
            "optional_compliances": optional_compliances,
            "total_requirements": total_requirements,
            "compliance_by_type": compliance_by_type
        }
