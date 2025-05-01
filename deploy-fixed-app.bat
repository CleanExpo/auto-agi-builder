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
echo Building the project...
call npm run build

echo.
echo Checking for build success...
if %ERRORLEVEL% NEQ 0 (
    echo Build failed! Please check errors above.
    exit /b 1
)
echo Build successful!

echo.
echo Running Vercel deployment...
echo.

echo Step 1: Checking if vercel CLI is installed...
vercel --version
if %ERRORLEVEL% NEQ 0 (
    echo Error: Vercel CLI is not installed or not in PATH
    echo Please install it with: npm install -g vercel
    pause
    exit /b 1
)

echo.
echo Step 2: Running Vercel login...
vercel login

echo.
echo Step 3: Linking project to Vercel...
vercel link

echo.
echo Step 4: Deploying to production...
vercel --prod

echo.
echo Deployment process completed.
echo.

pause
