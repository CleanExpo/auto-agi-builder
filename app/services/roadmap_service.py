from sqlalchemy.orm import Session
from datetime import datetime
import uuid
from typing import List, Optional
from app.db.models.roadmap import Phase, Milestone, MilestoneRequirement, MilestoneDependency
from app.schemas.roadmap import (
    PhaseCreate, PhaseUpdate, MilestoneCreate, MilestoneUpdate, 
    Roadmap, PhaseWithMilestones
)


def create_phase(db: Session, phase_data: PhaseCreate) -> Phase:
    """
    Create a new project phase
    
    Args:
        db: Database session
        phase_data: Phase creation data
        
    Returns:
        Created Phase
    """
    phase = Phase(
        id=uuid.uuid4(),
        name=phase_data.name,
        description=phase_data.description,
        color=phase_data.color,
        order=phase_data.order,
        project_id=phase_data.project_id
    )
    db.add(phase)
    db.commit()
    db.refresh(phase)
    return phase


def get_phase(db: Session, phase_id: uuid.UUID) -> Optional[Phase]:
    """
    Get a phase by ID
    
    Args:
        db: Database session
        phase_id: ID of the phase to retrieve
        
    Returns:
        Phase if found, None otherwise
    """
    return db.query(Phase).filter(Phase.id == phase_id).first()


def get_phases_by_project(db: Session, project_id: uuid.UUID, skip: int = 0, limit: int = 100) -> List[Phase]:
    """
    Get all phases for a project
    
    Args:
        db: Database session
        project_id: Project ID
        skip: Skip first N records
        limit: Limit the number of records returned
        
    Returns:
        List of phases
    """
    return (
        db.query(Phase)
        .filter(Phase.project_id == project_id, Phase.is_active == True)
        .order_by(Phase.order)
        .offset(skip)
        .limit(limit)
        .all()
    )


def update_phase(db: Session, phase_id: uuid.UUID, phase_update: PhaseUpdate) -> Optional[Phase]:
    """
    Update a phase
    
    Args:
        db: Database session
        phase_id: Phase ID
        phase_update: Phase update data
        
    Returns:
        Updated Phase if found, None otherwise
    """
    phase = get_phase(db, phase_id)
    if not phase:
        return None
        
    update_data = phase_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(phase, field, value)
        
    phase.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(phase)
    return phase


def delete_phase(db: Session, phase_id: uuid.UUID) -> bool:
    """
    Delete a phase (soft delete)
    
    Args:
        db: Database session
        phase_id: Phase ID
        
    Returns:
        True if deleted, False if not found
    """
    phase = get_phase(db, phase_id)
    if not phase:
        return False
        
    # Soft delete
    phase.is_active = False
    phase.updated_at = datetime.utcnow()
    db.commit()
    return True


def create_milestone(db: Session, milestone_data: MilestoneCreate) -> Milestone:
    """
    Create a new milestone
    
    Args:
        db: Database session
        milestone_data: Milestone creation data
        
    Returns:
        Created Milestone
    """
    # Create the milestone
    milestone = Milestone(
        id=uuid.uuid4(),
        title=milestone_data.title,
        description=milestone_data.description,
        start_date=milestone_data.start_date,
        end_date=milestone_data.end_date,
        progress=milestone_data.progress,
        status=milestone_data.status,
        order=milestone_data.order,
        is_milestone=milestone_data.is_milestone,
        phase_id=milestone_data.phase_id
    )
    db.add(milestone)
    db.commit()
    db.refresh(milestone)
    
    # Add requirements if any
    if milestone_data.requirement_ids:
        for req_id in milestone_data.requirement_ids:
            req_association = MilestoneRequirement(
                milestone_id=milestone.id,
                requirement_id=req_id
            )
            db.add(req_association)
    
    # Add dependencies if any
    if milestone_data.dependencies:
        for dep in milestone_data.dependencies:
            dependency = MilestoneDependency(
                dependency_id=dep.dependency_id,
                dependent_id=milestone.id,
                dependency_type=dep.dependency_type
            )
            db.add(dependency)
    
    db.commit()
    db.refresh(milestone)
    return milestone


