from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.security import verify_project_access
from app.db.models.user import User
from app.schemas.roi import ROIInput, ROIOutput, ROIListItem
from app.services.roi_service import ROICalculationService

router = APIRouter()

# Mock database for ROI calculations during development
# This would be replaced with proper database models and repositories in production
mock_roi_db = {}


@router.post("/", response_model=ROIOutput)
def create_roi_calculation(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    roi_input: ROIInput,
) -> ROIOutput:
    """
    Create a new ROI calculation
    """
    # If project_id is provided, verify access
    if roi_input.project_id:
        verify_project_access(db, current_user.id, roi_input.project_id)
    
    # Calculate ROI using the service
    roi_service = ROICalculationService()
    result = roi_service.calculate_roi(roi_input)
    
    # Save to mock database (replace with actual DB in production)
    mock_roi_db[result.id] = result
    
    return result


@router.get("/", response_model=List[ROIListItem])
def list_roi_calculations(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    project_id: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
) -> List[ROIListItem]:
    """
    List ROI calculations, optionally filtered by project
    """
    # If project_id is provided, verify access
    if project_id:
        verify_project_access(db, current_user.id, project_id)
    
    # Filter calculations by project_id if provided
    if project_id:
        calculations = [
            ROIListItem(
                id=calc.id,
                project_id=calc.project_id,
                name=calc.name,
                roi_percentage=calc.results.roi_percentage,
                net_present_value=calc.results.net_present_value,
                created_at=calc.created_at
            )
            for calc in mock_roi_db.values()
            if calc.project_id == project_id
        ]
    else:
        # Only show calculations for projects user has access to
        # For simplicity, we'll just return all in this mock implementation
        calculations = [
            ROIListItem(
                id=calc.id,
                project_id=calc.project_id,
                name=calc.name,
                roi_percentage=calc.results.roi_percentage,
                net_present_value=calc.results.net_present_value,
                created_at=calc.created_at
            )
            for calc in mock_roi_db.values()
        ]
    
    # Apply pagination
    return calculations[skip : skip + limit]


@router.get("/{roi_id}", response_model=ROIOutput)
def get_roi_calculation(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    roi_id: str = Path(...),
) -> ROIOutput:
    """
    Get a specific ROI calculation by ID
    """
    # Check if calculation exists
    if roi_id not in mock_roi_db:
        raise HTTPException(status_code=404, detail="ROI calculation not found")
    
    calculation = mock_roi_db[roi_id]
    
    # If associated with a project, verify access
    if calculation.project_id:
        verify_project_access(db, current_user.id, calculation.project_id)
    
    return calculation


@router.put("/{roi_id}", response_model=ROIOutput)
def update_roi_calculation(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    roi_id: str = Path(...),
    roi_input: ROIInput,
) -> ROIOutput:
    """
    Update an existing ROI calculation
    """
    # Check if calculation exists
    if roi_id not in mock_roi_db:
        raise HTTPException(status_code=404, detail="ROI calculation not found")
    
    original_calculation = mock_roi_db[roi_id]
    
    # If associated with a project, verify access
    if original_calculation.project_id:
        verify_project_access(db, current_user.id, original_calculation.project_id)
    
    # If new project_id is provided, verify access
    if roi_input.project_id and roi_input.project_id != original_calculation.project_id:
        verify_project_access(db, current_user.id, roi_input.project_id)
    
    # Recalculate ROI with new inputs
    roi_service = ROICalculationService()
    result = roi_service.calculate_roi(roi_input)
    
    # Preserve original ID
    result.id = roi_id
    
    # Update in mock database
    mock_roi_db[roi_id] = result
    
    return result


@router.delete("/{roi_id}", response_model=ROIOutput)
def delete_roi_calculation(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    roi_id: str = Path(...),
) -> ROIOutput:
    """
    Delete an ROI calculation
    """
    # Check if calculation exists
    if roi_id not in mock_roi_db:
        raise HTTPException(status_code=404, detail="ROI calculation not found")
    
    calculation = mock_roi_db[roi_id]
    
    # If associated with a project, verify access
    if calculation.project_id:
        verify_project_access(db, current_user.id, calculation.project_id)
    
    # Delete from mock database
    deleted_calculation = mock_roi_db.pop(roi_id)
    
    return deleted_calculation
