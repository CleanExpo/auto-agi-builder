"""
Monitoring package for Auto AGI Builder.

This package provides monitoring, logging, and error tracking functionality
for the application. It includes integrations with:

- Sentry for error tracking and performance monitoring
- Structured JSON logging
- Request timing and tracing
"""

import logging
import sys
import json
from typing import Dict, Any, Optional, Union
import logging.config
from pathlib import Path

from fastapi import FastAPI

from app.core.config import settings
from app.core.monitoring.sentry import setup_sentry, init_sentry_middleware


class JSONFormatter(logging.Formatter):
    """JSON formatter for structured logging."""
    
    def __init__(self, fmt=None, datefmt=None, style='%', include_extras=True):
        super().__init__(fmt, datefmt, style)
        self.include_extras = include_extras
    
    def format(self, record):
        log_record = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "name": record.name,
            "message": record.getMessage(),
            "location": f"{record.pathname}:{record.lineno}",
            "function": record.funcName,
        }
        
        # Include exception info if available
        if record.exc_info:
            log_record["exception"] = self.formatException(record.exc_info)
        
        # Include extra fields from record
        if self.include_extras and hasattr(record, "extras") and record.extras:
            log_record.update(record.extras)
        
        return json.dumps(log_record)


def setup_logging(
    log_level: Optional[str] = None,
    log_format: Optional[str] = None,
    log_file: Optional[Union[str, Path]] = None
) -> None:
    """
    Set up logging for the application.
    
    Args:
        log_level: The log level to use (default from settings)
        log_format: The log format (json or text)
        log_file: Path to log file (optional)
    """
    level = log_level or settings.LOG_LEVEL.upper()
    format_type = log_format or settings.LOG_FORMAT.lower()
    
    # Configure handlers
    handlers = {
        "console": {
            "class": "logging.StreamHandler",
            "stream": sys.stdout,
            "level": level,
        }
    }
    
    # Add file handler if log file specified
    if log_file or settings.LOG_FILE_PATH:
        file_path = Path(log_file) if log_file else settings.LOG_FILE_PATH
        handlers["file"] = {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": str(file_path),
            "maxBytes": 10485760,  # 10MB
            "backupCount": settings.LOG_RETENTION_DAYS,
            "level": level,
        }
    
    # Configure formatters based on format type
    if format_type == "json":
        handlers["console"]["formatter"] = "json"
        if "file" in handlers:
            handlers["file"]["formatter"] = "json"
        formatter_config = {
            "json": {
                "()": JSONFormatter,
                "fmt": None,
                "include_extras": True,
            },
        }
    else:
        # Default to text format
        handlers["console"]["formatter"] = "text"
        if "file" in handlers:
            handlers["file"]["formatter"] = "text"
        formatter_config = {
            "text": {
                "format": "%(asctime)s | %(levelname)s | %(name)s | %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
        }
    
    # Configure logging
    logging.config.dictConfig({
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": formatter_config,
        "handlers": handlers,
        "loggers": {
            "": {  # Root logger
                "handlers": list(handlers.keys()),
                "level": level,
                "propagate": True,
            },
            "uvicorn": {
                "handlers": list(handlers.keys()),
                "level": level,
                "propagate": False,
            },
            "uvicorn.access": {
                "handlers": list(handlers.keys()),
                "level": level,
                "propagate": False,
            },
            "app": {
                "handlers": list(handlers.keys()),
                "level": level,
                "propagate": False,
            },
        },
    })
    
    # Adjust third-party loggers
    logging.getLogger("sqlalchemy.engine").setLevel(logging.INFO if settings.DATABASE_ECHO else logging.WARNING)
    logging.getLogger("asyncio").setLevel(logging.WARNING)
    
    # Log configuration
    logger = logging.getLogger(__name__)
    logger.info(f"Logging initialized: level={level}, format={format_type}")
    if "file" in handlers:
        logger.info(f"Log file: {handlers['file']['filename']}")


def log_extra(logger: logging.Logger, message: str, extras: Dict[str, Any], level: str = "info") -> None:
    """
    Log a message with extra fields in a structured format.
    
    Args:
        logger: The logger instance
        message: The log message
        extras: Extra fields to include in the log record
        level: Log level (info, warning, error, debug, critical)
    """
    log_method = getattr(logger, level.lower())
    
    # Create a LogRecord
    record = logger.makeRecord(
        logger.name, 
        getattr(logging, level.upper()), 
        "(unknown file)", 0, 
        message, (), None
    )
    
    # Add extras to the record
    record.extras = extras
    
    # Call the handler directly
    logger.handle(record)


def init_monitoring(app: FastAPI) -> None:
    """
    Initialize all monitoring and logging systems.
    
    This function sets up Sentry, structured logging, and
    request monitoring for the FastAPI application.
    
    Args:
        app: FastAPI application instance
    """
    # Set up logging first to capture setup events
    setup_logging()
    
    # Set up Sentry for error tracking
    setup_sentry()
    init_sentry_middleware(app)
    
    # Add application context log middleware
    @app.middleware("http")
    async def logging_middleware(request, call_next):
        # Generate a unique request ID
        import uuid
        request_id = str(uuid.uuid4())
        
        # Add request metadata
        request.state.request_id = request_id
        
        # Add it to the logging context
        logger = logging.getLogger("app.request")
        
        log_extra(logger, f"Request started: {request.method} {request.url.path}", {
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "query_params": str(request.query_params),
            "client_host": request.client.host if request.client else None,
        })
        
        # Process the request
        import time
        start_time = time.time()
        
        try:
            response = await call_next(request)
            
            # Calculate duration
            duration_ms = (time.time() - start_time) * 1000
            
            # Log the response
            log_extra(logger, f"Request completed: {request.method} {request.url.path}", {
                "request_id": request_id,
                "status_code": response.status_code,
                "duration_ms": round(duration_ms, 2),
            })
            
            # Add request ID to response headers
            response.headers["X-Request-ID"] = request_id
            
            return response
        except Exception as e:
            # Calculate duration for errors too
            duration_ms = (time.time() - start_time) * 1000
            
            # Log the error
            log_extra(logger, f"Request failed: {request.method} {request.url.path}", {
                "request_id": request_id,
                "error": str(e),
                "error_type": type(e).__name__,
                "duration_ms": round(duration_ms, 2),
            }, level="error")
            
            # Re-raise the exception
            raise
    
    # Register startup/shutdown events
    @app.on_event("startup")
    async def startup_logging():
        logger = logging.getLogger("app")
        logger.info(
            f"Application startup: {settings.APP_NAME} v{settings.APP_VERSION} in {settings.ENVIRONMENT} mode"
        )
    
    @app.on_event("shutdown")
    async def shutdown_logging():
        logger = logging.getLogger("app")
        logger.info(f"Application shutdown: {settings.APP_NAME}")
    
    logger = logging.getLogger(__name__)
    logger.info("Monitoring systems initialized")