def get_milestone(db: Session, milestone_id: uuid.UUID) -> Optional[Milestone]:
    """
    Get a milestone by ID
    
    Args:
        db: Database session
        milestone_id: ID of the milestone to retrieve
        
    Returns:
        Milestone if found, None otherwise
    """
    return db.query(Milestone).filter(Milestone.id == milestone_id).first()


def get_milestones_by_phase(db: Session, phase_id: uuid.UUID, skip: int = 0, limit: int = 100) -> List[Milestone]:
    """
    Get all milestones for a phase
    
    Args:
        db: Database session
        phase_id: Phase ID
        skip: Skip first N records
        limit: Limit the number of records returned
        
    Returns:
        List of milestones
    """
    return (
        db.query(Milestone)
        .filter(Milestone.phase_id == phase_id, Milestone.is_active == True)
        .order_by(Milestone.order)
        .offset(skip)
        .limit(limit)
        .all()
    )


def update_milestone(db: Session, milestone_id: uuid.UUID, milestone_update: MilestoneUpdate) -> Optional[Milestone]:
    """
    Update a milestone
    
    Args:
        db: Database session
        milestone_id: Milestone ID
        milestone_update: Milestone update data
        
    Returns:
        Updated Milestone if found, None otherwise
    """
    milestone = get_milestone(db, milestone_id)
    if not milestone:
        return None
        
    # Update milestone fields
    update_data = milestone_update.dict(exclude_unset=True, exclude={"requirement_ids", "dependencies"})
    for field, value in update_data.items():
        setattr(milestone, field, value)
    
    milestone.updated_at = datetime.utcnow()
    
    # Update requirements if provided
    if milestone_update.requirement_ids is not None:
        # Clear existing requirements
        db.query(MilestoneRequirement).filter(
            MilestoneRequirement.milestone_id == milestone_id
        ).delete()
        
        # Add new requirements
        for req_id in milestone_update.requirement_ids:
            req_association = MilestoneRequirement(
                milestone_id=milestone.id,
                requirement_id=req_id
            )
            db.add(req_association)
    
    # Update dependencies if provided
    if milestone_update.dependencies is not None:
        # Clear existing dependencies
        db.query(MilestoneDependency).filter(
            MilestoneDependency.dependent_id == milestone_id
        ).delete()
        
        # Add new dependencies
        for dep in milestone_update.dependencies:
            dependency = MilestoneDependency(
                dependency_id=dep.dependency_id,
                dependent_id=milestone.id,
                dependency_type=dep.dependency_type
            )
            db.add(dependency)
    
    db.commit()
    db.refresh(milestone)
    return milestone


def delete_milestone(db: Session, milestone_id: uuid.UUID) -> bool:
    """
    Delete a milestone (soft delete)
    
    Args:
        db: Database session
        milestone_id: Milestone ID
        
    Returns:
        True if deleted, False if not found
    """
    milestone = get_milestone(db, milestone_id)
    if not milestone:
        return False
        
    # Soft delete
    milestone.is_active = False
    milestone.updated_at = datetime.utcnow()
    db.commit()
    return True


def reorder_phases(db: Session, project_id: uuid.UUID, phase_ids: List[uuid.UUID]) -> List[Phase]:
    """
    Reorder phases within a project
    
    Args:
        db: Database session
        project_id: Project ID
        phase_ids: List of phase IDs in new order
        
    Returns:
        List of updated phases
    """
    phases = get_phases_by_project(db, project_id)
    phase_dict = {str(phase.id): phase for phase in phases}
    
    # Update order for each phase
    for index, phase_id in enumerate(phase_ids):
        phase = phase_dict.get(str(phase_id))
        if phase:
            phase.order = index
            phase.updated_at = datetime.utcnow()
    
    db.commit()
    return get_phases_by_project(db, project_id)


