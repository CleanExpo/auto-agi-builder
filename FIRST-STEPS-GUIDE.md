# Auto AGI Builder: First Implementation Steps Guide

This guide provides detailed instructions for the first practical steps to begin implementing the Auto AGI Builder platform based on the comprehensive implementation and deployment documentation we've created. These initial steps focus on the Week 1 tasks from the implementation roadmap.

## Initial Setup

Before beginning the implementation, ensure you have the following development environment set up:

1. Clone the Auto AGI Builder repository
2. Install required dependencies:
   ```bash
   # Frontend dependencies
   cd frontend
   npm install
   
   # Backend dependencies
   cd ../
   pip install -r requirements.txt
   ```
3. Set up the database connection in `.env` file
4. Ensure you have appropriate permissions to create files in the project directories

## Step 1: Create Frontend Assets

### 1.1 Create Prototype Example Image

Create a modern UI prototype image to showcase in the hero section:

```bash
# Create directories if they don't exist
mkdir -p public/images
```

Create `public/images/prototype-example.png` with the following specifications:
- Dimensions: 600x400px
- Content: Modern UI interface showing:
  - Navigation sidebar
  - Requirements list panel
  - Prototype preview area
  - Use the application's color scheme (blues and indigos)

### 1.2 Create Feature Icons

Create the SVG icons for the feature section:

```bash
mkdir -p public/icons
```

#### Requirements Icon (`public/icons/requirements-icon.svg`)
```svg
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="8" y1="6" x2="21" y2="6"></line>
  <line x1="8" y1="12" x2="21" y2="12"></line>
  <line x1="8" y1="18" x2="21" y2="18"></line>
  <line x1="3" y1="6" x2="3.01" y2="6"></line>
  <line x1="3" y1="12" x2="3.01" y2="12"></line>
  <line x1="3" y1="18" x2="3.01" y2="18"></line>
</svg>
```

#### Prototype Icon (`public/icons/prototype-icon.svg`)
```svg
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
  <line x1="3" y1="9" x2="21" y2="9"></line>
  <line x1="9" y1="21" x2="9" y2="9"></line>
</svg>
```

#### Devices Icon (`public/icons/devices-icon.svg`)
```svg
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
  <rect x="14" y="14" width="7" height="7" rx="2" ry="2"></rect>
  <path d="M10 4L4 10"></path>
</svg>
```

#### Calculator Icon (`public/icons/calculator-icon.svg`)
```svg
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
  <line x1="8" y1="6" x2="16" y2="6"></line>
  <line x1="8" y1="10" x2="10" y2="10"></line>
  <line x1="14" y1="10" x2="16" y2="10"></line>
  <line x1="8" y1="14" x2="10" y2="14"></line>
  <line x1="14" y1="14" x2="16" y2="14"></line>
  <line x1="8" y1="18" x2="10" y2="18"></line>
  <line x1="14" y1="18" x2="16" y2="18"></line>
</svg>
```

#### Timeline Icon (`public/icons/timeline-icon.svg`)
```svg
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="3" y1="12" x2="21" y2="12"></line>
  <circle cx="7" cy="12" r="2"></circle>
  <circle cx="14" cy="12" r="2"></circle>
  <circle cx="21" cy="12" r="2"></circle>
  <path d="M7 8v-4"></path>
  <path d="M14 4v4"></path>
  <path d="M21 8v-4"></path>
  <path d="M7 16v4"></path>
  <path d="M14 20v-4"></path>
  <path d="M21 16v4"></path>
</svg>
```

#### Collaboration Icon (`public/icons/collaboration-icon.svg`)
```svg
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
  <circle cx="9" cy="7" r="4"></circle>
  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
</svg>
```

## Step 2: Update Homepage Components

### 2.1 Connect Homepage Components in `frontend/pages/index.js`

Update the index.js file to connect all homepage components:

```javascript
import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import HeroSection from '../components/home/HeroSection';
import FeatureSection from '../components/home/FeatureSection';
import QuickStartForm from '../components/home/QuickStartForm';
import TestimonialSection from '../components/home/TestimonialSection';
import PricingSection from '../components/home/PricingSection';
import CallToAction from '../components/home/CallToAction';
import { useUI } from '../contexts/UIContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

export default function Home() {
  const router = useRouter();
  const { openModal, closeModal, toast } = useUI();
  const { isAuthenticated } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  
  // Handle "Get Started" button click
  const handleGetStarted = () => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/projects/new');
      return;
    }
    
    openModal({
      title: 'Create New Project',
      content: (
        <QuickStartForm
          onSubmit={handleCreateProject}
          isLoading={isCreating}
          requiresAuth={true}
          onRequiresAuth={() => router.push('/auth/login')}
        />
      ),
      size: 'lg'
    });
  };
  
  // Handle project creation
  const handleCreateProject = async (formData) => {
    setIsCreating(true);
    
    try {
      const response = await api.post('/projects', formData);
      
      // Close modal
      closeModal();
      
      // Show success message
      toast.success('Project created successfully');
      
      // Redirect to project page
      router.push(`/projects/${response.data.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error(error.response?.data?.message || 'Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <>
      <Head>
        <title>Auto AGI Builder - AI-Powered Development</title>
        <meta 
          name="description" 
          content="Build your ideas faster with AI-powered development. Auto AGI Builder transforms your requirements into working prototypes." 
        />
      </Head>
      <main>
        <HeroSection onGetStarted={handleGetStarted} />
        <FeatureSection />
        <TestimonialSection />
        <PricingSection />
        <CallToAction onGetStarted={handleGetStarted} />
      </main>
    </>
  );
}
```

### 2.2 Add Smooth Scrolling to Homepage

Create a new file `frontend/utils/smoothScroll.js`:

```javascript
// Smooth scroll function for navigation
export const smoothScrollTo = (elementId) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const headerOffset = 80; // Adjust based on header height
  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
  
  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });
};
```

Then update the `HeroSection.js` to use smooth scrolling:

```javascript
import React from 'react';
import Image from 'next/image';
import { smoothScrollTo } from '../../utils/smoothScroll';

