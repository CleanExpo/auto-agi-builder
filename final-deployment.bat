@echo off
echo ===================================
echo Auto AGI Builder Final Deployment
echo ===================================
echo.

echo Step 1: Setting environment variables...
set NODE_ENV=production
set SENTRY_DSN=
echo Environment variables set.
echo.

echo Step 2: Navigating to project directory...
cd /d "C:\Users\PhillMcGurk\OneDrive - Disaster Recovery\1111\Auto AGI Builder"
if %ERRORLEVEL% neq 0 (
    echo Error: Failed to navigate to project directory.
    goto :end
)
echo Successfully navigated to project directory.
echo.

echo Step 3: Verifying package.json...
if not exist package.json (
    echo Error: package.json not found.
    echo Please run fix-package-json.bat first.
    goto :end
)
echo Package.json file found.
echo.

echo Step 4: Verifying Vercel configuration...
if not exist .vercel\project.json (
    echo Error: .vercel\project.json not found.
    echo Creating .vercel/project.json...
    mkdir ".vercel" 2>nul
    echo {> .vercel\project.json
    echo   "projectId": "prj_zJDsetW3XUQ8Pgw0EhEgeZVUk0Ss",>> .vercel\project.json
    echo   "orgId": "team_hIVuEbN4ena7UPqg1gt1jb6s">> .vercel\project.json
    echo }>> .vercel\project.json
)
echo Vercel configuration confirmed.
echo.

echo Step 5: Executing Vercel deployment...
echo.
echo Deploying to production...
echo.
vercel --prod

:end
echo.
echo Press any key to exit...
pause > nul
