from typing import List, Optional, Dict, Any, Union
from uuid import UUID
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, func, and_, or_
from fastapi import HTTPException, BackgroundTasks

from app.models.notification import Notification, NotificationType, NotificationCategory
from app.models.user import User
from app.schemas.notification import (
    NotificationCreate, 
    NotificationUpdate,
    NotificationFilterParams,
    NotificationSettings,
    NotificationSettingsUpdate
)
from app.services.email.sendgrid_service import SendgridService


class NotificationService:
    """Service for managing user notifications"""
    
    def __init__(self, db: Session):
        self.db = db
        self.email_service = SendgridService()
    
    # CRUD Operations
    
    async def create_notification(
        self, 
        data: NotificationCreate, 
        background_tasks: Optional[BackgroundTasks] = None
    ) -> Notification:
        """Create a new notification"""
        
        # Create notification instance
        db_notification = Notification(
            user_id=data.user_id,
            title=data.title,
            message=data.message,
            type=data.type,
            category=data.category,
            action_url=data.action_url,
            expires_at=data.expires_at,
            project_id=data.project_id,
            client_id=data.client_id,
            task_id=data.task_id,
            is_global=data.is_global,
            priority=data.priority
        )
        
        # Add and commit to DB
        self.db.add(db_notification)
        self.db.commit()
        self.db.refresh(db_notification)
        
        # Handle additional notification channels if background_tasks is provided
        if background_tasks and data.user_id:
            self._schedule_external_notifications(background_tasks, db_notification, data.user_id)
        
        return db_notification
    
    async def get_notification(
        self, 
        notification_id: UUID, 
        user_id: Optional[UUID] = None
    ) -> Notification:
        """Get a notification by ID with optional user filtering"""
        query = self.db.query(Notification).filter(Notification.id == notification_id)
        
        # Filter by user if provided (for security)
        if user_id:
            query = query.filter(
                or_(
                    Notification.user_id == user_id,
                    Notification.is_global == True
                )
            )
        
        notification = query.first()
        if not notification:
            raise HTTPException(status_code=404, detail="Notification not found")
        
        return notification
    
    async def list_notifications(
        self, 
        user_id: UUID,
        page: int = 1,
        size: int = 20,
        filter_params: Optional[NotificationFilterParams] = None,
        sort_by: str = "created_at",
        sort_dir: str = "desc"
    ) -> Dict[str, Any]:
        """List notifications for a user with filtering, sorting and pagination"""
        # Base query for user notifications and global notifications
        query = self.db.query(Notification).filter(
            or_(
                Notification.user_id == user_id,
                Notification.is_global == True
            )
        )
        
        # Apply filters if provided
        if filter_params:
            query = self._apply_filters(query, filter_params)
        
        # Get total count before pagination
        total = query.count()
        
        # Count unread notifications
        unread_count = self.db.query(func.count(Notification.id)).filter(
            and_(
                or_(
                    Notification.user_id == user_id,
                    Notification.is_global == True
                ),
                Notification.is_read == False,
                Notification.is_archived == False
            )
        ).scalar()
        
        # Calculate pages
        pages = (total + size - 1) // size if size > 0 else 0
        
        # Apply sorting
        if sort_dir.lower() == "asc":
            query = query.order_by(asc(getattr(Notification, sort_by)))
        else:
            query = query.order_by(desc(getattr(Notification, sort_by)))
        
        # Apply pagination
        query = query.offset((page - 1) * size).limit(size)
        
        # Execute query
        items = query.all()
        
        return {
            "items": items,
            "total": total,
            "page": page,
            "size": size,
            "pages": pages,
            "unread_count": unread_count
        }
    
    async def update_notification(
        self, 
        notification_id: UUID, 
        data: NotificationUpdate,
        user_id: Optional[UUID] = None
    ) -> Notification:
        """Update a notification"""
        notification = await self.get_notification(notification_id, user_id)
        
        # Update notification fields
        update_data = data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(notification, field, value)
        
        # Update the updated_at timestamp
        notification.updated_at = datetime.utcnow()
        
        # Commit changes
        self.db.commit()
        self.db.refresh(notification)
        
        return notification
    
    async def delete_notification(
        self, 
        notification_id: UUID,
        user_id: Optional[UUID] = None
    ) -> bool:
        """Delete a notification"""
        notification = await self.get_notification(notification_id, user_id)
        
        # Delete the notification
        self.db.delete(notification)
        self.db.commit()
        
        return True
    
    # Bulk Operations
    
    async def mark_notifications_as_read(
        self, 
        user_id: UUID,
        notification_ids: List[UUID],
        is_read: bool = True
    ) -> int:
        """Mark multiple notifications as read/unread"""
        result = self.db.query(Notification).filter(
            and_(
                Notification.id.in_(notification_ids),
                or_(
                    Notification.user_id == user_id,
                    Notification.is_global == True
                )
            )
        ).update(
            {"is_read": is_read, "updated_at": datetime.utcnow()},
            synchronize_session=False
        )
        
        self.db.commit()
        return result
    
    async def mark_all_as_read(self, user_id: UUID) -> int:
        """Mark all user's notifications as read"""
        result = self.db.query(Notification).filter(
            and_(
                or_(
                    Notification.user_id == user_id,
                    Notification.is_global == True
                ),
                Notification.is_read == False
            )
        ).update(
            {"is_read": True, "updated_at": datetime.utcnow()},
            synchronize_session=False
        )
        
        self.db.commit()
        return result
    
    async def mark_notifications_as_archived(
        self, 
        user_id: UUID,
        notification_ids: List[UUID],
        is_archived: bool = True
    ) -> int:
        """Mark multiple notifications as archived/unarchived"""
        result = self.db.query(Notification).filter(
            and_(
                Notification.id.in_(notification_ids),
                or_(
                    Notification.user_id == user_id,
                    Notification.is_global == True
                )
            )
        ).update(
            {"is_archived": is_archived, "updated_at": datetime.utcnow()},
            synchronize_session=False
        )
        
        self.db.commit()
        return result
    
    async def bulk_delete_notifications(
        self, 
        user_id: UUID,
        notification_ids: List[UUID]
    ) -> int:
        """Delete multiple notifications"""
        result = self.db.query(Notification).filter(
            and_(
                Notification.id.in_(notification_ids),
                or_(
                    Notification.user_id == user_id,
                    Notification.is_global == True
                )
            )
        ).delete(synchronize_session=False)
        
        self.db.commit()
        return result
    
    async def delete_expired_notifications(self) -> int:
        """Delete all expired notifications (for background task)"""
        now = datetime.utcnow()
        result = self.db.query(Notification).filter(
            and_(
                Notification.expires_at.isnot(None),
                Notification.expires_at < now
            )
        ).delete(synchronize_session=False)
        
        self.db.commit()
        return result
    
    # Notification Settings
    
    async def get_notification_settings(self, user_id: UUID) -> Dict[str, Any]:
        """Get notification settings for a user"""
        # In a full implementation, this would retrieve from a notification_settings table
        # For now, returning default settings
        return {
            "email_notifications": True,
            "push_notifications": True,
            "in_app_notifications": True,
            "system_notifications": True,
            "project_notifications": True,
            "client_notifications": True,
            "task_notifications": True,
            "prototype_notifications": True,
            "collaboration_notifications": True,
            "billing_notifications": True,
            "security_notifications": True,
            "digest_frequency": "daily",
            "quiet_hours_start": None,
            "quiet_hours_end": None,
            "minimum_priority": 0
        }
    
    async def update_notification_settings(
        self, 
        user_id: UUID,
        data: NotificationSettingsUpdate
    ) -> Dict[str, Any]:
        """Update notification settings for a user"""
        # In a full implementation, this would update the notification_settings table
        # For now, just return the updated settings
        current_settings = await self.get_notification_settings(user_id)
        update_data = data.dict(exclude_unset=True)
        
        # Update settings
        for field, value in update_data.items():
            current_settings[field] = value
        
        return current_settings
    
    # Helper Methods
    
    def _apply_filters(
        self, 
        query, 
        filter_params: NotificationFilterParams
    ):
        """Apply filters to the notification query"""
        if filter_params.is_read is not None:
            query = query.filter(Notification.is_read == filter_params.is_read)
        
        if filter_params.is_archived is not None:
            query = query.filter(Notification.is_archived == filter_params.is_archived)
        
        if filter_params.type:
            query = query.filter(Notification.type == filter_params.type)
        
        if filter_params.category:
            query = query.filter(Notification.category == filter_params.category)
        
        if filter_params.search:
            search_term = f"%{filter_params.search}%"
            query = query.filter(
                or_(
                    Notification.title.ilike(search_term),
                    Notification.message.ilike(search_term)
                )
            )
        
        if filter_params.from_date:
            query = query.filter(Notification.created_at >= filter_params.from_date)
        
        if filter_params.to_date:
            query = query.filter(Notification.created_at <= filter_params.to_date)
        
        if filter_params.priority_min is not None:
            query = query.filter(Notification.priority >= filter_params.priority_min)
        
        if filter_params.priority_max is not None:
            query = query.filter(Notification.priority <= filter_params.priority_max)
        
        if filter_params.project_id:
            query = query.filter(Notification.project_id == filter_params.project_id)
        
        if filter_params.client_id:
            query = query.filter(Notification.client_id == filter_params.client_id)
        
        if filter_params.task_id:
            query = query.filter(Notification.task_id == filter_params.task_id)
        
        if filter_params.is_global is not None:
            query = query.filter(Notification.is_global == filter_params.is_global)
        
        return query
    
    def _schedule_external_notifications(
        self, 
        background_tasks: BackgroundTasks,
        notification: Notification,
        user_id: UUID
    ) -> None:
        """Schedule background tasks for email and push notifications"""
        # Get user's notification settings
        settings = self.get_notification_settings(user_id)
        
        # Skip if notification priority is below user's minimum
        if notification.priority < settings.get("minimum_priority", 0):
            return
            
        # Check if in quiet hours
        is_quiet_hours = self._is_quiet_hours(
            settings.get("quiet_hours_start"), 
            settings.get("quiet_hours_end")
        )
        
        # Schedule email notification
        if settings.get("email_notifications", True) and not is_quiet_hours:
            background_tasks.add_task(
                self._send_email_notification,
                notification,
                user_id
            )
        
        # Schedule push notification (if implemented)
        if settings.get("push_notifications", True) and not is_quiet_hours:
            background_tasks.add_task(
                self._send_push_notification,
                notification,
                user_id
            )
    
    def _is_quiet_hours(
        self, 
        start_hour: Optional[int], 
        end_hour: Optional[int]
    ) -> bool:
        """Check if current time is within quiet hours"""
        if start_hour is None or end_hour is None:
            return False
            
        current_hour = datetime.utcnow().hour
        
        if start_hour < end_hour:
            # Simple range, e.g., 22:00 - 06:00
            return start_hour <= current_hour < end_hour
        else:
            # Overnight range, e.g., 22:00 - 06:00
            return current_hour >= start_hour or current_hour < end_hour
    
    async def _send_email_notification(
        self, 
        notification: Notification,
        user_id: UUID
    ) -> None:
        """Send email notification"""
        # Get user's email
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user or not user.email:
            return
            
        # Prepare email data
        subject = f"{notification.type.capitalize()}: {notification.title}"
        content = notification.message
        
        # Add action button if action_url is provided
        if notification.action_url:
            content += f"\n\nView Details: {notification.action_url}"
        
        # Send email
        try:
            # Call SendgridService to send email
            self.email_service.send_email(
                to_email=user.email,
                subject=subject,
                content=content,
                is_html=False
            )
        except Exception as e:
            # Log error but don't raise exception - notification delivery should be non-blocking
            print(f"Failed to send email notification: {str(e)}")
    
    async def _send_push_notification(
        self, 
        notification: Notification,
        user_id: UUID
    ) -> None:
        """Send push notification (placeholder)"""
        # This would integrate with a push notification service
        # such as Firebase Cloud Messaging, OneSignal, etc.
        # For now, this is just a placeholder
        pass
