from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
import datetime
import enum
from app.db.base_class import Base

class DocumentType(str, enum.Enum):
    """Types of supported documents"""
    PDF = "pdf"
    WORD = "word"
    TEXT = "text"
    MARKDOWN = "markdown"
    HTML = "html"
    IMAGE = "image"
    OTHER = "other"

class Document(Base):
    """
    Document database model
    
    Documents are files uploaded by users that contain requirements, specifications,
    or other information related to a project. Documents can be automatically analyzed
    to extract requirements.
    """
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # File metadata
    filename = Column(String(255), nullable=False)
    filepath = Column(String(512), nullable=False)  # Path relative to storage root
    file_size = Column(Integer, nullable=False)  # Size in bytes
    document_type = Column(String(50), nullable=False, default=DocumentType.PDF)
    content_hash = Column(String(64), nullable=True)  # SHA-256 hash of document content
    
    # Extracted content
    extracted_text = Column(Text, nullable=True)  # Plain text extracted from document
    extraction_status = Column(String(50), default="pending")  # pending, processing, complete, failed
    
    # Metadata
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    is_archived = Column(Boolean, default=False)
    
    # Upload info
    uploader_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Project relationship
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    project = relationship("Project", back_populates="documents")
    uploader = relationship("User")
    
    # Requirements relationship
    extracted_requirements = relationship("Requirement", back_populates="source_document")
    
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)
            
    def to_dict(self):
        """Convert document to dictionary"""
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "filename": self.filename,
            "filepath": self.filepath,
            "file_size": self.file_size,
            "document_type": self.document_type,
            "extraction_status": self.extraction_status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "is_archived": self.is_archived,
            "uploader_id": self.uploader_id,
            "project_id": self.project_id,
        }
