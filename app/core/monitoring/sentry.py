"""
Sentry integration module for Auto AGI Builder.

This module provides Sentry integration for error monitoring and performance tracking
in production and staging environments. It configures Sentry based on environment variables
and provides helpers for custom error reporting.
"""

import functools
import logging
import os
import time
from typing import Any, Callable, Dict, Optional, TypeVar, cast

import sentry_sdk
from fastapi import FastAPI, Request
from sentry_sdk.integrations.asgi import SentryAsgiMiddleware
from sentry_sdk.integrations.logging import LoggingIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

from app.core.config import settings

logger = logging.getLogger(__name__)

# Type variable for function decorators
F = TypeVar('F', bound=Callable[..., Any])


def setup_sentry() -> None:
    """
    Initialize and configure Sentry SDK for error monitoring.
    This should be called during application startup.
    """
    if not settings.SENTRY_DSN:
        logger.info("Sentry DSN not provided, skipping Sentry setup")
        return

    # Configure Sentry SDK
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        environment=settings.SENTRY_ENVIRONMENT or settings.get_environment_name(),
        traces_sample_rate=settings.SENTRY_TRACES_SAMPLE_RATE,
        release=f"auto-agi-builder@{settings.APP_VERSION}",
        # Set max breadcrumbs to prevent excessive memory usage
        max_breadcrumbs=50,
        # Ignore common exceptions that don't need reporting
        ignore_errors=[
            "HTTPException",  # Ignore 4xx HTTP errors (they are client errors)
            "ConnectionError",  # Ignore temporary connection issues
            "TimeoutError",    # Ignore temporary timeout issues
        ],
        # Include relevant packages in stacktraces
        include_paths=[
            "app",
            "fastapi",
            "starlette",
            "pydantic",
            "sqlalchemy",
        ],
        # Configure integrations
        integrations=[
            # Capture logs as breadcrumbs
            LoggingIntegration(
                level=logging.INFO,        # Capture INFO and above as breadcrumbs
                event_level=logging.ERROR  # Send ERROR and above to Sentry
            ),
            # Track database operations
            SqlalchemyIntegration(),
        ],
    )

    # Add extra context to Sentry events
    sentry_sdk.set_context(
        "application", {
            "name": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "environment": settings.ENVIRONMENT,
            "debug_mode": settings.DEBUG,
        }
    )

    logger.info(
        f"Sentry initialized for environment: {settings.SENTRY_ENVIRONMENT or settings.get_environment_name()}"
    )


def init_sentry_middleware(app: FastAPI) -> None:
    """
    Initialize Sentry middleware for FastAPI application.
    This will wrap all requests in Sentry transaction tracking.
    
    Args:
        app: FastAPI application instance
    """
    if not settings.SENTRY_DSN:
        return

    # Wrap the application with Sentry ASGI middleware
    app.add_middleware(SentryAsgiMiddleware)
    
    # Add Sentry request hook to capture custom data
    @app.middleware("http")
    async def sentry_request_middleware(request: Request, call_next):
        # Start timing the request
        start_time = time.time()
        
        # Set request data in Sentry scope
        with sentry_sdk.configure_scope() as scope:
            scope.set_tag("http_method", request.method)
            scope.set_tag("endpoint", request.url.path)
            
            # Try to get user information if available
            try:
                if hasattr(request.state, "user") and request.state.user:
                    scope.set_user({"id": str(request.state.user.id), "email": request.state.user.email})
            except Exception:
                # Ignore errors in gathering user data
                pass
            
        try:
            # Process the request
            response = await call_next(request)
            
            # Calculate request duration
            duration = time.time() - start_time
            
            # Add performance data
            with sentry_sdk.configure_scope() as scope:
                scope.set_tag("response_status", response.status_code)
                scope.set_extra("request_duration", duration)
            
            # Only report 5xx errors automatically
            if 500 <= response.status_code < 600:
                sentry_sdk.capture_message(
                    f"HTTP {response.status_code} error for {request.method} {request.url.path}",
                    level="error"
                )
                
            return response
        except Exception as e:
            # The exception will be captured by Sentry automatically
            # but we add extra context here
            with sentry_sdk.configure_scope() as scope:
                scope.set_extra("request_duration", time.time() - start_time)
                scope.set_tag("error_location", "http_middleware")
            
            # Re-raise the exception for FastAPI to handle
            raise
    
    logger.info("Sentry middleware initialized for FastAPI application")


