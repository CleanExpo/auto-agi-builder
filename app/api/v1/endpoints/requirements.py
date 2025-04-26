from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Body, Path, File, UploadFile
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps
from app.core.security import get_current_active_user, get_current_user

router = APIRouter()

@router.get("/", response_model=schemas.requirement.RequirementList)
def read_requirements(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_active_user),
    project_id: Optional[int] = None,
    status: Optional[str] = None,
    requirement_type: Optional[str] = None,
    priority: Optional[str] = None,
) -> Any:
    """
    Retrieve requirements.
    
    This endpoint returns requirements that the current user has access to.
    Results can be filtered by project, status, type, and priority.
    """
    # If project_id is provided, check if the user has access to that project
    if project_id:
        project = crud.project.get(db=db, id=project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        if not crud.project.is_user_has_access(db, project, current_user):
            raise HTTPException(
                status_code=403, 
                detail="Not enough permissions to access this project"
            )
            
        requirements = crud.requirement.get_by_project(
            db=db, project_id=project_id, skip=skip, limit=limit,
            status=status, requirement_type=requirement_type, priority=priority
        )
        total = crud.requirement.count_by_project(
            db=db, project_id=project_id,
            status=status, requirement_type=requirement_type, priority=priority
        )
    else:
        # If no project_id, return requirements from all accessible projects
        if current_user.is_superuser:
            requirements = crud.requirement.get_multi(
                db=db, skip=skip, limit=limit,
                status=status, requirement_type=requirement_type, priority=priority
            )
            total = crud.requirement.count(
                db=db, status=status, requirement_type=requirement_type, priority=priority
            )
        else:
            requirements = crud.requirement.get_multi_by_user(
                db=db, user_id=current_user.id, skip=skip, limit=limit,
                status=status, requirement_type=requirement_type, priority=priority
            )
            total = crud.requirement.count_by_user(
                db=db, user_id=current_user.id,
                status=status, requirement_type=requirement_type, priority=priority
            )
    
    # Format response with pagination
    return {
        "total": total,
        "items": requirements,
        "page": skip // limit + 1,
        "page_size": limit
    }


@router.post("/", response_model=schemas.requirement.Requirement)
def create_requirement(
    *,
    db: Session = Depends(deps.get_db),
    requirement_in: schemas.requirement.RequirementCreate,
    current_user: models.User = Depends(get_current_active_user),
) -> Any:
    """
    Create new requirement.
    
    Creates a new requirement for a specific project.
    The user must have access to the project.
    """
    # Check if the user has access to the project
    project = crud.project.get(db=db, id=requirement_in.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if not crud.project.is_user_has_access(db, project, current_user):
        raise HTTPException(
            status_code=403, 
            detail="Not enough permissions to create requirements for this project"
        )
    
    # Check if source document exists and belongs to the project
    if requirement_in.source_document_id:
        document = crud.document.get(db=db, id=requirement_in.source_document_id)
        if not document or document.project_id != requirement_in.project_id:
            raise HTTPException(
                status_code=400, 
                detail="Source document does not exist or does not belong to the project"
            )
    
    requirement = crud.requirement.create(db=db, obj_in=requirement_in)
    return requirement


@router.get("/{requirement_id}", response_model=schemas.requirement.RequirementDetail)
def read_requirement(
    *,
    requirement_id: int = Path(..., description="The ID of the requirement to get"),
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(get_current_active_user),
) -> Any:
    """
    Get requirement by ID.
    
    Retrieves detailed information about a single requirement.
    The user must have access to the project that the requirement belongs to.
    """
    requirement = crud.requirement.get(db=db, id=requirement_id)
    if not requirement:
        raise HTTPException(status_code=404, detail="Requirement not found")
    
    # Check if the user has access to the project
    project = crud.project.get(db=db, id=requirement.project_id)
    if not crud.project.is_user_has_access(db, project, current_user):
        raise HTTPException(
            status_code=403, 
            detail="Not enough permissions to access this requirement"
        )
    
    # Include related data in the response
    requirement_dict = requirement.to_dict()
    
    # Add project info
    requirement_dict["project"] = project.to_dict() if project else None
    
    # Add source document info if available
    if requirement.source_document_id:
        source_document = crud.document.get(db=db, id=requirement.source_document_id)
        requirement_dict["source_document"] = source_document.to_dict() if source_document else None
    
    # Add prototype implementations
    implemented_in = crud.prototype.get_by_requirement(db=db, requirement_id=requirement_id)
    requirement_dict["implemented_in_prototypes"] = [p.to_dict() for p in implemented_in]
    
    return requirement_dict


@router.put("/{requirement_id}", response_model=schemas.requirement.Requirement)
def update_requirement(
    *,
    db: Session = Depends(deps.get_db),
    requirement_id: int = Path(..., description="The ID of the requirement to update"),
    requirement_in: schemas.requirement.RequirementUpdate,
    current_user: models.User = Depends(get_current_active_user),
) -> Any:
    """
    Update a requirement.
    
    Updates the requirement with the provided data.
    The user must have access to the project that the requirement belongs to.
    """
    requirement = crud.requirement.get(db=db, id=requirement_id)
    if not requirement:
        raise HTTPException(status_code=404, detail="Requirement not found")
    
    # Check if the user has access to the project
    project = crud.project.get(db=db, id=requirement.project_id)
    if not crud.project.is_user_has_access(db, project, current_user):
        raise HTTPException(
            status_code=403, 
            detail="Not enough permissions to update this requirement"
        )
    
    # Check if source document exists and belongs to the project
    if requirement_in.source_document_id:
        document = crud.document.get(db=db, id=requirement_in.source_document_id)
        if not document or document.project_id != requirement.project_id:
            raise HTTPException(
                status_code=400, 
                detail="Source document does not exist or does not belong to the project"
            )
    
    requirement = crud.requirement.update(db=db, db_obj=requirement, obj_in=requirement_in)
    return requirement


@router.delete("/{requirement_id}", response_model=schemas.requirement.Requirement)
def delete_requirement(
    *,
    db: Session = Depends(deps.get_db),
    requirement_id: int = Path(..., description="The ID of the requirement to delete"),
    current_user: models.User = Depends(get_current_active_user),
) -> Any:
    """
    Delete a requirement.
    
    Deletes the specified requirement.
    The user must have access to the project that the requirement belongs to.
    Project owners or contributors with edit access can delete requirements.
    """
    requirement = crud.requirement.get(db=db, id=requirement_id)
    if not requirement:
        raise HTTPException(status_code=404, detail="Requirement not found")
    
    # Check if the user has access to the project
    project = crud.project.get(db=db, id=requirement.project_id)
    if not crud.project.is_owner_or_superuser(db, project, current_user):
        raise HTTPException(
            status_code=403, 
            detail="Not enough permissions to delete this requirement"
        )
    
    requirement = crud.requirement.remove(db=db, id=requirement_id)
    return requirement


@router.post("/bulk", response_model=List[schemas.requirement.Requirement])
def create_requirements_bulk(
    *,
    db: Session = Depends(deps.get_db),
    bulk_in: schemas.requirement.RequirementBulkCreate,
    current_user: models.User = Depends(get_current_active_user),
) -> Any:
    """
    Create multiple requirements.
    
    Creates multiple requirements for a specific project in one request.
    Useful for importing requirements from documents or other sources.
    The user must have access to the project.
    """
    # Check if the user has access to the project
    project = crud.project.get(db=db, id=bulk_in.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if not crud.project.is_user_has_access(db, project, current_user):
        raise HTTPException(
            status_code=403, 
            detail="Not enough permissions to create requirements for this project"
        )
    
    # Create all requirements
    requirements = crud.requirement.create_multi(
        db=db, objs_in=bulk_in.requirements, project_id=bulk_in.project_id
    )
    return requirements


@router.post("/extract", response_model=List[schemas.requirement.Requirement])
def extract_requirements_from_document(
    *,
    db: Session = Depends(deps.get_db),
    extract_in: schemas.requirement.RequirementExtract,
    current_user: models.User = Depends(get_current_active_user),
) -> Any:
    """
    Extract requirements from document.
    
    Uses AI to extract requirements from a document and creates them in the database.
    The user must have access to the document and its project.
    """
    # Check if the document exists
    document = crud.document.get(db=db, id=extract_in.document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Check if the user has access to the project
    project = crud.project.get(db=db, id=document.project_id)
    if not crud.project.is_user_has_access(db, project, current_user):
        raise HTTPException(
            status_code=403, 
            detail="Not enough permissions to extract requirements from this document"
        )
    
    # Extract requirements using the document analysis service
    requirements = crud.requirement.extract_from_document(
        db=db, document_id=extract_in.document_id, 
        extraction_mode=extract_in.extraction_mode,
        extraction_options=extract_in.extraction_options
    )
    return requirements
