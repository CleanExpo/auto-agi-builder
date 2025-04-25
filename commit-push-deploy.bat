@echo off
echo ===================================
echo AUTO AGI BUILDER COMMIT-PUSH-DEPLOY
echo ===================================
echo.

echo This script will:
echo 1. Commit all changes to Git
echo 2. Push to the remote repository
echo 3. Deploy to Vercel production
echo.

REM Check dependencies
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Git is not installed or not in PATH.
  echo Please install Git from https://git-scm.com/
  exit /b 1
)

where vercel >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo WARNING: Vercel CLI is not installed or not in PATH.
  echo We will attempt to install it when needed.
  set VERCEL_INSTALLED=false
) else (
  set VERCEL_INSTALLED=true
)

REM Check Git status
echo Checking Git status...
git status
echo.

REM Detect changes
git diff --quiet
if %ERRORLEVEL% EQU 0 (
  git diff --quiet --staged
  if %ERRORLEVEL% EQU 0 (
    echo No changes detected in the working directory or staging area.
    
    set /p FORCE_CONTINUE=Would you like to proceed anyway? (Y/N): 
    if /i not "%FORCE_CONTINUE%"=="Y" (
      echo Operation cancelled by user.
      exit /b 0
    )
  )
)

REM Stage all changes
echo.
echo Staging all changes...
git add .
echo All changes staged.

REM Create commit
echo.
echo Creating commit...
set /p COMMIT_MESSAGE=Enter commit message (default: "Update deployment files"): 
if "%COMMIT_MESSAGE%"=="" set COMMIT_MESSAGE=Update deployment files

git commit -m "%COMMIT_MESSAGE%"
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Failed to create commit.
  echo Please check Git configuration and try again.
  exit /b 1
)
echo Commit created successfully.

REM Push changes
echo.
echo Pushing to remote repository...

REM Get current branch
for /f "tokens=* USEBACKQ" %%g in (`git branch --show-current`) do (set CURRENT_BRANCH=%%g)

REM Check if remote exists
git remote -v | find "origin" >nul
if %ERRORLEVEL% NEQ 0 (
  echo No remote repository found.
  set /p REMOTE_URL=Enter the remote repository URL: 
  
  if "%REMOTE_URL%"=="" (
    echo No remote URL provided. Skipping push.
    set PUSH_SUCCESS=false
  ) else (
    git remote add origin %REMOTE_URL%
    echo Remote added as 'origin'.
    git push -u origin %CURRENT_BRANCH%
    
    if %ERRORLEVEL% EQU 0 (
      echo Push successful.
      set PUSH_SUCCESS=true
    ) else (
      echo ERROR: Failed to push to remote repository.
      set PUSH_SUCCESS=false
    )
  )
) else (
  git push origin %CURRENT_BRANCH%
  
  if %ERRORLEVEL% EQU 0 (
    echo Push successful.
    set PUSH_SUCCESS=true
  ) else (
    REM Try to set upstream
    echo Setting upstream and pushing...
    git push -u origin %CURRENT_BRANCH%
    
    if %ERRORLEVEL% EQU 0 (
      echo Push successful.
      set PUSH_SUCCESS=true
    ) else (
      echo ERROR: Failed to push to remote repository.
      set PUSH_SUCCESS=false
    )
  )
)

echo.
echo ===================================
echo DEPLOYING TO VERCEL PRODUCTION
echo ===================================
echo.

REM Check for Vercel CLI
if "%VERCEL_INSTALLED%"=="false" (
  echo Installing Vercel CLI...
  npm install -g vercel
  
  if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install Vercel CLI.
    echo Please install it manually with 'npm install -g vercel'
    exit /b 1
  ) else (
    echo Vercel CLI installed successfully.
    set VERCEL_INSTALLED=true
  )
)

REM Check if deployment directories exist
if not exist "deployment" (
  echo Deployment directory not found.
  echo Do you want to run full-deploy.bat to prepare the deployment files?
  set /p RUN_FULL_DEPLOY=Enter Y to run full-deploy.bat, any other key to continue: 
  
  if /i "%RUN_FULL_DEPLOY%"=="Y" (
    echo Running full-deploy.bat...
    call full-deploy.bat
    echo.
    echo Deployment preparation completed.
  ) else (
    echo Proceeding without running full-deploy.bat
  )
)

echo Choose deployment target:
echo 1. Deploy both frontend and backend
echo 2. Deploy frontend only
echo 3. Deploy backend only
echo.

set /p DEPLOY_TARGET=Enter your choice (1-3): 

if "%DEPLOY_TARGET%"=="1" (
  echo.
  echo Deploying frontend and backend...
  
  if exist "deployment\frontend" (
    echo Deploying frontend...
    cd deployment\frontend
    vercel --prod
    cd ..\..
  ) else (
    echo ERROR: Frontend deployment directory not found.
    echo Please run full-deploy.bat to prepare deployment files.
  )
  
  if exist "deployment\backend" (
    echo Deploying backend...
    cd deployment\backend
    vercel --prod
    cd ..\..
  ) else (
    echo ERROR: Backend deployment directory not found.
    echo Please run full-deploy.bat to prepare deployment files.
  )
  
) else if "%DEPLOY_TARGET%"=="2" (
  echo.
  echo Deploying frontend only...
  
  if exist "deployment\frontend" (
    cd deployment\frontend
    vercel --prod
    cd ..\..
  ) else (
    echo ERROR: Frontend deployment directory not found.
    echo Please run full-deploy.bat to prepare deployment files.
  )
  
) else if "%DEPLOY_TARGET%"=="3" (
  echo.
  echo Deploying backend only...
  
  if exist "deployment\backend" (
    cd deployment\backend
    vercel --prod
    cd ..\..
  ) else (
    echo ERROR: Backend deployment directory not found.
    echo Please run full-deploy.bat to prepare deployment files.
  )
  
) else (
  echo Invalid choice. Deployment cancelled.
)

echo.
echo ===================================
echo DEPLOYMENT VERIFICATION
echo ===================================
echo.

echo Would you like to verify the deployment?
set /p VERIFY_DEPLOY=Enter Y to verify, any other key to skip: 

if /i "%VERIFY_DEPLOY%"=="Y" (
  echo Running deployment verification...
  call verify-deployment.bat
) else (
  echo Skipping deployment verification.
)

echo.
echo ===================================
echo OPERATION COMPLETED
echo ===================================
echo.

if "%PUSH_SUCCESS%"=="true" (
  echo Git changes successfully committed and pushed.
) else (
  echo WARNING: Git push was not completed successfully.
)

echo Deployment process completed.
echo Please check the Vercel dashboard for deployment status.
echo.

pause