def capture_exception(
    exception: Optional[Exception] = None,
    context: Optional[Dict[str, Any]] = None
) -> str:
    """
    Manually capture an exception in Sentry with additional context.
    
    Args:
        exception: The exception to capture, if None, the current exception is captured
        context: Additional context to attach to the event
        
    Returns:
        The Sentry event ID
    """
    if not settings.SENTRY_DSN:
        if exception:
            logger.error(f"Error (not sent to Sentry): {str(exception)}")
        return "sentry-not-configured"
    
    with sentry_sdk.configure_scope() as scope:
        if context:
            for key, value in context.items():
                scope.set_extra(key, value)
        
        return sentry_sdk.capture_exception(exception)


def track_performance(
    operation_name: str, 
    tags: Optional[Dict[str, str]] = None
) -> Callable[[F], F]:
    """
    Decorator to track function performance with Sentry.
    
    Args:
        operation_name: Name of the operation for tracking
        tags: Additional tags to add to the span
        
    Returns:
        Decorated function
    """
    def decorator(func: F) -> F:
        @functools.wraps(func)
        def sync_wrapper(*args: Any, **kwargs: Any) -> Any:
            # Skip tracking if Sentry is not configured
            if not settings.SENTRY_DSN or not settings.ENABLE_PERFORMANCE_MONITORING:
                return func(*args, **kwargs)
            
            # Create a transaction for synchronous functions
            with sentry_sdk.start_transaction(name=f"{operation_name}:{func.__name__}") as transaction:
                # Add tags to the transaction
                if tags:
                    for key, value in tags.items():
                        transaction.set_tag(key, value)
                
                # Record start time for custom duration calculation
                start_time = time.time()
                
                try:
                    # Execute the function
                    result = func(*args, **kwargs)
                    
                    # Record success
                    transaction.set_tag("outcome", "success")
                    
                    return result
                except Exception as e:
                    # Record failure
                    transaction.set_tag("outcome", "failure")
                    transaction.set_tag("error_type", type(e).__name__)
                    
                    # Re-raise the exception
                    raise
                finally:
                    # Record duration
                    duration = (time.time() - start_time) * 1000.0  # Convert to ms
                    transaction.set_data("duration_ms", duration)
        
        @functools.wraps(func)
        async def async_wrapper(*args: Any, **kwargs: Any) -> Any:
            # Skip tracking if Sentry is not configured
            if not settings.SENTRY_DSN or not settings.ENABLE_PERFORMANCE_MONITORING:
                return await func(*args, **kwargs)
            
            # Create a transaction for asynchronous functions
            with sentry_sdk.start_transaction(name=f"{operation_name}:{func.__name__}") as transaction:
                # Add tags to the transaction
                if tags:
                    for key, value in tags.items():
                        transaction.set_tag(key, value)
                
                # Record start time for custom duration calculation
                start_time = time.time()
                
                try:
                    # Execute the function
                    result = await func(*args, **kwargs)
                    
                    # Record success
                    transaction.set_tag("outcome", "success")
                    
                    return result
                except Exception as e:
                    # Record failure
                    transaction.set_tag("outcome", "failure")
                    transaction.set_tag("error_type", type(e).__name__)
                    
                    # Re-raise the exception
                    raise
                finally:
                    # Record duration
                    duration = (time.time() - start_time) * 1000.0  # Convert to ms
                    transaction.set_data("duration_ms", duration)
        
        # Use the appropriate wrapper based on whether the function is async
        if asyncio.iscoroutinefunction(func):
            return cast(F, async_wrapper)
        else:
            return cast(F, sync_wrapper)
    
    return decorator


# Import asyncio at module level to avoid circular import in decorator
import asyncio
