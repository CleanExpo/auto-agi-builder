from fastapi import APIRouter

from app.api.v1.endpoints import auth, users, projects, requirements, documents, prototypes, roi, comments, roadmap

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(requirements.router, prefix="/requirements", tags=["requirements"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(prototypes.router, prefix="/prototypes", tags=["prototypes"])
api_router.include_router(roi.router, prefix="/roi", tags=["roi"])
api_router.include_router(comments.router, prefix="/comments", tags=["comments"])
api_router.include_router(roadmap.router, prefix="/roadmap", tags=["roadmap"])