const HeroSection = ({ onGetStarted }) => {
  return (
    <section className="relative bg-gradient-to-r from-blue-600 to-indigo-800 text-white py-20 md:py-28 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        {/* ... existing code ... */}
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="max-w-2xl md:w-1/2 md:pr-8 text-center md:text-left mb-12 md:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Build Your Ideas Faster with AI-Powered Development
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-xl">
              Auto AGI Builder transforms your requirements into working prototypes, 
              saving you weeks of development time and accelerating your product roadmap.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button 
                onClick={onGetStarted}
                className="bg-white text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium text-lg shadow-lg hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              >
                Get Started Free
              </button>
              <a 
                href="#features"
                onClick={(e) => {
                  e.preventDefault();
                  smoothScrollTo('features');
                }}
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-700 px-6 py-3 rounded-lg font-medium text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              >
                See How It Works
              </a>
            </div>
          </div>
          
          {/* ... existing code ... */}
        </div>
        
        {/* Stats section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* ... existing code ... */}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
```

## Step 3: Implement Authentication Backend

Now, create the auth endpoints for the backend API:

### 3.1 Create User Model

Create `app/api/v1/endpoints/auth.py`:

```python
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Any, List

from app.core.auth.jwt import (
    create_access_token,
    create_refresh_token,
    get_current_user,
    get_password_hash,
    verify_password
)
from app.core.config import settings
from app.db.session import get_db
from app.db.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.schemas.token import Token, TokenPayload

router = APIRouter()

@router.post("/login", response_model=Token)
def login(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    return {
        "access_token": create_access_token(
            subject=user.id, expires_delta=access_token_expires
        ),
        "refresh_token": create_refresh_token(
            subject=user.id, expires_delta=refresh_token_expires
        ),
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
            "is_active": user.is_active,
            "is_superuser": user.is_superuser
        }
    }

@router.post("/register", response_model=Token)
def register(
    user_in: UserCreate,
    db: Session = Depends(get_db)
) -> Any:
    """
    Register a new user
    """
    # Check if user with this email exists
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists"
        )
    
    # Create new user
    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        name=user_in.name,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    return {
        "access_token": create_access_token(
            subject=user.id, expires_delta=access_token_expires
        ),
        "refresh_token": create_refresh_token(
            subject=user.id, expires_delta=refresh_token_expires
        ),
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
            "is_active": user.is_active,
            "is_superuser": user.is_superuser
        }
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)) -> Any:
    """
    Get current user information
    """
    return current_user

@router.post("/logout")
def logout():
    """
    Logout the user
    
    Note: Since JWT is stateless, this endpoint doesn't actually invalidate the token.
    The frontend will handle removing the token from storage.
    For a real implementation, this should use a token blacklist or short-lived tokens.
    """
    return {"detail": "Successfully logged out"}
```

### 3.2 Update API Router to Include Auth Endpoints

Update `app/api/v1/api.py` to include the auth endpoints:

```python
from fastapi import APIRouter

from app.api.v1.endpoints import auth, requirements, prototype, roi

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(requirements.router, prefix="/requirements", tags=["requirements"])
api_router.include_router(prototype.router, prefix="/prototype", tags=["prototype"])
api_router.include_router(roi.router, prefix="/roi", tags=["roi"])
```

## Next Steps

After completing these initial steps, you'll have:

1. Created all the necessary frontend assets for the homepage
2. Connected the homepage components with proper navigation
3. Set up the authentication backend endpoints

You can then proceed to implement the frontend authentication connections and project management functionality as outlined in Weeks 2-3 of the implementation roadmap.

## Testing Your Progress

To test these initial implementations:

1. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

2. Start the backend development server:
   ```bash
   cd ../app
   uvicorn main:app --reload
   ```

3. Access the homepage at `http://localhost:3000`
4. Verify that:
   - All icons and images are displaying properly
   - Smooth scrolling works when clicking "See How It Works"
   - The "Get Started" button opens the QuickStartForm modal

Follow this guide to get started with the Auto AGI Builder implementation, and then continue with the subsequent steps outlined in the IMPLEMENTATION-ROADMAP.md document.
