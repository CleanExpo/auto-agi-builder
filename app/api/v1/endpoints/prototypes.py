from typing import Any, List, Optional, Dict

from fastapi import APIRouter, Depends, HTTPException, Query, Path, Body, BackgroundTasks
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps
from app.core.security import get_current_active_user, get_current_user
from app.core.config import settings
from app.services.prototype_service import PrototypeService

router = APIRouter()

@router.get("/", response_model=schemas.prototype.PrototypeList)
def read_prototypes(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_active_user),
    project_id: Optional[int] = None,
    prototype_type: Optional[str] = None,
    status: Optional[str] = None,
    is_favorited: Optional[bool] = None,
    is_exported: Optional[bool] = None,
) -> Any:
    """
    Retrieve prototypes.
    
    This endpoint returns prototypes that the current user has access to.
    Results can be filtered by project, type, status, and other attributes.
    """
    if project_id:
        project = crud.project.get(db=db, id=project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        if not crud.project.is_user_has_access(db, project, current_user):
            raise HTTPException(
                status_code=403, 
                detail="Not enough permissions to access this project"
            )
            
        prototypes = crud.prototype.get_by_project(
            db=db, project_id=project_id, skip=skip, limit=limit,
            prototype_type=prototype_type, status=status,
            is_favorited=is_favorited, is_exported=is_exported
        )
        total = crud.prototype.count_by_project(
            db=db, project_id=project_id,
            prototype_type=prototype_type, status=status,
            is_favorited=is_favorited, is_exported=is_exported
        )
    else:
        if current_user.is_superuser:
            prototypes = crud.prototype.get_multi(
                db=db, skip=skip, limit=limit,
                prototype_type=prototype_type, status=status,
                is_favorited=is_favorited, is_exported=is_exported
            )
            total = crud.prototype.count(
                db=db, prototype_type=prototype_type, status=status,
                is_favorited=is_favorited, is_exported=is_exported
            )
        else:
            prototypes = crud.prototype.get_multi_by_user(
                db=db, user_id=current_user.id, skip=skip, limit=limit,
                prototype_type=prototype_type, status=status,
                is_favorited=is_favorited, is_exported=is_exported
            )
            total = crud.prototype.count_by_user(
                db=db, user_id=current_user.id,
                prototype_type=prototype_type, status=status,
                is_favorited=is_favorited, is_exported=is_exported
            )
    
    # Format response with pagination
    return {
        "total": total,
        "items": prototypes,
        "page": skip // limit + 1,
        "page_size": limit
    }


@router.post("/", response_model=schemas.prototype.Prototype)
def create_prototype(
    *,
    db: Session = Depends(deps.get_db),
    background_tasks: BackgroundTasks,
    prototype_in: schemas.prototype.PrototypeCreate,
    current_user: models.User = Depends(get_current_active_user),
) -> Any:
    """
    Create new prototype.
    
    Creates a new prototype generation request for a specific project.
    The generation will happen asynchronously.
    The user must have access to the project.
    """
    # Check if the user has access to the project
    project = crud.project.get(db=db, id=prototype_in.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if not crud.project.is_user_has_access(db, project, current_user):
        raise HTTPException(
            status_code=403, 
            detail="Not enough permissions to create prototypes for this project"
        )
    
    # Create prototype record with initial status
    prototype = crud.prototype.create(
        db=db, 
        obj_in=prototype_in,
        status="draft"
    )
    
    # Map requirements to prototype if provided
    if prototype_in.requirement_ids:
        for req_id in prototype_in.requirement_ids:
            requirement = crud.requirement.get(db=db, id=req_id)
            if not requirement or requirement.project_id != prototype_in.project_id:
                continue
            
            crud.prototype.add_requirement(
                db=db, 
                prototype_id=prototype.id, 
                requirement_id=req_id
            )
    
    # Start prototype generation in background
    prototype_service = PrototypeService()
    background_tasks.add_task(
        prototype_service.generate_prototype,
        db=db,
        prototype_id=prototype.id,
        generation_parameters=prototype_in.generation_parameters
    )
    
    # Update status to generating
    crud.prototype.update(
        db=db, 
        db_obj=prototype, 
        obj_in={"status": "generating"}
    )
    
    return prototype


@router.get("/{prototype_id}", response_model=schemas.prototype.PrototypeDetail)
def read_prototype(
    *,
    prototype_id: int = Path(..., description="The ID of the prototype to get"),
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(get_current_active_user),
) -> Any:
    """
    Get prototype by ID.
    
    Retrieves detailed information about a single prototype.
    The user must have access to the project that the prototype belongs to.
    """
    prototype = crud.prototype.get(db=db, id=prototype_id)
    if not prototype:
        raise HTTPException(status_code=404, detail="Prototype not found")
    
    # Check if the user has access to the project
    project = crud.project.get(db=db, id=prototype.project_id)
    if not crud.project.is_user_has_access(db, project, current_user):
        raise HTTPException(
            status_code=403, 
            detail="Not enough permissions to access this prototype"
        )
    
    # Include related data in the response
    prototype_dict = prototype.to_dict()
    
    # Add project info
    prototype_dict["project"] = project.to_dict() if project else None
    
    # Add implemented requirements
    requirements = crud.requirement.get_by_prototype(
        db=db, prototype_id=prototype_id
    )
    prototype_dict["implemented_requirements"] = [req.to_dict() for req in requirements]
    
    return prototype_dict


@router.put("/{prototype_id}", response_model=schemas.prototype.Prototype)
def update_prototype(
    *,
    db: Session = Depends(deps.get_db),
    prototype_id: int = Path(..., description="The ID of the prototype to update"),
    prototype_in: schemas.prototype.PrototypeUpdate,
    current_user: models.User = Depends(get_current_active_user),
) -> Any:
    """
    Update a prototype.
    
    Updates the prototype metadata with the provided data.
    The user must have access to the project that the prototype belongs to.
    """
    prototype = crud.prototype.get(db=db, id=prototype_id)
    if not prototype:
        raise HTTPException(status_code=404, detail="Prototype not found")
    
    # Check if the user has access to the project
    project = crud.project.get(db=db, id=prototype.project_id)
    if not crud.project.is_user_has_access(db, project, current_user):
        raise HTTPException(
            status_code=403, 
            detail="Not enough permissions to update this prototype"
        )
    
    prototype = crud.prototype.update(db=db, db_obj=prototype, obj_in=prototype_in)
    return prototype


@router.delete("/{prototype_id}", response_model=schemas.prototype.Prototype)
def delete_prototype(
    *,
    db: Session = Depends(deps.get_db),
    prototype_id: int = Path(..., description="The ID of the prototype to delete"),
    current_user: models.User = Depends(get_current_active_user),
) -> Any:
    """
    Delete a prototype.
    
    Deletes the specified prototype and its artifacts.
    The user must have access to the project that the prototype belongs to.
    Project owners or contributors with edit access can delete prototypes.
    """
    prototype = crud.prototype.get(db=db, id=prototype_id)
    if not prototype:
        raise HTTPException(status_code=404, detail="Prototype not found")
    
    # Check if the user has access to the project
    project = crud.project.get(db=db, id=prototype.project_id)
    if not crud.project.is_owner_or_superuser(db, project, current_user):
        raise HTTPException(
            status_code=403, 
            detail="Not enough permissions to delete this prototype"
        )
    
    # Delete prototype artifacts
    if prototype.artifact_path:
        prototype_service = PrototypeService()
        prototype_service.delete_prototype_artifacts(prototype.artifact_path)
    
    # Delete database record
    prototype = crud.prototype.remove(db=db, id=prototype_id)
    return prototype


@router.post("/{prototype_id}/regenerate", response_model=schemas.prototype.Prototype)
def regenerate_prototype(
    *,
    db: Session = Depends(deps.get_db),
    background_tasks: BackgroundTasks,
    prototype_id: int = Path(..., description="The ID of the prototype to regenerate"),
    regenerate_in: schemas.prototype.PrototypeRegenerateRequest,
    current_user: models.User = Depends(get_current_active_user),
) -> Any:
    """
    Regenerate a prototype.
    
    Regenerates an existing prototype with possibly updated parameters.
    The user must have access to the project that the prototype belongs to.
    """
    prototype = crud.prototype.get(db=db, id=prototype_id)
    if not prototype:
        raise HTTPException(status_code=404, detail="Prototype not found")
    
    # Check if the user has access to the project
    project = crud.project.get(db=db, id=prototype.project_id)
    if not crud.project.is_user_has_access(db, project, current_user):
        raise HTTPException(
            status_code=403, 
            detail="Not enough permissions to regenerate this prototype"
        )
    
    # Update prototype version and status
    prototype = crud.prototype.update(
        db=db, 
        db_obj=prototype, 
        obj_in={
            "version": prototype.version + 1,
            "status": "generating"
        }
    )
    
    # Update requirements mapping if requested
    if regenerate_in.include_requirements:
        for req_id in regenerate_in.include_requirements:
            requirement = crud.requirement.get(db=db, id=req_id)
            if not requirement or requirement.project_id != prototype.project_id:
                continue
            
            crud.prototype.add_requirement(
                db=db, 
                prototype_id=prototype.id, 
                requirement_id=req_id
            )
            
    if regenerate_in.exclude_requirements:
        for req_id in regenerate_in.exclude_requirements:
            crud.prototype.remove_requirement(
                db=db, 
                prototype_id=prototype.id, 
                requirement_id=req_id
            )
    
    # Get current generation parameters and update with new ones if provided
    generation_parameters = prototype.generation_parameters or {}
    if regenerate_in.update_parameters:
        generation_parameters.update(regenerate_in.update_parameters)
    
    # Start prototype regeneration in background
    prototype_service = PrototypeService()
    background_tasks.add_task(
        prototype_service.generate_prototype,
        db=db,
        prototype_id=prototype.id,
        generation_parameters=generation_parameters
    )
    
    return prototype


@router.post("/{prototype_id}/export", response_model=Dict[str, Any])
def export_prototype(
    *,
    db: Session = Depends(deps.get_db),
    background_tasks: BackgroundTasks,
    prototype_id: int = Path(..., description="The ID of the prototype to export"),
    export_in: schemas.prototype.PrototypeExportRequest,
    current_user: models.User = Depends(get_current_active_user),
) -> Any:
    """
    Export a prototype.
    
    Exports a prototype to a specific format.
    The user must have access to the project that the prototype belongs to.
    """
    prototype = crud.prototype.get(db=db, id=prototype_id)
    if not prototype:
        raise HTTPException(status_code=404, detail="Prototype not found")
    
    # Check if the user has access to the project
    project = crud.project.get(db=db, id=prototype.project_id)
    if not crud.project.is_user_has_access(db, project, current_user):
        raise HTTPException(
            status_code=403, 
            detail="Not enough permissions to export this prototype"
        )
    
    # Check if prototype is ready for export
    if prototype.status != "ready":
        raise HTTPException(
            status_code=400, 
            detail="Prototype is not ready for export. Current status: " + prototype.status
        )
    
    # Start export in background
    prototype_service = PrototypeService()
    export_task_id = prototype_service.start_export(
        prototype_id=prototype_id,
        export_format=export_in.export_format,
        export_options=export_in.export_options
    )
    
    # Mark prototype as exported
    crud.prototype.update(
        db=db, 
        db_obj=prototype, 
        obj_in={"is_exported": True}
    )
    
    # Add background task for processing export
    background_tasks.add_task(
        prototype_service.process_export,
        db=db,
        prototype_id=prototype.id,
        export_task_id=export_task_id,
        export_format=export_in.export_format
    )
    
    return {
        "prototype_id": prototype_id,
        "export_task_id": export_task_id,
        "export_format": export_in.export_format,
        "status": "processing"
    }


@router.post("/{prototype_id}/toggle_favorite", response_model=schemas.prototype.Prototype)
def toggle_favorite(
    *,
    db: Session = Depends(deps.get_db),
    prototype_id: int = Path(..., description="The ID of the prototype to toggle favorite status"),
    current_user: models.User = Depends(get_current_active_user),
) -> Any:
    """
    Toggle favorite status.
    
    Toggles the favorite status of a prototype.
    The user must have access to the project that the prototype belongs to.
    """
    prototype = crud.prototype.get(db=db, id=prototype_id)
    if not prototype:
        raise HTTPException(status_code=404, detail="Prototype not found")
    
    # Check if the user has access to the project
    project = crud.project.get(db=db, id=prototype.project_id)
    if not crud.project.is_user_has_access(db, project, current_user):
        raise HTTPException(
            status_code=403, 
            detail="Not enough permissions to toggle favorite status for this prototype"
        )
    
    # Toggle favorite status
    prototype = crud.prototype.update(
        db=db, 
        db_obj=prototype, 
        obj_in={"is_favorited": not prototype.is_favorited}
    )
    
    return prototype
