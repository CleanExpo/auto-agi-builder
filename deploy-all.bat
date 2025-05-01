@echo off
echo =========================================
echo Auto AGI Builder Master Deployment Script
echo =========================================
echo.
echo This script will run the entire deployment process:
echo 1. Install dependencies
echo 2. Build and deploy the application
echo.

echo Do you want to proceed with the full deployment process?
echo Press Ctrl+C to cancel or any other key to continue...
pause > nul

echo.
echo Step 1: Installing dependencies...
echo --------------------------------
call install-dependencies.bat
if %ERRORLEVEL% NEQ 0 (
    echo Error during dependency installation!
    exit /b 1
)

echo.
echo Step 2: Building and deploying the application...
echo -----------------------------------------------
call deploy-fixed-app.bat
if %ERRORLEVEL% NEQ 0 (
    echo Error during build or deployment!
    exit /b 1
)

echo.
echo ========================================================
echo Deployment process completed successfully!
echo.
echo Your SSR-safe UI Context is now deployed to Vercel.
echo The application should be available at your Vercel URL.
echo ========================================================
echo.

pause
