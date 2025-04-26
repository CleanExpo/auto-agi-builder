from datetime import datetime
from typing import List, Optional, Dict, Any, Union
import json

from pydantic import BaseModel, Field, validator


# Shared properties
class CommentBase(BaseModel):
    content: str
    entity_type: str
    entity_id: Union[int, str]
    parent_id: Optional[int] = None
    mentions: Optional[List[str]] = None
    reactions: Optional[Dict[str, Any]] = None


# Properties to receive on comment creation
class CommentCreate(CommentBase):
    pass


# Properties to receive on comment update
class CommentUpdate(BaseModel):
    content: Optional[str] = None
    mentions: Optional[List[str]] = None
    reactions: Optional[Dict[str, Any]] = None


# Properties shared by models stored in DB
class CommentInDBBase(CommentBase):
    id: int
    user_id: Union[int, str]
    created_at: datetime
    updated_at: datetime
    is_edited: bool
    
    @validator('mentions', pre=True)
    def parse_mentions(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return []
        return v or []

    @validator('reactions', pre=True)
    def parse_reactions(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return {}
        return v or {}
    
    class Config:
        orm_mode = True


# Properties to return to client
class Comment(CommentInDBBase):
    user_name: Optional[str] = None
    replies: Optional[List['Comment']] = None
    reply_count: Optional[int] = None


# Additional properties stored in DB
class CommentInDB(CommentInDBBase):
    pass


# For circular references
Comment.update_forward_refs()


# For retrieving comments with pagination
class CommentList(BaseModel):
    items: List[Comment]
    total: int


# For nesting replies in a threaded view
class ThreadedComment(Comment):
    replies: List['ThreadedComment'] = []


ThreadedComment.update_forward_refs()
