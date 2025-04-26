import os
import shutil
import hashlib
import datetime
from pathlib import Path
from typing import Optional, Dict, Any, List

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app import crud, models, schemas

class DocumentService:
    """
    Service for handling document operations like upload, processing, and extraction
    """
    
    def __init__(self, storage_dir: str):
        """
        Initialize the document service with the storage directory
        
        Args:
            storage_dir: Base directory for document storage
        """
        self.storage_dir = storage_dir
        self._ensure_storage_dir_exists()
    
    def _ensure_storage_dir_exists(self):
        """Ensure the storage directory exists"""
        os.makedirs(self.storage_dir, exist_ok=True)
    
    def _get_document_directory(self, project_id: int) -> str:
        """
        Get the directory for storing documents of a specific project
        
        Args:
            project_id: The ID of the project
            
        Returns:
            Directory path for the project's documents
        """
        project_dir = os.path.join(self.storage_dir, f"project_{project_id}", "documents")
        os.makedirs(project_dir, exist_ok=True)
        return project_dir
    
    def _calculate_hash(self, file_path: str) -> str:
        """
        Calculate SHA-256 hash of a file
        
        Args:
            file_path: Path to the file
            
        Returns:
            SHA-256 hash of the file
        """
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            # Read and update hash in chunks of 4K
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()
    
    def _get_document_type(self, filename: str) -> str:
        """
        Determine document type from filename extension
        
        Args:
            filename: Name of the file
            
        Returns:
            Document type based on extension
        """
        ext = Path(filename).suffix.lower()
        if ext in ['.pdf']:
            return 'pdf'
        elif ext in ['.doc', '.docx']:
            return 'word'
        elif ext in ['.txt']:
            return 'text'
        elif ext in ['.md', '.markdown']:
            return 'markdown'
        elif ext in ['.html', '.htm']:
            return 'html'
        elif ext in ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.svg']:
            return 'image'
        else:
            return 'other'
    
    async def save_document(
        self,
        db: Session,
        file: UploadFile,
        project_id: int,
        uploader_id: Any,
        title: str,
        description: Optional[str] = None,
        document_type: Optional[str] = None,
    ) -> models.Document:
        """
        Save uploaded document and create database record
        
        Args:
            db: Database session
            file: Uploaded file
            project_id: ID of the project
            uploader_id: ID of the user who uploaded the file
            title: Document title
            description: Optional description
            document_type: Optional document type (will be determined from extension if not provided)
            
        Returns:
            Created document model
        """
        # Get project document directory
        doc_dir = self._get_document_directory(project_id)
        
        # Create unique filename with timestamp
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_filename = Path(file.filename).stem.replace(" ", "_")
        ext = Path(file.filename).suffix
        unique_filename = f"{safe_filename}_{timestamp}{ext}"
        file_path = os.path.join(doc_dir, unique_filename)
        
        # Save file
        with open(file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        
        # Get file size and calculate hash
        file_size = os.path.getsize(file_path)
        content_hash = self._calculate_hash(file_path)
        
        # Determine document type if not provided
        if not document_type:
            document_type = self._get_document_type(file.filename)
        
        # Create relative filepath for storage in database
        relative_path = os.path.join(f"project_{project_id}", "documents", unique_filename)
        
        # Create document record
        document_data = schemas.document.DocumentCreate(
            project_id=project_id,
            title=title,
            description=description,
            filename=file.filename,
            filepath=relative_path,
            file_size=file_size,
            document_type=document_type,
            content_hash=content_hash,
        )
        
        document = crud.document.create(
            db=db,
            obj_in=document_data,
            uploader_id=uploader_id
        )
        
        return document
    
    def delete_document_file(self, filepath: str) -> bool:
        """
        Delete document file from storage
        
        Args:
            filepath: Relative path of the file
            
        Returns:
            True if successfully deleted, False otherwise
        """
        full_path = os.path.join(self.storage_dir, filepath)
        if os.path.exists(full_path):
            os.remove(full_path)
            return True
        return False
    
    def get_document_preview(self, document: models.Document) -> str:
        """
        Get or generate document preview
        
        Args:
            document: Document model
            
        Returns:
            Path to preview file
        """
        # Determine preview type and generate if needed
        document_path = os.path.join(self.storage_dir, document.filepath)
        preview_dir = os.path.dirname(document_path)
        preview_name = f"{Path(document.filepath).stem}_preview.html"
        preview_path = os.path.join(preview_dir, preview_name)
        
        # If preview doesn't exist, generate it
        if not os.path.exists(preview_path):
            self._generate_preview(document_path, preview_path, document.document_type)
        
        return preview_path
    
    def _generate_preview(self, source_path: str, preview_path: str, doc_type: str):
        """
        Generate preview for document
        
        Args:
            source_path: Path to source document
            preview_path: Path to save preview
            doc_type: Type of document
        """
        # This would be implemented with appropriate libraries based on document type
        # For PDF: use PyPDF2 or pdf2image
        # For Word: use python-docx
        # For images: use PIL
        # For now, we'll create a simple HTML wrapper
        
        with open(preview_path, "w") as f:
            f.write(f"""<!DOCTYPE html>
            <html>
            <head>
                <title>Document Preview</title>
                <style>
                    body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; }}
                    .preview-container {{ max-width: 800px; margin: 0 auto; }}
                    .preview-header {{ background-color: #f5f5f5; padding: 10px; border-radius: 5px; }}
                </style>
            </head>
            <body>
                <div class="preview-container">
                    <div class="preview-header">
                        <h2>Document Preview</h2>
                        <p>Document type: {doc_type}</p>
                        <p>This is a placeholder preview. In a real implementation, 
                        the document content would be rendered here.</p>
                    </div>
                    <div class="preview-content">
                        <p>Document content would be displayed here.</p>
                    </div>
                </div>
            </body>
            </html>
            """)
    
    def process_document(
        self,
        db: Session,
        document_id: int,
        extract_requirements: bool = False,
    ) -> Dict[str, Any]:
        """
        Process document for text extraction and requirement identification
        
        Args:
            db: Database session
            document_id: ID of the document to process
            extract_requirements: Whether to extract requirements
            
        Returns:
            Dictionary with processing results
        """
        # Get document
        document = crud.document.get(db=db, id=document_id)
        if not document:
            return {"error": "Document not found"}
        
        # Update status
        crud.document.update(db=db, db_obj=document, obj_in={"extraction_status": "processing"})
        
        try:
            # Get document path
            document_path = os.path.join(self.storage_dir, document.filepath)
            
            # Extract text based on document type
            extracted_text = self._extract_text(document_path, document.document_type)
            
            # Update document with extracted text
            crud.document.update(
                db=db, 
                db_obj=document, 
                obj_in={
                    "extracted_text": extracted_text,
                    "extraction_status": "complete"
                }
            )
            
            result = {
                "document_id": document_id,
                "extracted_text": extracted_text,
                "extraction_status": "complete",
                "requirements_extracted": 0
            }
            
            # Extract requirements if requested
            if extract_requirements and extracted_text:
                requirements = self._extract_requirements(db, document, extracted_text)
                result["requirements_extracted"] = len(requirements)
            
            return result
        
        except Exception as e:
            # Update status to failed
            crud.document.update(
                db=db, 
                db_obj=document, 
                obj_in={"extraction_status": "failed"}
            )
            return {
                "document_id": document_id,
                "extraction_status": "failed",
                "error_message": str(e)
            }
    
    def _extract_text(self, document_path: str, document_type: str) -> str:
        """
        Extract text from document
        
        Args:
            document_path: Path to the document
            document_type: Type of document
            
        Returns:
            Extracted text
        """
        # This would be implemented with appropriate libraries based on document type
        # For now, return placeholder text
        return f"This is placeholder extracted text for a {document_type} document. " \
               f"In a real implementation, text would be extracted from {document_path}."
    
    def _extract_requirements(
        self, 
        db: Session, 
        document: models.Document, 
        text: str
    ) -> List[models.Requirement]:
        """
        Extract requirements from document text using AI
        
        Args:
            db: Database session
            document: Document model
            text: Extracted text
            
        Returns:
            List of created requirement models
        """
        # In a real implementation, this would use NLP/AI to identify requirements
        # For now, create a single sample requirement
        requirement_data = schemas.requirement.RequirementCreate(
            project_id=document.project_id,
            title=f"Requirement extracted from {document.title}",
            description="This is a placeholder requirement that would normally be extracted using AI.",
            requirement_type="functional",
            priority="medium",
            status="draft",
            is_ai_generated=True,
            source_document_id=document.id,
            source_text_excerpt=text[:200] + "..." if len(text) > 200 else text
        )
        
        requirement = crud.requirement.create(db=db, obj_in=requirement_data)
        return [requirement]
