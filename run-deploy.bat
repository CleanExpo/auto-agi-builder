@echo off
echo ===================================
echo Auto AGI Builder Deployment Script
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
    exit /b 1
)
echo Build successful!

echo.
echo Running Vercel deployment...
echo.

echo Step 1: Running Vercel login...
vercel login

echo.
echo Step 2: Linking project to Vercel...
vercel link

echo.
echo Step 3: Deploying to production...
vercel --prod

echo.
echo Deployment process completed.
echo.

pause
