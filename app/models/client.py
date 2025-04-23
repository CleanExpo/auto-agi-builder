from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4

from app.db.base_class import Base


class Client(Base):
    """Client organization model for storing organization details"""
    __tablename__ = "clients"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid4()))
    name = Column(String, nullable=False, index=True)
    logo_url = Column(String, nullable=True)
    industry = Column(String, nullable=True)
    description = Column(String, nullable=True)
    website = Column(String, nullable=True)
    
    # Contact information
    primary_contact_name = Column(String, nullable=True)
    primary_contact_email = Column(String, nullable=True)
    primary_contact_phone = Column(String, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Relationships
    settings = relationship("ClientSettings", back_populates="client", uselist=False, cascade="all, delete-orphan")
    members = relationship("ClientMember", back_populates="client", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="client")
    
    def __repr__(self):
        return f"<Client {self.name}>"


class ClientSettings(Base):
    """Client-specific settings and preferences"""
    __tablename__ = "client_settings"
    
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid4()))
    client_id = Column(String, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, unique=True)
    
    # Theme settings
    theme = Column(JSON, default=lambda: {
        "primaryColor": "#007bff",
        "secondaryColor": "#6c757d",
        "logoPosition": "left"
    })
    
    # Notification settings
    notifications = Column(JSON, default=lambda: {
        "email": True,
        "slack": False,
        "slackWebhookUrl": None
    })
    
    # Feature toggles
    features = Column(JSON, default=lambda: {
        "collaborationEnabled": True,
        "exportEnabled": True,
        "customDomainEnabled": False
    })
    
    # Localization settings
    locale = Column(String, default="en-US")
    timezone = Column(String, default="UTC")
    
    # Relationship
    client = relationship("Client", back_populates="settings")
    
    def __repr__(self):
        return f"<ClientSettings for {self.client_id}>"


class ClientMember(Base):
    """Association between clients and users (team members)"""
    __tablename__ = "client_members"
    
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid4()))
    client_id = Column(String, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Role within the organization
    role = Column(String, default="member", nullable=False)  # owner, admin, member, viewer
    
    # Invitation and join tracking
    invited_by = Column(String, ForeignKey("users.id"), nullable=True)
    invited_at = Column(DateTime, default=func.now(), nullable=False)
    joined_at = Column(DateTime, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Relationships
    client = relationship("Client", back_populates="members")
    user = relationship("User", foreign_keys=[user_id], back_populates="client_memberships")
    inviter = relationship("User", foreign_keys=[invited_by])
    
    # Define a unique constraint for user_id and client_id
    __table_args__ = (
        {"unique_constraint": ("user_id", "client_id")},
    )
    
    def __repr__(self):
        return f"<ClientMember {self.user_id} in {self.client_id} as {self.role}>"
