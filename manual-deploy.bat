@echo off
echo ===================================
echo Auto AGI Builder Manual Deployment
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

echo Step 2: Setting up Vercel configuration...
mkdir ".vercel" 2>nul
echo {> .vercel\project.json
echo   "projectId": "prj_zJDsetW3XUQ8Pgw0EhEgeZVUk0Ss",>> .vercel\project.json
echo   "orgId": "team_hIVuEbN4ena7UPqg1gt1jb6s">> .vercel\project.json
echo }>> .vercel\project.json
echo Successfully created .vercel/project.json configuration.
echo.

echo Step 3: Creating Vercel environment configuration...
echo {> vercel.json
echo   "env": {>> vercel.json
echo     "SENTRY_DSN": "">> vercel.json
echo   },>> vercel.json
echo   "build": {>> vercel.json
echo     "env": {>> vercel.json
echo       "SENTRY_DSN": "">> vercel.json
echo     }>> vercel.json
echo   }>> vercel.json
echo }>> vercel.json
echo Successfully created vercel.json configuration.
echo.

echo Step 4: Fixing potentially corrupted package-lock.json...
if exist package-lock.json (
    echo Removing existing package-lock.json...
    del package-lock.json
)
echo Regenerating package-lock.json...
call npm install --package-lock-only
echo Successfully regenerated package-lock.json.
echo.

echo Step 5: Installing Vercel CLI globally if needed...
where vercel >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Installing Vercel CLI globally...
    call npm install -g vercel
) else (
    echo Vercel CLI already installed.
)
echo.

echo Step 6: Running Vercel deployment...
echo.
echo Ready to deploy with Vercel CLI...
echo.
call vercel --prod

:end
echo.
echo Press any key to exit...
pause > nul
