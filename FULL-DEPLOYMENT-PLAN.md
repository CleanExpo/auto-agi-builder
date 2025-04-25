# Auto AGI Builder Full Deployment Plan

## Current Status

We have successfully deployed a static landing page to Vercel, but encountered authentication issues with the deployed site. The full Auto AGI Builder stack consists of:

1. **Frontend**: Next.js application with React components
2. **Backend**: Python FastAPI application
3. **Supporting services**: Authentication, storage, etc.

## Deployment Architecture

### Proposed Architecture

```
                      ┌─────────────────┐
                      │   Vercel CDN    │
                      │  (Frontend)     │
                      └────────┬────────┘
                               │
                               ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Database      │◄───┤    Backend API  │◄───┤  Authentication │
│ (PostgreSQL/    │    │   (FastAPI)     │    │   Service       │
│  MongoDB)       │    └─────────────────┘    └─────────────────┘
└─────────────────┘            │
                               │
                     ┌─────────▼────────┐
                     │  Storage Service │
                     │  (S3/Blob)       │
                     └──────────────────┘
```

## Build & Deployment Plan

### 1. Fix Authentication Issues

#### Current Issues:
- Vercel login screen appears despite setting `"public": true` in vercel.json
- API requests failing with 401/403 errors

#### Solution:
1. Create updated vercel.json with:
   - Public access flag properly configured
   - Authentication explicitly disabled
   - Proper request forwarding from frontend to backend
   - CORS configuration

### 2. Backend Deployment

#### Steps:
1. Set up a dedicated backend hosting environment:
   - Options: Vercel Serverless Functions, AWS Lambda, Heroku, or DigitalOcean App Platform
   - Configure Python environment with dependencies from requirements.txt
   - Set up environment variables for API keys and configuration

2. Database Configuration:
   - Deploy PostgreSQL or MongoDB instance
   - Configure connection strings and credentials
   - Set up database migrations

3. Storage Configuration:
   - Configure S3/Blob storage for document uploads
   - Set up necessary permissions and credentials

### 3. Frontend Enhancements & Configuration

1. Update API endpoint configuration to point to deployed backend
2. Configure environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://api.auto-agi-builder.com
   NEXT_PUBLIC_AUTH_DOMAIN=auth.auto-agi-builder.com
   ```

3. Implement proper error handling for API failures

### 4. Complete Deployment Pipeline

Create a comprehensive deployment script that will:

1. Build and test the backend
2. Build and test the frontend
3. Deploy backend to selected platform
4. Deploy frontend to Vercel
5. Run integration tests to verify connectivity

## Implementation Steps

### 1. Backend API Deployment

```bash
# Create deployment subdirectory
mkdir -p deployment/backend

# Copy requirements.txt and backend code
cp requirements.txt deployment/backend/
cp -r app deployment/backend/

# Create backend deployment script
```

### 2. Frontend Configuration Update

Update frontend API configuration to point to deployed backend:

```javascript
// frontend/lib/api.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-auto-agi-builder.vercel.app';

export const fetchData = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  // Handle errors including authentication errors
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      // Handle authentication errors
      console.error('Authentication error');
    }
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
};
```

### 3. Environment Variables Configuration

Create production environment files for both services:

**Backend (.env.production):**
```
DATABASE_URL=postgresql://username:password@host:port/dbname
STORAGE_BUCKET=auto-agi-builder-storage
AUTH_SECRET=your-auth-secret
```

**Frontend (frontend/.env.production):**
```
NEXT_PUBLIC_API_URL=https://api-auto-agi-builder.vercel.app
NEXT_PUBLIC_STORAGE_URL=https://storage-auto-agi-builder.vercel.app
```

### 4. Deployment Automation Scripts

Create unified deployment scripts that will handle both frontend and backend:

**full-deploy.bat:**
```batch
@echo off
echo ===================================
echo AUTO AGI BUILDER FULL STACK DEPLOYMENT
echo ===================================
echo.

REM Deploy backend
echo Deploying backend API...
cd app
vercel --prod
cd ..

REM Deploy frontend
echo Deploying frontend application...
cd frontend
vercel --prod
cd ..

echo.
echo ===================================
echo Deployment Complete
echo ===================================
echo Backend API: https://api-auto-agi-builder.vercel.app
echo Frontend: https://auto-agi-landing.vercel.app
echo.

pause
```

### 5. Custom Domain Configuration

1. Register domain (if not already owned)
2. Configure DNS settings:
   - API subdomain: api.yourdomain.com → backend
   - www/root domain: yourdomain.com → frontend

3. Update Vercel project settings with custom domains

## Known Issues and Resolutions

### Authentication Issues

The primary authentication issue appears to be that Vercel is enforcing team authentication despite public access settings. To resolve:

1. In the Vercel dashboard, ensure project visibility is set to "Public"
2. Verify that no team restrictions are applied to the project
3. Consider deploying to a personal Vercel account rather than team account
4. As last resort, implement a simple auth bypass mechanism

### API Connectivity Issues

To resolve connectivity between frontend and backend:

1. Configure proper CORS settings on the backend:
   ```python
   from fastapi.middleware.cors import CORSMiddleware
   
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["*"],  # In production, restrict to actual domain
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

2. Configure proper API routing in vercel.json:
   ```json
   {
     "rewrites": [
       { "source": "/api/(.*)", "destination": "https://api-auto-agi-builder.vercel.app/api/$1" }
     ]
   }
   ```

## Testing & Verification

After deployment, run these validation steps:

1. Landing page loads without authentication prompt
2. API endpoints return expected responses
3. Authentication flow works (login/register)
4. Document upload/processing functions properly
5. All major features operate as expected:
   - Requirements management
   - Prototype generation
   - ROI calculations
   - Demo data generation
   - Device preview
   - Roadmap visualization

## Rollback Plan

In case of deployment issues, create a rollback script:

```batch
@echo off
echo ===================================
echo AUTO AGI BUILDER ROLLBACK
echo ===================================
echo.

REM Rollback frontend to previous deployment
echo Rolling back frontend...
cd frontend
vercel rollback
cd ..

REM Rollback backend to previous deployment
echo Rolling back backend...
cd app
vercel rollback
cd ..

echo.
echo ===================================
echo Rollback Complete
echo ===================================
echo.

pause
```

## Next Steps for Production Readiness

1. Set up monitoring and alerting
2. Implement logging across all services
3. Configure backup strategy for database
4. Set up CI/CD pipeline with GitHub Actions
5. Implement user analytics
