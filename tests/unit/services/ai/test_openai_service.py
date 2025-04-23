"""
Unit tests for OpenAI service.
"""

import pytest
import json
import os
from unittest.mock import MagicMock, patch
from fastapi import HTTPException

from app.services.ai.openai_service import OpenAIService


@pytest.fixture
def openai_service():
    """Fixture to create an OpenAIService instance with mocked environment variables."""
    with patch.dict(os.environ, {
        "OPENAI_API_KEY": "test-api-key", 
        "OPENAI_API_BASE": "https://api.test.com/v1",
        "OPENAI_DEFAULT_MODEL": "test-model"
    }):
        return OpenAIService()


@pytest.fixture
def mock_response():
    """Fixture to create a mock response object."""
    mock = MagicMock()
    mock.status_code = 200
    mock.json.return_value = {
        "choices": [
            {
                "message": {
                    "content": "Test response content"
                }
            }
        ]
    }
    return mock


@pytest.mark.asyncio
@pytest.mark.unit
@pytest.mark.ai
async def test_chat_completion_success(openai_service, mock_response, mocker):
    """Test successful chat completion."""
    # Mock httpx.AsyncClient
    mock_client = MagicMock()
    mock_client.post.return_value = mock_response
    
    # Mock the AsyncClient context manager
    mock_async_client = MagicMock()
    mock_async_client.__aenter__.return_value = mock_client
    mocker.patch("httpx.AsyncClient", return_value=mock_async_client)
    
    # Call the method
    messages = [{"role": "user", "content": "Test message"}]
    result = await openai_service.chat_completion(messages)
    
    # Assertions
    assert result == mock_response.json.return_value
    mock_client.post.assert_called_once()
    
    # Check that the correct URL and data were used
    args, kwargs = mock_client.post.call_args
    assert args[0] == "https://api.test.com/v1/chat/completions"
    assert kwargs["headers"]["Authorization"] == "Bearer test-api-key"
    assert kwargs["json"]["messages"] == messages
    assert kwargs["json"]["model"] == "test-model"


@pytest.mark.asyncio
@pytest.mark.unit
@pytest.mark.ai
async def test_chat_completion_error(openai_service, mocker):
    """Test chat completion with API error."""
    # Mock httpx.AsyncClient
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.status_code = 400
    mock_response.text = "Bad request"
    mock_client.post.return_value = mock_response
    
    # Mock the AsyncClient context manager
    mock_async_client = MagicMock()
    mock_async_client.__aenter__.return_value = mock_client
    mocker.patch("httpx.AsyncClient", return_value=mock_async_client)
    
    # Call the method and check for exception
    messages = [{"role": "user", "content": "Test message"}]
    with pytest.raises(HTTPException) as excinfo:
        await openai_service.chat_completion(messages)
    
    # Assertions
    assert excinfo.value.status_code == 400
    assert "OpenAI API error" in str(excinfo.value.detail)


@pytest.mark.asyncio
@pytest.mark.unit
@pytest.mark.ai
async def test_chat_completion_timeout(openai_service, mocker):
    """Test chat completion with timeout error."""
    # Mock httpx.AsyncClient to raise TimeoutException
    import httpx
    mock_client = MagicMock()
    mock_client.post.side_effect = httpx.TimeoutException("Timeout")
    
    # Mock the AsyncClient context manager
    mock_async_client = MagicMock()
    mock_async_client.__aenter__.return_value = mock_client
    mocker.patch("httpx.AsyncClient", return_value=mock_async_client)
    
    # Call the method and check for exception
    messages = [{"role": "user", "content": "Test message"}]
    with pytest.raises(HTTPException) as excinfo:
        await openai_service.chat_completion(messages)
    
    # Assertions
    assert excinfo.value.status_code == 504
    assert "OpenAI API request timed out" in str(excinfo.value.detail)


@pytest.mark.asyncio
@pytest.mark.unit
@pytest.mark.ai
async def test_generate_text(openai_service, mocker):
    """Test generate_text method."""
    # Mock chat_completion method
    mock_completion = {
        "choices": [
            {
                "message": {
                    "content": "Generated text response"
                }
            }
        ]
    }
    mocker.patch.object(
        openai_service, 
        "chat_completion", 
        return_value=mock_completion
    )
    
    # Call the method
    result = await openai_service.generate_text("Test prompt")
    
    # Assertions
    assert result == "Generated text response"
    openai_service.chat_completion.assert_called_once()
    
    # Check that the correct messages were passed
    args, kwargs = openai_service.chat_completion.call_args
    assert args[0] == [{"role": "user", "content": "Test prompt"}]


