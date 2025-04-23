# Testing Strategy for Auto AGI Builder

This document outlines the comprehensive testing strategy for the Auto AGI Builder application, including test organization, execution, and best practices.

## Table of Contents

1. [Testing Approach](#testing-approach)
2. [Test Suite Organization](#test-suite-organization)
3. [Types of Tests](#types-of-tests)
4. [Running Tests](#running-tests)
5. [Writing Tests](#writing-tests)
6. [Test Coverage](#test-coverage)
7. [Continuous Integration](#continuous-integration)
8. [Mocking Strategy](#mocking-strategy)
9. [Best Practices](#best-practices)

## Testing Approach

The Auto AGI Builder application follows a comprehensive testing strategy that incorporates multiple types of tests to ensure high-quality, reliable code. Our testing pyramid includes:

- **Unit Tests**: Testing individual components in isolation
- **Integration Tests**: Testing interactions between components
- **API Tests**: Testing API endpoints and their behavior
- **End-to-End Tests**: Testing complete user flows

We utilize pytest as our primary testing framework for backend Python code, and Jest/React Testing Library for frontend JavaScript components.

## Test Suite Organization

The test suite is organized as follows:

```
tests/
  ├── unit/                 # Unit tests
  │   ├── services/         # Tests for service layer components
  │   │   ├── ai/           # Tests for AI services
  │   │   ├── storage/      # Tests for storage services
  │   │   └── ...
  │   ├── api/              # Tests for API endpoints
  │   └── models/           # Tests for data models
  ├── integration/          # Integration tests
  └── e2e/                  # End-to-end tests
```

Frontend tests are located within the frontend directory:

```
frontend/
  ├── __tests__/            # Jest tests
  │   ├── components/       # Component tests
  │   ├── pages/            # Page tests
  │   └── utils/            # Utility function tests
```

## Types of Tests

### Unit Tests

Unit tests verify that individual components work correctly in isolation. We use dependency injection and mocking to isolate components from their dependencies. Our unit tests focus on:

- Service methods
- Model behaviors
- Utility functions
- Individual React components

### Integration Tests

Integration tests verify that components work correctly together. These tests focus on:

- Service interactions
- API interactions with the database
- Multi-component interactions in the frontend

### API Tests

API tests verify that our API endpoints behave correctly, focusing on:

- Request validation
- Response formatting
- Error handling
- Authentication and authorization

### End-to-End Tests

End-to-end tests verify complete user flows from the frontend to the backend. We use Playwright for these tests, which:

- Simulate user interactions
- Verify UI state changes
- Test multi-step workflows
- Validate cross-component interactions

## Running Tests

### Running Backend Tests

We provide convenient scripts to run the backend tests:

#### For Unix/Linux/macOS:

```bash
./run-tests.sh
```

#### For Windows:

```bash
run-tests.bat
```

### Running Specific Tests

To run specific test categories, use pytest markers:

```bash
# Run unit tests only
pytest -m unit

# Run AI service tests only
pytest -m ai

# Run storage service tests only
pytest -m storage

# Run API tests only
pytest -m api
```

### Running Frontend Tests

For frontend tests, use the following commands:

```bash
# Navigate to frontend directory
cd frontend

# Run all tests
npm test

# Run with coverage
npm test -- --coverage
```

## Writing Tests

### Backend Tests

For backend Python tests, follow these guidelines:

1. Use pytest fixtures for common setup
2. Use parametrization for testing multiple scenarios
3. Use markers to categorize tests
4. Follow the AAA pattern (Arrange, Act, Assert)

Example:

```python
import pytest

@pytest.mark.unit
@pytest.mark.ai
def test_specific_function():
    # Arrange
    input_data = {"key": "value"}
    
    # Act
    result = function_under_test(input_data)
    
    # Assert
    assert result == expected_result
```

### Frontend Tests

For frontend JavaScript/React tests, follow these guidelines:

1. Use Jest's describe/it structure
2. Use React Testing Library's render and userEvent
3. Test component behavior, not implementation details

Example:

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import Component from './Component';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
  
  it('responds to user interaction', () => {
    render(<Component />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Changed Text')).toBeInTheDocument();
  });
});
```

## Test Coverage

We aim for high test coverage to ensure code quality and reliability. Our coverage goals are:

- 85%+ line coverage for critical service components
- 75%+ line coverage for API endpoints
- 70%+ line coverage for frontend components

We track coverage using pytest-cov for backend code and Jest's coverage for frontend code. Coverage reports are generated as part of the test runs.

## Continuous Integration

All tests are integrated into our CI/CD pipeline. The workflow includes:

1. Running all tests on every pull request
2. Generating and storing test coverage reports
3. Failing the build if tests fail or coverage drops below thresholds
4. Deploying only after all tests pass

## Mocking Strategy

### External Services

For external services like OpenAI API, AWS S3, etc., we use mocking to avoid actual API calls during testing:

- For Python, we use unittest.mock and pytest-mock
- For JavaScript, we use Jest's mocking capabilities

Example Python mock:

```python
@patch('app.services.ai.openai_service.httpx.AsyncClient')
async def test_with_mock(mock_client):
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"result": "mocked response"}
    
    mock_client.return_value.__aenter__.return_value.post.return_value = mock_response
    
    # Test with the mocked client
    result = await service.method_that_uses_client()
    assert result == expected_result
```

### Database

For database interactions, we use:

- Test databases with pre-defined fixtures
- In-memory databases for unit tests
- Transaction rollbacks to prevent test data persistence

## Best Practices

1. **Test Isolation**: Each test should be independent and not affect other tests
2. **Descriptive Names**: Use clear, descriptive test names that explain the scenario and expected outcome
3. **Test Failing Cases**: Test both success and failure scenarios
4. **Keep Tests Fast**: Optimize tests to run quickly to encourage frequent running
5. **Test Real Behavior**: Focus on testing behavior that matters to users, not implementation details
6. **Refactor Tests**: Keep test code as clean and maintainable as production code
7. **Test Edge Cases**: Include tests for boundary conditions and edge cases
8. **Parametrize Similar Tests**: Use parametrization to test similar scenarios without code duplication
9. **Update Tests With Code**: Always update tests when modifying functionality
10. **Test Once, Run Everywhere**: Configure tests to run consistently in all environments

By following these guidelines, we ensure our testing strategy supports the reliability, maintainability, and quality of the Auto AGI Builder application.
