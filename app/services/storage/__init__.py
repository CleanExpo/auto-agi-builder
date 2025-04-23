"""
Storage service package.

This package provides services for file storage and retrieval.
"""

from app.services.storage.s3_service import S3StorageService

__all__ = ["S3StorageService"]
