from typing import Any, Dict, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class Token(BaseModel):
    """
    Token schema for authentication responses
    
    Contains access token, refresh token, token type, 
    and basic user information
    """
    access_token: str
    refresh_token: str
    token_type: str
    user: Dict[str, Any]


class TokenPayload(BaseModel):
    """
    JWT token payload schema
    
    Used for token validation and decoding
    """
    sub: Optional[UUID] = None
    exp: Optional[int] = None
    type: Optional[str] = Field(None, description="Token type - access or refresh")


class RefreshTokenRequest(BaseModel):
    """
    Schema for requesting a token refresh
    """
    refresh_token: str = Field(..., description="Valid refresh token")
