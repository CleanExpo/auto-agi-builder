from datetime import datetime
from typing import Optional
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, Enum, Boolean
from sqlalchemy.orm import relationship
import enum

from app.db.base_class import Base


class ExportStatus(enum.Enum):
    """Status of an export job."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class ExportType(enum.Enum):
    """Type of export file."""
    PDF = "pdf"
    EXCEL = "excel"
    CSV = "csv"
    JSON = "json"
    IMAGE = "image"


class ContentType(enum.Enum):
    """Type of content being exported."""
    PROJECT = "project"
    REQUIREMENTS = "requirements"
    ROI = "roi"
    TIMELINE = "timeline"


class Export(Base):
    """
    Database model for project exports.
    
    Tracks metadata for exported files including status, type, and file information.
    """
    __tablename__ = "exports"

    id = Column(String, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=True)
    file_size = Column(Integer, nullable=True)
    
    export_type = Column(Enum(ExportType), nullable=False)
    content_type = Column(Enum(ContentType), nullable=False)
    status = Column(Enum(ExportStatus), nullable=False, default=ExportStatus.PENDING)
    
    # Options used for export (stored as JSON)
    options = Column(Text, nullable=True)
    
    # Error message in case of failure
    error_message = Column(Text, nullable=True)
    
    # Relationships
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Download tracking
    download_count = Column(Integer, default=0, nullable=False)
    last_downloaded_at = Column(DateTime, nullable=True)
    
    # Deletion tracking
    is_deleted = Column(Boolean, default=False, nullable=False)
    deleted_at = Column(DateTime, nullable=True)
    
    # Define relationships to other models
    project = relationship("Project", back_populates="exports")
    user = relationship("User", back_populates="exports")
    
    def __repr__(self):
        """String representation of the export."""
        return f"<Export {self.id}: {self.filename} ({self.status.name})>"
    
    @property
    def download_url(self) -> str:
        """Generate download URL for the export."""
        return f"/api/v1/exports/{self.id}/download"
    
    @property
    def is_available(self) -> bool:
        """Check if export is available for download."""
        return self.status == ExportStatus.COMPLETED and not self.is_deleted
    
    @property
    def duration(self) -> Optional[float]:
        """Calculate the duration of the export process in seconds."""
        if self.started_at and self.completed_at:
            return (self.completed_at - self.started_at).total_seconds()
        return None
