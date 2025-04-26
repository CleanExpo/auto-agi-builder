from typing import List, Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel, Field, validator

class DocumentBase(BaseModel):
    """Base document schema with common attributes"""
    title: str
    description: Optional[str] = None
    document_type: str = "pdf"

class DocumentCreate(DocumentBase):
    """Schema for creating a new document record after upload"""
    project_id: int
    filename: str
    filepath: str
    file_size: int
    content_hash: Optional[str] = None

class DocumentUpdate(BaseModel):
    """Schema for updating an existing document"""
    title: Optional[str] = None
    description: Optional[str] = None
    is_archived: Optional[bool] = None
    extraction_status: Optional[str] = None

class DocumentInDBBase(DocumentBase):
    """Base schema for documents retrieved from the database"""
    id: int
    project_id: int
    filename: str
    filepath: str
    file_size: int
    uploader_id: Any  # UUID or int depending on implementation
    content_hash: Optional[str] = None
    extraction_status: str = "pending"
    is_archived: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class Document(DocumentInDBBase):
    """Schema for returning a document to clients"""
    requirements_count: Optional[int] = 0

class DocumentDetail(Document):
    """Detailed document schema with related items"""
    project: Optional[Dict[str, Any]] = None
    uploader: Optional[Dict[str, Any]] = None
    extracted_requirements: Optional[List[Dict[str, Any]]] = []
    
    # Add preview URL if available
    @validator('filepath')
    def add_preview_url(cls, v, values):
        if v:
            return {
                "path": v,
                "preview_url": f"/api/v1/documents/{values.get('id')}/preview"
            }
        return v

class DocumentList(BaseModel):
    """Schema for a list of documents with pagination"""
    total: int
    items: List[Document]
    page: int = 1
    page_size: int = 10
    
    class Config:
        orm_mode = True

class DocumentUpload(BaseModel):
    """Schema for file upload request"""
    project_id: int
    document_type: str = "pdf"
    title: Optional[str] = None  # If not provided, will use filename
    description: Optional[str] = None
    extract_requirements: bool = False

class DocumentExtractionResult(BaseModel):
    """Schema for document text extraction result"""
    document_id: int
    extracted_text: str
    extraction_status: str = "complete"
    extraction_metadata: Optional[Dict[str, Any]] = None
    requirements_extracted: Optional[int] = 0
    error_message: Optional[str] = None
