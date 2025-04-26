from typing import List, Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel, Field

class RequirementBase(BaseModel):
    """Base requirement schema with common attributes"""
    title: str
    description: Optional[str] = None
    requirement_type: str = "functional"
    priority: str = "medium"
    status: str = "draft"
    is_ai_generated: bool = False

class RequirementCreate(RequirementBase):
    """Schema for creating a new requirement"""
    project_id: int
    source_document_id: Optional[int] = None
    source_text_excerpt: Optional[str] = None

class RequirementUpdate(BaseModel):
    """Schema for updating an existing requirement"""
    title: Optional[str] = None
    description: Optional[str] = None
    requirement_type: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    source_document_id: Optional[int] = None
    source_text_excerpt: Optional[str] = None

class RequirementInDBBase(RequirementBase):
    """Base schema for requirements retrieved from the database"""
    id: int
    project_id: int
    source_document_id: Optional[int] = None
    source_text_excerpt: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class Requirement(RequirementInDBBase):
    """Schema for returning a requirement to clients"""
    implemented_count: Optional[int] = 0

class RequirementDetail(Requirement):
    """Detailed requirement schema with related items"""
    project: Optional[Dict[str, Any]] = None
    source_document: Optional[Dict[str, Any]] = None
    implemented_in_prototypes: Optional[List[Dict[str, Any]]] = []

class RequirementList(BaseModel):
    """Schema for a list of requirements with pagination"""
    total: int
    items: List[Requirement]
    page: int = 1
    page_size: int = 10
    
    class Config:
        orm_mode = True

class RequirementBulkCreate(BaseModel):
    """Schema for creating multiple requirements at once"""
    project_id: int
    requirements: List[RequirementCreate]

class RequirementBulkUpdate(BaseModel):
    """Schema for updating multiple requirements at once"""
    requirements: List[Dict[str, Any]]  # List of {id: int, ...update_fields}

class RequirementExtract(BaseModel):
    """Schema for extracting requirements from a document"""
    document_id: int
    extraction_mode: str = "auto"  # auto, standard, detailed
    extraction_options: Optional[Dict[str, Any]] = None
