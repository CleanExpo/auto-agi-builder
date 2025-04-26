from typing import Any, List, Optional, Union
from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session

from app.api import deps
from app.schemas.comment import Comment, CommentCreate, CommentUpdate, CommentList, ThreadedComment
from app.services.comment_service import comment_service
from app.db.models.user import User

router = APIRouter()


@router.get("/", response_model=CommentList)
def list_comments(
    *,
    db: Session = Depends(deps.get_db),
    entity_type: Optional[str] = Query(None, description="Filter by entity type"),
    entity_id: Optional[str] = Query(None, description="Filter by entity ID"),
    parent_id: Optional[int] = Query(None, description="Filter by parent comment ID"),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve comments with optional filtering
    """
    comments = comment_service.get_multi(
        db,
        entity_type=entity_type,
        entity_id=entity_id,
        parent_id=parent_id,
        skip=skip,
        limit=limit
    )
    
    total = comment_service.get_total_count(
        db,
        entity_type=entity_type,
        entity_id=entity_id,
        parent_id=parent_id
    )
    
    return {
        "items": comments,
        "total": total
    }


@router.get("/threaded", response_model=CommentList)
def get_threaded_comments(
    *,
    db: Session = Depends(deps.get_db),
    entity_type: str = Query(..., description="Entity type"),
    entity_id: str = Query(..., description="Entity ID"),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve comments in a threaded structure
    """
    result = comment_service.get_threaded_comments(
        db,
        entity_type=entity_type,
        entity_id=entity_id,
        skip=skip,
        limit=limit
    )
    
    return result


@router.post("/", response_model=Comment)
def create_comment(
    *,
    db: Session = Depends(deps.get_db),
    comment_in: CommentCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Create a new comment
    """
    comment = comment_service.create(db, obj_in=comment_in, user_id=current_user.id)
    return comment


@router.get("/{comment_id}", response_model=Comment)
def get_comment(
    *,
    db: Session = Depends(deps.get_db),
    comment_id: int = Path(..., description="Comment ID"),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get a specific comment by ID
    """
    comment = comment_service.get_by_id(db, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    return comment


@router.put("/{comment_id}", response_model=Comment)
def update_comment(
    *,
    db: Session = Depends(deps.get_db),
    comment_id: int = Path(..., description="Comment ID"),
    comment_in: CommentUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Update a comment
    """
    comment = comment_service.get_by_id(db, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
        
    # Check if user is the author of the comment
    if str(comment.user_id) != str(current_user.id) and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions to update this comment")
        
    comment = comment_service.update(db, db_obj=comment, obj_in=comment_in)
    return comment


@router.delete("/{comment_id}", response_model=Comment)
def delete_comment(
    *,
    db: Session = Depends(deps.get_db),
    comment_id: int = Path(..., description="Comment ID"),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Delete a comment
    """
    comment = comment_service.get_by_id(db, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
        
    # Check if user is the author of the comment
    if str(comment.user_id) != str(current_user.id) and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions to delete this comment")
        
    comment = comment_service.remove(db, comment_id=comment_id)
    return comment


@router.post("/{comment_id}/reaction/{reaction_type}", response_model=Comment)
def add_reaction(
    *,
    db: Session = Depends(deps.get_db),
    comment_id: int = Path(..., description="Comment ID"),
    reaction_type: str = Path(..., description="Reaction type (e.g., 'like', 'heart')"),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Add a reaction to a comment
    """
    comment = comment_service.get_by_id(db, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
        
    comment = comment_service.add_reaction(
        db,
        comment_id=comment_id,
        user_id=current_user.id,
        reaction_type=reaction_type
    )
    
    return comment


@router.delete("/{comment_id}/reaction/{reaction_type}", response_model=Comment)
def remove_reaction(
    *,
    db: Session = Depends(deps.get_db),
    comment_id: int = Path(..., description="Comment ID"),
    reaction_type: str = Path(..., description="Reaction type (e.g., 'like', 'heart')"),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Remove a reaction from a comment
    """
    comment = comment_service.get_by_id(db, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
        
    comment = comment_service.remove_reaction(
        db,
        comment_id=comment_id,
        user_id=current_user.id,
        reaction_type=reaction_type
    )
    
    return comment


@router.get("/count/entity", response_model=dict)
def get_comment_count(
    *,
    db: Session = Depends(deps.get_db),
    entity_type: str = Query(..., description="Entity type"),
    entity_id: str = Query(..., description="Entity ID"),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get comment count for a specific entity
    """
    count = comment_service.get_total_count(
        db,
        entity_type=entity_type,
        entity_id=entity_id
    )
    
    return {"count": count}
