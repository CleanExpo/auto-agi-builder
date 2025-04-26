from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from app.api.deps import get_db, get_current_user
from app.db.models.user import User
from app.services import roadmap_service, project_service
from app.schemas.roadmap import (
    Phase, PhaseCreate, PhaseUpdate, 
    Milestone, MilestoneCreate, MilestoneUpdate,
    Roadmap
)

router = APIRouter()


@router.post("/projects/{project_id}/phases/", response_model=Phase, status_code=status.HTTP_201_CREATED)
def create_phase(
    project_id: uuid.UUID = Path(..., description="Project ID"),
    phase_data: PhaseCreate = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new project phase"""
    # Verify project exists and user has permission
    project = project_service.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project.owner_id != current_user.id and current_user.id not in [c.id for c in project.contributors]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Create phase with project_id from URL
    phase_create = PhaseCreate(**phase_data.dict(), project_id=project_id)
    phase = roadmap_service.create_phase(db, phase_create)
    return phase


@router.get("/projects/{project_id}/phases/", response_model=List[Phase])
def get_project_phases(
    project_id: uuid.UUID = Path(..., description="Project ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all phases for a project"""
    # Verify project exists and user has permission
    project = project_service.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if (project.owner_id != current_user.id and 
        current_user.id not in [c.id for c in project.contributors] and 
        not project.is_public):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return roadmap_service.get_phases_by_project(db, project_id, skip, limit)


@router.get("/phases/{phase_id}", response_model=Phase)
def get_phase(
    phase_id: uuid.UUID = Path(..., description="Phase ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific phase by ID"""
    phase = roadmap_service.get_phase(db, phase_id)
    if not phase:
        raise HTTPException(status_code=404, detail="Phase not found")
    
    # Verify user has permission to access the phase through project
    project = project_service.get_project(db, phase.project_id)
    if (project.owner_id != current_user.id and 
        current_user.id not in [c.id for c in project.contributors] and 
        not project.is_public):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return phase


@router.put("/phases/{phase_id}", response_model=Phase)
def update_phase(
    phase_id: uuid.UUID = Path(..., description="Phase ID"),
    phase_update: PhaseUpdate = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a project phase"""
    # Check if phase exists
    phase = roadmap_service.get_phase(db, phase_id)
    if not phase:
        raise HTTPException(status_code=404, detail="Phase not found")
    
    # Verify user has permission to modify the phase through project
    project = project_service.get_project(db, phase.project_id)
    if project.owner_id != current_user.id and current_user.id not in [c.id for c in project.contributors]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Update the phase
    updated_phase = roadmap_service.update_phase(db, phase_id, phase_update)
    return updated_phase


@router.delete("/phases/{phase_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_phase(
    phase_id: uuid.UUID = Path(..., description="Phase ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a project phase (soft delete)"""
    # Check if phase exists
    phase = roadmap_service.get_phase(db, phase_id)
    if not phase:
        raise HTTPException(status_code=404, detail="Phase not found")
    
    # Verify user has permission to delete the phase through project
    project = project_service.get_project(db, phase.project_id)
    if project.owner_id != current_user.id and current_user.id not in [c.id for c in project.contributors]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Delete (soft) the phase
    success = roadmap_service.delete_phase(db, phase_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete phase")
    
    return None


@router.post("/phases/{phase_id}/milestones/", response_model=Milestone, status_code=status.HTTP_201_CREATED)
def create_milestone(
    phase_id: uuid.UUID = Path(..., description="Phase ID"),
    milestone_data: MilestoneCreate = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new milestone"""
    # Verify phase exists
    phase = roadmap_service.get_phase(db, phase_id)
    if not phase:
        raise HTTPException(status_code=404, detail="Phase not found")
    
    # Verify user has permission to add milestone through project
    project = project_service.get_project(db, phase.project_id)
    if project.owner_id != current_user.id and current_user.id not in [c.id for c in project.contributors]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Create milestone with phase_id from URL
    milestone_create = MilestoneCreate(**milestone_data.dict(), phase_id=phase_id)
    milestone = roadmap_service.create_milestone(db, milestone_create)
    return milestone


@router.get("/phases/{phase_id}/milestones/", response_model=List[Milestone])
def get_phase_milestones(
    phase_id: uuid.UUID = Path(..., description="Phase ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all milestones for a phase"""
    # Verify phase exists
    phase = roadmap_service.get_phase(db, phase_id)
    if not phase:
        raise HTTPException(status_code=404, detail="Phase not found")
    
    # Verify user has permission to access the phase through project
    project = project_service.get_project(db, phase.project_id)
    if (project.owner_id != current_user.id and 
        current_user.id not in [c.id for c in project.contributors] and 
        not project.is_public):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return roadmap_service.get_milestones_by_phase(db, phase_id, skip, limit)


@router.get("/milestones/{milestone_id}", response_model=Milestone)
def get_milestone(
    milestone_id: uuid.UUID = Path(..., description="Milestone ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific milestone by ID"""
    milestone = roadmap_service.get_milestone(db, milestone_id)
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")
    
    # Verify user has permission to access the milestone through phase and project
    phase = roadmap_service.get_phase(db, milestone.phase_id)
    project = project_service.get_project(db, phase.project_id)
    if (project.owner_id != current_user.id and 
        current_user.id not in [c.id for c in project.contributors] and 
        not project.is_public):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return milestone


@router.put("/milestones/{milestone_id}", response_model=Milestone)
def update_milestone(
    milestone_id: uuid.UUID = Path(..., description="Milestone ID"),
    milestone_update: MilestoneUpdate = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a milestone"""
    # Check if milestone exists
    milestone = roadmap_service.get_milestone(db, milestone_id)
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")
    
    # Verify user has permission to modify the milestone through phase and project
    phase = roadmap_service.get_phase(db, milestone.phase_id)
    project = project_service.get_project(db, phase.project_id)
    if project.owner_id != current_user.id and current_user.id not in [c.id for c in project.contributors]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Update the milestone
    updated_milestone = roadmap_service.update_milestone(db, milestone_id, milestone_update)
    return updated_milestone


@router.delete("/milestones/{milestone_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_milestone(
    milestone_id: uuid.UUID = Path(..., description="Milestone ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a milestone (soft delete)"""
    # Check if milestone exists
    milestone = roadmap_service.get_milestone(db, milestone_id)
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")
    
    # Verify user has permission to delete the milestone through phase and project
    phase = roadmap_service.get_phase(db, milestone.phase_id)
    project = project_service.get_project(db, phase.project_id)
    if project.owner_id != current_user.id and current_user.id not in [c.id for c in project.contributors]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Delete (soft) the milestone
    success = roadmap_service.delete_milestone(db, milestone_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete milestone")
    
    return None


@router.post("/projects/{project_id}/phases/reorder", response_model=List[Phase])
def reorder_phases(
    project_id: uuid.UUID,
    phase_ids: List[uuid.UUID],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Reorder phases within a project"""
    # Verify project exists and user has permission
    project = project_service.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project.owner_id != current_user.id and current_user.id not in [c.id for c in project.contributors]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return roadmap_service.reorder_phases(db, project_id, phase_ids)


@router.post("/phases/{phase_id}/milestones/reorder", response_model=List[Milestone])
def reorder_milestones(
    phase_id: uuid.UUID,
    milestone_ids: List[uuid.UUID],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Reorder milestones within a phase"""
    # Verify phase exists
    phase = roadmap_service.get_phase(db, phase_id)
    if not phase:
        raise HTTPException(status_code=404, detail="Phase not found")
    
    # Verify user has permission to reorder milestones through project
    project = project_service.get_project(db, phase.project_id)
    if project.owner_id != current_user.id and current_user.id not in [c.id for c in project.contributors]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return roadmap_service.reorder_milestones(db, phase_id, milestone_ids)


@router.get("/projects/{project_id}/roadmap", response_model=Roadmap)
def get_project_roadmap(
    project_id: uuid.UUID = Path(..., description="Project ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get the complete roadmap for a project"""
    # Verify project exists and user has permission
    project = project_service.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if (project.owner_id != current_user.id and 
        current_user.id not in [c.id for c in project.contributors] and 
        not project.is_public):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return roadmap_service.get_project_roadmap(db, project_id)


@router.post("/projects/{project_id}/roadmap/generate-default", response_model=Roadmap)
def generate_default_roadmap(
    project_id: uuid.UUID = Path(..., description="Project ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate a default roadmap template for a project"""
    # Verify project exists and user has permission
    project = project_service.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project.owner_id != current_user.id and current_user.id not in [c.id for c in project.contributors]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return roadmap_service.generate_default_roadmap(db, project_id)
