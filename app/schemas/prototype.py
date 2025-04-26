from typing import List, Optional, Any, Dict, Union
from datetime import datetime
from pydantic import BaseModel, Field

class PrototypeBase(BaseModel):
    """Base prototype schema with common attributes"""
    name: str
    description: Optional[str] = None
    prototype_type: str = "mockup"
    is_favorited: bool = False
    is_exported: bool = False

class PrototypeCreate(PrototypeBase):
    """Schema for creating a new prototype generation request"""
    project_id: int
    generation_parameters: Optional[Dict[str, Any]] = Field(default_factory=dict)
    requirement_ids: Optional[List[int]] = Field(default_factory=list)

class PrototypeUpdate(BaseModel):
    """Schema for updating an existing prototype"""
    name: Optional[str] = None
    description: Optional[str] = None
    is_favorited: Optional[bool] = None
    is_exported: Optional[bool] = None

class PrototypeInDBBase(PrototypeBase):
    """Base schema for prototypes retrieved from the database"""
    id: int
    project_id: int
    status: str
    version: int
    created_at: datetime
    updated_at: datetime
    generation_started_at: Optional[datetime] = None
    generation_completed_at: Optional[datetime] = None
    preview_image_path: Optional[str] = None
    artifact_path: Optional[str] = None

    class Config:
        orm_mode = True

class Prototype(PrototypeInDBBase):
    """Schema for returning a prototype to clients"""
    requirements_count: Optional[int] = 0

class PrototypeDetail(Prototype):
    """Detailed prototype schema with related items"""
    project: Optional[Dict[str, Any]] = None
    implemented_requirements: Optional[List[Dict[str, Any]]] = []
    # Include generation metadata for detailed view
    generation_parameters: Optional[Dict[str, Any]] = None
    generation_log: Optional[str] = None
    content_json: Optional[Dict[str, Any]] = None

class PrototypeList(BaseModel):
    """Schema for a list of prototypes with pagination"""
    total: int
    items: List[Prototype]
    page: int = 1
    page_size: int = 10
    
    class Config:
        orm_mode = True

class PrototypeGenerationParameters(BaseModel):
    """Schema for prototype generation parameters"""
    prototype_type: str = "mockup"
    style_preferences: Optional[Dict[str, Any]] = Field(default_factory=dict)
    technical_constraints: Optional[Dict[str, Any]] = Field(default_factory=dict)
    included_features: Optional[List[str]] = Field(default_factory=list)
    excluded_features: Optional[List[str]] = Field(default_factory=list)
    reference_urls: Optional[List[str]] = Field(default_factory=list)
    ai_creativity_level: int = Field(default=5, ge=1, le=10)

class PrototypeRegenerateRequest(BaseModel):
    """Schema for requesting regeneration of a prototype"""
    prototype_id: int
    update_parameters: Optional[Dict[str, Any]] = None
    include_requirements: Optional[List[int]] = None
    exclude_requirements: Optional[List[int]] = None

class PrototypeExportRequest(BaseModel):
    """Schema for exporting a prototype"""
    prototype_id: int
    export_format: str = "zip"  # zip, pdf, html, reactjs, etc.
    export_options: Optional[Dict[str, Any]] = Field(default_factory=dict)
