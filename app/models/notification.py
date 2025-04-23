from datetime import datetime
from typing import Optional, List
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Integer, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
import enum

from app.db.base_class import Base


class NotificationType(str, enum.Enum):
    """Enum for notification types"""
    INFO = "info"
    SUCCESS = "success"
    WARNING = "warning"
    ERROR = "error"
    SYSTEM = "system"


class NotificationCategory(str, enum.Enum):
    """Enum for notification categories"""
    SYSTEM = "system"
    PROJECT = "project"
    CLIENT = "client"
    TASK = "task"
    PROTOTYPE = "prototype"
    COLLABORATION = "collaboration"
    BILLING = "billing"
    SECURITY = "security"
    OTHER = "other"


class Notification(Base):
    """Notification model for storing user notifications"""
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(
        Enum(NotificationType),
        nullable=False, 
        default=NotificationType.INFO,
        server_default=NotificationType.INFO.value
    )
    category = Column(
        Enum(NotificationCategory),
        nullable=False,
        default=NotificationCategory.SYSTEM,
        server_default=NotificationCategory.SYSTEM.value
    )
    is_read = Column(Boolean, nullable=False, default=False, server_default="false")
    is_archived = Column(Boolean, nullable=False, default=False, server_default="false")
    action_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="notifications")
    
    # Optional fields for related entities
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=True)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id"), nullable=True)
    task_id = Column(UUID(as_uuid=True), ForeignKey("tasks.id"), nullable=True)
    
    # For system-wide notifications
    is_global = Column(Boolean, nullable=False, default=False, server_default="false")
    priority = Column(Integer, nullable=False, default=0, server_default="0")
    
    def __repr__(self):
        return f"<Notification(id={self.id}, user_id={self.user_id}, title='{self.title}', type={self.type})>"
    
    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "title": self.title,
            "message": self.message,
            "type": self.type,
            "category": self.category,
            "is_read": self.is_read,
            "is_archived": self.is_archived,
            "action_url": self.action_url,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "project_id": str(self.project_id) if self.project_id else None,
            "client_id": str(self.client_id) if self.client_id else None,
            "task_id": str(self.task_id) if self.task_id else None,
            "is_global": self.is_global,
            "priority": self.priority
        }
