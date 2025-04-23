"""
Configuration module for Auto AGI Builder application.

This module handles configuration settings for the application, including
loading environment variables, validating required settings, and providing
access to configuration values throughout the application.
"""
import os
import secrets
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

from pydantic import (
    AnyHttpUrl,
    BaseSettings,
    EmailStr,
    Field,
    PostgresDsn,
    SecretStr,
    validator
)

# Base project directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Application Settings
    # --------------------
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    LOG_LEVEL: str = "info"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    APP_NAME: str = "Auto AGI Builder"
    APP_VERSION: str = "1.0.0"
    APP_URL: AnyHttpUrl = Field(..., description="Base URL for the frontend application")
    API_DOMAIN: Optional[str] = None
    TIME_ZONE: str = "UTC"
    
    # Security Settings
    # ----------------
    SECRET_KEY: SecretStr = Field(
        default_factory=lambda: SecretStr(secrets.token_urlsafe(32)),
        description="Secret key for cryptographic components"
    )
    JWT_SECRET: SecretStr = Field(
        default_factory=lambda: SecretStr(secrets.token_urlsafe(32)),
        description="Secret for JWT token generation"
    )
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS Settings
    ALLOWED_ORIGINS: List[str] = Field(default_factory=list)
    RATE_LIMIT_PER_MINUTE: int = 60
    
    # Cookie Settings
    COOKIE_SECURE: bool = True
    COOKIE_SAMESITE: str = "lax"
    COOKIE_HTTPONLY: bool = True
    
    # Database Settings
    # ----------------
    DATABASE_URL: PostgresDsn
    DATABASE_MAX_CONNECTIONS: int = 20
    DATABASE_POOL_TIMEOUT: int = 30
    DATABASE_ECHO: bool = False
    DATABASE_SSL_MODE: Optional[str] = None

    # Redis Settings
    # -------------
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: Optional[SecretStr] = None
    REDIS_DB: int = 0
    REDIS_SSL: bool = False
    REDIS_MAX_CONNECTIONS: int = 10
    REDIS_KEY_PREFIX: str = "auto_agi:"
    
    # Email Settings
    # -------------
    SENDGRID_API_KEY: Optional[SecretStr] = None
    DEFAULT_FROM_EMAIL: Optional[EmailStr] = None
    SUPPORT_EMAIL: Optional[EmailStr] = None
    
    # OpenAI Settings
    # --------------
    OPENAI_API_KEY: Optional[SecretStr] = None
    OPENAI_ORG_ID: Optional[str] = None
    OPENAI_BASE_MODEL: str = "gpt-4-turbo"
    OPENAI_MAX_TOKENS: int = 4096
    OPENAI_TEMPERATURE: float = 0.7
    OPENAI_TIMEOUT_SECONDS: int = 30
    
    # AWS Settings
    # -----------
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[SecretStr] = None
    AWS_REGION: Optional[str] = None
    AWS_S3_BUCKET: Optional[str] = None
    AWS_S3_KEY_PREFIX: Optional[str] = None
    AWS_CLOUDFRONT_DOMAIN: Optional[str] = None
    AWS_S3_PUBLIC_URL: Optional[AnyHttpUrl] = None
    
    # Storage Settings
    # --------------
    STORAGE_PROVIDER: str = "local"  # Options: local, s3
    STORAGE_LOCAL_PATH: Path = BASE_DIR / "data" / "storage"
    STORAGE_MAX_UPLOAD_SIZE: int = 10485760  # 10MB in bytes
    ALLOWED_UPLOAD_TYPES: str = ".pdf,.docx,.xlsx,.pptx,.txt,.csv,.json,.jpg,.png,.svg"
    
    # Monitoring and Logging Settings
    # -----------------------------
    SENTRY_DSN: Optional[str] = None
    SENTRY_ENVIRONMENT: Optional[str] = None
    SENTRY_TRACES_SAMPLE_RATE: float = 0.1
    ENABLE_PERFORMANCE_MONITORING: bool = True
    LOG_FORMAT: str = "json"
    LOG_RETENTION_DAYS: int = 30
    LOG_FILE_PATH: Optional[Path] = None
    
    # Analytics Settings
    # ----------------
    GOOGLE_ANALYTICS_ID: Optional[str] = None
    GOOGLE_TAG_MANAGER_ID: Optional[str] = None
    ENABLE_USAGE_ANALYTICS: bool = True
    ANALYTICS_CONSENT_REQUIRED: bool = True
    
    # Feature Flags
    # ------------
    ENABLE_COLLABORATION_FEATURES: bool = True
    ENABLE_DEVICE_PREVIEW: bool = True
    ENABLE_AI_PROTOTYPE_GENERATION: bool = True
    ENABLE_REAL_TIME_UPDATES: bool = True
    ENABLE_ADMIN_DASHBOARD: bool = True
    ENABLE_USER_FEEDBACK: bool = True
    
    # Testing
    # -------
    IS_TESTING_ENVIRONMENT: bool = False
    
    class Config:
        """Pydantic Settings Config."""
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
    
    # Validators
    
    @validator("ALLOWED_ORIGINS", pre=True)
    def parse_allowed_origins(cls, v: Union[str, List[str]]) -> List[str]:
        """Parse comma-separated string of allowed origins."""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v
    
    @validator("ALLOWED_UPLOAD_TYPES", pre=True)
    def parse_allowed_upload_types(cls, v: str) -> List[str]:
        """Parse comma-separated string of allowed file types."""
        if isinstance(v, str):
            return [file_type.strip() for file_type in v.split(",") if file_type.strip()]
        return v
    
    @validator("DATABASE_URL", pre=True)
    def validate_database_url(cls, v: Optional[str], values: Dict[str, Any]) -> Any:
        """Validate PostgreSQL connection string and apply SSL mode if needed."""
        if not v:
            raise ValueError("DATABASE_URL is required")
        
        # For testing environment, allow non-PostgreSQL URLs
        if values.get("IS_TESTING_ENVIRONMENT"):
            return v
        
        # Apply SSL mode if set
        if values.get("DATABASE_SSL_MODE") and "sslmode=" not in v:
            if "?" in v:
                return f"{v}&sslmode={values['DATABASE_SSL_MODE']}"
            else:
                return f"{v}?sslmode={values['DATABASE_SSL_MODE']}"
        
        return v
    
    @validator("STORAGE_LOCAL_PATH", pre=True)
    def validate_storage_path(cls, v: Union[str, Path]) -> Path:
        """Convert string path to Path object and ensure it exists."""
        if isinstance(v, str):
            path = Path(v)
        else:
            path = v
        
        # Create directories if they don't exist
        path.mkdir(parents=True, exist_ok=True)
        return path
    
    @validator("LOG_FILE_PATH", pre=True)
    def validate_log_path(cls, v: Optional[Union[str, Path]]) -> Optional[Path]:
        """Convert string log path to Path object and ensure parent directory exists."""
        if not v:
            return None
            
        if isinstance(v, str):
            path = Path(v)
        else:
            path = v
        
        # Create parent directories if they don't exist
        path.parent.mkdir(parents=True, exist_ok=True)
        return path
    
    # Helper methods
    
    def get_redis_url(self) -> str:
        """Get Redis URL with authentication if password is provided."""
        auth_part = f":{self.REDIS_PASSWORD.get_secret_value()}@" if self.REDIS_PASSWORD else ""
        protocol = "rediss" if self.REDIS_SSL else "redis"
        return f"{protocol}://{auth_part}{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
    
    def get_frontend_url(self) -> str:
        """Get the frontend URL for CORS configuration."""
        return str(self.APP_URL)
    
    def get_storage_url(self) -> str:
        """Get the base URL for file storage access."""
        if self.STORAGE_PROVIDER == "s3" and self.AWS_S3_PUBLIC_URL:
            return str(self.AWS_S3_PUBLIC_URL)
        return "/storage"
    
    def get_environment_name(self) -> str:
        """Get a formatted environment name for logging and monitoring."""
        return self.ENVIRONMENT.lower()
    
    def is_development(self) -> bool:
        """Check if running in development environment."""
        return self.ENVIRONMENT.lower() == "development"
    
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.ENVIRONMENT.lower() == "production"
    
    def is_testing(self) -> bool:
        """Check if running in testing environment."""
        return self.IS_TESTING_ENVIRONMENT or self.ENVIRONMENT.lower() == "testing"


