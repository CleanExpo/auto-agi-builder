"""
Unit tests for S3 Storage service.
"""

import pytest
import os
import io
import boto3
from unittest.mock import MagicMock, patch
from botocore.exceptions import ClientError

from app.services.storage.s3_service import S3StorageService


@pytest.fixture
def s3_service():
    """Fixture to create an S3StorageService instance with mocked environment variables."""
    with patch.dict(os.environ, {
        "AWS_ACCESS_KEY_ID": "test-access-key",
        "AWS_SECRET_ACCESS_KEY": "test-secret-key",
        "AWS_REGION": "us-test-1",
        "AWS_S3_BUCKET": "test-bucket"
    }):
        # Mock the boto3 s3 client
        with patch('boto3.client') as mock_client_builder:
            mock_s3_client = MagicMock()
            mock_client_builder.return_value = mock_s3_client
            
            # Create the service
            service = S3StorageService()
            
            # Return both service and mocked client for testing
            return service, mock_s3_client


@pytest.mark.unit
@pytest.mark.storage
def test_init_with_env_vars(s3_service):
    """Test service initialization with environment variables."""
    service, _ = s3_service
    
    # Assert environment variables were correctly loaded
    assert service.default_bucket == "test-bucket"
    assert service.region == "us-test-1"
    
    # Check boto3 client was created with correct parameters
    boto3.client.assert_called_once_with(
        's3',
        aws_access_key_id="test-access-key",
        aws_secret_access_key="test-secret-key",
        region_name="us-test-1"
    )


@pytest.mark.unit
@pytest.mark.storage
def test_init_with_custom_params():
    """Test service initialization with custom parameters."""
    with patch('boto3.client') as mock_client_builder:
        # Create service with custom parameters
        service = S3StorageService(
            access_key="custom-access-key",
            secret_key="custom-secret-key",
            region="custom-region",
            default_bucket="custom-bucket"
        )
        
        # Assert custom parameters were correctly used
        assert service.default_bucket == "custom-bucket"
        assert service.region == "custom-region"
        
        # Check boto3 client was created with correct parameters
        boto3.client.assert_called_once_with(
            's3',
            aws_access_key_id="custom-access-key",
            aws_secret_access_key="custom-secret-key",
            region_name="custom-region"
        )


@pytest.mark.unit
@pytest.mark.storage
def test_init_without_credentials():
    """Test service initialization without credentials."""
    with patch.dict(os.environ, {}, clear=True):
        with patch('boto3.client') as mock_client_builder:
            # Create service without credentials
            service = S3StorageService()
            
            # Assert default values were used
            assert service.default_bucket is None
            assert service.region == "us-east-1"  # Default region
            
            # Check boto3 client was created with no explicit credentials
            boto3.client.assert_called_once_with('s3', region_name="us-east-1")


@pytest.mark.unit
@pytest.mark.storage
def test_upload_file(s3_service, tmp_path):
    """Test upload_file method."""
    service, mock_s3 = s3_service
    
    # Create a temporary file
    test_file = tmp_path / "test_file.txt"
    test_file.write_text("Test content")
    
    # Call the method
    result = service.upload_file(
        str(test_file),
        "uploads/test_file.txt"
    )
    
    # Assertions
    assert result == {
        "bucket": "test-bucket",
        "key": "uploads/test_file.txt",
        "content_type": "text/plain",
        "url": f"https://test-bucket.s3.us-test-1.amazonaws.com/uploads/test_file.txt"
    }
    
    # Verify S3 client was called correctly
    mock_s3.upload_file.assert_called_once_with(
        str(test_file),
        "test-bucket",
        "uploads/test_file.txt",
        ExtraArgs={"ContentType": "text/plain"}
    )


@pytest.mark.unit
@pytest.mark.storage
def test_upload_file_with_custom_bucket(s3_service, tmp_path):
    """Test upload_file method with custom bucket."""
    service, mock_s3 = s3_service
    
    # Create a temporary file
    test_file = tmp_path / "test_file.txt"
    test_file.write_text("Test content")
    
    # Call the method with custom bucket
    result = service.upload_file(
        str(test_file),
        "uploads/test_file.txt",
        bucket="custom-bucket"
    )
    
    # Assertions
    assert result["bucket"] == "custom-bucket"
    
    # Verify S3 client was called with custom bucket
    mock_s3.upload_file.assert_called_once_with(
        str(test_file),
        "custom-bucket",
        "uploads/test_file.txt",
        ExtraArgs={"ContentType": "text/plain"}
    )


@pytest.mark.unit
@pytest.mark.storage
def test_upload_file_error(s3_service, tmp_path):
    """Test upload_file method with S3 error."""
    service, mock_s3 = s3_service
    
    # Create a temporary file
    test_file = tmp_path / "test_file.txt"
    test_file.write_text("Test content")
    
    # Set up mock to raise an error
    mock_s3.upload_file.side_effect = ClientError(
        {"Error": {"Code": "AccessDenied", "Message": "Access Denied"}},
        "upload_file"
    )
    
    # Call the method and expect exception
    with pytest.raises(Exception) as excinfo:
        service.upload_file(str(test_file), "uploads/test_file.txt")
    
    # Verify correct error message
    assert "Error uploading file" in str(excinfo.value)
    assert "AccessDenied" in str(excinfo.value)


