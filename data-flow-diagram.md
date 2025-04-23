# Auto AGI Builder - Data Flow Diagram

This document outlines the key data flows within the Auto AGI Builder application.

## Core Data Flow Architecture

```
User → UI Components → React Contexts → API Client → FastAPI Backend → Database
                                                   ↓
                                        External Services (OpenAI, SendGrid, AWS S3)
```

The data flows through these major system components:

1. **User Interface (UI)**: React components that display information and capture user input
2. **Context Providers**: React contexts that manage application state
3. **API Client**: Communication layer between frontend and backend
4. **Backend**: FastAPI server that processes business logic
5. **Database**: PostgreSQL database for persistent storage
6. **External Services**: Third-party integrations for additional functionality

## Authentication Flow

1. User enters credentials in login form
2. AuthContext sends credentials to backend via API client
3. Backend validates credentials against database
4. If valid, backend generates JWT token
5. Token returned to frontend and stored in localStorage
6. All subsequent API requests include the token in headers
7. Protected routes check authentication status from AuthContext

## Project Management Flow

1. User creates/edits project via modal form
2. Form data sent to ProjectContext
3. ProjectContext makes API request through API client
4. Backend validates and processes the request
5. Data stored in PostgreSQL database
6. Response returned to frontend
7. ProjectContext updates local state
8. UI reflects the changes to the user

## Requirements Management Flow

1. User adds/edits requirements
2. RequirementContext sends data to backend
3. Backend may use AI services to analyze and enhance requirements
4. Processed requirements stored in database
5. UI updates to show new/modified requirements

## Document Processing Flow

1. User uploads document for analysis
2. Document sent to backend through API
3. Backend uses AI services to extract information
4. Extracted information converted to requirements/notes
5. Results stored in database and returned to frontend
6. UI updated to display the extracted information

## Prototype Generation Flow

1. User requests prototype generation
2. Requirements and configuration sent to backend
3. Backend uses AI services to generate prototype code
4. Generated code stored and returned to frontend
5. UI displays the prototype and provides preview options

## Multi-Device Preview Flow

1. User selects application to preview
2. Frontend renders the application in different device frames
3. Interactions captured and simulated across device views
4. Screenshots can be captured and saved to storage

## ROI Calculation Flow

1. User enters business metrics and parameters
2. Data sent to backend for calculation
3. Backend applies ROI models to calculate projections
4. Results returned to frontend for visualization
5. Charts and reports generated for the user

## State Management Design

The application uses a hierarchical state management approach:

```
CombinedProvider
├── UIProvider (modals, notifications, theme)
│   └── AuthProvider (user, authentication)
│       └── ProjectProvider (projects, current project)
│           └── Application Components
```

This structure ensures that:
- UI state (modals, themes) is available to all components
- Auth state is available to project-related functionality
- Project state is available to all project-dependent features
- Each context handles its specific domain concerns

Data flows down through this hierarchy as props and up through context methods.
