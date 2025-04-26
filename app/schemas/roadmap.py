from typing import List, Optional
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field


class MilestoneDependencyBase(BaseModel):
    """Base schema for milestone dependency"""
    dependency_id: UUID
    dependency_type: str = Field("finish_to_start", description="Type of dependency (finish_to_start, start_to_start, etc.)")


class MilestoneDependencyCreate(MilestoneDependencyBase):
    """Schema for creating a milestone dependency"""
    pass


class MilestoneDependency(MilestoneDependencyBase):
    """Schema for a milestone dependency"""
    dependent_id: UUID
    created_at: datetime

    class Config:
        orm_mode = True


class PhaseBase(BaseModel):
    """Base schema for project phase"""
    name: str
    description: Optional[str] = None
    color: str = "#3498db"  # Default blue color
    order: int = 0


class PhaseCreate(PhaseBase):
    """Schema for creating a project phase"""
    project_id: UUID


class PhaseUpdate(BaseModel):
    """Schema for updating a project phase"""
    name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    order: Optional[int] = None
    is_active: Optional[bool] = None


class Phase(PhaseBase):
    """Full Phase schema with all fields"""
    id: UUID
    project_id: UUID
    created_at: datetime
    updated_at: datetime
    is_active: bool = True

    class Config:
        orm_mode = True


class MilestoneBase(BaseModel):
    """Base schema for milestone"""
    title: str
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    progress: float = 0.0
    status: str = "Not Started"
    order: int = 0
    is_milestone: bool = True  # True if milestone, False if task


class MilestoneCreate(MilestoneBase):
    """Schema for creating a milestone"""
    phase_id: UUID
    requirement_ids: Optional[List[UUID]] = None
    dependencies: Optional[List[MilestoneDependencyCreate]] = None


class MilestoneUpdate(BaseModel):
    """Schema for updating a milestone"""
    title: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    progress: Optional[float] = None
    status: Optional[str] = None
    order: Optional[int] = None
    is_milestone: Optional[bool] = None
    is_active: Optional[bool] = None
    requirement_ids: Optional[List[UUID]] = None
    dependencies: Optional[List[MilestoneDependencyCreate]] = None


class MilestoneRequirement(BaseModel):
    """Schema for milestone-requirement relationship"""
    requirement_id: UUID

    class Config:
        orm_mode = True


class Milestone(MilestoneBase):
    """Full Milestone schema with all fields"""
    id: UUID
    phase_id: UUID
    created_at: datetime
    updated_at: datetime
    is_active: bool = True
    dependencies: List[MilestoneDependency] = []
    requirements: List[MilestoneRequirement] = []

    class Config:
        orm_mode = True


# Update Phase schema to include milestones
class PhaseWithMilestones(Phase):
    """Phase schema with included milestones"""
    milestones: List[Milestone] = []


# Schema for roadmap representation (used for roadmap visualization)
class Roadmap(BaseModel):
    """Complete roadmap representation for a project"""
    project_id: UUID
    phases: List[PhaseWithMilestones] = []

    class Config:
        orm_mode = True
