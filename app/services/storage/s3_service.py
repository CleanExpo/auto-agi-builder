"""
AWS S3 Storage Service for Auto AGI Builder

This module provides integration with AWS S3 for file storage and retrieval.
"""

import os
import logging
import boto3
from botocore.exceptions import ClientError
from typing import Dict, List, Optional, BinaryIO, Union, Tuple
import mimetypes
import uuid

# Configure logging
logger = logging.getLogger(__name__)


class S3StorageService:
    """
    Service for interacting with AWS S3 storage.
    
    Provides methods for uploading, downloading, and managing files in S3 buckets.
    """
    
    def __init__(self):
        """Initialize the S3 storage service."""
        self.aws_access_key_id = os.getenv('AWS_ACCESS_KEY_ID')
        self.aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')
        self.region_name = os.getenv('AWS_REGION', 'us-east-1')
        self.default_bucket = os.getenv('AWS_S3_BUCKET')
        
        if not self.aws_access_key_id or not self.aws_secret_access_key:
            logger.warning("AWS credentials not found in environment variables")
        
        if not self.default_bucket:
            logger.warning("AWS S3 bucket not specified in environment variables")
        
        # Initialize S3 client
        self.s3_client = self._get_s3_client()
    
    def _get_s3_client(self):
        """Create and return an S3 client."""
        try:
            return boto3.client(
                's3',
                aws_access_key_id=self.aws_access_key_id,
                aws_secret_access_key=self.aws_secret_access_key,
                region_name=self.region_name
            )
        except Exception as e:
            logger.error(f"Error initializing S3 client: {str(e)}")
            return None
    
    def upload_file(
        self,
        file_path: str,
        object_name: Optional[str] = None,
        bucket: Optional[str] = None,
        public: bool = False,
        content_type: Optional[str] = None,
        metadata: Optional[Dict[str, str]] = None
    ) -> Dict:
        """
        Upload a file to an S3 bucket.
        
        Args:
            file_path: Path to the file to upload
            object_name: S3 object name (if not specified, file_path's filename will be used)
            bucket: Bucket to upload to (if not specified, default bucket will be used)
            public: Whether the file should be publicly accessible
            content_type: MIME type of the file (if not specified, will be guessed)
            metadata: Optional metadata to attach to the file
            
        Returns:
            Dictionary with status and result information
        """
        if not self.s3_client:
            return {
                'success': False,
                'error': 'S3 client not initialized'
            }
        
        # If bucket not specified, use default
        if not bucket:
            bucket = self.default_bucket
            if not bucket:
                return {
                    'success': False,
                    'error': 'No S3 bucket specified'
                }
        
        # If object_name not specified, use file_path's filename
        if not object_name:
            object_name = os.path.basename(file_path)
        
        # Determine content type if not specified
        if not content_type:
            content_type, _ = mimetypes.guess_type(file_path)
            if not content_type:
                content_type = 'application/octet-stream'
        
        # Set up extra args
        extra_args = {
            'ContentType': content_type
        }
        
        # Add metadata if provided
        if metadata:
            extra_args['Metadata'] = metadata
        
        # Set ACL if public
        if public:
            extra_args['ACL'] = 'public-read'
        
        try:
            # Upload file
            self.s3_client.upload_file(
                file_path,
                bucket,
                object_name,
                ExtraArgs=extra_args
            )
            
            # Generate URL
            if public:
                url = f"https://{bucket}.s3.amazonaws.com/{object_name}"
            else:
                url = self.s3_client.generate_presigned_url(
                    'get_object',
                    Params={'Bucket': bucket, 'Key': object_name},
                    ExpiresIn=86400  # 24 hours
                )
            
            return {
                'success': True,
                'bucket': bucket,
                'object_name': object_name,
                'url': url,
                'content_type': content_type
            }
        
        except Exception as e:
            logger.error(f"Error uploading file to S3: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def upload_fileobj(
        self,
        file_obj: BinaryIO,
        object_name: str,
        bucket: Optional[str] = None,
        public: bool = False,
        content_type: Optional[str] = None,
        metadata: Optional[Dict[str, str]] = None
    ) -> Dict:
        """
        Upload a file-like object to an S3 bucket.
        
        Args:
            file_obj: File-like object to upload
            object_name: S3 object name
            bucket: Bucket to upload to (if not specified, default bucket will be used)
            public: Whether the file should be publicly accessible
            content_type: MIME type of the file
            metadata: Optional metadata to attach to the file
            
        Returns:
            Dictionary with status and result information
        """
        if not self.s3_client:
            return {
                'success': False,
                'error': 'S3 client not initialized'
            }
        
        # If bucket not specified, use default
        if not bucket:
            bucket = self.default_bucket
            if not bucket:
                return {
                    'success': False,
                    'error': 'No S3 bucket specified'
                }
        
        # Determine content type if not specified
        if not content_type:
            content_type = 'application/octet-stream'
        
        # Set up extra args
        extra_args = {
            'ContentType': content_type
        }
        
        # Add metadata if provided
        if metadata:
            extra_args['Metadata'] = metadata
        
        # Set ACL if public
        if public:
            extra_args['ACL'] = 'public-read'
        
        try:
            # Upload file object
            self.s3_client.upload_fileobj(
                file_obj,
                bucket,
                object_name,
                ExtraArgs=extra_args
            )
            
            # Generate URL
            if public:
                url = f"https://{bucket}.s3.amazonaws.com/{object_name}"
            else:
                url = self.s3_client.generate_presigned_url(
                    'get_object',
                    Params={'Bucket': bucket, 'Key': object_name},
                    ExpiresIn=86400  # 24 hours
                )
            
            return {
                'success': True,
                'bucket': bucket,
                'object_name': object_name,
                'url': url,
                'content_type': content_type
            }
        
        except Exception as e:
            logger.error(f"Error uploading file object to S3: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def download_file(
        self,
        object_name: str,
        file_path: str,
        bucket: Optional[str] = None
    ) -> Dict:
        """
        Download a file from an S3 bucket.
        
        Args:
            object_name: S3 object name
            file_path: Path to save the downloaded file
            bucket: Bucket to download from (if not specified, default bucket will be used)
            
        Returns:
            Dictionary with status and result information
        """
        if not self.s3_client:
            return {
                'success': False,
                'error': 'S3 client not initialized'
            }
        
        # If bucket not specified, use default
        if not bucket:
            bucket = self.default_bucket
            if not bucket:
                return {
                    'success': False,
                    'error': 'No S3 bucket specified'
                }
        
        try:
            # Ensure directory exists
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            # Download file
            self.s3_client.download_file(
                bucket,
                object_name,
                file_path
            )
            
            return {
                'success': True,
                'bucket': bucket,
                'object_name': object_name,
                'file_path': file_path
            }
        
        except Exception as e:
            logger.error(f"Error downloading file from S3: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_object(
        self,
        object_name: str,
        bucket: Optional[str] = None
    ) -> Dict:
        """
        Get an object from an S3 bucket.
        
        Args:
            object_name: S3 object name
            bucket: Bucket to get object from (if not specified, default bucket will be used)
            
        Returns:
            Dictionary with status and object information, including 'Body' stream
        """
        if not self.s3_client:
            return {
                'success': False,
                'error': 'S3 client not initialized'
            }
        
        # If bucket not specified, use default
        if not bucket:
            bucket = self.default_bucket
            if not bucket:
                return {
                    'success': False,
                    'error': 'No S3 bucket specified'
                }
        
        try:
            # Get object
            response = self.s3_client.get_object(
                Bucket=bucket,
                Key=object_name
            )
            
            return {
                'success': True,
                'bucket': bucket,
                'object_name': object_name,
                'body': response['Body'],
                'content_type': response.get('ContentType'),
                'content_length': response.get('ContentLength'),
                'metadata': response.get('Metadata')
            }
        
        except Exception as e:
            logger.error(f"Error getting object from S3: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def delete_object(
        self,
        object_name: str,
        bucket: Optional[str] = None
    ) -> Dict:
        """
        Delete an object from an S3 bucket.
        
        Args:
            object_name: S3 object name
            bucket: Bucket to delete object from (if not specified, default bucket will be used)
            
        Returns:
            Dictionary with status information
        """
        if not self.s3_client:
            return {
                'success': False,
                'error': 'S3 client not initialized'
            }
        
        # If bucket not specified, use default
        if not bucket:
            bucket = self.default_bucket
            if not bucket:
                return {
                    'success': False,
                    'error': 'No S3 bucket specified'
                }
        
        try:
            # Delete object
            self.s3_client.delete_object(
                Bucket=bucket,
                Key=object_name
            )
            
            return {
                'success': True,
                'bucket': bucket,
                'object_name': object_name
            }
        
        except Exception as e:
            logger.error(f"Error deleting object from S3: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def list_objects(
        self,
        prefix: str = '',
        bucket: Optional[str] = None,
        max_keys: int = 1000
    ) -> Dict:
        """
        List objects in an S3 bucket.
        
        Args:
            prefix: Prefix to filter objects by
            bucket: Bucket to list objects from (if not specified, default bucket will be used)
            max_keys: Maximum number of keys to return
            
        Returns:
            Dictionary with status and list of objects
        """
        if not self.s3_client:
            return {
                'success': False,
                'error': 'S3 client not initialized'
            }
        
        # If bucket not specified, use default
        if not bucket:
            bucket = self.default_bucket
            if not bucket:
                return {
                    'success': False,
                    'error': 'No S3 bucket specified'
                }
        
        try:
            # List objects
            response = self.s3_client.list_objects_v2(
                Bucket=bucket,
                Prefix=prefix,
                MaxKeys=max_keys
            )
            
            # Extract object information
            objects = []
            if 'Contents' in response:
                for obj in response['Contents']:
                    objects.append({
                        'key': obj['Key'],
                        'size': obj['Size'],
                        'last_modified': obj['LastModified'],
                        'etag': obj['ETag']
                    })
            
            return {
                'success': True,
                'bucket': bucket,
                'objects': objects,
                'is_truncated': response.get('IsTruncated', False),
                'next_continuation_token': response.get('NextContinuationToken')
            }
        
        except Exception as e:
            logger.error(f"Error listing objects in S3: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def generate_presigned_url(
        self,
        object_name: str,
        bucket: Optional[str] = None,
        expiration: int = 3600,
        method: str = 'get_object'
    ) -> Dict:
        """
        Generate a presigned URL for an S3 object.
        
        Args:
            object_name: S3 object name
            bucket: Bucket containing the object (if not specified, default bucket will be used)
            expiration: Time in seconds until the URL expires
            method: S3 method for which to generate the URL (get_object, put_object, etc.)
            
        Returns:
            Dictionary with status and URL information
        """
        if not self.s3_client:
            return {
                'success': False,
                'error': 'S3 client not initialized'
            }
        
        # If bucket not specified, use default
        if not bucket:
            bucket = self.default_bucket
            if not bucket:
                return {
                    'success': False,
                    'error': 'No S3 bucket specified'
                }
        
        try:
            # Generate presigned URL
            url = self.s3_client.generate_presigned_url(
                method,
                Params={'Bucket': bucket, 'Key': object_name},
                ExpiresIn=expiration
            )
            
            return {
                'success': True,
                'bucket': bucket,
                'object_name': object_name,
                'url': url,
                'expiration': expiration
            }
        
        except Exception as e:
            logger.error(f"Error generating presigned URL: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def generate_unique_object_name(
        self,
        base_name: Optional[str] = None,
        prefix: str = '',
        extension: Optional[str] = None
    ) -> str:
        """
        Generate a unique object name for S3 storage.
        
        Args:
            base_name: Optional base name for the object (will be sanitized)
            prefix: Optional prefix to prepend to the object name
            extension: Optional file extension (without dot)
            
        Returns:
            Unique object name
        """
        # Generate unique identifier
        unique_id = str(uuid.uuid4())
        
        # Process base name if provided
        if base_name:
            # Sanitize base name (remove special characters, spaces, etc.)
            import re
            sanitized_base = re.sub(r'[^\w\-]', '_', base_name)
            # Truncate if too long
            if len(sanitized_base) > 50:
                sanitized_base = sanitized_base[:50]
            # Construct object name with base
            object_name = f"{prefix}{sanitized_base}_{unique_id}"
        else:
            # Use only unique ID if no base name
            object_name = f"{prefix}{unique_id}"
        
        # Add extension if provided
        if extension:
            # Ensure extension doesn't have a dot
            extension = extension.lstrip('.')
            object_name = f"{object_name}.{extension}"
        
        return object_name
