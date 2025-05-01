@echo off
echo ===================================
echo Auto AGI Builder Deployment Script
echo ===================================
echo.

echo This script will deploy from ANY directory

REM Get full path to desktop directory
set "DESKTOP_DIR=%USERPROFILE%\Desktop"
set "FRONTEND_DIR=%DESKTOP_DIR%\frontend-minimal"

echo.
echo Desktop directory: %DESKTOP_DIR%
echo Frontend directory: %FRONTEND_DIR%
echo.

if not exist "%FRONTEND_DIR%" (
    echo Error: frontend-minimal directory not found at: %FRONTEND_DIR%
    echo Creating the directory...
    mkdir "%FRONTEND_DIR%"
    if not exist "%FRONTEND_DIR%" (
        echo Failed to create directory!
        goto :error
    )
)

echo Navigating to frontend-minimal directory...
cd /d "%FRONTEND_DIR%"

echo.
echo Current directory: %CD%
echo.

echo Installing dependencies...
call npm install

echo.
echo Installing development dependencies...
call npm install --save-dev @types/react @types/node

echo.
echo Installing Vercel CLI globally...
call npm install -g vercel

echo.
echo Building the project...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo Error: Build failed! Please check errors above.
    goto :error
)
echo Build successful!

echo.
echo Running Vercel deployment...
echo.

echo Step 1: Running Vercel login...
call vercel login

echo.
echo Step 2: Linking project to Vercel...
call vercel link

echo.
echo Step 3: Deploying to production...
call vercel --prod

echo.
echo Deployment process completed.
echo.

echo Press any key to exit...
pause > nul
exit /b 0

:error
echo.
echo An error occurred during deployment.
echo.
pause
exit /b 1
