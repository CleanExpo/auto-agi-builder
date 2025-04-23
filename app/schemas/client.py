from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr, HttpUrl, validator
from uuid import UUID


# Base schemas - used for creating objects
class ClientSettingsBase(BaseModel):
    theme: Optional[Dict[str, Any]] = Field(
        default={
            "primaryColor": "#007bff",
            "secondaryColor": "#6c757d",
            "logoPosition": "left"
        }
    )
    notifications: Optional[Dict[str, Any]] = Field(
        default={
            "email": True,
            "slack": False,
            "slackWebhookUrl": None
        }
    )
    features: Optional[Dict[str, Any]] = Field(
        default={
            "collaborationEnabled": True,
            "exportEnabled": True,
            "customDomainEnabled": False
        }
    )
    locale: Optional[str] = "en-US"
    timezone: Optional[str] = "UTC"


class ClientBase(BaseModel):
    name: str
    logo_url: Optional[str] = None
    industry: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    primary_contact_name: Optional[str] = None
    primary_contact_email: Optional[EmailStr] = None
    primary_contact_phone: Optional[str] = None
    is_active: Optional[bool] = True


class ClientMemberBase(BaseModel):
    user_id: str
    role: str = Field(default="member")
    
    @validator('role')
    def validate_role(cls, v):
        allowed_roles = ["owner", "admin", "member", "viewer"]
        if v not in allowed_roles:
            raise ValueError(f"Role must be one of: {', '.join(allowed_roles)}")
        return v


# Create schemas - used for creating new objects
class ClientSettingsCreate(ClientSettingsBase):
    pass


class ClientCreate(ClientBase):
    settings: Optional[ClientSettingsCreate] = None


class ClientMemberCreate(ClientMemberBase):
    pass


# Update schemas - used for updating existing objects
class ClientSettingsUpdate(ClientSettingsBase):
    pass


class ClientUpdate(ClientBase):
    name: Optional[str] = None
    settings: Optional[ClientSettingsCreate] = None


class ClientMemberUpdate(BaseModel):
    role: Optional[str] = None
    is_active: Optional[bool] = None

    @validator('role')
    def validate_role(cls, v):
        if v is not None:
            allowed_roles = ["owner", "admin", "member", "viewer"]
            if v not in allowed_roles:
                raise ValueError(f"Role must be one of: {', '.join(allowed_roles)}")
        return v


# Response schemas - used for API responses
class ClientSettingsResponse(ClientSettingsBase):
    id: str
    client_id: str

    class Config:
        orm_mode = True


class ClientMemberResponse(ClientMemberBase):
    id: str
    client_id: str
    invited_by: Optional[str] = None
    invited_at: datetime
    joined_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    is_active: bool

    class Config:
        orm_mode = True


class ClientResponse(ClientBase):
    id: str
    created_at: datetime
    updated_at: datetime
    settings: Optional[ClientSettingsResponse] = None
    members_count: Optional[int] = None

    class Config:
        orm_mode = True


class ClientDetailResponse(ClientResponse):
    members: List[ClientMemberResponse] = []

    class Config:
        orm_mode = True


# Special schemas
class ClientInvitation(BaseModel):
    email: EmailStr
    role: str = Field(default="member")
    message: Optional[str] = None

    @validator('role')
    def validate_role(cls, v):
        allowed_roles = ["admin", "member", "viewer"]  # Cannot invite as owner
        if v not in allowed_roles:
            raise ValueError(f"Role must be one of: {', '.join(allowed_roles)}")
        return v


class ClientInvitationResponse(BaseModel):
    id: str
    client_id: str
    email: EmailStr
    role: str
    invited_by: str
    invited_at: datetime
    status: str  # "pending", "accepted", "declined", "expired"
    
    class Config:
        orm_mode = True


# List response
class ClientListResponse(BaseModel):
    items: List[ClientResponse]
    total: int
    page: int
    size: int
    pages: int
