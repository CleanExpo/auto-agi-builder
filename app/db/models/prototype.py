from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.orm import relationship
import datetime
import enum
from app.db.base_class import Base

class PrototypeType(str, enum.Enum):
    """Types of prototypes that can be generated"""
    WIREFRAME = "wireframe"
    MOCKUP = "mockup"
    INTERACTIVE = "interactive"
    CODE = "code"
    API = "api"
    OTHER = "other"

class PrototypeStatus(str, enum.Enum):
    """Status values for prototypes"""
    DRAFT = "draft"
    GENERATING = "generating"
    READY = "ready"
    FAILED = "failed"
    ARCHIVED = "archived"

class Prototype(Base):
    """
    Prototype database model
    
    Prototypes are generated outputs based on project requirements.
    They can be wireframes, mockups, or code implementations.
    """
    __tablename__ = "prototypes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Prototype details
    prototype_type = Column(String(50), nullable=False, default=PrototypeType.MOCKUP)
    status = Column(String(50), nullable=False, default=PrototypeStatus.DRAFT)
    
    # Generated content
    content_json = Column(JSON, nullable=True)  # JSON representation of prototype structure
    preview_image_path = Column(String(512), nullable=True)  # Path to preview image
    artifact_path = Column(String(512), nullable=True)  # Path to generated artifacts
    
    # Generation metadata
    generation_parameters = Column(JSON, nullable=True)  # Parameters used for generation
    generation_log = Column(Text, nullable=True)  # Log of generation process
    version = Column(Integer, default=1)  # Version number (increments with regeneration)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    generation_started_at = Column(DateTime, nullable=True)
    generation_completed_at = Column(DateTime, nullable=True)
    
    # Flags
    is_favorited = Column(Boolean, default=False)
    is_exported = Column(Boolean, default=False)
    
    # Project relationship
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    project = relationship("Project", back_populates="prototypes")
    
    # Requirements mapping (many-to-many)
    implemented_requirements = relationship(
        "Requirement",
        secondary="prototype_requirements",
        backref="implemented_in_prototypes"
    )
    
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)
            
    def to_dict(self):
        """Convert prototype to dictionary"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "prototype_type": self.prototype_type,
            "status": self.status,
            "preview_image_path": self.preview_image_path,
            "artifact_path": self.artifact_path,
            "version": self.version,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "generation_started_at": self.generation_started_at.isoformat() if self.generation_started_at else None,
            "generation_completed_at": self.generation_completed_at.isoformat() if self.generation_completed_at else None,
            "is_favorited": self.is_favorited,
            "is_exported": self.is_exported,
            "project_id": self.project_id
        }

# Association table for prototypes and requirements (many-to-many)
prototype_requirements = Table = Base.metadata.tables.get("prototype_requirements") or Table(
    "prototype_requirements",
    Base.metadata,
    Column("prototype_id", Integer, ForeignKey("prototypes.id"), primary_key=True),
    Column("requirement_id", Integer, ForeignKey("requirements.id"), primary_key=True),
    Column("implementation_notes", Text, nullable=True),
    Column("implementation_status", String(50), default="implemented")  # implemented, partial, planned
)
