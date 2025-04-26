from sqlalchemy import Column, String, Integer, ForeignKey, Text, DateTime, Boolean, Float
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from sqlalchemy.dialects.postgresql import UUID

from app.db.base_class import Base


class Phase(Base):
    """Project phase model for organizing the roadmap into logical sections."""
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    color = Column(String, default="#3498db", nullable=False)  # Default blue color
    order = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    is_active = Column(Boolean, default=True)
    
    # Relationship to project
    project_id = Column(UUID(as_uuid=True), ForeignKey("project.id"), nullable=False)
    project = relationship("Project", back_populates="phases")
    
    # Relationship to milestones
    milestones = relationship("Milestone", back_populates="phase", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Phase {self.name} for Project {self.project_id}>"


class Milestone(Base):
    """Milestone model for tracking important points in the project roadmap."""
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    progress = Column(Float, default=0.0, nullable=False)  # 0 to 100
    status = Column(String, default="Not Started", nullable=False)  # Not Started, In Progress, Completed, Delayed
    order = Column(Integer, default=0, nullable=False)
    is_milestone = Column(Boolean, default=True)  # True if milestone, False if task
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    is_active = Column(Boolean, default=True)
    
    # Relationship to phase
    phase_id = Column(UUID(as_uuid=True), ForeignKey("phase.id"), nullable=False)
    phase = relationship("Phase", back_populates="milestones")
    
    # Relationships to requirements and dependencies
    requirements = relationship(
        "Requirement",
        secondary="milestone_requirements",
        back_populates="milestones"
    )
    
    # Self-referential relationship for dependencies
    dependencies = relationship(
        "MilestoneDependency",
        primaryjoin="Milestone.id == MilestoneDependency.dependent_id",
        back_populates="dependent"
    )
    dependents = relationship(
        "MilestoneDependency",
        primaryjoin="Milestone.id == MilestoneDependency.dependency_id",
        back_populates="dependency"
    )
    
    def __repr__(self):
        return f"<Milestone {self.title} in Phase {self.phase_id}>"


class MilestoneRequirement(Base):
    """Association table for milestone-requirement relationship."""
    
    milestone_id = Column(UUID(as_uuid=True), ForeignKey("milestone.id"), primary_key=True)
    requirement_id = Column(UUID(as_uuid=True), ForeignKey("requirement.id"), primary_key=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class MilestoneDependency(Base):
    """Association table for milestone dependencies."""
    
    dependency_id = Column(UUID(as_uuid=True), ForeignKey("milestone.id"), primary_key=True)
    dependent_id = Column(UUID(as_uuid=True), ForeignKey("milestone.id"), primary_key=True)
    dependency_type = Column(String, default="finish_to_start", nullable=False)  # finish_to_start, start_to_start, etc.
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    dependency = relationship(
        "Milestone",
        foreign_keys=[dependency_id],
        back_populates="dependents"
    )
    dependent = relationship(
        "Milestone", 
        foreign_keys=[dependent_id],
        back_populates="dependencies"
    )
