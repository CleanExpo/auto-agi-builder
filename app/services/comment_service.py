from typing import List, Optional, Dict, Any, Union
import json
from sqlalchemy.orm import Session
from fastapi.encoders import jsonable_encoder

from app.db.models.comment import Comment
from app.db.models.user import User
from app.schemas.comment import CommentCreate, CommentUpdate


class CommentService:
    """
    Service class for handling comment operations
    """

    @staticmethod
    def get_multi(
        db: Session,
        *,
        entity_type: str = None,
        entity_id: Union[int, str] = None,
        parent_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100,
        include_replies: bool = False
    ) -> List[Comment]:
        """
        Retrieve multiple comments with filtering options
        """
        query = db.query(Comment)
        
        if entity_type:
            query = query.filter(Comment.entity_type == entity_type)
        
        if entity_id:
            query = query.filter(Comment.entity_id == entity_id)
        
        if parent_id is not None:
            query = query.filter(Comment.parent_id == parent_id)
        elif not include_replies:
            # If parent_id is not provided and we don't want replies,
            # only get top-level comments (where parent_id is None)
            query = query.filter(Comment.parent_id == None)  # noqa: E711
            
        return query.order_by(Comment.created_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def get_total_count(
        db: Session,
        *,
        entity_type: str = None,
        entity_id: Union[int, str] = None,
        parent_id: Optional[int] = None
    ) -> int:
        """
        Count comments with filtering options
        """
        query = db.query(Comment)
        
        if entity_type:
            query = query.filter(Comment.entity_type == entity_type)
        
        if entity_id:
            query = query.filter(Comment.entity_id == entity_id)
        
        if parent_id is not None:
            query = query.filter(Comment.parent_id == parent_id)
        else:
            # If parent_id is not provided, only count top-level comments
            query = query.filter(Comment.parent_id == None)  # noqa: E711
            
        return query.count()

    @staticmethod
    def get_by_id(db: Session, comment_id: int) -> Optional[Comment]:
        """
        Get a specific comment by ID
        """
        return db.query(Comment).filter(Comment.id == comment_id).first()

    @staticmethod
    def create(
        db: Session,
        *,
        obj_in: CommentCreate,
        user_id: Union[int, str]
    ) -> Comment:
        """
        Create a new comment
        """
        obj_in_data = jsonable_encoder(obj_in)
        
        # Convert list/dict fields to JSON strings for storage
        if obj_in.mentions:
            obj_in_data["mentions"] = json.dumps(obj_in.mentions)
        
        if obj_in.reactions:
            obj_in_data["reactions"] = json.dumps(obj_in.reactions)
            
        db_obj = Comment(
            **obj_in_data,
            user_id=user_id,
            is_edited=False
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    @staticmethod
    def update(
        db: Session,
        *,
        db_obj: Comment,
        obj_in: CommentUpdate
    ) -> Comment:
        """
        Update an existing comment
        """
        obj_data = jsonable_encoder(db_obj)
        update_data = obj_in.dict(exclude_unset=True)
        
        # Handle mentions and reactions JSON serialization
        if "mentions" in update_data and update_data["mentions"] is not None:
            update_data["mentions"] = json.dumps(update_data["mentions"])
            
        if "reactions" in update_data and update_data["reactions"] is not None:
            update_data["reactions"] = json.dumps(update_data["reactions"])
            
        # Mark as edited if content is updated
        if "content" in update_data:
            update_data["is_edited"] = True
            
        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])
                
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    @staticmethod
    def remove(db: Session, *, comment_id: int) -> Comment:
        """
        Delete a comment
        """
        obj = db.query(Comment).get(comment_id)
        db.delete(obj)
        db.commit()
        return obj
        
    @staticmethod
    def add_reaction(
        db: Session,
        *,
        comment_id: int,
        user_id: Union[int, str],
        reaction_type: str
    ) -> Comment:
        """
        Add a reaction to a comment
        """
        comment = CommentService.get_by_id(db, comment_id)
        
        if not comment:
            return None
            
        reactions = {}
        if comment.reactions:
            try:
                reactions = json.loads(comment.reactions)
            except json.JSONDecodeError:
                reactions = {}
        
        if reaction_type not in reactions:
            reactions[reaction_type] = []
            
        # Only add the reaction if the user hasn't already added it
        user_id_str = str(user_id)
        if user_id_str not in reactions[reaction_type]:
            reactions[reaction_type].append(user_id_str)
            
        comment.reactions = json.dumps(reactions)
        db.add(comment)
        db.commit()
        db.refresh(comment)
        return comment
        
    @staticmethod
    def remove_reaction(
        db: Session,
        *,
        comment_id: int,
        user_id: Union[int, str],
        reaction_type: str
    ) -> Comment:
        """
        Remove a reaction from a comment
        """
        comment = CommentService.get_by_id(db, comment_id)
        
        if not comment or not comment.reactions:
            return comment
            
        try:
            reactions = json.loads(comment.reactions)
        except json.JSONDecodeError:
            return comment
            
        if reaction_type in reactions:
            user_id_str = str(user_id)
            if user_id_str in reactions[reaction_type]:
                reactions[reaction_type].remove(user_id_str)
                
                # Remove the reaction type if no users have this reaction
                if not reactions[reaction_type]:
                    del reactions[reaction_type]
                    
                comment.reactions = json.dumps(reactions)
                db.add(comment)
                db.commit()
                db.refresh(comment)
                
        return comment
        
    @staticmethod
    def get_threaded_comments(
        db: Session,
        *,
        entity_type: str,
        entity_id: Union[int, str],
        skip: int = 0,
        limit: int = 100
    ) -> Dict[str, Any]:
        """
        Get comments in a threaded structure
        """
        # Get top-level comments
        top_comments = CommentService.get_multi(
            db, 
            entity_type=entity_type, 
            entity_id=entity_id,
            skip=skip,
            limit=limit
        )
        
        total = CommentService.get_total_count(
            db, 
            entity_type=entity_type, 
            entity_id=entity_id
        )
        
        # For each top-level comment, fetch its replies
        result = []
        for comment in top_comments:
            comment_dict = jsonable_encoder(comment)
            
            # Get user name
            user = db.query(User).filter(User.id == comment.user_id).first()
            comment_dict["user_name"] = user.name if user else None
            
            # Get replies
            replies = CommentService.get_multi(
                db, 
                parent_id=comment.id,
                include_replies=True
            )
            
            reply_list = []
            for reply in replies:
                reply_dict = jsonable_encoder(reply)
                
                # Get replier name
                reply_user = db.query(User).filter(User.id == reply.user_id).first()
                reply_dict["user_name"] = reply_user.name if reply_user else None
                
                # Parse mentions and reactions
                if reply.mentions:
                    try:
                        reply_dict["mentions"] = json.loads(reply.mentions)
                    except json.JSONDecodeError:
                        reply_dict["mentions"] = []
                
                if reply.reactions:
                    try:
                        reply_dict["reactions"] = json.loads(reply.reactions)
                    except json.JSONDecodeError:
                        reply_dict["reactions"] = {}
                        
                reply_list.append(reply_dict)
            
            # Parse mentions and reactions for the top-level comment
            if comment.mentions:
                try:
                    comment_dict["mentions"] = json.loads(comment.mentions)
                except json.JSONDecodeError:
                    comment_dict["mentions"] = []
            
            if comment.reactions:
                try:
                    comment_dict["reactions"] = json.loads(comment.reactions)
                except json.JSONDecodeError:
                    comment_dict["reactions"] = {}
                    
            comment_dict["replies"] = reply_list
            comment_dict["reply_count"] = len(reply_list)
            
            result.append(comment_dict)
            
        return {
            "items": result,
            "total": total
        }


# Create a singleton instance
comment_service = CommentService()
