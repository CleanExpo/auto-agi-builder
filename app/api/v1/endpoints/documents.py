from typing import Any, List, Optional
import os
import shutil
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query, Path as PathParam, Body, File, UploadFile, Form, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps
from app.core.security import get_current_active_user, get_current_user
from app.core.config import settings
from app.services.document_service import DocumentService

router = APIRouter()

@router.get("/", response_model=schemas.document.DocumentList)
def read_documents(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_active_user),
    project_id: Optional[int] = None,
    document_type: Optional[str] = None,
    is_archived: Optional[bool] = None,
    extraction_status: Optional[str] = None,
) -> Any:
    """
    Retrieve documents.
    
    This endpoint returns documents that the current user has access to.
    Results can be filtered by project, document type, archived status, and extraction status.
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
            
        documents = crud.document.get_by_project(
            db=db, project_id=project_id, skip=skip, limit=limit,
            document_type=document_type, is_archived=is_archived,
            extraction_status=extraction_status
        )
        total = crud.document.count_by_project(
            db=db, project_id=project_id,
            document_type=document_type, is_archived=is_archived,
            extraction_status=extraction_status
        )
    else:
        if current_user.is_superuser:
            documents = crud.document.get_multi(
                db=db, skip=skip, limit=limit,
                document_type=document_type, is_archived=is_archived,
                extraction_status=extraction_status
            )
            total = crud.document.count(
                db=db, document_type=document_type, is_archived=is_archived,
                extraction_status=extraction_status
            )
        else:
            documents = crud.document.get_multi_by_user(
                db=db, user_id=current_user.id, skip=skip, limit=limit,
                document_type=document_type, is_archived=is_archived,
                extraction_status=extraction_status
            )
            total = crud.document.count_by_user(
                db=db, user_id=current_user.id,
                document_type=document_type, is_archived=is_archived,
                extraction_status=extraction_status
            )
    
    # Format response with pagination
    return {
        "total": total,
        "items": documents,
        "page": skip // limit + 1,
        "page_size": limit
    }


@router.post("/upload", response_model=schemas.document.Document)
async def create_document(
    background_tasks: BackgroundTasks,
    project_id: int = Form(...),
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    document_type: str = Form(...),
    extract_requirements: bool = Form(False),
    file: UploadFile = File(...),
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(get_current_active_user),
) -> Any:
    """
    Upload a document.
    
    Uploads a new document to a project and creates the corresponding database record.
    Optionally extracts requirements from the document.
    """
    # Check if the user has access to the project
    project = crud.project.get(db=db, id=project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if not crud.project.is_user_has_access(db, project, current_user):
        raise HTTPException(
            status_code=403, 
            detail="Not enough permissions to upload documents to this project"
        )
    
    # Save file and create database record
    document_service = DocumentService(settings.STORAGE_DIR)
    document = await document_service.save_document(
        db=db,
        file=file,
        project_id=project_id,
        uploader_id=current_user.id,
        title=title or file.filename,
        description=description,
        document_type=document_type,
    )
    
    # If extract_requirements is true, process the document in the background
    if extract_requirements:
        background_tasks.add_task(
            document_service.process_document,
            db=db,
            document_id=document.id,
            extract_requirements=True,
        )
    
    return document


@router.get("/{document_id}", response_model=schemas.document.DocumentDetail)
def read_document(
    *,
    document_id: int = PathParam(..., description="The ID of the document to get"),
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(get_current_active_user),
) -> Any:
    """
    Get document by ID.
    
    Retrieves detailed information about a single document.
    The user must have access to the project that the document belongs to.
    """
    document = crud.document.get(db=db, id=document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Check if the user has access to the project
    project = crud.project.get(db=db, id=document.project_id)
    if not crud.project.is_user_has_access(db, project, current_user):
        raise HTTPException(
            status_code=403, 
            detail="Not enough permissions to access this document"
        )
    
    # Include related data in the response
    document_dict = document.to_dict()
    
    # Add project info
    document_dict["project"] = project.to_dict() if project else None
    
    # Add uploader info
    uploader = crud.user.get(db=db, id=document.uploader_id)
    document_dict["uploader"] = uploader.to_dict() if uploader else None
    
    # Add extracted requirements
    requirements = crud.requirement.get_by_source_document(
        db=db, document_id=document_id, limit=50
    )
    document_dict["extracted_requirements"] = [req.to_dict() for req in requirements]
    
    return document_dict


@router.put("/{document_id}", response_model=schemas.document.Document)
def update_document(
    *,
    db: Session = Depends(deps.get_db),
    document_id: int = PathParam(..., description="The ID of the document to update"),
    document_in: schemas.document.DocumentUpdate,
    current_user: models.User = Depends(get_current_active_user),
) -> Any:
    """
    Update a document.
    
    Updates the document metadata with the provided data.
    The user must have access to the project that the document belongs to.
    """
    document = crud.document.get(db=db, id=document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Check if the user has access to the project
    project = crud.project.get(db=db, id=document.project_id)
    if not crud.project.is_user_has_access(db, project, current_user):
        raise HTTPException(
            status_code=403, 
            detail="Not enough permissions to update this document"
        )
    
    document = crud.document.update(db=db, db_obj=document, obj_in=document_in)
    return document


@router.delete("/{document_id}", response_model=schemas.document.Document)
def delete_document(
    *,
    db: Session = Depends(deps.get_db),
    document_id: int = PathParam(..., description="The ID of the document to delete"),
    current_user: models.User = Depends(get_current_active_user),
) -> Any:
    """
    Delete a document.
    
    Deletes the specified document and its file.
    The user must have access to the project that the document belongs to.
    Project owners or contributors with edit access can delete documents.
    """
    document = crud.document.get(db=db, id=document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Check if the user has access to the project
    project = crud.project.get(db=db, id=document.project_id)
    if not crud.project.is_owner_or_superuser(db, project, current_user):
        raise HTTPException(
            status_code=403, 
            detail="Not enough permissions to delete this document"
        )
    
    # Remove file from storage
    document_service = DocumentService(settings.STORAGE_DIR)
    document_service.delete_document_file(document.filepath)
    
    # Delete database record
    document = crud.document.remove(db=db, id=document_id)
    return document


@router.get("/{document_id}/download")
def download_document(
    *,
    document_id: int = PathParam(..., description="The ID of the document to download"),
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(get_current_active_user),
) -> Any:
    """
    Download document file.
    
    Returns the document file for downloading.
    The user must have access to the project that the document belongs to.
    """
    document = crud.document.get(db=db, id=document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Check if the user has access to the project
    project = crud.project.get(db=db, id=document.project_id)
    if not crud.project.is_user_has_access(db, project, current_user):
        raise HTTPException(
            status_code=403, 
            detail="Not enough permissions to access this document"
        )
    
    # Get file path
    file_path = os.path.join(settings.STORAGE_DIR, document.filepath)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Document file not found")
    
    return FileResponse(
        path=file_path,
        filename=document.filename,
        media_type="application/octet-stream"
    )


@router.get("/{document_id}/preview")
def preview_document(
    *,
    document_id: int = PathParam(..., description="The ID of the document to preview"),
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(get_current_active_user),
) -> Any:
    """
    Preview document.
    
    Returns a preview of the document (e.g. as HTML or PDF).
    The user must have access to the project that the document belongs to.
    """
    document = crud.document.get(db=db, id=document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Check if the user has access to the project
    project = crud.project.get(db=db, id=document.project_id)
    if not crud.project.is_user_has_access(db, project, current_user):
        raise HTTPException(
            status_code=403, 
            detail="Not enough permissions to access this document"
        )
    
    # Generate or retrieve preview
    document_service = DocumentService(settings.STORAGE_DIR)
    preview_path = document_service.get_document_preview(document)
    
    if not os.path.exists(preview_path):
        raise HTTPException(status_code=404, detail="Document preview not found")
    
    # Determine content type based on document type
    content_type = "application/pdf"
    if document.document_type.lower() == "html":
        content_type = "text/html"
    elif document.document_type.lower() == "markdown":
        content_type = "text/markdown"
    elif document.document_type.lower() == "image":
        content_type = "image/png"  # Default, actual type could vary
    
    return FileResponse(
        path=preview_path,
        media_type=content_type
    )


@router.post("/{document_id}/extract", response_model=schemas.document.DocumentExtractionResult)
def extract_text_from_document(
    *,
    document_id: int = PathParam(..., description="The ID of the document to process"),
    background_tasks: BackgroundTasks,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(get_current_active_user),
) -> Any:
    """
    Extract text and requirements from document.
    
    Processes the document to extract plain text and requirements.
    The processing happens in the background.
    """
    document = crud.document.get(db=db, id=document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Check if the user has access to the project
    project = crud.project.get(db=db, id=document.project_id)
    if not crud.project.is_user_has_access(db, project, current_user):
        raise HTTPException(
            status_code=403, 
            detail="Not enough permissions to process this document"
        )
    
    # Update document status to processing
    crud.document.update(
        db=db, 
        db_obj=document, 
        obj_in={"extraction_status": "processing"}
    )
    
    # Process document in the background
    document_service = DocumentService(settings.STORAGE_DIR)
    background_tasks.add_task(
        document_service.process_document,
        db=db,
        document_id=document.id,
        extract_requirements=True,
    )
    
    return {
        "document_id": document.id,
        "extracted_text": "",  # Will be filled by background task
        "extraction_status": "processing",
        "requirements_extracted": 0,
    }
