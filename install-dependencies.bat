@echo off
echo ===================================
echo Auto AGI Builder Dependencies Setup
echo ===================================
echo.

echo Navigating to frontend-minimal directory...
cd frontend-minimal
if not exist package.json (
    echo Error: frontend-minimal directory does not contain package.json!
    exit /b 1
)

echo.
echo Installing dependencies...
call npm install

echo.
echo Checking for Vercel CLI...
vercel --version
if %ERRORLEVEL% NEQ 0 (
    echo Installing Vercel CLI globally...
    call npm install -g vercel
) else (
    echo Vercel CLI is already installed.
)

echo.
echo Installing development dependencies...
call npm install --save-dev @types/react @types/node

echo.
echo Dependencies installation completed.
echo You can now run deploy-fixed-app.bat to build and deploy the application.
echo.

pause
