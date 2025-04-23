from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, validator
import json

# Enum schemas
class ExportStatusEnum(str):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class ExportTypeEnum(str):
    PDF = "pdf"
    EXCEL = "excel"
    CSV = "csv"
    JSON = "json"
    IMAGE = "image"


class ContentTypeEnum(str):
    PROJECT = "project"
    REQUIREMENTS = "requirements"
    ROI = "roi"
    TIMELINE = "timeline"


# Request schemas
class ExportRequestBase(BaseModel):
    """Base schema for export requests"""
    export_type: ExportTypeEnum = Field(ExportTypeEnum.PDF, description="Type of export file")
    content_type: ContentTypeEnum = Field(ContentTypeEnum.PROJECT, description="Type of content to export")
    filename: Optional[str] = Field(None, description="Custom filename (generated if not provided)")
    options: Optional[Dict[str, Any]] = Field(None, description="Export-specific options")

    class Config:
        use_enum_values = True


class ExportCreateRequest(ExportRequestBase):
    """Schema for creating a new export"""
    project_id: str = Field(..., description="ID of the project to export")

    @validator('options')
    def validate_options(cls, v):
        """Ensure options is valid JSON if provided"""
        if v is not None:
            # Ensure options can be serialized to JSON
            try:
                json.dumps(v)
            except Exception as e:
                raise ValueError(f"Invalid options: {str(e)}")
        return v


class ExportUpdateRequest(BaseModel):
    """Schema for updating an export"""
    filename: Optional[str] = Field(None, description="New filename for the export")
    is_deleted: Optional[bool] = Field(None, description="Mark export as deleted")


# Response schemas
class ExportBase(BaseModel):
    """Base schema for export responses"""
    id: str
    filename: str
    export_type: str
    content_type: str
    status: str
    created_at: datetime
    file_size: Optional[int] = None


class ExportListItem(ExportBase):
    """Schema for export items in list view"""
    download_url: str
    project_id: str
    user_id: str
    download_count: int
    is_available: bool

    class Config:
        orm_mode = True


class ExportDetail(ExportListItem):
    """Schema for detailed export information"""
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    last_downloaded_at: Optional[datetime] = None
    is_deleted: bool
    deleted_at: Optional[datetime] = None
    error_message: Optional[str] = None
    options: Optional[Dict[str, Any]] = None
    duration: Optional[float] = None

    class Config:
        orm_mode = True


class ExportList(BaseModel):
    """Schema for paginated export list"""
    items: List[ExportListItem]
    total: int
    page: int
    size: int
    pages: int


# Response for successful export creation
class ExportCreateResponse(BaseModel):
    """Schema for export creation response"""
    export_id: str
    filename: str
    status: str
    download_url: str

    class Config:
        orm_mode = True


# Simple message response
class MessageResponse(BaseModel):
    """Schema for simple message responses"""
    message: str
