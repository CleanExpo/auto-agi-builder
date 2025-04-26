from fastapi import APIRouter, Depends, HTTPException, Body, Query, Path
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
import uuid
import json
from app.core.auth.jwt import get_current_user
from app.models.user import User
from app.db.session import get_db
from sqlalchemy.orm import Session
from app.services.ai import ai_service_manager

router = APIRouter()

# Schemas
class CommentPosition(BaseModel):
    x: float
    y: float

class CommentCreate(BaseModel):
    text: str
    position: CommentPosition
    page: str

class Comment(CommentCreate):
    id: str
    author: Dict[str, str]
    createdAt: datetime

class PrototypePage(BaseModel):
    id: str
    name: str
    url: Optional[str] = None
    isHome: bool = False
    title: Optional[str] = None

class PrototypeOptions(BaseModel):
    platform: str = "web"
    fidelity: str = "medium"
    includeNavigation: bool = True
    includeAnimations: bool = False
    styleTheme: str = "default"
    customBranding: bool = False
    useRealData: bool = False
    optimizeFor: str = "usability"
    targetFramework: str = "react"

class PrototypeRequirement(BaseModel):
    id: str
    title: str
    description: str
    status: str
    priority: str
    type: str

class PrototypeCreate(BaseModel):
    projectId: str
    requirements: List[PrototypeRequirement]
    options: PrototypeOptions

