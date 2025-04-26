from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, Table
from sqlalchemy.orm import relationship
import datetime
from app.db.base_class import Base
from app.db.models.user import User

# Association table for project contributors (many-to-many relationship)
project_contributors = Table(
    "project_contributors",
    Base.metadata,
    Column("project_id", Integer, ForeignKey("projects.id"), primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
)

class Project(Base):
    """
    Project database model
    
    Projects are the central entity in the Auto AGI Builder system.
    Each project contains requirements, documents, and generated prototypes.
    """
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    # Project status: draft, in_progress, completed, archived
    status = Column(String(50), default="draft")
    # Project type: web, mobile, desktop, api, other
    project_type = Column(String(50), default="web")
    
    # Date tracking
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    # Ownership and access control
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_public = Column(Boolean, default=False)
    
    # Relationships
    owner = relationship("User", back_populates="owned_projects", foreign_keys=[owner_id])
    contributors = relationship("User", secondary=project_contributors, back_populates="contributed_projects")
    
    # Project components
    requirements = relationship("Requirement", back_populates="project", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="project", cascade="all, delete-orphan")
    prototypes = relationship("Prototype", back_populates="project", cascade="all, delete-orphan")
    
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)
            
    def to_dict(self):
        """Convert project to dictionary"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "status": self.status,
            "project_type": self.project_type,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "owner_id": self.owner_id,
            "is_public": self.is_public,
        }
