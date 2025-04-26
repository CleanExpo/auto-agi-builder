from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Body, Path
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps
from app.core.security import get_current_active_user, get_current_user

router = APIRouter()

@router.get("/", response_model=schemas.project.ProjectList)
def read_projects(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_active_user),
    status: Optional[str] = None,
    project_type: Optional[str] = None,
    is_public: Optional[bool] = None,
) -> Any:
    """
    Retrieve projects.
    
    This endpoint returns projects that the current user owns or contributes to.
    Results can be filtered by status, type, or public visibility.
    """
    # If the user is a superuser, they can see all projects
    if current_user.is_superuser:
        projects = crud.project.get_multi(
            db, skip=skip, limit=limit, status=status, 
            project_type=project_type, is_public=is_public
        )
        total = crud.project.count(
            db, status=status, project_type=project_type, is_public=is_public
        )
    else:
        # Otherwise, they can only see their own projects and ones they're contributing to
        projects = crud.project.get_multi_by_user(
            db=db, user_id=current_user.id, skip=skip, limit=limit,
            status=status, project_type=project_type, is_public=is_public
        )
        total = crud.project.count_by_user(
            db=db, user_id=current_user.id, 
            status=status, project_type=project_type, is_public=is_public
        )
    
    # Format response with pagination
    return {
        "total": total,
        "items": projects,
        "page": skip // limit + 1,
        "page_size": limit
    }


@router.post("/", response_model=schemas.project.Project)
def create_project(
    *,
    db: Session = Depends(deps.get_db),
    project_in: schemas.project.ProjectCreate,
    current_user: models.User = Depends(get_current_active_user),
) -> Any:
    """
    Create new project.
    
    Creates a new project with the current user as the owner.
    """
    project = crud.project.create_with_owner(
        db=db, obj_in=project_in, owner_id=current_user.id
    )
    return project


@router.get("/{project_id}", response_model=schemas.project.ProjectDetail)
def read_project(
    *,
    project_id: int = Path(..., description="The ID of the project to get"),
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(get_current_active_user),
) -> Any:
    """
    Get project by ID.
    
    Retrieves detailed information about a single project, including its
    contributors, requirements, documents and prototypes.
    """
    project = crud.project.get(db=db, id=project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if the user has access to this project
    if not crud.project.is_user_has_access(db, project, current_user):
        raise HTTPException(
            status_code=403, 
            detail="Not enough permissions to access this project"
        )
    
    # Get related data
    contributors = crud.project.get_contributors(db, project_id)
    requirements = crud.requirement.get_by_project(db, project_id, limit=10)
    documents = crud.document.get_by_project(db, project_id, limit=10)
    prototypes = crud.prototype.get_by_project(db, project_id, limit=10)
    
    # Create response with related data
    project_dict = project.__dict__
    project_dict["contributors"] = [user.to_dict() for user in contributors]
    project_dict["requirements"] = [req.to_dict() for req in requirements]
    project_dict["documents"] = [doc.to_dict() for doc in documents]
    project_dict["prototypes"] = [proto.to_dict() for proto in prototypes]
    
    return project_dict


@router.put("/{project_id}", response_model=schemas.project.Project)
def update_project(
    *,
    db: Session = Depends(deps.get_db),
    project_id: int = Path(..., description="The ID of the project to update"),
    project_in: schemas.project.ProjectUpdate,
    current_user: models.User = Depends(get_current_active_user),
) -> Any:
    """
    Update a project.
    
    Updates the project with the provided data. Only the project owner or a 
    superuser can update a project.
    """
    project = crud.project.get(db=db, id=project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if user is owner or superuser
    if not crud.project.is_owner_or_superuser(db, project, current_user):
        raise HTTPException(
            status_code=403, 
            detail="Not enough permissions to update this project"
        )
    
    project = crud.project.update(db=db, db_obj=project, obj_in=project_in)
    return project


@router.delete("/{project_id}", response_model=schemas.project.Project)
def delete_project(
    *,
    db: Session = Depends(deps.get_db),
    project_id: int = Path(..., description="The ID of the project to delete"),
    current_user: models.User = Depends(get_current_active_user),
) -> Any:
    """
    Delete a project.
    
    Deletes the specified project. Only the project owner or a superuser can
    delete a project. This operation also deletes all related requirements,
    documents, and prototypes.
    """
    project = crud.project.get(db=db, id=project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if user is owner or superuser
    if not crud.project.is_owner_or_superuser(db, project, current_user):
        raise HTTPException(
            status_code=403, 
            detail="Not enough permissions to delete this project"
        )
    
    project = crud.project.remove(db=db, id=project_id)
    return project


@router.post("/{project_id}/contributors", response_model=schemas.project.ProjectDetail)
def add_contributor(
    *,
    db: Session = Depends(deps.get_db),
    project_id: int = Path(..., description="The ID of the project"),
    user_id: str = Body(..., embed=True, description="The ID of the user to add as a contributor"),
    current_user: models.User = Depends(get_current_active_user),
) -> Any:
    """
    Add contributor to project.
    
    Adds a user as a contributor to the project. Only the project owner or a
    superuser can add contributors.
    """
    project = crud.project.get(db=db, id=project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if user is owner or superuser
    if not crud.project.is_owner_or_superuser(db, project, current_user):
        raise HTTPException(
            status_code=403, 
            detail="Not enough permissions to add contributors to this project"
        )
    
    # Add contributor and return updated project
    project = crud.project.add_contributor(db=db, project_id=project_id, user_id=user_id)
    return read_project(project_id=project_id, db=db, current_user=current_user)


@router.delete("/{project_id}/contributors/{user_id}", response_model=schemas.project.ProjectDetail)
def remove_contributor(
    *,
    db: Session = Depends(deps.get_db),
    project_id: int = Path(..., description="The ID of the project"),
    user_id: str = Path(..., description="The ID of the contributor to remove"),
    current_user: models.User = Depends(get_current_active_user),
) -> Any:
    """
    Remove contributor from project.
    
    Removes a user from the contributors list of the project. Only the project
    owner or a superuser can remove contributors.
    """
    project = crud.project.get(db=db, id=project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if user is owner or superuser
    if not crud.project.is_owner_or_superuser(db, project, current_user):
        raise HTTPException(
            status_code=403, 
            detail="Not enough permissions to remove contributors from this project"
        )
    
    # Remove contributor and return updated project
    project = crud.project.remove_contributor(db=db, project_id=project_id, user_id=user_id)
    return read_project(project_id=project_id, db=db, current_user=current_user)


@router.get("/{project_id}/stats", response_model=schemas.project.ProjectStats)
def get_project_stats(
    *,
    db: Session = Depends(deps.get_db),
    project_id: int = Path(..., description="The ID of the project"),
    current_user: models.User = Depends(get_current_active_user),
) -> Any:
    """
    Get project statistics.
    
    Retrieves statistical information about a project, including requirement,
    document, and prototype counts, as well as recent activity.
    """
    project = crud.project.get(db=db, id=project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if the user has access to this project
    if not crud.project.is_user_has_access(db, project, current_user):
        raise HTTPException(
            status_code=403, 
            detail="Not enough permissions to access this project"
        )
    
    # Get project statistics
    stats = crud.project.get_project_stats(db=db, project_id=project_id)
    return stats