class Prototype(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    projectId: str
    platform: str
    fidelity: str
    targetFramework: str
    status: str = "ready"
    thumbnailUrl: Optional[str] = None
    requirements: List[str]
    pages: List[PrototypePage] = []
    createdAt: datetime
    updatedAt: datetime

# Helper Functions
def generate_prototype_name(requirements: List[PrototypeRequirement], options: PrototypeOptions) -> str:
    """Generate a descriptive name for the prototype based on its requirements and options."""
    
    # Get primary requirement (usually the first high-priority one)
    primary_req = next(
        (r for r in requirements if r.priority in ["critical", "high"]), 
        requirements[0] if requirements else None
    )
    
    if primary_req:
        # Create name based on primary requirement and platform
        return f"{primary_req.title[:40]} Prototype ({options.platform.capitalize()})"
    else:
        # Fallback name
        return f"New {options.platform.capitalize()} Prototype"

def store_prototype(db: Session, prototype_data: Dict[str, Any]) -> Dict[str, Any]:
    """Store prototype data in database."""
    
    # In a real implementation, this would store data in the database
    # For simplicity, we'll just return the data as if it was stored
    
    # In production, use a proper database model and repository
    return prototype_data

def generate_prototype_pages(requirements: List[PrototypeRequirement], options: PrototypeOptions) -> List[Dict[str, Any]]:
    """Generate prototype pages based on requirements and options."""
    
    # This would typically involve AI processing of the requirements to generate pages
    # For now, we'll create some default pages based on common patterns
    pages = []
    
    # Always include a home page
    home_page = {
        "id": str(uuid.uuid4()),
        "name": "Home",
        "isHome": True,
        "title": "Home"
    }
    pages.append(home_page)
    
    # Group requirements by type
    req_types = {}
    for req in requirements:
        if req.type not in req_types:
            req_types[req.type] = []
        req_types[req.type].append(req)
    
    # Create pages for each requirement type
    for req_type, reqs in req_types.items():
        # Skip if no requirements of this type
        if not reqs:
            continue
            
        # Create page for this type
        page_id = str(uuid.uuid4())
        page = {
            "id": page_id,
            "name": req_type.capitalize(),
            "title": f"{req_type.capitalize()} View"
        }
        pages.append(page)
        
        # For feature requirements, create individual detail pages
        if req_type.lower() in ["feature", "user story"]:
            for req in reqs:
                detail_page = {
                    "id": str(uuid.uuid4()),
                    "name": f"{req.title[:30]}",
                    "title": req.title
                }
                pages.append(detail_page)
    
    # Based on platform and options, add additional standard pages
    if options.includeNavigation:
        # Add common pages based on platform
        if options.platform == "web":
            pages.append({
                "id": str(uuid.uuid4()),
                "name": "About",
                "title": "About"
            })
            pages.append({
                "id": str(uuid.uuid4()),
                "name": "Contact",
                "title": "Contact"
            })
        elif options.platform == "mobile":
            pages.append({
                "id": str(uuid.uuid4()),
                "name": "Profile",
                "title": "User Profile"
            })
            pages.append({
                "id": str(uuid.uuid4()),
                "name": "Settings",
                "title": "Settings"
            })
    
    return pages

# API Endpoints

@router.post("/prototypes/generate", response_model=Dict[str, Any])
async def generate_prototype(
    prototype_data: PrototypeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a new prototype based on project requirements."""
    
    try:
        # Validate project ID
        # In a real implementation, verify the user has access to the project
        project_id = prototype_data.projectId
        
        # Generate prototype name
        prototype_name = generate_prototype_name(prototype_data.requirements, prototype_data.options)
        
        # Generate pages for the prototype
        pages = generate_prototype_pages(prototype_data.requirements, prototype_data.options)
        
        # Create prototype record
        now = datetime.now()
        prototype = {
            "id": str(uuid.uuid4()),
            "name": prototype_name,
            "description": f"Prototype generated from {len(prototype_data.requirements)} requirements",
            "projectId": project_id,
            "platform": prototype_data.options.platform,
            "fidelity": prototype_data.options.fidelity,
            "targetFramework": prototype_data.options.targetFramework,
            "status": "ready",
            "requirements": [req.id for req in prototype_data.requirements],
            "pages": pages,
            "createdAt": now,
            "updatedAt": now
        }
        
        # Store prototype data
        stored_prototype = store_prototype(db, prototype)
        
        # Return the created prototype
        return {"prototype": stored_prototype}
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating prototype: {str(e)}"
        )

@router.get("/projects/{project_id}/prototypes", response_model=Dict[str, List[Dict[str, Any]]])
async def list_prototypes(
    project_id: str = Path(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all prototypes for a project."""
    
    try:
        # In a real implementation, fetch from database
        # For simplicity, return mock data
        mock_prototypes = [
            {
                "id": "proto-123",
                "name": "User Dashboard Prototype",
                "projectId": project_id,
                "platform": "web",
                "fidelity": "medium",
                "targetFramework": "react",
                "status": "ready",
                "thumbnailUrl": None,
                "createdAt": datetime.now().isoformat()
            },
            {
                "id": "proto-456",
                "name": "Mobile App Prototype",
                "projectId": project_id,
                "platform": "mobile",
                "fidelity": "high",
                "targetFramework": "react-native",
                "status": "ready",
                "thumbnailUrl": None,
                "createdAt": datetime.now().isoformat()
            }
        ]
        
        return {"prototypes": mock_prototypes}
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching prototypes: {str(e)}"
        )

@router.get("/prototypes/{prototype_id}", response_model=Dict[str, Any])
async def get_prototype(
    prototype_id: str = Path(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get details for a specific prototype."""
    
    try:
        # In a real implementation, fetch from database
        # For simplicity, return mock data
        mock_prototype = {
            "id": prototype_id,
            "name": "User Dashboard Prototype",
            "description": "Prototype showing the main user dashboard with key features",
            "projectId": "project-123",
            "platform": "web",
            "fidelity": "medium",
            "targetFramework": "react",
            "status": "ready",
            "thumbnailUrl": None,
            "requirements": ["req-001", "req-002", "req-003"],
            "pages": [
                {
                    "id": "page-001",
                    "name": "Home",
                    "isHome": True,
                    "title": "Dashboard Home"
                },
                {
                    "id": "page-002",
                    "name": "Reports",
                    "title": "User Reports"
                },
                {
                    "id": "page-003",
                    "name": "Settings",
                    "title": "User Settings"
                }
            ],
            "createdAt": datetime.now().isoformat(),
            "updatedAt": datetime.now().isoformat()
        }
        
        return mock_prototype
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching prototype: {str(e)}"
        )

@router.delete("/prototypes/{prototype_id}", response_model=Dict[str, str])
async def delete_prototype(
    prototype_id: str = Path(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a prototype."""
    
    try:
        # In a real implementation, delete from database
        # For simplicity, just return success response
        
        return {"message": f"Prototype {prototype_id} deleted successfully"}
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting prototype: {str(e)}"
        )

@router.get("/prototypes/{prototype_id}/preview/{page_id}", response_model=Dict[str, str])
async def get_prototype_page_preview(
    prototype_id: str = Path(...),
    page_id: str = Path(...),
    current_user: User = Depends(get_current_user)
):
    """Get HTML preview for a prototype page."""
    
    try:
        # In a real implementation, generate or fetch HTML for the page
        # For simplicity, return mock HTML
        
        mock_html = """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Prototype Preview</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f5f5f5;
                }
                .header {
                    background-color: #3f51b5;
                    color: white;
                    padding: 1rem;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .content {
                    padding: 1rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .card {
                    background: white;
                    border-radius: 4px;
                    padding: 1rem;
                    margin-bottom: 1rem;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .footer {
                    background-color: #f5f5f5;
                    text-align: center;
                    padding: 1rem;
                    margin-top: 2rem;
                    border-top: 1px solid #e0e0e0;
                }
                .button {
                    background-color: #3f51b5;
                    color: white;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 4px;
                    cursor: pointer;
                }
                .nav {
                    display: flex;
                    gap: 1rem;
                    padding: 0.5rem 1rem;
                    background-color: #e0e0e0;
                }
                .nav-item {
                    cursor: pointer;
                    padding: 0.5rem;
                }
                .nav-item:hover {
                    background-color: #d0d0d0;
                    border-radius: 4px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Prototype Preview</h1>
            </div>
            <div class="nav">
                <div class="nav-item">Home</div>
                <div class="nav-item">Features</div>
                <div class="nav-item">Reports</div>
                <div class="nav-item">Settings</div>
            </div>
            <div class="content">
                <div class="card">
                    <h2>Welcome to Your Dashboard</h2>
                    <p>This is a prototype preview of page ID: """ + page_id + """</p>
                    <p>Here you'll see visualizations of your data and quick actions.</p>
                    <button class="button">Get Started</button>
                </div>
                <div class="card">
                    <h3>Recent Activity</h3>
                    <ul>
                        <li>New comment on Project A</li>
                        <li>Task "Update documentation" completed</li>
                        <li>New task assigned to you</li>
                    </ul>
                </div>
            </div>
            <div class="footer">
                <p>This is a prototype preview. Not all functionality is implemented.</p>
            </div>
        </body>
        </html>
        """
        
        return {"html": mock_html}
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching prototype page preview: {str(e)}"
        )

@router.get("/prototypes/{prototype_id}/comments", response_model=Dict[str, List[Comment]])
async def get_prototype_comments(
    prototype_id: str = Path(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all comments for a prototype."""
    
    try:
        # In a real implementation, fetch from database
        # For simplicity, return mock data
        mock_comments = [
            {
                "id": "comment-001",
                "text": "The button position should be more prominent",
                "position": {"x": 50, "y": 60},
                "page": "page-001",
                "author": {"name": "Jane Doe", "id": "user-123"},
                "createdAt": datetime.now().isoformat()
            },
            {
                "id": "comment-002",
                "text": "Can we use a different color for this section?",
                "position": {"x": 70, "y": 40},
                "page": "page-002",
                "author": {"name": "John Smith", "id": "user-456"},
                "createdAt": datetime.now().isoformat()
            }
        ]
        
        return {"comments": mock_comments}
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching prototype comments: {str(e)}"
        )

@router.post("/prototypes/{prototype_id}/comments", response_model=Dict[str, Any])
async def add_prototype_comment(
    prototype_id: str = Path(...),
    comment_data: CommentCreate = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a new comment to a prototype."""
    
    try:
        # In a real implementation, save to database
        # For simplicity, fabricate a response
        
        comment_id = str(uuid.uuid4())
        new_comment = {
            "id": comment_id,
            "text": comment_data.text,
            "position": {
                "x": comment_data.position.x,
                "y": comment_data.position.y
            },
            "page": comment_data.page,
            "author": {
                "id": current_user.id,
                "name": f"{current_user.first_name} {current_user.last_name}"
            },
            "createdAt": datetime.now().isoformat()
        }
        
        return {"comment": new_comment}
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error adding comment: {str(e)}"
        )

@router.delete("/prototypes/{prototype_id}/comments/{comment_id}", response_model=Dict[str, str])
async def delete_prototype_comment(
    prototype_id: str = Path(...),
    comment_id: str = Path(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a comment from a prototype."""
    
    try:
        # In a real implementation, delete from database
        # For simplicity, just return success response
        
        return {"message": f"Comment {comment_id} deleted successfully"}
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting comment: {str(e)}"
        )