@pytest.mark.unit
@pytest.mark.storage
def test_upload_fileobj(s3_service):
    """Test upload_fileobj method."""
    service, mock_s3 = s3_service
    
    # Create a file-like object
    file_obj = io.BytesIO(b"Test content")
    
    # Call the method
    result = service.upload_fileobj(
        file_obj,
        "uploads/test_file.jpg",
        content_type="image/jpeg"
    )
    
    # Assertions
    assert result == {
        "bucket": "test-bucket",
        "key": "uploads/test_file.jpg",
        "content_type": "image/jpeg",
        "url": f"https://test-bucket.s3.us-test-1.amazonaws.com/uploads/test_file.jpg"
    }
    
    # Verify S3 client was called correctly
    mock_s3.upload_fileobj.assert_called_once_with(
        file_obj,
        "test-bucket",
        "uploads/test_file.jpg",
        ExtraArgs={"ContentType": "image/jpeg"}
    )


@pytest.mark.unit
@pytest.mark.storage
def test_download_file(s3_service, tmp_path):
    """Test download_file method."""
    service, mock_s3 = s3_service
    
    # Set up local path
    local_path = str(tmp_path / "downloaded_file.txt")
    
    # Call the method
    service.download_file("uploads/test_file.txt", local_path)
    
    # Verify S3 client was called correctly
    mock_s3.download_file.assert_called_once_with(
        "test-bucket",
        "uploads/test_file.txt",
        local_path
    )


@pytest.mark.unit
@pytest.mark.storage
def test_get_object(s3_service):
    """Test get_object method."""
    service, mock_s3 = s3_service
    
    # Set up mock response
    mock_response = {
        "Body": io.BytesIO(b"Test content"),
        "ContentType": "text/plain",
        "ContentLength": 12
    }
    mock_s3.get_object.return_value = mock_response
    
    # Call the method
    result = service.get_object("uploads/test_file.txt")
    
    # Assertions
    assert result == mock_response
    
    # Verify S3 client was called correctly
    mock_s3.get_object.assert_called_once_with(
        Bucket="test-bucket",
        Key="uploads/test_file.txt"
    )


@pytest.mark.unit
@pytest.mark.storage
def test_delete_object(s3_service):
    """Test delete_object method."""
    service, mock_s3 = s3_service
    
    # Call the method
    service.delete_object("uploads/test_file.txt")
    
    # Verify S3 client was called correctly
    mock_s3.delete_object.assert_called_once_with(
        Bucket="test-bucket",
        Key="uploads/test_file.txt"
    )


@pytest.mark.unit
@pytest.mark.storage
def test_list_objects(s3_service):
    """Test list_objects method."""
    service, mock_s3 = s3_service
    
    # Set up mock response
    mock_response = {
        "Contents": [
            {
                "Key": "uploads/file1.txt",
                "LastModified": "2025-04-22T12:00:00Z",
                "Size": 100
            },
            {
                "Key": "uploads/file2.txt",
                "LastModified": "2025-04-22T13:00:00Z",
                "Size": 200
            }
        ]
    }
    mock_s3.list_objects_v2.return_value = mock_response
    
    # Call the method
    result = service.list_objects(prefix="uploads/")
    
    # Assertions
    assert result == mock_response
    
    # Verify S3 client was called correctly
    mock_s3.list_objects_v2.assert_called_once_with(
        Bucket="test-bucket",
        Prefix="uploads/"
    )


@pytest.mark.unit
@pytest.mark.storage
def test_generate_presigned_url(s3_service):
    """Test generate_presigned_url method."""
    service, mock_s3 = s3_service
    
    # Set up mock response
    mock_url = "https://test-bucket.s3.amazonaws.com/uploads/test_file.txt?signature=abc123"
    mock_s3.generate_presigned_url.return_value = mock_url
    
    # Call the method
    result = service.generate_presigned_url(
        "uploads/test_file.txt",
        expiration=3600
    )
    
    # Assertions
    assert result == mock_url
    
    # Verify S3 client was called correctly
    mock_s3.generate_presigned_url.assert_called_once_with(
        'get_object',
        Params={
            'Bucket': "test-bucket",
            'Key': "uploads/test_file.txt"
        },
        ExpiresIn=3600
    )


@pytest.mark.unit
@pytest.mark.storage
def test_generate_unique_object_name():
    """Test generate_unique_object_name method."""
    service = S3StorageService()
    
    # Call the method
    result = service.generate_unique_object_name("test_file.txt")
    
    # Assertions
    assert "test_file" in result
    assert result.endswith(".txt")
    assert len(result) > len("test_file.txt")  # Should have added a UUID
    
    # Make sure it's unique on subsequent calls
    result2 = service.generate_unique_object_name("test_file.txt")
    assert result != result2


@pytest.mark.unit
@pytest.mark.storage
def test_guess_content_type():
    """Test _guess_content_type method."""
    service = S3StorageService()
    
    # Test various file extensions
    assert service._guess_content_type("test.txt") == "text/plain"
    assert service._guess_content_type("test.html") == "text/html"
    assert service._guess_content_type("test.jpg") == "image/jpeg"
    assert service._guess_content_type("test.png") == "image/png"
    assert service._guess_content_type("test.pdf") == "application/pdf"
    assert service._guess_content_type("test.unknown") == "application/octet-stream"
