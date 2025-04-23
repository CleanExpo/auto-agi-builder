"""
Core error handling module for Auto AGI Builder.

This module provides centralized error handling capabilities including:
- Standardized error response formats
- Error classification and logging
- Recovery mechanisms for common error scenarios
"""

import logging
import traceback
from typing import Dict, Any, Optional, Type, Union, List

from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse
from fastapi.exception_handlers import http_exception_handler
from pydantic import ValidationError

# Configure logger
logger = logging.getLogger("error_handler")

# Error classification constants
class ErrorCategory:
    VALIDATION = "validation"  # Input validation errors
    AUTHENTICATION = "authentication"  # Auth related errors
    AUTHORIZATION = "authorization"  # Permission related errors
    RESOURCE = "resource"  # Resource not found or conflict
    EXTERNAL = "external"  # External service errors
    INTERNAL = "internal"  # Unexpected server errors
    BUSINESS_LOGIC = "business_logic"  # Application logic errors


class AppError(Exception):
    """Base application error class with structured error information."""
    
    def __init__(
        self, 
        message: str, 
        category: str = ErrorCategory.INTERNAL,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[Dict[str, Any]] = None,
        recovery_hint: Optional[str] = None
    ):
        self.message = message
        self.category = category
        self.status_code = status_code
        self.details = details or {}
        self.recovery_hint = recovery_hint
        super().__init__(self.message)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert error to a dictionary format for API responses."""
        error_dict = {
            "error": True,
            "message": self.message,
            "category": self.category,
            "status_code": self.status_code,
        }
        
        if self.details:
            error_dict["details"] = self.details
            
        if self.recovery_hint:
            error_dict["recovery_hint"] = self.recovery_hint
            
        return error_dict


class ValidationError(AppError):
    """Validation error for invalid input data."""
    
    def __init__(
        self, 
        message: str = "Invalid input data", 
        details: Optional[Dict[str, Any]] = None,
        recovery_hint: Optional[str] = None
    ):
        super().__init__(
            message=message,
            category=ErrorCategory.VALIDATION,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            details=details,
            recovery_hint=recovery_hint or "Please review the input data and ensure it meets the requirements."
        )


class AuthenticationError(AppError):
    """Authentication error for failed login or invalid credentials."""
    
    def __init__(
        self, 
        message: str = "Authentication failed", 
        details: Optional[Dict[str, Any]] = None,
        recovery_hint: Optional[str] = None
    ):
        super().__init__(
            message=message,
            category=ErrorCategory.AUTHENTICATION,
            status_code=status.HTTP_401_UNAUTHORIZED,
            details=details,
            recovery_hint=recovery_hint or "Please check your credentials and try again."
        )


class AuthorizationError(AppError):
    """Authorization error for insufficient permissions."""
    
    def __init__(
        self, 
        message: str = "Insufficient permissions", 
        details: Optional[Dict[str, Any]] = None,
        recovery_hint: Optional[str] = None
    ):
        super().__init__(
            message=message,
            category=ErrorCategory.AUTHORIZATION,
            status_code=status.HTTP_403_FORBIDDEN,
            details=details,
            recovery_hint=recovery_hint or "You don't have permission to access this resource."
        )


class ResourceNotFoundError(AppError):
    """Resource not found error."""
    
    def __init__(
        self, 
        message: str = "Resource not found", 
        details: Optional[Dict[str, Any]] = None,
        recovery_hint: Optional[str] = None
    ):
        super().__init__(
            message=message,
            category=ErrorCategory.RESOURCE,
            status_code=status.HTTP_404_NOT_FOUND,
            details=details,
            recovery_hint=recovery_hint or "The requested resource does not exist or has been moved."
        )


class ResourceConflictError(AppError):
    """Resource conflict error (e.g., duplicate entry)."""
    
    def __init__(
        self, 
        message: str = "Resource conflict", 
        details: Optional[Dict[str, Any]] = None,
        recovery_hint: Optional[str] = None
    ):
        super().__init__(
            message=message,
            category=ErrorCategory.RESOURCE,
            status_code=status.HTTP_409_CONFLICT,
            details=details,
            recovery_hint=recovery_hint or "The request could not be completed due to a conflict with the current state of the resource."
        )


class ExternalServiceError(AppError):
    """External service error (e.g., API failures)."""
    
    def __init__(
        self, 
        message: str = "External service error", 
        details: Optional[Dict[str, Any]] = None,
        recovery_hint: Optional[str] = None,
        retriable: bool = False
    ):
        self.retriable = retriable
        super().__init__(
            message=message,
            category=ErrorCategory.EXTERNAL,
            status_code=status.HTTP_502_BAD_GATEWAY,
            details=details,
            recovery_hint=recovery_hint or ("Please try again later." if retriable else "Please contact support.")
        )
        
        # Add retriable flag to details
        if "retriable" not in self.details:
            self.details["retriable"] = retriable


class BusinessLogicError(AppError):
    """Business logic error for application-specific errors."""
    
    def __init__(
        self, 
        message: str = "Business logic error", 
        details: Optional[Dict[str, Any]] = None,
        recovery_hint: Optional[str] = None
    ):
        super().__init__(
            message=message,
            category=ErrorCategory.BUSINESS_LOGIC,
            status_code=status.HTTP_400_BAD_REQUEST,
            details=details,
            recovery_hint=recovery_hint
        )


# Error handler for FastAPI
async def app_exception_handler(request: Request, exc: AppError) -> JSONResponse:
    """Handle application exceptions and return appropriate responses."""
    # Log error details based on severity
    if exc.status_code >= 500:
        logger.error(
            f"Server error: {exc.message}",
            extra={
                "path": request.url.path,
                "method": request.method,
                "category": exc.category,
                "details": exc.details,
                "traceback": traceback.format_exc()
            }
        )
    else:
        logger.warning(
            f"Client error: {exc.message}",
            extra={
                "path": request.url.path,
                "method": request.method,
                "category": exc.category,
                "details": exc.details
            }
        )
    
    # Return structured error response
    return JSONResponse(
        status_code=exc.status_code,
        content=exc.to_dict()
    )


# Validation error handler for Pydantic errors
async def validation_exception_handler(request: Request, exc: ValidationError) -> JSONResponse:
    """Handle Pydantic validation errors."""
    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"]
        })
    
    app_exc = ValidationError(
        message="Input validation error",
        details={"errors": errors}
    )
    
    return await app_exception_handler(request, app_exc)


# HTTPException handler to convert to our standard format
async def http_exception_to_app_error(request: Request, exc: HTTPException) -> JSONResponse:
    """Convert HTTPExceptions to AppError format."""
    
    category = ErrorCategory.INTERNAL
    recovery_hint = None
    
    # Map status codes to categories and provide recovery hints
    if exc.status_code == 401:
        category = ErrorCategory.AUTHENTICATION
        recovery_hint = "Please log in to access this resource."
    elif exc.status_code == 403:
        category = ErrorCategory.AUTHORIZATION
        recovery_hint = "You don't have permission to access this resource."
    elif exc.status_code == 404:
        category = ErrorCategory.RESOURCE
        recovery_hint = "The requested resource does not exist or has been moved."
    elif exc.status_code == 422:
        category = ErrorCategory.VALIDATION
        recovery_hint = "Please check your input and try again."
    
    # Create AppError from HTTPException
    app_exc = AppError(
        message=str(exc.detail),
        category=category,
        status_code=exc.status_code,
        recovery_hint=recovery_hint
    )
    
    return await app_exception_handler(request, app_exc)


# Configure FastAPI exception handlers
def configure_exception_handlers(app):
    """Configure exception handlers for a FastAPI application."""
    
    # Register handlers for our custom exceptions
    app.add_exception_handler(AppError, app_exception_handler)
    app.add_exception_handler(ValidationError, validation_exception_handler)
    
    # Override default HTTPException handler
    app.add_exception_handler(HTTPException, http_exception_to_app_error)


# Recovery mechanisms
class RecoveryStrategy:
    """Recovery strategies for common error scenarios."""
    
    @staticmethod
    async def retry_with_backoff(
        operation,
        max_retries: int = 3,
        initial_delay: float = 0.5,
        backoff_factor: float = 2,
        exceptions: Union[Type[Exception], List[Type[Exception]]] = ExternalServiceError
    ):
        """Retry an operation with exponential backoff."""
        import asyncio
        
        retries = 0
        delay = initial_delay
        
        while True:
            try:
                return await operation()
            except exceptions as e:
                retries += 1
                
                # Check if it's retriable and we haven't exceeded max retries
                if (
                    not (hasattr(e, "retriable") and e.retriable) or 
                    retries >= max_retries
                ):
                    raise
                
                # Log retry attempt
                logger.info(
                    f"Retrying operation after error: {str(e)}. "
                    f"Attempt {retries}/{max_retries} with delay {delay}s"
                )
                
                # Wait before retry with exponential backoff
                await asyncio.sleep(delay)
                delay *= backoff_factor
    
    @staticmethod
    def circuit_breaker(threshold: int = 5, reset_timeout: int = 60):
        """Circuit breaker decorator to prevent repeated failed calls to external services."""
        import time
        import functools
        
        def decorator(func):
            # State variables for the circuit breaker
            failures = 0
            last_failure_time = 0
            is_open = False
            
            @functools.wraps(func)
            async def wrapper(*args, **kwargs):
                nonlocal failures, last_failure_time, is_open
                
                # Check if circuit is open
                if is_open:
                    # Check if timeout has elapsed to reset circuit
                    if time.time() - last_failure_time > reset_timeout:
                        logger.info("Circuit breaker reset after timeout")
                        is_open = False
                        failures = 0
                    else:
                        raise ExternalServiceError(
                            message="Service temporarily unavailable",
                            details={"circuit_breaker": "open"},
                            recovery_hint="The service is currently unavailable. Please try again later."
                        )
                
                try:
                    result = await func(*args, **kwargs)
                    # Success, reset failure count
                    failures = 0
                    return result
                except Exception as e:
                    # Increment failure count
                    failures += 1
                    last_failure_time = time.time()
                    
                    # Check if threshold reached
                    if failures >= threshold:
                        logger.warning(
                            f"Circuit breaker opened after {failures} failures"
                        )
                        is_open = True
                    
                    # Re-raise the original exception
                    raise
            
            return wrapper
        
        return decorator
