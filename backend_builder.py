"""
Backend builder for the Auto AGI Builder system.
Handles API generation, database connections, and backend services.
"""
import os
import sys
import logging
from typing import List, Dict, Any, Optional, Union, Tuple
from pathlib import Path

from builder_core import BuilderCore

class BackendBuilder(BuilderCore):
    """
    Handles the generation and management of backend components.
    Builds FastAPI endpoints, database models, and services.
    """
    
    def __init__(self, project_root: str = None):
        """Initialize the backend builder."""
        super().__init__(project_root)
        self.logger = logging.getLogger("backend_builder")
        
        # Check Python version
        if sys.version_info < (3, 8):
            self.logger.warning(f"Python 3.8+ is recommended. Current version: {sys.version_info.major}.{sys.version_info.minor}")
    
    def setup_fastapi(self) -> bool:
        """
        Set up the FastAPI application structure.
        
        Returns:
            bool: True if successful, False otherwise
        """
        self.logger.info("Setting up FastAPI application structure...")
        
        # Create necessary directories if they don't exist
        dirs = [
            "app",
            "app/api",
            "app/api/v1",
            "app/api/v1/endpoints",
            "app/core",
            "app/schemas",
            "app/models",
            "app/services",
            "app/services/ai",
            "app/services/storage",
            "app/services/email",
        ]
        
        for directory in dirs:
            dir_path = self.project_root / directory
            if not dir_path.exists():
                self.logger.info(f"Creating directory: {dir_path}")
                dir_path.mkdir(parents=True, exist_ok=True)
                
                # Create __init__.py in each directory
                init_file = dir_path / "__init__.py"
                if not init_file.exists():
                    self.logger.info(f"Creating file: {init_file}")
                    init_file.touch()
        
        # Create main.py
        main_py_content = """
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.core.config import settings
from app.api.v1.api import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
"""
        if self.create_file("app/main.py", main_py_content):
            self.logger.info("Created main.py")
        
        # Create config.py
        config_py_content = """
import os
import secrets
from typing import Any, Dict, List, Optional, Union

from pydantic import AnyHttpUrl, BaseSettings, EmailStr, validator

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    PROJECT_NAME: str = "Auto AGI Builder"
    PROJECT_DESCRIPTION: str = "AI-powered prototype development platform"
    VERSION: str = "1.0.0"
    
    # CORS Settings
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "https://localhost:3000"]
    
    @validator("CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    # Database Settings
    DATABASE_URL: Optional[str] = None
    
    # Firebase Settings
    FIREBASE_API_KEY: Optional[str] = None
    FIREBASE_AUTH_DOMAIN: Optional[str] = None
    FIREBASE_PROJECT_ID: Optional[str] = None
    FIREBASE_STORAGE_BUCKET: Optional[str] = None
    FIREBASE_MESSAGING_SENDER_ID: Optional[str] = None
    FIREBASE_APP_ID: Optional[str] = None
    
    # OpenAI Settings
    OPENAI_API_KEY: Optional[str] = None
    
    # AWS Settings
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: Optional[str] = None
    S3_BUCKET_NAME: Optional[str] = None
    
    # Email Settings
    SMTP_TLS: bool = True
    SMTP_PORT: Optional[int] = None
    SMTP_HOST: Optional[str] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: Optional[EmailStr] = None
    EMAILS_FROM_NAME: Optional[str] = None
    
    # Sentry Settings
    SENTRY_DSN: Optional[str] = None
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
"""
        if self.create_file("app/core/config.py", config_py_content):
            self.logger.info("Created config.py")
        
        # Create API router
        api_router_content = """
from fastapi import APIRouter

from app.api.v1.endpoints import requirements, prototype, roi, export

api_router = APIRouter()
api_router.include_router(requirements.router, prefix="/requirements", tags=["requirements"])
api_router.include_router(prototype.router, prefix="/prototype", tags=["prototype"])
api_router.include_router(roi.router, prefix="/roi", tags=["roi"])
api_router.include_router(export.router, prefix="/export", tags=["export"])
"""
        if self.create_file("app/api/v1/api.py", api_router_content):
            self.logger.info("Created API router")
        
        # Create sample endpoint file
        requirements_endpoint_content = """
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional

from app.schemas.requirement import RequirementCreate, RequirementUpdate, RequirementInDB

router = APIRouter()

@router.get("/", response_model=List[RequirementInDB])
async def get_requirements():
    \"\"\"Get all requirements.\"\"\"
    # Implement database query here
    return []

@router.post("/", response_model=RequirementInDB)
async def create_requirement(requirement: RequirementCreate):
    \"\"\"Create a new requirement.\"\"\"
    # Implement database insertion here
    return {**requirement.dict(), "id": "123"}

@router.get("/{requirement_id}", response_model=RequirementInDB)
async def get_requirement(requirement_id: str):
    \"\"\"Get a specific requirement by ID.\"\"\"
    # Implement database query here
    return {"id": requirement_id, "title": "Sample Requirement", "description": "This is a sample requirement."}

@router.put("/{requirement_id}", response_model=RequirementInDB)
async def update_requirement(requirement_id: str, requirement: RequirementUpdate):
    \"\"\"Update a specific requirement.\"\"\"
    # Implement database update here
    return {**requirement.dict(), "id": requirement_id}

@router.delete("/{requirement_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_requirement(requirement_id: str):
    \"\"\"Delete a specific requirement.\"\"\"
    # Implement database deletion here
    return None
"""
        if self.create_file("app/api/v1/endpoints/requirements.py", requirements_endpoint_content):
            self.logger.info("Created requirements endpoint")
        
        # Create sample schema file
        requirement_schema_content = """
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class RequirementPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class RequirementStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    IN_PROGRESS = "in_progress"
    DONE = "done"
    CANCELLED = "cancelled"

class RequirementBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: RequirementPriority = RequirementPriority.MEDIUM
    status: RequirementStatus = RequirementStatus.DRAFT
    tags: List[str] = []

class RequirementCreate(RequirementBase):
    pass

class RequirementUpdate(RequirementBase):
    title: Optional[str] = None
    
class RequirementInDB(RequirementBase):
    id: str
    created_at: Optional[datetime] = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = Field(default_factory=datetime.now)
    
    class Config:
        orm_mode = True
"""
        if self.create_file("app/schemas/requirement.py", requirement_schema_content):
            self.logger.info("Created requirement schema")
        
        # Create error handling
        error_handling_content = """
from fastapi import HTTPException, status
from typing import Dict, Any, Optional

class AppException(Exception):
    \"\"\"Base exception class for the application.\"\"\"
    def __init__(
        self,
        status_code: int,
        detail: str,
        headers: Optional[Dict[str, Any]] = None,
    ):
        self.status_code = status_code
        self.detail = detail
        self.headers = headers


def get_user_not_found_exception() -> HTTPException:
    \"\"\"Return a user not found HTTP exception.\"\"\"
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="The user with this ID does not exist.",
    )


def get_authentication_exception() -> HTTPException:
    \"\"\"Return an authentication HTTP exception.\"\"\"
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_permission_denied_exception() -> HTTPException:
    \"\"\"Return a permission denied HTTP exception.\"\"\"
    return HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Not enough permissions",
    )


def get_bad_request_exception(detail: str) -> HTTPException:
    \"\"\"Return a bad request HTTP exception.\"\"\"
    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=detail,
    )
"""
        if self.create_file("app/core/error_handling.py", error_handling_content):
            self.logger.info("Created error handling module")
        
        return True
    
    def setup_database(self, db_type: str = "sqlite") -> bool:
        """
        Set up the database connection and models.
        
        Args:
            db_type: Type of database to use. Options: 'sqlite', 'postgres', 'mongodb'
            
        Returns:
            bool: True if successful, False otherwise
        """
        self.logger.info(f"Setting up {db_type} database connection...")
        
        if db_type == "sqlite":
            db_module_content = """
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL or "sqlite:///./auto_agi_builder.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
"""
            if self.create_file("app/db/session.py", db_module_content):
                self.logger.info("Created SQLite database module")
                
            # Create models directory
            models_dir = self.project_root / "app" / "models"
            models_dir.mkdir(parents=True, exist_ok=True)
            
            # Create base model for SQLAlchemy
            base_model_content = """
from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from uuid import uuid4

from app.db.session import Base

def generate_uuid():
    return str(uuid4())

class BaseModel(Base):
    __abstract__ = True
    
    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
"""
            if self.create_file("app/models/base.py", base_model_content):
                self.logger.info("Created base SQLAlchemy model")
                
            # Create a sample model
            requirement_model_content = """
from sqlalchemy import Column, String, Text, Enum, ARRAY
from sqlalchemy.dialects.postgresql import ARRAY as PG_ARRAY
import enum

from app.models.base import BaseModel

class RequirementPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class RequirementStatus(str, enum.Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    IN_PROGRESS = "in_progress"
    DONE = "done"
    CANCELLED = "cancelled"

class Requirement(BaseModel):
    __tablename__ = "requirements"
    
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(
        Enum(RequirementPriority),
        default=RequirementPriority.MEDIUM,
        nullable=False
    )
    status = Column(
        Enum(RequirementStatus),
        default=RequirementStatus.DRAFT,
        nullable=False
    )
    # Use a custom method to handle tags as list or strings based on DB
    tags_str = Column(String, nullable=True)
    
    @property
    def tags(self):
        if self.tags_str:
            return self.tags_str.split(",")
        return []
    
    @tags.setter
    def tags(self, value):
        if isinstance(value, list):
            self.tags_str = ",".join(value)
        else:
            self.tags_str = value
"""
            if self.create_file("app/models/requirement.py", requirement_model_content):
                self.logger.info("Created requirement SQLAlchemy model")
                
        elif db_type == "mongodb":
            db_module_content = """
import motor.motor_asyncio
from bson import ObjectId
from typing import Any, List, Optional
from pydantic import BaseModel, Field

from app.core.config import settings

DATABASE_URL = settings.DATABASE_URL or "mongodb://localhost:27017"
client = motor.motor_asyncio.AsyncIOMotorClient(DATABASE_URL)
database = client.auto_agi_builder

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

class MongoBaseModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
"""
            if self.create_file("app/db/mongodb.py", db_module_content):
                self.logger.info("Created MongoDB database module")
                
            # Create a sample MongoDB model
            requirement_model_content = """
from typing import List, Optional
from datetime import datetime
from enum import Enum
from pydantic import Field

from app.db.mongodb import MongoBaseModel

class RequirementPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class RequirementStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    IN_PROGRESS = "in_progress"
    DONE = "done"
    CANCELLED = "cancelled"

class RequirementModel(MongoBaseModel):
    title: str
    description: Optional[str] = None
    priority: RequirementPriority = RequirementPriority.MEDIUM
    status: RequirementStatus = RequirementStatus.DRAFT
    tags: List[str] = []
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    class Collection:
        name = "requirements"
"""
            if self.create_file("app/models/requirement_mongodb.py", requirement_model_content):
                self.logger.info("Created requirement MongoDB model")
                
        elif db_type == "postgres":
            db_module_content = """
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL or "postgresql://postgres:postgres@localhost/auto_agi_builder"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
"""
            if self.create_file("app/db/session.py", db_module_content):
                self.logger.info("Created PostgreSQL database module")
                
            # Create same base model as SQLite since both use SQLAlchemy
            base_model_content = """
from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from uuid import uuid4

from app.db.session import Base

def generate_uuid():
    return str(uuid4())

class BaseModel(Base):
    __abstract__ = True
    
    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
"""
            if self.create_file("app/models/base.py", base_model_content):
                self.logger.info("Created base SQLAlchemy model")
                
            # Create a sample model with postgres-specific features
            requirement_model_content = """
from sqlalchemy import Column, String, Text, Enum
from sqlalchemy.dialects.postgresql import ARRAY
import enum

from app.models.base import BaseModel

class RequirementPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class RequirementStatus(str, enum.Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    IN_PROGRESS = "in_progress"
    DONE = "done"
    CANCELLED = "cancelled"

class Requirement(BaseModel):
    __tablename__ = "requirements"
    
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(
        Enum(RequirementPriority),
        default=RequirementPriority.MEDIUM,
        nullable=False
    )
    status = Column(
        Enum(RequirementStatus),
        default=RequirementStatus.DRAFT,
        nullable=False
    )
    tags = Column(ARRAY(String), nullable=True)
"""
            if self.create_file("app/models/requirement_postgres.py", requirement_model_content):
                self.logger.info("Created requirement PostgreSQL model")
                
        else:
            self.logger.error(f"Unsupported database type: {db_type}")
            return False
            
        # Create CRUD operations
        crud_base_content = """
from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import Base

ModelType = TypeVar("ModelType", bound=Base)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)

class CRUDBase(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, model: Type[ModelType]):
        \"\"\"
        CRUD object with default methods to Create, Read, Update, Delete (CRUD).

        **Parameters**

        * `model`: A SQLAlchemy model class
        * `schema`: A Pydantic model (schema) class
        \"\"\"
        self.model = model

    def get(self, db: Session, id: Any) -> Optional[ModelType]:
        return db.query(self.model).filter(self.model.id == id).first()

    def get_multi(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[ModelType]:
        return db.query(self.model).offset(skip).limit(limit).all()

    def create(self, db: Session, *, obj_in: CreateSchemaType) -> ModelType:
        obj_in_data = jsonable_encoder(obj_in)
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self,
        db: Session,
        *,
        db_obj: ModelType,
        obj_in: Union[UpdateSchemaType, Dict[str, Any]]
    ) -> ModelType:
        obj_data = jsonable_encoder(db_obj)
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: Any) -> ModelType:
        obj = db.query(self.model).get(id)
        db.delete(obj)
        db.commit()
        return obj
"""
        if self.create_file("app/crud/base.py", crud_base_content):
            self.logger.info("Created base CRUD operations")
            
        # Create sample CRUD implementation
        crud_requirement_content = """
from typing import List, Optional
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.requirement import Requirement
from app.schemas.requirement import RequirementCreate, RequirementUpdate

class CRUDRequirement(CRUDBase[Requirement, RequirementCreate, RequirementUpdate]):
    def get_by_title(self, db: Session, *, title: str) -> Optional[Requirement]:
        return db.query(self.model).filter(self.model.title == title).first()
    
    def get_by_status(self, db: Session, *, status: str) -> List[Requirement]:
        return db.query(self.model).filter(self.model.status == status).all()

    def get_by_priority(self, db: Session, *, priority: str) -> List[Requirement]:
        return db.query(self.model).filter(self.model.priority == priority).all()

requirement = CRUDRequirement(Requirement)
"""
        if self.create_file("app/crud/requirement.py", crud_requirement_content):
            self.logger.info("Created requirement CRUD operations")
            
        return True
    
    def setup_ai_services(self) -> bool:
        """
        Set up AI service integrations.
        
        Returns:
            bool: True if successful, False otherwise
        """
        self.logger.info("Setting up AI service integrations...")
        
        # Create AI service manager
        ai_service_manager_content = """
import logging
from typing import Dict, Any, Optional, List
from enum import Enum

from app.core.config import settings
from app.services.ai.openai_service import OpenAIService

logger = logging.getLogger(__name__)

class AIServiceType(str, Enum):
    OPENAI = "openai"
    HUGGINGFACE = "huggingface"
    AZURE_OPENAI = "azure_openai"

class AIServiceManager:
    \"\"\"
    Manager class to handle different AI service providers.
    Provides a unified interface to interact with various AI models.
    \"\"\"
    
    def __init__(self):
        self.services = {}
        self._initialize_services()
    
    def _initialize_services(self):
        \"\"\"Initialize available AI services.\"\"\"
        # Initialize OpenAI if API key is available
        if settings.OPENAI_API_KEY:
            try:
                self.services[AIServiceType.OPENAI] = OpenAIService(
                    api_key=settings.OPENAI_API_KEY
                )
                logger.info("OpenAI service initialized")
            except Exception as e:
                logger.error(f"Failed to initialize OpenAI service: {e}")
        else:
            logger.warning("OpenAI API key not found, service not initialized")
    
    async def generate_text(
        self,
        prompt: str,
        service_type: AIServiceType = AIServiceType.OPENAI,
        model: Optional[str] = None,
        max_tokens: int = 1000,
        temperature: float = 0.7,
        options: Optional[Dict[str, Any]] = None
    ) -> str:
        \"\"\"
        Generate text using the specified AI service.
        
        Args:
            prompt: The input prompt for text generation.
            service_type: The AI service provider to use.
            model: Optional model name. If None, uses the service's default.
            max_tokens: Maximum number of tokens to generate.
            temperature: Controls randomness. Lower is more deterministic.
            options: Additional options specific to the service provider.
            
        Returns:
            str: The generated text.
            
        Raises:
            ValueError: If the specified service is not available.
        \"\"\"
        options = options or {}
        
        if service_type not in self.services:
            available_services = list(self.services.keys())
            raise ValueError(
                f"Service {service_type} not available. "
                f"Available services: {available_services}"
            )
        
        service = self.services[service_type]
        return await service.generate_text(
            prompt=prompt,
            model=model,
            max_tokens=max_tokens,
            temperature=temperature,
            **options
        )
    
    async def embed_text(
        self,
        text: str,
        service_type: AIServiceType = AIServiceType.OPENAI,
        model: Optional[str] = None,
        options: Optional[Dict[str, Any]] = None
    ) -> List[float]:
        \"\"\"
        Generate embeddings for the given text.
        
        Args:
            text: The text to embed.
            service_type: The AI service provider to use.
            model: Optional model name. If None, uses the service's default.
            options: Additional options specific to the service provider.
            
        Returns:
            List[float]: The embedding vector.
            
        Raises:
            ValueError: If the specified service is not available.
        \"\"\"
        options = options or {}
        
        if service_type not in self.services:
            available_services = list(self.services.keys())
            raise ValueError(
                f"Service {service_type} not available. "
                f"Available services: {available_services}"
            )
        
        service = self.services[service_type]
        return await service.embed_text(
            text=text,
            model=model,
            **options
        )
    
    async def analyze_document(
        self,
        text: str,
        analysis_type: str,
        service_type: AIServiceType = AIServiceType.OPENAI,
        model: Optional[str] = None,
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        \"\"\"
        Analyze a document for specific information.
        
        Args:
            text: The document text to analyze.
            analysis_type: Type of analysis to perform (e.g., "requirements", "summary", "entities").
            service_type: The AI service provider to use.
            model: Optional model name. If None, uses the service's default.
            options: Additional options specific to the service provider.
            
        Returns:
            Dict[str, Any]: The analysis results.
            
        Raises:
            ValueError: If the specified service is not available.
        \"\"\"
        options = options or {}
        
        if service_type not in self.services:
            available_services = list(self.services.keys())
            raise ValueError(
                f"Service {service_type} not available. "
                f"Available services: {available_services}"
            )
        
        service = self.services[service_type]
        return await service.analyze_document(
            text=text,
            analysis_type=analysis_type,
            model=model,
            **options
        )

# Create a singleton instance
ai_service_manager = AIServiceManager()
"""
        if self.create_file("app/services/ai/ai_service_manager.py", ai_service_manager_content):
            self.logger.info("Created AI service manager")
            
        # Create OpenAI service
        openai_service_content = """
import logging
import json
from typing import Dict, Any, Optional, List, Union
import openai

logger = logging.getLogger(__name__)

class OpenAIService:
