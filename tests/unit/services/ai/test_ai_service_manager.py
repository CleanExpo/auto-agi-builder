"""
Unit tests for AI Service Manager.
"""

import pytest
import json
from unittest.mock import MagicMock, patch

from app.services.ai.ai_service_manager import AIServiceManager
from app.services.ai.openai_service import OpenAIService


@pytest.fixture
def ai_service_manager():
    """Fixture to create an AIServiceManager instance with mocked OpenAIService."""
    with patch('app.services.ai.ai_service_manager.OpenAIService') as mock_openai_cls:
        # Mock the OpenAI service instance
        mock_openai_instance = MagicMock(spec=OpenAIService)
        mock_openai_cls.return_value = mock_openai_instance
        
        # Create and return the manager
        manager = AIServiceManager()
        
        # Return both manager and mocked service for testing
        return manager, mock_openai_instance


@pytest.mark.asyncio
@pytest.mark.unit
@pytest.mark.ai
async def test_analyze_requirements(ai_service_manager):
    """Test analyze_requirements method passes through to OpenAI service."""
    manager, mock_openai = ai_service_manager
    
    # Set up mock return value
    mock_return = {
        "requirements": [
            {
                "id": "REQ-001",
                "name": "User Authentication"
            }
        ]
    }
    mock_openai.analyze_requirements.return_value = mock_return
    
    # Call the method
    result = await manager.analyze_requirements("Test requirements")
    
    # Assertions
    assert result == mock_return
    mock_openai.analyze_requirements.assert_called_once_with("Test requirements")


@pytest.mark.asyncio
@pytest.mark.unit
@pytest.mark.ai
async def test_generate_code(ai_service_manager):
    """Test generate_code method passes through to OpenAI service."""
    manager, mock_openai = ai_service_manager
    
    # Set up mock return value
    mock_code = "function test() { return 'Hello'; }"
    mock_openai.generate_code.return_value = mock_code
    
    # Call the method
    result = await manager.generate_code(
        "Create a test function",
        language="javascript",
        comments=True
    )
    
    # Assertions
    assert result == mock_code
    mock_openai.generate_code.assert_called_once_with(
        "Create a test function",
        "javascript",
        True
    )


@pytest.mark.asyncio
@pytest.mark.unit
@pytest.mark.ai
async def test_summarize_document(ai_service_manager):
    """Test summarize_document method passes through to OpenAI service."""
    manager, mock_openai = ai_service_manager
    
    # Set up mock return value
    mock_summary = "This is a summary of the document."
    mock_openai.summarize_document.return_value = mock_summary
    
    # Call the method
    result = await manager.summarize_document("Long document text", 200)
    
    # Assertions
    assert result == mock_summary
    mock_openai.summarize_document.assert_called_once_with("Long document text", 200)


@pytest.mark.asyncio
@pytest.mark.unit
@pytest.mark.ai
async def test_calculate_roi(ai_service_manager):
    """Test calculate_roi method passes through to OpenAI service."""
    manager, mock_openai = ai_service_manager
    
    # Set up test data and mock return value
    project_data = {
        "initialCost": 10000,
        "ongoingCosts": [500, 500, 500],
        "benefits": [1000, 2000, 3000],
        "timeframe": 12
    }
    
    mock_roi = {
        "summary": {
            "roi": 120,
            "paybackPeriod": 18
        }
    }
    mock_openai.calculate_roi.return_value = mock_roi
    
    # Call the method
    result = await manager.calculate_roi(project_data)
    
    # Assertions
    assert result == mock_roi
    mock_openai.calculate_roi.assert_called_once_with(project_data)


@pytest.mark.asyncio
@pytest.mark.unit
@pytest.mark.ai
async def test_generate_timeline(ai_service_manager):
    """Test generate_timeline method."""
    manager, mock_openai = ai_service_manager
    
    # Set up test data
    project_data = {
        "name": "Test Project",
        "requirements": [
            {"id": "REQ-001", "name": "Requirement 1"},
            {"id": "REQ-002", "name": "Requirement 2"}
        ]
    }
    
    # Set up mock for generate_text
    mock_timeline_json = json.dumps({
        "milestones": [
            {
                "id": "M1",
                "name": "Project Start",
                "date": "2025-01-15"
            }
        ],
        "tasks": [
            {
                "id": "T1", 
                "name": "Task 1",
                "startDate": "2025-01-15",
                "endDate": "2025-01-30"
            }
        ]
    })
    mock_openai.generate_text.return_value = mock_timeline_json
    
    # Call the method
    result = await manager.generate_timeline(project_data)
    
    # Assertions
    assert result["milestones"][0]["id"] == "M1"
    assert result["tasks"][0]["id"] == "T1"
    
    # Verify generate_text was called with correct arguments
    mock_openai.generate_text.assert_called_once()
    args, kwargs = mock_openai.generate_text.call_args
    
    # Check that project data is in the prompt
    assert "Project data" in args[0]
    assert "Test Project" in str(args[0])
    
    # Should use a low temperature for deterministic output
    assert kwargs["temperature"] == 0.3
    assert kwargs["model"] == "gpt-4-turbo"


@pytest.mark.asyncio
@pytest.mark.unit
@pytest.mark.ai
async def test_generate_prototype_code(ai_service_manager):
    """Test generate_prototype_code method."""
    manager, mock_openai = ai_service_manager
    
    # Set up test data
    requirements = [
        {"id": "REQ-001", "name": "User Authentication", "priority": "high"}
    ]
    tech_stack = {
        "frontend": "React",
        "backend": "FastAPI"
    }
    
    # Set up mock for generate_text
    mock_prototype_json = json.dumps({
        "files": [
            {
                "path": "src/App.js",
                "content": "// React component code"
            },
            {
                "path": "api/main.py",
                "content": "# FastAPI code"
            }
        ],
        "instructions": "How to run the prototype"
    })
    mock_openai.generate_text.return_value = mock_prototype_json
    
    # Call the method
    result = await manager.generate_prototype_code(requirements, tech_stack)
    
    # Assertions
    assert "src/App.js" in result
    assert result["src/App.js"] == "// React component code"
    assert "api/main.py" in result
    assert result["api/main.py"] == "# FastAPI code"
    assert result["__instructions__"] == "How to run the prototype"
    
    # Verify generate_text was called with correct arguments
    mock_openai.generate_text.assert_called_once()
    args, kwargs = mock_openai.generate_text.call_args
    
    # Check that requirements and tech stack are in the prompt
    assert "Requirements" in args[0]
    assert "Tech Stack" in args[0]
    assert "User Authentication" in str(args[0])
    assert "React" in str(args[0])
    
    # Should use a low temperature for deterministic output
    assert kwargs["temperature"] == 0.3
    assert kwargs["model"] == "gpt-4-turbo"


@pytest.mark.asyncio
@pytest.mark.unit
@pytest.mark.ai
async def test_explain_code(ai_service_manager):
    """Test explain_code method."""
    manager, mock_openai = ai_service_manager
    
    # Set up test data
    code = "function test() { return 'Hello'; }"
    
    # Set up mock for generate_text
    mock_explanation = "This function returns the string 'Hello'."
    mock_openai.generate_text.return_value = mock_explanation
    
    # Call the method
    result = await manager.explain_code(code, detail_level="detailed")
    
    # Assertions
    assert result == mock_explanation
    
    # Verify generate_text was called with correct arguments
    mock_openai.generate_text.assert_called_once()
    args, kwargs = mock_openai.generate_text.call_args
    
    # Check that code is in the prompt and detailed explanation is requested
    assert code in args[0]
    assert "detailed" in args[0].lower()
    
    # Should use a low temperature for deterministic output
    assert kwargs["temperature"] == 0.3


@pytest.mark.asyncio
@pytest.mark.unit
@pytest.mark.ai
async def test_generate_test_cases(ai_service_manager):
    """Test generate_test_cases method."""
    manager, mock_openai = ai_service_manager
    
    # Set up test data
    code = "function sum(a, b) { return a + b; }"
    
    # Set up mock for generate_code
    mock_tests = "test('adds 1 + 2 to equal 3', () => { expect(sum(1, 2)).toBe(3); });"
    mock_openai.generate_code.return_value = mock_tests
    
    # Call the method
    result = await manager.generate_test_cases(code, test_framework="jest")
    
    # Assertions
    assert result == mock_tests
    
    # Verify generate_code was called with correct arguments
    mock_openai.generate_code.assert_called_once()
    args, kwargs = mock_openai.generate_code.call_args
    
    # Check that code is in the prompt and jest is specified
    assert code in args[0]
    assert "jest" in args[0].lower()
    
    # Check language and comments
    assert kwargs["language"] == "javascript"
    assert kwargs["comments"] == True


@pytest.mark.asyncio
@pytest.mark.unit
@pytest.mark.ai
async def test_generate_embeddings(ai_service_manager):
    """Test generate_embeddings method passes through to OpenAI service."""
    manager, mock_openai = ai_service_manager
    
    # Set up mock return value
    mock_embeddings = [
        [0.1, 0.2, 0.3],
        [0.4, 0.5, 0.6]
    ]
    mock_openai.generate_embeddings.return_value = mock_embeddings
    
    # Call the method
    texts = ["Text 1", "Text 2"]
    result = await manager.generate_embeddings(texts)
    
    # Assertions
    assert result == mock_embeddings
    mock_openai.generate_embeddings.assert_called_once_with(texts)
