from sqlalchemy import Column, String, Integer, ForeignKey, Text, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.base_class import Base


class Comment(Base):
    """Comment model for discussions on various entities in the system."""
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    is_edited = Column(Boolean, default=False)
    
    # Author of the comment
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    user = relationship("User", back_populates="comments")
    
    # Polymorphic relationship to allow comments on different entity types
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(Integer, nullable=False)
    
    # For threaded comments (replies)
    parent_id = Column(Integer, ForeignKey("comment.id"), nullable=True)
    replies = relationship("Comment", backref="parent", remote_side=[id])
    
    # Mentions
    mentions = Column(Text, nullable=True)  # Stored as JSON string of user IDs
    
    # Reactions (likes, etc.)
    reactions = Column(Text, nullable=True)  # Stored as JSON string of reaction data
    
    def __repr__(self):
        return f"<Comment {self.id}: by user {self.user_id} on {self.entity_type} {self.entity_id}>"
