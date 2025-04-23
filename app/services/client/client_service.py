from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException
from uuid import uuid4
import logging

from app.models.client import Client, ClientSettings, ClientMember
from app.models.user import User
from app.schemas.client import ClientCreate, ClientUpdate, ClientMemberCreate, ClientSettingsCreate

logger = logging.getLogger(__name__)


class ClientService:
    """
    Service for managing client organizations
    """
    
    @staticmethod
    def create_client(db: Session, data: ClientCreate, user_id: str) -> Client:
        """
        Create a new client organization
        
        Args:
            db: Database session
            data: Client creation data
            user_id: ID of the user creating the client (will become the owner)
            
        Returns:
            The created client
        """
        # Check if user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Create client with settings
        client_id = str(uuid4())
        client = Client(
            id=client_id,
            name=data.name,
            logo_url=data.logo_url,
            industry=data.industry,
            description=data.description,
            website=data.website,
            primary_contact_name=data.primary_contact_name,
            primary_contact_email=data.primary_contact_email,
            primary_contact_phone=data.primary_contact_phone,
            is_active=data.is_active
        )
        
        db.add(client)
        
        # Create settings if provided, otherwise use defaults
        settings_data = data.settings if data.settings else ClientSettingsCreate()
        settings = ClientSettings(
            id=str(uuid4()),
            client_id=client_id,
            theme=settings_data.theme,
            notifications=settings_data.notifications,
            features=settings_data.features,
            locale=settings_data.locale,
            timezone=settings_data.timezone
        )
        
        db.add(settings)
        
        # Add creator as owner
        member = ClientMember(
            id=str(uuid4()),
            client_id=client_id,
            user_id=user_id,
            role="owner",
            invited_by=user_id,
            joined_at=func.now()
        )
        
        db.add(member)
        
        try:
            db.commit()
            db.refresh(client)
            return client
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating client: {e}")
            raise HTTPException(status_code=500, detail="Failed to create client")
    
    @staticmethod
    def get_clients(
        db: Session, 
        user_id: str,
        skip: int = 0, 
        limit: int = 100, 
        search: Optional[str] = None,
        is_active: Optional[bool] = None
    ) -> Tuple[List[Client], int]:
        """
        Get clients for a user
        
        Args:
            db: Database session
            user_id: ID of the user
            skip: Number of clients to skip
            limit: Maximum number of clients to return
            search: Optional search term for client name
            is_active: Optional filter for active/inactive clients
            
        Returns:
            Tuple of (list of clients, total count)
        """
        # Base query for clients where user is a member
        query = db.query(Client).join(
            ClientMember, 
            Client.id == ClientMember.client_id
        ).filter(
            ClientMember.user_id == user_id,
            ClientMember.is_active == True
        )
        
        # Apply filters
        if search:
            query = query.filter(Client.name.ilike(f"%{search}%"))
        
        if is_active is not None:
            query = query.filter(Client.is_active == is_active)
        
        # Get total count
        total = query.count()
        
        # Get paginated results
        clients = query.order_by(Client.name).offset(skip).limit(limit).all()
        
        return clients, total
    
    @staticmethod
    def get_client(db: Session, client_id: str, user_id: str) -> Client:
        """
        Get a client by ID, checking if user has access
        
        Args:
            db: Database session
            client_id: ID of the client to get
            user_id: ID of the user trying to access
            
        Returns:
            The client if found and user has access
        """
        # Check if user has access to this client
        membership = db.query(ClientMember).filter(
            ClientMember.client_id == client_id,
            ClientMember.user_id == user_id,
            ClientMember.is_active == True
        ).first()
        
        if not membership:
            raise HTTPException(status_code=403, detail="You don't have access to this client")
        
        client = db.query(Client).filter(Client.id == client_id).first()
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        
        return client
    
    @staticmethod
    def update_client(db: Session, client_id: str, user_id: str, data: ClientUpdate) -> Client:
        """
        Update a client
        
        Args:
            db: Database session
            client_id: ID of the client to update
            user_id: ID of the user making the update
            data: Client update data
            
        Returns:
            The updated client
        """
        # Check user has admin/owner access
        membership = db.query(ClientMember).filter(
            ClientMember.client_id == client_id,
            ClientMember.user_id == user_id,
            ClientMember.is_active == True,
            ClientMember.role.in_(["owner", "admin"])
        ).first()
        
        if not membership:
            raise HTTPException(
                status_code=403, 
                detail="You don't have permission to update this client"
            )
        
        # Get client
        client = db.query(Client).filter(Client.id == client_id).first()
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        
        # Update client fields
        update_data = data.dict(exclude_unset=True)
        settings_data = update_data.pop('settings', None)
        
        for key, value in update_data.items():
            setattr(client, key, value)
            
        # Update settings if provided
        if settings_data:
            settings = db.query(ClientSettings).filter(
                ClientSettings.client_id == client_id
            ).first()
            
            if not settings:
                # Create settings if they don't exist
                settings = ClientSettings(
                    id=str(uuid4()),
                    client_id=client_id
                )
                db.add(settings)
            
            # Update settings fields
            for key, value in settings_data.items():
                setattr(settings, key, value)
        
        try:
            db.commit()
            db.refresh(client)
            return client
        except Exception as e:
            db.rollback()
            logger.error(f"Error updating client: {e}")
            raise HTTPException(status_code=500, detail="Failed to update client")
    
    @staticmethod
    def delete_client(db: Session, client_id: str, user_id: str) -> bool:
        """
        Delete (deactivate) a client
        
        Args:
            db: Database session
            client_id: ID of the client to delete
            user_id: ID of the user requesting deletion
            
        Returns:
            True if successful
        """
        # Check user has owner access
        membership = db.query(ClientMember).filter(
            ClientMember.client_id == client_id,
            ClientMember.user_id == user_id,
            ClientMember.is_active == True,
            ClientMember.role == "owner"
        ).first()
        
        if not membership:
            raise HTTPException(
                status_code=403, 
                detail="Only the owner can delete a client"
            )
        
        # Get client
        client = db.query(Client).filter(Client.id == client_id).first()
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        
        # Soft delete (mark as inactive)
        client.is_active = False
        
        try:
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            logger.error(f"Error deleting client: {e}")
            raise HTTPException(status_code=500, detail="Failed to delete client")
    
    @staticmethod
    def add_member(db: Session, client_id: str, user_id: str, data: ClientMemberCreate) -> ClientMember:
        """
        Add a member to a client
        
        Args:
            db: Database session
            client_id: ID of the client
            user_id: ID of the user adding the member
            data: Member data
            
        Returns:
            The created client member
        """
        # Check user has admin/owner access
        membership = db.query(ClientMember).filter(
            ClientMember.client_id == client_id,
            ClientMember.user_id == user_id,
            ClientMember.is_active == True,
            ClientMember.role.in_(["owner", "admin"])
        ).first()
        
        if not membership:
            raise HTTPException(
                status_code=403, 
                detail="You don't have permission to add members"
            )
        
        # Check client exists
        client = db.query(Client).filter(Client.id == client_id).first()
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        
        # Check if target user exists
        target_user = db.query(User).filter(User.id == data.user_id).first()
        if not target_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if user is already a member
        existing_member = db.query(ClientMember).filter(
            ClientMember.client_id == client_id,
            ClientMember.user_id == data.user_id
        ).first()
        
        if existing_member:
            if existing_member.is_active:
                raise HTTPException(status_code=400, detail="User is already a member")
            
            # Reactivate if inactive
            existing_member.is_active = True
            existing_member.role = data.role
            existing_member.invited_by = user_id
            existing_member.invited_at = func.now()
            
            try:
                db.commit()
                db.refresh(existing_member)
                return existing_member
            except Exception as e:
                db.rollback()
                logger.error(f"Error reactivating member: {e}")
                raise HTTPException(status_code=500, detail="Failed to add member")
        
        # Create new member
        member = ClientMember(
            id=str(uuid4()),
            client_id=client_id,
            user_id=data.user_id,
            role=data.role,
            invited_by=user_id,
            joined_at=func.now()  # Assume direct add (not invitation)
        )
        
        db.add(member)
        
        try:
            db.commit()
            db.refresh(member)
            return member
        except Exception as e:
            db.rollback()
            logger.error(f"Error adding member: {e}")
            raise HTTPException(status_code=500, detail="Failed to add member")
    
    @staticmethod
    def remove_member(db: Session, client_id: str, user_id: str, member_id: str) -> bool:
        """
        Remove a member from a client
        
        Args:
            db: Database session
            client_id: ID of the client
            user_id: ID of the user removing the member
            member_id: ID of the member to remove
            
        Returns:
            True if successful
        """
        # Check user has admin/owner access
        membership = db.query(ClientMember).filter(
            ClientMember.client_id == client_id,
            ClientMember.user_id == user_id,
            ClientMember.is_active == True,
            ClientMember.role.in_(["owner", "admin"])
        ).first()
        
        if not membership:
            raise HTTPException(
                status_code=403, 
                detail="You don't have permission to remove members"
            )
        
        # Get target member
        target_member = db.query(ClientMember).filter(
            ClientMember.id == member_id,
            ClientMember.client_id == client_id
        ).first()
        
        if not target_member:
            raise HTTPException(status_code=404, detail="Member not found")
        
        # Cannot remove the owner
        if target_member.role == "owner":
            raise HTTPException(status_code=400, detail="Cannot remove the owner")
        
        # If admin, cannot remove another admin
        if membership.role == "admin" and target_member.role == "admin":
            raise HTTPException(status_code=403, detail="Admins cannot remove other admins")
        
        # Cannot remove yourself
        if target_member.user_id == user_id:
            raise HTTPException(status_code=400, detail="Cannot remove yourself")
        
        # Soft delete (mark as inactive)
        target_member.is_active = False
        
        try:
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            logger.error(f"Error removing member: {e}")
            raise HTTPException(status_code=500, detail="Failed to remove member")
    
    @staticmethod
    def update_member_role(
        db: Session, client_id: str, user_id: str, member_id: str, new_role: str
    ) -> ClientMember:
        """
        Update a member's role
        
        Args:
            db: Database session
            client_id: ID of the client
            user_id: ID of the user updating the role
            member_id: ID of the member to update
            new_role: New role to assign
            
        Returns:
            The updated member
        """
        # Check user has admin/owner access
        membership = db.query(ClientMember).filter(
            ClientMember.client_id == client_id,
            ClientMember.user_id == user_id,
            ClientMember.is_active == True,
            ClientMember.role.in_(["owner", "admin"])
        ).first()
        
        if not membership:
            raise HTTPException(
                status_code=403, 
                detail="You don't have permission to update member roles"
            )
        
        # Get target member
        target_member = db.query(ClientMember).filter(
            ClientMember.id == member_id,
            ClientMember.client_id == client_id,
            ClientMember.is_active == True
        ).first()
        
        if not target_member:
            raise HTTPException(status_code=404, detail="Member not found")
        
        # Validate role
        allowed_roles = ["admin", "member", "viewer"]
        if new_role not in allowed_roles:
            raise HTTPException(
                status_code=400, 
                detail=f"Role must be one of: {', '.join(allowed_roles)}"
            )
        
        # Only owner can promote to admin
        if new_role == "admin" and membership.role != "owner":
            raise HTTPException(
                status_code=403, 
                detail="Only the owner can promote members to admin"
            )
        
        # Cannot change role of the owner
        if target_member.role == "owner":
            raise HTTPException(status_code=400, detail="Cannot change the role of the owner")
        
        # If admin, cannot change role of another admin
        if membership.role == "admin" and target_member.role == "admin":
            raise HTTPException(status_code=403, detail="Admins cannot change the role of other admins")
        
        # Update role
        target_member.role = new_role
        
        try:
            db.commit()
            db.refresh(target_member)
            return target_member
        except Exception as e:
            db.rollback()
            logger.error(f"Error updating member role: {e}")
            raise HTTPException(status_code=500, detail="Failed to update member role")
