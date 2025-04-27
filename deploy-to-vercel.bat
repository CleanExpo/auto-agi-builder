@echo off
echo ==========================================
echo Auto AGI Builder - Vercel Deployment Script
echo ==========================================
echo.

:: Check if Vercel CLI is installed
call vercel --version > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo Vercel CLI not found. Installing...
  call npm i -g vercel
  if %ERRORLEVEL% NEQ 0 (
    echo Failed to install Vercel CLI. Please install it manually.
    exit /b 1
  )
)

echo Preparing deployment package...

:: Navigate to the frontend directory
cd deployment\frontend

:: Check if package.json exists
if not exist package.json (
  echo Error: package.json not found in deployment/frontend directory
  echo Please make sure the deployment directory is set up correctly
  exit /b 1
)

:: Check if vercel.json exists
if not exist vercel.json (
  echo Error: vercel.json not found in deployment/frontend directory
  echo Creating a default vercel.json file...
  
  echo {^
  "version": 2,^
  "builds": [^
    {^
      "src": "package.json",^
      "use": "@vercel/next"^
    }^
  ],^
  "routes": [^
    { "handle": "filesystem" },^
    { "src": "/(.*)", "dest": "/$1" }^
  ],^
  "env": {^
    "NODE_ENV": "production"^
  }^
} > vercel.json
)

echo Running build verification...
call npm run build
if %ERRORLEVEL% NEQ 0 (
  echo Build verification failed. Please fix any build issues before deploying.
  exit /b 1
)

echo.
echo ==============================================
echo Project is ready for deployment to Vercel!
echo ==============================================
echo.
echo Options:
echo 1. Deploy with interactive setup (recommended for first deployment)
echo 2. Deploy with existing configuration (for subsequent deployments)
echo 3. Cancel deployment
echo.

set /p deployOption="Select an option (1-3): "

if "%deployOption%"=="1" (
  echo Starting interactive deployment...
  call vercel
) else if "%deployOption%"=="2" (
  echo Deploying with existing configuration...
  call vercel --prod
) else (
  echo Deployment cancelled.
  exit /b 0
)

if %ERRORLEVEL% NEQ 0 (
  echo Deployment encountered issues. Please check the error messages above.
  exit /b 1
)

echo.
echo ======================================
echo Deployment completed successfully!
echo ======================================
echo.
echo Your application should now be accessible via the Vercel URL provided above.
echo You can also configure a custom domain in the Vercel dashboard.
echo.

pause
