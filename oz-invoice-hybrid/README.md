# OZ Invoice Hybrid

A hybrid invoice management system with external API integrations for accounting systems, CRMs, and AI-powered features.

## Overview

OZ Invoice Hybrid builds on the OZ Invoice Safeguard system by adding robust API integration capabilities that connect to external accounting and CRM systems. This enables automated data synchronization of clients, invoices, and payments between systems. Additionally, it integrates with AI services to provide smart features like field suggestions and content generation.

## Features

- Connect to popular accounting systems (Xero, QuickBooks, MYOB)
- Connect to CRM platforms (HubSpot)
- Securely store and manage API credentials
- Automatically synchronize client data
- Import invoices and payments
- Schedule regular data synchronization
- Generate shareable links for clients to connect their accounts
- AI-powered features using your own LLM API keys:
  - Intelligent field suggestions
  - Invoice summary generation
  - Content assistance for client communications

## Project Structure

```
oz-invoice-hybrid/
├── backend/               # Flask API backend
│   ├── app/               # Application package
│   │   ├── api/           # API endpoints
│   │   ├── models/        # Database models
│   │   └── services/      # Business logic and services
│   │       └── integration/  # API integration services
│   ├── migrations/        # Database migration scripts
│   └── main.py            # Application entry point
├── frontend/              # Frontend application (React)
└── docs/                  # Documentation
```

## Backend Setup

### Prerequisites

- Python 3.10+
- PostgreSQL 14+

### Installation

1. Create a virtual environment:
   ```
   cd oz-invoice-hybrid/backend
   python -m venv venv
   ```

2. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   Create a `.env` file in the `backend` directory with the following variables:
   ```
   FLASK_APP=main.py
   FLASK_ENV=development
   DATABASE_URL=postgresql://username:password@localhost/oz_invoice
   SECRET_KEY=your-secret-key
   
   # External API credentials (optional)
   XERO_CLIENT_ID=your-xero-client-id
   XERO_CLIENT_SECRET=your-xero-client-secret
   
   QUICKBOOKS_CLIENT_ID=your-quickbooks-client-id
   QUICKBOOKS_CLIENT_SECRET=your-quickbooks-client-secret
   
   MYOB_CLIENT_ID=your-myob-client-id
   MYOB_CLIENT_SECRET=your-myob-client-secret
   
   HUBSPOT_API_KEY=your-hubspot-api-key
   ```

5. Initialize the database:
   ```
   flask db upgrade
   ```

6. Run the application:
   ```
   python main.py
   ```

## API Integration Setup

### Connecting to External Systems

1. Navigate to the API Integrations page in the application
2. Select the service you want to connect to
3. Follow the OAuth flow or provide API keys as required
4. Once connected, you can synchronize data manually or set up automatic syncing

### Client Connection Links

To allow clients to connect their own accounting systems:

1. Go to the API Integrations page
2. Select the desired integration
3. Click "Generate Client Link"
4. Share the generated link with your client
5. The client can follow the link to authorize access to their accounting data without needing access to your dashboard

## API Documentation

### Available Endpoints

- `GET /api/integration/providers` - List available integration providers
- `GET /api/integration/status` - Get integration status
- `GET /api/integration/oauth/{provider}` - Get OAuth authorization URL
- `GET /api/integration/oauth/{provider}/callback` - OAuth callback handler
- `GET /api/integration/apikey/{provider}` - Get API key form
- `POST /api/integration/apikey/{provider}` - Submit API key
- `POST /api/integration/disconnect/{provider}` - Disconnect integration
- `POST /api/integration/client-link/{provider}` - Generate client connection link
- `POST /api/integration/sync/{provider}` - Trigger data sync
- `GET /api/integration/sync-status/{job_id}` - Get sync job status
- `GET/POST /api/integration/sync-schedule` - Manage sync schedule

## Development

### Adding New Integrations

To add support for a new integration:

1. Create a new adapter class in `app/services/integration/adapters/`
2. Implement the `BaseIntegrationAdapter` interface
3. Add the new provider to the available providers list in `app/api/integration.py`
4. Implement any provider-specific OAuth or API key handling

### Running Tests

```
pytest
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
