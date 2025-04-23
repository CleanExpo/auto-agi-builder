from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.services.client.client_service import ClientService
from app.schemas.client import (
    ClientCreate, 
    ClientUpdate, 
    ClientResponse, 
    ClientDetailResponse,
    ClientListResponse,
    ClientMemberCreate,
    ClientMemberResponse,
    ClientMemberUpdate,
    ClientInvitation
)

router = APIRouter()


@router.post("/", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
def create_client(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    client_in: ClientCreate
):
    """
    Create new client organization.
    """
    client = ClientService.create_client(db, client_in, current_user.id)
    return client


@router.get("/", response_model=ClientListResponse)
def get_clients(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    search: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None)
):
    """
    Get list of clients for current user.
    """
    clients, total = ClientService.get_clients(
        db, current_user.id, skip, limit, search, is_active
    )
    
    return {
        "items": clients,
        "total": total,
        "page": skip // limit + 1 if limit > 0 else 1,
        "size": limit,
        "pages": (total + limit - 1) // limit if limit > 0 else 1
    }


@router.get("/{client_id}", response_model=ClientDetailResponse)
def get_client(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    client_id: str = Path(..., title="The ID of the client to get")
):
    """
    Get detailed information for a specific client.
    """
    client = ClientService.get_client(db, client_id, current_user.id)
    return client


@router.put("/{client_id}", response_model=ClientResponse)
def update_client(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    client_id: str = Path(..., title="The ID of the client to update"),
    client_in: ClientUpdate
):
    """
    Update a client organization.
    """
    client = ClientService.update_client(db, client_id, current_user.id, client_in)
    return client


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_client(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    client_id: str = Path(..., title="The ID of the client to delete")
):
    """
    Delete a client organization (soft delete).
    """
    ClientService.delete_client(db, client_id, current_user.id)
    return None


# Member management endpoints
@router.post("/{client_id}/members", response_model=ClientMemberResponse)
def add_member(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    client_id: str = Path(..., title="The ID of the client"),
    member_in: ClientMemberCreate
):
    """
    Add a member to a client organization.
    """
    member = ClientService.add_member(db, client_id, current_user.id, member_in)
    return member


@router.delete("/{client_id}/members/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_member(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    client_id: str = Path(..., title="The ID of the client"),
    member_id: str = Path(..., title="The ID of the member to remove")
):
    """
    Remove a member from a client organization.
    """
    ClientService.remove_member(db, client_id, current_user.id, member_id)
    return None


@router.patch("/{client_id}/members/{member_id}/role", response_model=ClientMemberResponse)
def update_member_role(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    client_id: str = Path(..., title="The ID of the client"),
    member_id: str = Path(..., title="The ID of the member"),
    role_update: ClientMemberUpdate
):
    """
    Update a member's role in a client organization.
    """
    if not role_update.role:
        raise HTTPException(status_code=400, detail="Role is required")
    
    member = ClientService.update_member_role(
        db, client_id, current_user.id, member_id, role_update.role
    )
    return member


# Invitation endpoints
@router.post("/{client_id}/invitations", response_model=ClientMemberResponse)
def invite_member(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    client_id: str = Path(..., title="The ID of the client"),
    invitation: ClientInvitation
):
    """
    Invite a new member to join a client organization.
    
    This creates a pending invitation and sends an email to the invitee.
    """
    # This would typically:
    # 1. Create an invitation record
    # 2. Send an email via a service like SendGrid
    # 3. Return the invitation details
    
    # For now, use a placeholder implementation
    raise HTTPException(
        status_code=501, 
        detail="Invitation functionality not yet implemented"
    )