# Create a global settings object
settings = Settings()


def get_settings() -> Settings:
    """
    Get application settings.
    
    This function is primarily used for dependency injection in FastAPI.
    
    Returns:
        Settings: The application settings
    """
    return settings


def validate_required_settings() -> List[str]:
    """
    Validate that all required settings are provided.
    
    Returns:
        List[str]: List of missing required settings (empty if all present)
    """
    # Define required settings for production
    if settings.is_production():
        required_settings = [
            "SECRET_KEY",
            "JWT_SECRET",
            "DATABASE_URL",
            "SENDGRID_API_KEY",
            "DEFAULT_FROM_EMAIL",
            "OPENAI_API_KEY",
        ]
        
        # Add S3 requirements if using S3 storage
        if settings.STORAGE_PROVIDER == "s3":
            required_settings.extend([
                "AWS_ACCESS_KEY_ID",
                "AWS_SECRET_ACCESS_KEY",
                "AWS_REGION",
                "AWS_S3_BUCKET"
            ])
    else:
        # Minimal requirements for development
        required_settings = [
            "SECRET_KEY",
            "JWT_SECRET",
            "DATABASE_URL",
        ]
    
    # Check for missing settings
    missing_settings = []
    for name in required_settings:
        value = getattr(settings, name, None)
        if value is None:
            missing_settings.append(name)
        elif isinstance(value, SecretStr) and value.get_secret_value() == "":
            missing_settings.append(name)
    
    return missing_settings


def check_settings_on_startup() -> None:
    """
    Check all required settings on application startup.
    
    Raises:
        ValueError: If any required settings are missing
    """
    missing_settings = validate_required_settings()
    if missing_settings:
        raise ValueError(
            f"Missing required environment variables: {', '.join(missing_settings)}"
        )
    
    # Additional checks
    if settings.is_production():
        if settings.DEBUG:
            print("WARNING: DEBUG mode is enabled in production environment!")
        
        if not settings.COOKIE_SECURE:
            print("WARNING: Insecure cookies in production environment!")
