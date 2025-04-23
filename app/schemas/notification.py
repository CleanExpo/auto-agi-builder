from datetime import datetime
from typing import Optional, List, Union
from uuid import UUID
from pydantic import BaseModel, Field, validator

from app.models.notification import NotificationType, NotificationCategory


class NotificationBase(BaseModel):
    """Base schema for notification data"""
    title: str = Field(..., min_length=1, max_length=255)
    message: str = Field(..., min_length=1)
    type: NotificationType = Field(default=NotificationType.INFO)
    category: NotificationCategory = Field(default=NotificationCategory.SYSTEM)
    action_url: Optional[str] = Field(None, max_length=255)
    expires_at: Optional[datetime] = None
    project_id: Optional[UUID] = None
    client_id: Optional[UUID] = None
    task_id: Optional[UUID] = None
    is_global: bool = Field(default=False)
    priority: int = Field(default=0, ge=0, le=10)


class NotificationCreate(NotificationBase):
    """Schema for creating a new notification"""
    user_id: Optional[UUID] = None  # Can be None for global notifications


class NotificationUpdate(BaseModel):
    """Schema for updating a notification"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    message: Optional[str] = Field(None, min_length=1)
    type: Optional[NotificationType] = None
    category: Optional[NotificationCategory] = None
    is_read: Optional[bool] = None
    is_archived: Optional[bool] = None
    action_url: Optional[str] = Field(None, max_length=255)
    expires_at: Optional[datetime] = None
    priority: Optional[int] = Field(None, ge=0, le=10)


class NotificationResponse(NotificationBase):
    """Schema for notification response"""
    id: UUID
    user_id: UUID
    is_read: bool
    is_archived: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class NotificationListResponse(BaseModel):
    """Schema for notification list response"""
    items: List[NotificationResponse]
    total: int
    page: int
    size: int
    pages: int
    unread_count: int


class NotificationFilterParams(BaseModel):
    """Schema for notification filter parameters"""
    is_read: Optional[bool] = None
    is_archived: Optional[bool] = None
    type: Optional[NotificationType] = None
    category: Optional[NotificationCategory] = None
    search: Optional[str] = None
    from_date: Optional[datetime] = None
    to_date: Optional[datetime] = None
    priority_min: Optional[int] = Field(None, ge=0, le=10)
    priority_max: Optional[int] = Field(None, ge=0, le=10)
    project_id: Optional[UUID] = None
    client_id: Optional[UUID] = None
    task_id: Optional[UUID] = None
    is_global: Optional[bool] = None


class NotificationMarkRead(BaseModel):
    """Schema for marking notifications as read"""
    notification_ids: List[UUID] = Field(..., min_items=1)
    is_read: bool = True


class NotificationMarkArchived(BaseModel):
    """Schema for marking notifications as archived"""
    notification_ids: List[UUID] = Field(..., min_items=1)
    is_archived: bool = True


class NotificationBulkDelete(BaseModel):
    """Schema for bulk deleting notifications"""
    notification_ids: List[UUID] = Field(..., min_items=1)


class NotificationSettings(BaseModel):
    """Schema for notification settings"""
    email_notifications: bool = True
    push_notifications: bool = True
    in_app_notifications: bool = True
    
    # Granular notification preferences by category
    system_notifications: bool = True
    project_notifications: bool = True
    client_notifications: bool = True
    task_notifications: bool = True
    prototype_notifications: bool = True
    collaboration_notifications: bool = True
    billing_notifications: bool = True
    security_notifications: bool = True
    
    # Notification frequency settings
    digest_frequency: Optional[str] = "daily"  # Options: "none", "daily", "weekly"
    quiet_hours_start: Optional[int] = None  # Hour of day (0-23)
    quiet_hours_end: Optional[int] = None  # Hour of day (0-23)
    
    # Minimum priority threshold (0-10, where 0 is all notifications)
    minimum_priority: int = Field(0, ge=0, le=10)
    
    class Config:
        orm_mode = True


class NotificationSettingsUpdate(BaseModel):
    """Schema for updating notification settings"""
    email_notifications: Optional[bool] = None
    push_notifications: Optional[bool] = None
    in_app_notifications: Optional[bool] = None
    system_notifications: Optional[bool] = None
    project_notifications: Optional[bool] = None
    client_notifications: Optional[bool] = None
    task_notifications: Optional[bool] = None
    prototype_notifications: Optional[bool] = None
    collaboration_notifications: Optional[bool] = None
    billing_notifications: Optional[bool] = None
    security_notifications: Optional[bool] = None
    digest_frequency: Optional[str] = None
    quiet_hours_start: Optional[int] = Field(None, ge=0, le=23)
    quiet_hours_end: Optional[int] = Field(None, ge=0, le=23)
    minimum_priority: Optional[int] = Field(None, ge=0, le=10)
    
    @validator('digest_frequency')
    def validate_digest_frequency(cls, v):
        if v is not None and v not in ["none", "daily", "weekly"]:
            raise ValueError('digest_frequency must be one of "none", "daily", "weekly"')
        return v
    
    @validator('quiet_hours_end')
    def validate_quiet_hours(cls, v, values):
        if v is not None and values.get('quiet_hours_start') is not None:
            if v == values.get('quiet_hours_start'):
                raise ValueError('quiet_hours_end must be different from quiet_hours_start')
        return v
