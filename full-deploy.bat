@echo off
echo ===================================
echo AUTO AGI BUILDER FULL DEPLOYMENT
echo ===================================
echo.

echo This script will prepare the project for deployment to Vercel.
echo.

REM Check for Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Node.js is not installed or not in the PATH.
  echo Please install Node.js from https://nodejs.org/
  exit /b 1
)

REM Check for npm
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: npm is not installed or not in the PATH.
  echo Please install Node.js from https://nodejs.org/
  exit /b 1
)

REM Check for Python
where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
  set PYTHON_CMD=python
) else (
  where py >nul 2>&1
  if %ERRORLEVEL% EQU 0 (
    set PYTHON_CMD=py
  ) else (
    echo ERROR: Python is not installed or not in the PATH.
    echo Please install Python from https://www.python.org/
    exit /b 1
  )
)

REM Check for pip
%PYTHON_CMD% -m pip --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: pip is not installed or not working properly.
  echo Please install or fix pip installation.
  exit /b 1
)

REM Verify Vercel CLI
where vercel >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo Vercel CLI not found. Installing globally...
  npm install -g vercel
  if %ERRORLEVEL% NEQ 0 (
    echo Failed to install Vercel CLI. Please install it manually with:
    echo npm install -g vercel
    exit /b 1
  )
)

echo.
echo Environment verification complete.
echo.

REM Create deployment directory structure
echo Creating deployment directory structure...
if exist deployment (
  echo Removing existing deployment directory...
  rmdir /s /q deployment
)

mkdir deployment
mkdir deployment\frontend
mkdir deployment\backend
echo Directory structure created.

echo.
echo ===================================
echo PREPARING FRONTEND
echo ===================================
echo.

REM Check if frontend directory exists
if not exist frontend (
  echo ERROR: Frontend directory not found.
  echo Please run this script from the project root directory.
  exit /b 1
)

echo Installing frontend dependencies...
cd frontend
npm install
if %ERRORLEVEL% NEQ 0 (
  echo Failed to install frontend dependencies.
  cd ..
  exit /b 1
)

echo.
echo Building frontend for production...
npm run build
if %ERRORLEVEL% NEQ 0 (
  echo Failed to build frontend.
  cd ..
  exit /b 1
)

echo.
echo Copying frontend files to deployment directory...
xcopy /E /I /Y .next ..\deployment\frontend\.next
xcopy /E /I /Y public ..\deployment\frontend\public
copy package.json ..\deployment\frontend\
copy next.config.js ..\deployment\frontend\
if exist .env.production copy .env.production ..\deployment\frontend\
if exist vercel.json copy vercel.json ..\deployment\frontend\

cd ..
echo Frontend preparation complete.

echo.
echo ===================================
echo PREPARING BACKEND
echo ===================================
echo.

REM Check if app directory exists
if not exist app (
  echo ERROR: Backend app directory not found.
  echo Please run this script from the project root directory.
  exit /b 1
)

echo Installing backend dependencies...
%PYTHON_CMD% -m pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
  echo Failed to install backend dependencies.
  exit /b 1
)

echo.
echo Copying backend files to deployment directory...
xcopy /E /I /Y app deployment\backend\app
copy requirements.txt deployment\backend\
if exist vercel.json copy vercel.json deployment\backend\
if exist .env copy .env deployment\backend\

REM Create Vercel configuration files if they don't exist
echo.
echo Checking/creating Vercel configuration files...

if not exist deployment\frontend\vercel.json (
  echo Creating frontend Vercel configuration...
  echo {> deployment\frontend\vercel.json
  echo   "version": 2,>> deployment\frontend\vercel.json
  echo   "builds": [>> deployment\frontend\vercel.json
  echo     { "src": "package.json", "use": "@vercel/next" }>> deployment\frontend\vercel.json
  echo   ],>> deployment\frontend\vercel.json
  echo   "routes": [>> deployment\frontend\vercel.json
  echo     { "src": "/(.*)", "dest": "/$1" }>> deployment\frontend\vercel.json
  echo   ]>> deployment\frontend\vercel.json
  echo }>> deployment\frontend\vercel.json
)

if not exist deployment\backend\vercel.json (
  echo Creating backend Vercel configuration...
  echo {> deployment\backend\vercel.json
  echo   "version": 2,>> deployment\backend\vercel.json
  echo   "builds": [>> deployment\backend\vercel.json
  echo     { "src": "app/main.py", "use": "@vercel/python" }>> deployment\backend\vercel.json
  echo   ],>> deployment\backend\vercel.json
  echo   "routes": [>> deployment\backend\vercel.json
  echo     { "src": "/(.*)", "dest": "app/main.py" }>> deployment\backend\vercel.json
  echo   ]>> deployment\backend\vercel.json
  echo }>> deployment\backend\vercel.json
)

REM Create simple index.py for Vercel Python deployment
echo from app.main import app > deployment\backend\index.py

echo.
echo ===================================
echo DEPLOYMENT PREPARATION COMPLETE
echo ===================================
echo.

echo Frontend and backend have been prepared for deployment.
echo.
echo The following steps have been completed:
echo 1. Environment verification
echo 2. Frontend build and preparation
echo 3. Backend preparation
echo 4. Deployment configuration
echo.
echo To deploy to Vercel:
echo 1. Navigate to deployment/frontend and run 'vercel' to deploy the frontend
echo 2. Navigate to deployment/backend and run 'vercel' to deploy the backend
echo 3. Alternatively, use the run-deploy-pipeline.bat script for a guided deployment
echo.
echo Deployment files are ready in the 'deployment' directory.
echo.

pause
