from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
import datetime
import enum
from app.db.base_class import Base

class RequirementPriority(str, enum.Enum):
    """Priority levels for requirements"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class RequirementStatus(str, enum.Enum):
    """Status values for requirements"""
    DRAFT = "draft"
    APPROVED = "approved"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    REJECTED = "rejected"

class RequirementType(str, enum.Enum):
    """Types of requirements"""
    FUNCTIONAL = "functional"
    NON_FUNCTIONAL = "non_functional"
    TECHNICAL = "technical"
    USER_STORY = "user_story"
    UI_UX = "ui_ux"
    OTHER = "other"

class Requirement(Base):
    """
    Requirement database model
    
    Requirements are specific features or functionalities that need to be implemented
    in a project. They can be automatically extracted from documents or manually created.
    """
    __tablename__ = "requirements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Classification and prioritization
    requirement_type = Column(String(50), default=RequirementType.FUNCTIONAL)
    priority = Column(String(50), default=RequirementPriority.MEDIUM)
    status = Column(String(50), default=RequirementStatus.DRAFT)
    
    # Traceability and source info
    source_document_id = Column(Integer, ForeignKey("documents.id"), nullable=True)
    source_text_excerpt = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    is_ai_generated = Column(Boolean, default=False)
    
    # Project relationship
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    project = relationship("Project", back_populates="requirements")
    
    # Document relationship - if any
    source_document = relationship("Document", back_populates="extracted_requirements")
    
    # Milestone relationship
    milestones = relationship(
        "Milestone",
        secondary="milestone_requirements",
        back_populates="requirements"
    )
    
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)
            
    def to_dict(self):
        """Convert requirement to dictionary"""
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "requirement_type": self.requirement_type,
            "priority": self.priority,
            "status": self.status,
            "source_document_id": self.source_document_id,
            "source_text_excerpt": self.source_text_excerpt,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "is_ai_generated": self.is_ai_generated,
            "project_id": self.project_id,
        }
