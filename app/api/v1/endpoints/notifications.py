from typing import List, Optional, Dict, Any
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.auth.jwt import get_current_user
from app.models.user import User
from app.models.notification import NotificationType, NotificationCategory
from app.schemas.notification import (
    NotificationCreate,
    NotificationUpdate,
    NotificationResponse,
    NotificationListResponse,
    NotificationFilterParams,
    NotificationMarkRead,
    NotificationMarkArchived,
    NotificationBulkDelete,
    NotificationSettings,
    NotificationSettingsUpdate
)
from app.services.notification.notification_service import NotificationService

router = APIRouter()

# CRUD Operations

@router.post("", response_model=NotificationResponse, status_code=201)
async def create_notification(
    data: NotificationCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new notification.
    
    If user_id is not provided, it will use the current user's ID.
    Admin users can create notifications for any user.
    """
    service = NotificationService(db)
    
    # If user_id is not provided, use current user's ID
    if not data.user_id:
        data.user_id = current_user.id
    
    # Only admins can create notifications for other users or global notifications
    if (data.user_id != current_user.id or data.is_global) and not current_user.is_admin:
        raise HTTPException(
            status_code=403, 
            detail="Only administrators can create notifications for other users or global notifications"
        )
    
    return await service.create_notification(data, background_tasks)

@router.get("", response_model=NotificationListResponse)
async def list_notifications(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    is_read: Optional[bool] = None,
    is_archived: Optional[bool] = None,
    type: Optional[NotificationType] = None,
    category: Optional[NotificationCategory] = None,
    project_id: Optional[UUID] = None,
    client_id: Optional[UUID] = None,
    task_id: Optional[UUID] = None,
    search: Optional[str] = None,
    sort_by: str = "created_at",
    sort_dir: str = "desc",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List notifications for the current user with filtering and pagination"""
    service = NotificationService(db)
    
    # Create filter parameters from query params
    filter_params = NotificationFilterParams(
        is_read=is_read,
        is_archived=is_archived,
        type=type,
        category=category,
        project_id=project_id,
        client_id=client_id,
        task_id=task_id,
        search=search
    )
    
    return await service.list_notifications(
        user_id=current_user.id,
        page=page,
        size=size,
        filter_params=filter_params,
        sort_by=sort_by,
        sort_dir=sort_dir
    )

@router.get("/unread-count", response_model=int)
async def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get count of unread notifications for the current user"""
    service = NotificationService(db)
    
    result = await service.list_notifications(
        user_id=current_user.id,
        page=1,
        size=1,
        filter_params=NotificationFilterParams(is_read=False, is_archived=False)
    )
    
    return result["unread_count"]

@router.get("/{notification_id}", response_model=NotificationResponse)
async def get_notification(
    notification_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a notification by ID"""
    service = NotificationService(db)
    return await service.get_notification(notification_id, current_user.id)

@router.put("/{notification_id}", response_model=NotificationResponse)
async def update_notification(
    notification_id: UUID,
    data: NotificationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a notification"""
    service = NotificationService(db)
    
    # Check if admin for certain operations
    if not current_user.is_admin:
        # Get notification to check ownership
        notification = await service.get_notification(notification_id, current_user.id)
        
        # Non-admins can only update is_read and is_archived on their own notifications
        allowed_fields = {"is_read", "is_archived"}
        update_fields = set(data.dict(exclude_unset=True).keys())
        
        if notification.user_id != current_user.id or not update_fields.issubset(allowed_fields):
            raise HTTPException(
                status_code=403,
                detail="You can only update read/archive status of your own notifications"
            )
    
    return await service.update_notification(notification_id, data, current_user.id)

@router.delete("/{notification_id}", response_model=bool)
async def delete_notification(
    notification_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a notification"""
    service = NotificationService(db)
    
    # Only admins can delete any notification, users can only delete their own
    if not current_user.is_admin:
        # Get notification to check ownership
        notification = await service.get_notification(notification_id, current_user.id)
        
        if notification.user_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="You can only delete your own notifications"
            )
    
    return await service.delete_notification(notification_id, current_user.id)

# Bulk Operations

@router.post("/mark-read", response_model=int)
async def mark_notifications_as_read(
    data: NotificationMarkRead,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark multiple notifications as read/unread"""
    service = NotificationService(db)
    return await service.mark_notifications_as_read(
        user_id=current_user.id,
        notification_ids=data.notification_ids,
        is_read=data.is_read
    )

@router.post("/mark-all-read", response_model=int)
async def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark all notifications as read for the current user"""
    service = NotificationService(db)
    return await service.mark_all_as_read(current_user.id)

@router.post("/mark-archived", response_model=int)
async def mark_notifications_as_archived(
    data: NotificationMarkArchived,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark multiple notifications as archived/unarchived"""
    service = NotificationService(db)
    return await service.mark_notifications_as_archived(
        user_id=current_user.id,
        notification_ids=data.notification_ids,
        is_archived=data.is_archived
    )

@router.post("/bulk-delete", response_model=int)
async def bulk_delete_notifications(
    data: NotificationBulkDelete,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete multiple notifications"""
    service = NotificationService(db)
    
    # Only admins can bulk delete any notifications
    if not current_user.is_admin:
        # For non-admins, filter to only their notifications
        # This is handled in the service by passing the user_id
        pass
    
    return await service.bulk_delete_notifications(
        user_id=current_user.id,
        notification_ids=data.notification_ids
    )

# Notification Settings

@router.get("/settings", response_model=NotificationSettings)
async def get_notification_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get notification settings for the current user"""
    service = NotificationService(db)
    settings = await service.get_notification_settings(current_user.id)
    return NotificationSettings(**settings)

@router.put("/settings", response_model=NotificationSettings)
async def update_notification_settings(
    data: NotificationSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update notification settings for the current user"""
    service = NotificationService(db)
    settings = await service.update_notification_settings(current_user.id, data)
    return NotificationSettings(**settings)

# Admin Operations

@router.delete("/expired", response_model=int)
async def delete_expired_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete all expired notifications (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Only administrators can delete expired notifications"
        )
    
    service = NotificationService(db)
    return await service.delete_expired_notifications()

@router.post("/global", response_model=NotificationResponse, status_code=201)
async def create_global_notification(
    data: NotificationCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a global notification (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Only administrators can create global notifications"
        )
    
    # Ensure notification is global
    data.is_global = True
    # For global notifications, user_id is None
    data.user_id = None
    
    service = NotificationService(db)
    return await service.create_notification(data, background_tasks)
