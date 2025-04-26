from typing import Optional
from pydantic import BaseModel, EmailStr, Field, validator
import uuid


class UserBase(BaseModel):
    """Base model with fields common to all user-related schemas"""
    email: EmailStr
    name: Optional[str] = None
    is_active: Optional[bool] = True
    is_superuser: Optional[bool] = False


class UserCreate(UserBase):
    """Schema for creating a new user"""
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")
    password_confirm: str = Field(..., description="Password confirmation for validation")
    
    @validator('password_confirm')
    def passwords_match(cls, v, values, **kwargs):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v


class UserUpdate(BaseModel):
    """Schema for updating an existing user"""
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None
    password: Optional[str] = None


class UserInDBBase(UserBase):
    """Base model for user stored in database, includes id field"""
    id: uuid.UUID
    
    class Config:
        orm_mode = True


class UserResponse(UserInDBBase):
    """Schema for user data returned in API responses"""
    pass


class UserInDB(UserInDBBase):
    """Complete user model as stored in database, including hashed_password"""
    hashed_password: str
