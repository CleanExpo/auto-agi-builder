import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, Column, DateTime, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class User(Base):
    """
    User model with authentication and user profile information
    """
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    
    @declared_attr
    def owned_projects(cls):
        """
        Relationship to projects owned by this user
        """
        return relationship("Project", back_populates="owner", foreign_keys="Project.owner_id", lazy="dynamic")
        
    # Relationship for projects user contributes to
    contributed_projects = relationship(
        "Project", 
        secondary="project_contributors",
        back_populates="contributors", 
        lazy="dynamic"
    )
    
    # Relationship with comments
    comments = relationship("Comment", back_populates="user")
    
    def __repr__(self):
        return f"<User {self.email}>"