@pytest.mark.asyncio
@pytest.mark.unit
@pytest.mark.ai
async def test_generate_embeddings_success(openai_service, mocker):
    """Test successful embeddings generation."""
    # Mock httpx.AsyncClient response
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "data": [
            {"embedding": [0.1, 0.2, 0.3]},
            {"embedding": [0.4, 0.5, 0.6]}
        ]
    }
    mock_client.post.return_value = mock_response
    
    # Mock the AsyncClient context manager
    mock_async_client = MagicMock()
    mock_async_client.__aenter__.return_value = mock_client
    mocker.patch("httpx.AsyncClient", return_value=mock_async_client)
    
    # Call the method
    texts = ["Text 1", "Text 2"]
    result = await openai_service.generate_embeddings(texts)
    
    # Assertions
    assert result == [[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]]
    mock_client.post.assert_called_once()
    
    # Check that the correct URL and data were used
    args, kwargs = mock_client.post.call_args
    assert args[0] == "https://api.test.com/v1/embeddings"
    assert kwargs["headers"]["Authorization"] == "Bearer test-api-key"
    assert kwargs["json"]["input"] == texts


@pytest.mark.asyncio
@pytest.mark.unit
@pytest.mark.ai
async def test_analyze_requirements(openai_service, mocker):
    """Test analyze_requirements method."""
    # Mock generate_text method
    mock_json_response = json.dumps({
        "requirements": [
            {
                "id": "REQ-001",
                "name": "User Authentication",
                "description": "System must support user login",
                "priority": "high",
                "category": "functional",
                "dependencies": []
            }
        ],
        "categories": {
            "functional": ["REQ-001"]
        },
        "summary": "Basic authentication system",
        "recommendations": ["Add multi-factor authentication"]
    })
    
    mocker.patch.object(
        openai_service,
        "generate_text",
        return_value=mock_json_response
    )
    
    # Call the method
    result = await openai_service.analyze_requirements("Test requirements")
    
    # Assertions
    assert result["requirements"][0]["id"] == "REQ-001"
    assert result["categories"]["functional"] == ["REQ-001"]
    assert result["summary"] == "Basic authentication system"
    
    # Verify generate_text was called with correct arguments
    openai_service.generate_text.assert_called_once()
    args, kwargs = openai_service.generate_text.call_args
    assert "Test requirements" in args[0]
    assert kwargs["temperature"] == 0.2
    assert kwargs["model"] == "gpt-4-turbo"


@pytest.mark.asyncio
@pytest.mark.unit
@pytest.mark.ai
async def test_generate_code(openai_service, mocker):
    """Test generate_code method."""
    # Mock chat_completion method
    mock_response = {
        "choices": [
            {
                "message": {
                    "content": "function test() { return 'Hello'; }"
                }
            }
        ]
    }
    
    mocker.patch.object(
        openai_service,
        "chat_completion",
        return_value=mock_response
    )
    
    # Call the method
    result = await openai_service.generate_code(
        "Create a hello function", 
        language="javascript", 
        comments=True
    )
    
    # Assertions
    assert result == "function test() { return 'Hello'; }"
    
    # Verify chat_completion was called with correct arguments
    openai_service.chat_completion.assert_called_once()
    args, kwargs = openai_service.chat_completion.call_args
    
    # First argument should be messages with system and user content
    assert len(args[0]) == 2
    assert args[0][0]["role"] == "system"
    assert "expert javascript developer" in args[0][0]["content"].lower()
    assert args[0][1]["role"] == "user"
    assert args[0][1]["content"] == "Create a hello function"
    
    # Should use a low temperature for deterministic output
    assert kwargs["temperature"] == 0.3
    assert kwargs["model"] == "gpt-4-turbo"


@pytest.mark.asyncio
@pytest.mark.unit
@pytest.mark.ai
async def test_no_api_key(mocker):
    """Test service behavior when API key is not set."""
    # Mock environment with no API key
    with patch.dict(os.environ, {}, clear=True):
        service = OpenAIService()
        
        # Attempt to use API without key should raise exception
        with pytest.raises(HTTPException) as excinfo:
            await service.chat_completion([{"role": "user", "content": "Test"}])
        
        assert excinfo.value.status_code == 500
        assert "API key is not configured" in str(excinfo.value.detail)
