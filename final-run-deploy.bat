@echo off
echo ===================================
echo Auto AGI Builder Final Deployment Runner
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

echo Step 2: Verifying we're in the correct directory...
if not exist app\main.py (
    echo Error: app\main.py not found.
    echo Current directory does not appear to be the Auto AGI Builder root.
    goto :end
)
echo Correctly positioned in Auto AGI Builder root directory.
echo.

echo Step 3: Confirm environments are set properly...
echo NODE_ENV=production > .env.production
echo SKIP_INSTALL_DEPS=true >> .env.production
echo VERCEL_PROJECT_ID=prj_zJDsetW3XUQ8Pgw0EhEgeZVUk0Ss >> .env.production
echo VERCEL_ORG_ID=team_hIVuEbN4ena7UPqg1gt1jb6s >> .env.production
echo Environment variables set.
echo.

echo Step 4: Starting Vercel deployment without Python dependency installation...
echo Running Vercel CLI with no-build flag to use prebuilt packages on Vercel...
echo.
vercel --prod --no-clipboard --confirm

:end
echo.
echo Press any key to exit...
pause > nul
