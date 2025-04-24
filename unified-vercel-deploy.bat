@echo off
echo ===================================
echo Auto AGI Builder Unified Deployment Solution
echo ===================================
echo.

echo Step 1: Navigating to project directory...
cd /d "C:\Users\PhillMcGurk\OneDrive - Disaster Recovery\1111\Auto AGI Builder"
if %ERRORLEVEL% neq 0 (
    echo Error: Failed to navigate to project directory.
    goto :end
)
echo Successfully navigated to project directory.
echo.

echo Step 2: Fixing package.json (Removing merge conflict markers)...
echo {> package.json
echo   "name": "auto-agi-builder",>> package.json
echo   "version": "1.0.0",>> package.json
echo   "description": "Auto AGI Builder platform",>> package.json
echo   "private": true,>> package.json
echo   "scripts": {>> package.json
echo     "dev": "cd frontend && npm run dev",>> package.json
echo     "build": "cd frontend && npm run build",>> package.json
echo     "start": "cd frontend && npm run start">> package.json
echo   },>> package.json
echo   "engines": {>> package.json
echo     "node": ">=16.0.0">> package.json
echo   }>> package.json
echo }>> package.json
echo Successfully created clean package.json file.
echo.

echo Step 3: Setting up Python version and optimizing requirements...
echo python-3.9.18> runtime.txt
echo.
echo Optimizing requirements.txt with pinned versions...
echo fastapi==0.95.0> requirements.txt
echo uvicorn==0.21.1>> requirements.txt
echo pydantic==1.10.7>> requirements.txt
echo python-dotenv==1.0.0>> requirements.txt
echo requests==2.28.2>> requirements.txt
echo starlette==0.26.1>> requirements.txt
echo typing-extensions==4.5.0>> requirements.txt
echo aiohttp==3.8.4>> requirements.txt
echo setuptools==65.5.0>> requirements.txt
echo wheel==0.38.4>> requirements.txt
echo Successfully created optimized requirements.txt with pinned versions.
echo.

echo Step 4: Setting up Vercel configuration...
echo { > vercel.json
echo   "version": 2, >> vercel.json
echo   "builds": [ >> vercel.json
echo     { "src": "frontend/package.json", "use": "@vercel/next" }, >> vercel.json
echo     { "src": "app/main.py", "use": "@vercel/python" } >> vercel.json
echo   ], >> vercel.json
echo   "routes": [ >> vercel.json
echo     { "src": "/api/(.*)", "dest": "app/main.py" }, >> vercel.json
echo     { "src": "/(.*)", "dest": "frontend/$1" } >> vercel.json
echo   ], >> vercel.json
echo   "env": { >> vercel.json
echo     "SENTRY_DSN": "", >> vercel.json
echo     "PYTHONUNBUFFERED": "1", >> vercel.json
echo     "PYTHONPATH": ".", >> vercel.json
echo     "SKIP_INSTALL_DEPS": "true" >> vercel.json
echo   } >> vercel.json
echo } >> vercel.json
echo Successfully created vercel.json configuration.
echo.

echo Step 5: Setting up Vercel project configuration...
mkdir ".vercel" 2>nul
echo {> .vercel\project.json
echo   "projectId": "prj_zJDsetW3XUQ8Pgw0EhEgeZVUk0Ss",>> .vercel\project.json
echo   "orgId": "team_hIVuEbN4ena7UPqg1gt1jb6s",>> .vercel\project.json
echo   "settings": {>> .vercel\project.json
echo     "framework": null,>> .vercel\project.json
echo     "pythonVersion": "3.9",>> .vercel\project.json
echo     "installCommand": "pip install -r requirements.txt">> .vercel\project.json
echo   }>> .vercel\project.json
echo }>> .vercel\project.json
echo Successfully created .vercel/project.json with proper IDs.
echo.

echo Step 6: Setting up .vercelignore...
echo # Python files that should be ignored >> .vercelignore
echo *.pyc >> .vercelignore
echo __pycache__/ >> .vercelignore
echo .pytest_cache/ >> .vercelignore
echo .coverage >> .vercelignore
echo htmlcov/ >> .vercelignore
echo Successfully created .vercelignore file.
echo.

echo ===================================
echo Important: Deployment Strategy Options
echo ===================================
echo.
echo 1. For FULL-STACK deployment (frontend + backend):
echo    Run: vercel --prod
echo.
echo 2. For FRONTEND-ONLY deployment:
echo    Run: .\frontend-only-deploy.bat
echo.
echo 3. For STATIC SITE deployment (most compatible):
echo    Run: .\static-site-deploy.bat
echo.
echo Press any key to proceed with option 1 (full-stack deployment)...
pause > nul

echo Proceeding with full-stack deployment...
echo.
echo Starting Vercel deployment...
vercel --prod

:end
echo.
echo Press any key to exit...
pause > nul
