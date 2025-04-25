@echo off
echo ===================================
echo AUTO AGI BUILDER DEPLOYMENT PIPELINE
echo ===================================
echo.

echo This script will run the full deployment pipeline:
echo 1. Configure environment (DB, Storage, Auth)
echo 2. Build and prepare deployment
echo 3. Deploy to Vercel
echo 4. Verify deployment
echo 5. Commit and push changes to Git
echo.

REM Check if the required scripts exist
set MISSING_SCRIPTS=0
if not exist "database-setup.bat" (
  echo ERROR: database-setup.bat not found
  set MISSING_SCRIPTS=1
)
if not exist "storage-setup.bat" (
  echo ERROR: storage-setup.bat not found
  set MISSING_SCRIPTS=1
)
if not exist "auth-setup.bat" (
  echo ERROR: auth-setup.bat not found
  set MISSING_SCRIPTS=1
)
if not exist "full-deploy.bat" (
  echo ERROR: full-deploy.bat not found
  set MISSING_SCRIPTS=1
)
if not exist "verify-deployment.bat" (
  echo ERROR: verify-deployment.bat not found
  set MISSING_SCRIPTS=1
)
if not exist "git-commit-and-push.bat" (
  echo ERROR: git-commit-and-push.bat not found
  set MISSING_SCRIPTS=1
)

if %MISSING_SCRIPTS% NEQ 0 (
  echo.
  echo One or more required scripts are missing.
  echo Please ensure all deployment toolkit scripts are in the current directory.
  exit /b 1
)

echo Choose deployment environment:
echo 1. Production
echo 2. Staging
echo 3. Development
echo.

set /p ENV_CHOICE=Enter your choice (1-3): 

if "%ENV_CHOICE%"=="1" (
  set ENVIRONMENT=production
  set ENV_DISPLAY=Production
) else if "%ENV_CHOICE%"=="2" (
  set ENVIRONMENT=staging
  set ENV_DISPLAY=Staging
) else if "%ENV_CHOICE%"=="3" (
  set ENVIRONMENT=development
  set ENV_DISPLAY=Development
) else (
  echo Invalid choice. Defaulting to development.
  set ENVIRONMENT=development
  set ENV_DISPLAY=Development
)

echo.
echo Selected environment: %ENV_DISPLAY%
echo.

REM Choose which configurations to run
echo Select which configurations to run:
echo 1. Database setup
echo 2. Storage setup
echo 3. Authentication setup
echo 4. All of the above
echo 5. Skip configuration (use existing)
echo.

set /p CONFIG_CHOICE=Enter your choice (1-5): 

echo.
echo ===================================
echo Step 1: Environment Configuration
echo ===================================
echo.

if "%CONFIG_CHOICE%"=="1" (
  echo Running database setup...
  call database-setup.bat
) else if "%CONFIG_CHOICE%"=="2" (
  echo Running storage setup...
  call storage-setup.bat
) else if "%CONFIG_CHOICE%"=="3" (
  echo Running authentication setup...
  call auth-setup.bat
) else if "%CONFIG_CHOICE%"=="4" (
  echo Running all configuration scripts...
  
  echo.
  echo --- Database Configuration ---
  echo.
  call database-setup.bat
  
  echo.
  echo --- Storage Configuration ---
  echo.
  call storage-setup.bat
  
  echo.
  echo --- Authentication Configuration ---
  echo.
  call auth-setup.bat
) else if "%CONFIG_CHOICE%"=="5" (
  echo Skipping configuration. Using existing settings.
) else (
  echo Invalid choice. Skipping configuration.
)

echo.
echo ===================================
echo Step 2: Build and Prepare Deployment
echo ===================================
echo.

REM Run the full deployment preparation
echo Running full deployment preparation...
call full-deploy.bat

if %ERRORLEVEL% NEQ 0 (
  echo.
  echo Deployment preparation failed. Pipeline aborted.
  echo Review errors above and try again.
  exit /b 1
)

echo.
echo ===================================
echo Step 3: Deploy to Vercel
echo ===================================
echo.

REM Check if we need to deploy frontend and backend separately
echo Do you want to deploy both frontend and backend components?
set /p DEPLOY_BOTH=Enter Y for both, F for frontend only, B for backend only, N to skip deployment: 

if /i "%DEPLOY_BOTH%"=="Y" (
  REM Deploy backend
  echo.
  echo Deploying backend API...
  cd deployment\backend
  vercel --prod --name auto-agi-api-%ENVIRONMENT%
  cd ..\..
  
  REM Deploy frontend
  echo.
  echo Deploying frontend application...
  cd deployment\frontend
  vercel --prod --name auto-agi-builder-%ENVIRONMENT%
  cd ..\..
) else if /i "%DEPLOY_BOTH%"=="F" (
  REM Deploy frontend only
  echo.
  echo Deploying frontend application only...
  cd deployment\frontend
  vercel --prod --name auto-agi-builder-%ENVIRONMENT%
  cd ..\..
) else if /i "%DEPLOY_BOTH%"=="B" (
  REM Deploy backend only
  echo.
  echo Deploying backend API only...
  cd deployment\backend
  vercel --prod --name auto-agi-api-%ENVIRONMENT%
  cd ..\..
) else (
  echo Skipping deployment step.
)

echo.
echo ===================================
echo Step 4: Verify Deployment
echo ===================================
echo.

echo Do you want to verify the deployment?
set /p VERIFY_DEPLOY=Enter Y for yes, any other key to skip: 

if /i "%VERIFY_DEPLOY%"=="Y" (
  echo Running deployment verification...
  call verify-deployment.bat
)

echo.
echo ===================================
echo Step 5: Commit and Push Changes
echo ===================================
echo.

echo Do you want to commit and push changes to Git?
set /p GIT_COMMIT=Enter Y for yes, any other key to skip: 

if /i "%GIT_COMMIT%"=="Y" (
  echo Running Git operations...
  call git-commit-and-push.bat
)

echo.
echo ===================================
echo Deployment Pipeline Complete
echo ===================================
echo.

echo Summary:
echo - Environment: %ENV_DISPLAY%
echo - Configuration: %CONFIG_CHOICE%
echo - Deployment: %DEPLOY_BOTH%
echo - Verification: %VERIFY_DEPLOY%
echo - Git Operations: %GIT_COMMIT%
echo.

echo Deployment pipeline completed successfully!
echo.

pause
