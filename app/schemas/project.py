from typing import List, Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel, Field, validator

class ProjectBase(BaseModel):
    """Base project schema with common attributes"""
    name: str
    description: Optional[str] = None
    status: str = "draft"
    project_type: str = "web"
    is_public: bool = False

class ProjectCreate(ProjectBase):
    """Schema for creating a new project"""
    pass

class ProjectUpdate(BaseModel):
    """Schema for updating an existing project"""
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    project_type: Optional[str] = None
    is_public: Optional[bool] = None

class ProjectInDBBase(ProjectBase):
    """Base schema for projects retrieved from the database"""
    id: int
    owner_id: Any  # UUID or int depending on database implementation
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class Project(ProjectInDBBase):
    """Schema for returning a project to clients"""
    contributor_count: Optional[int] = 0
    requirement_count: Optional[int] = 0
    document_count: Optional[int] = 0
    prototype_count: Optional[int] = 0

class ProjectDetail(Project):
    """Detailed project schema with related items"""
    contributors: List[Dict[str, Any]] = []
    requirements: Optional[List[Dict[str, Any]]] = []
    documents: Optional[List[Dict[str, Any]]] = []
    prototypes: Optional[List[Dict[str, Any]]] = []

class ProjectList(BaseModel):
    """Schema for a list of projects with pagination"""
    total: int
    items: List[Project]
    page: int = 1
    page_size: int = 10
    
    class Config:
        orm_mode = True

class ProjectStats(BaseModel):
    """Project statistics schema"""
    requirement_counts: Dict[str, int] = Field(default_factory=dict)  # Counts by priority or status
    document_counts: Dict[str, int] = Field(default_factory=dict)  # Counts by document type
    prototype_counts: Dict[str, int] = Field(default_factory=dict)  # Counts by prototype type
    activity_timeline: List[Dict[str, Any]] = []  # Recent activity
    
    class Config:
        orm_mode = True