def reorder_milestones(db: Session, phase_id: uuid.UUID, milestone_ids: List[uuid.UUID]) -> List[Milestone]:
    """
    Reorder milestones within a phase
    
    Args:
        db: Database session
        phase_id: Phase ID
        milestone_ids: List of milestone IDs in new order
        
    Returns:
        List of updated milestones
    """
    milestones = get_milestones_by_phase(db, phase_id)
    milestone_dict = {str(milestone.id): milestone for milestone in milestones}
    
    # Update order for each milestone
    for index, milestone_id in enumerate(milestone_ids):
        milestone = milestone_dict.get(str(milestone_id))
        if milestone:
            milestone.order = index
            milestone.updated_at = datetime.utcnow()
    
    db.commit()
    return get_milestones_by_phase(db, phase_id)


def get_project_roadmap(db: Session, project_id: uuid.UUID) -> Roadmap:
    """
    Get the complete roadmap for a project with all phases and milestones
    
    Args:
        db: Database session
        project_id: Project ID
        
    Returns:
        Complete roadmap data
    """
    phases = get_phases_by_project(db, project_id)
    phases_with_milestones = []
    
    for phase in phases:
        milestones = get_milestones_by_phase(db, phase.id)
        phase_dict = {k: getattr(phase, k) for k in phase.__table__.columns.keys()}
        phase_with_milestones = PhaseWithMilestones(**phase_dict, milestones=milestones)
        phases_with_milestones.append(phase_with_milestones)
    
    roadmap = Roadmap(project_id=project_id, phases=phases_with_milestones)
    return roadmap


def generate_default_roadmap(db: Session, project_id: uuid.UUID) -> Roadmap:
    """
    Generate a default roadmap template for a new project
    
    Args:
        db: Database session
        project_id: Project ID
        
    Returns:
        Generated roadmap
    """
    # Create default phases
    planning_phase = create_phase(
        db, 
        PhaseCreate(
            name="Planning",
            description="Project planning and requirement gathering",
            color="#3498db",  # Blue
            order=0,
            project_id=project_id
        )
    )
    
    design_phase = create_phase(
        db, 
        PhaseCreate(
            name="Design",
            description="Design and prototyping",
            color="#9b59b6",  # Purple
            order=1,
            project_id=project_id
        )
    )
    
    development_phase = create_phase(
        db, 
        PhaseCreate(
            name="Development",
            description="Implementation and development",
            color="#2ecc71",  # Green
            order=2,
            project_id=project_id
        )
    )
    
    testing_phase = create_phase(
        db, 
        PhaseCreate(
            name="Testing",
            description="Testing and quality assurance",
            color="#f1c40f",  # Yellow
            order=3,
            project_id=project_id
        )
    )
    
    deployment_phase = create_phase(
        db, 
        PhaseCreate(
            name="Deployment",
            description="Deployment and launch",
            color="#e74c3c",  # Red
            order=4,
            project_id=project_id
        )
    )
    
    # Create some example milestones
    create_milestone(
        db,
        MilestoneCreate(
            title="Project Kickoff",
            description="Initial project meeting and scope definition",
            start_date=datetime.utcnow(),
            order=0,
            phase_id=planning_phase.id
        )
    )
    
    create_milestone(
        db,
        MilestoneCreate(
            title="Requirements Finalized",
            description="All project requirements documented and approved",
            order=1,
            phase_id=planning_phase.id
        )
    )
    
    create_milestone(
        db,
        MilestoneCreate(
            title="Design Review",
            description="Review and approve design documents",
            order=0,
            phase_id=design_phase.id
        )
    )
    
    create_milestone(
        db,
        MilestoneCreate(
            title="MVP Development",
            description="Development of minimum viable product",
            order=0,
            phase_id=development_phase.id
        )
    )
    
    create_milestone(
        db,
        MilestoneCreate(
            title="User Acceptance Testing",
            description="Final testing with end users",
            order=0,
            phase_id=testing_phase.id
        )
    )
    
    create_milestone(
        db,
        MilestoneCreate(
            title="Production Deployment",
            description="Deploy application to production environment",
            order=0,
            phase_id=deployment_phase.id
        )
    )
    
    return get_project_roadmap(db, project_id)
