@echo off
REM Auto AGI Builder Redeployment Script for Windows
REM This script automates the process of redeploying the application to Vercel
REM Usage: scripts\redeploy.bat [--skip-checks] [--clear-cache] [--branch branch_name]

setlocal enabledelayedexpansion

REM Default values
set SKIP_CHECKS=false
set CLEAR_CACHE=false
set BRANCH=main
set VERCEL_PROJECT_NAME=auto-agi-builder

REM Parse command line arguments
:parse_args
if "%~1"=="" goto :end_parse_args
if "%~1"=="--skip-checks" (
    set SKIP_CHECKS=true
    shift
    goto :parse_args
)
if "%~1"=="--clear-cache" (
    set CLEAR_CACHE=true
    shift
    goto :parse_args
)
if "%~1"=="--branch" (
    set BRANCH=%~2
    shift
    shift
    goto :parse_args
)
echo Unknown parameter: %~1
exit /b 1
:end_parse_args

REM Print header
echo.
echo ========================================================================
echo                Auto AGI Builder Redeployment Script
echo ========================================================================
echo Branch: %BRANCH%
echo Skip checks: %SKIP_CHECKS%
echo Clear cache: %CLEAR_CACHE%
echo.

REM Check if we're in the project root directory
if not exist "frontend" (
    echo Error: This script must be run from the project root directory
    exit /b 1
)
if not exist "app" (
    echo Error: This script must be run from the project root directory
    exit /b 1
)

REM Check if required tools are installed
echo Checking required tools...
where git >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Error: git is not installed
    exit /b 1
)
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Error: node is not installed
    exit /b 1
)
where npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Error: npm is not installed
    exit /b 1
)
where vercel >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Warning: vercel CLI is not installed. Installing...
    call npm install -g vercel
)
echo √ All required tools are installed

REM Check if node_modules exists and install dependencies if needed
if not exist "frontend\node_modules" (
    echo Warning: node_modules not found, installing dependencies...
    cd frontend && call npm install && cd ..
    if %ERRORLEVEL% neq 0 (
        echo Error: Failed to install dependencies
        exit /b 1
    )
)

REM Run deployment checks
if "%SKIP_CHECKS%"=="false" (
    echo Running deployment checks...
    call node scripts/deployment_checklist.js
    if %ERRORLEVEL% neq 0 (
        echo Deployment checks failed. Fix the issues or run with --skip-checks to bypass.
        exit /b 1
    )
    echo √ Deployment checks passed
)

REM Check git status
echo Checking git status...
for /f %%i in ('git status --porcelain ^| find /v /c ""') do set CHANGED_FILES=%%i
if %CHANGED_FILES% neq 0 (
    echo You have uncommitted changes:
    git status --short
    
    set /p REPLY=Do you want to stage, commit, and push these changes? (y/n) 
    if /i "!REPLY!"=="y" (
        REM Prompt for commit message
        set /p COMMIT_MESSAGE=Enter commit message: 
        
        REM Stage and commit changes
        echo Staging and committing changes...
        git add .
        git commit -m "!COMMIT_MESSAGE!"
        if %ERRORLEVEL% neq 0 (
            echo Error: Failed to commit changes
            exit /b 1
        )
        echo √ Changes committed
    ) else (
        echo Warning: You have uncommitted changes that won't be deployed
    )
)

REM Pull latest changes to avoid conflicts
echo Pulling latest changes from %BRANCH%...
git pull origin %BRANCH%
if %ERRORLEVEL% neq 0 (
    echo Error: Failed to pull latest changes. Resolve conflicts and try again.
    exit /b 1
)
echo √ Latest changes pulled

REM Validate local build
echo Validating local build...
cd frontend

REM Clear build cache if requested
if "%CLEAR_CACHE%"=="true" (
    echo Clearing Next.js build cache...
    if exist ".next" (
        rmdir /s /q .next
    )
    echo √ Build cache cleared
)

REM Run build
echo Building frontend...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo Error: Build failed. Fix the build errors and try again.
    cd ..
    exit /b 1
)
echo √ Build successful
cd ..

REM Push changes to GitHub
echo Pushing changes to GitHub...
git push origin %BRANCH%
if %ERRORLEVEL% neq 0 (
    echo Error: Failed to push changes to GitHub. Resolve issues and try again.
    exit /b 1
)
echo √ Changes pushed to GitHub

REM Deploy to Vercel
echo Deploying to Vercel...
cd frontend

REM Check if logged in to Vercel
echo Checking Vercel login status...
vercel whoami >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Not logged in to Vercel. Logging in...
    call vercel login
    if %ERRORLEVEL% neq 0 (
        echo Error: Failed to login to Vercel
        cd ..
        exit /b 1
    )
)

REM Check if GitHub integration is set up
echo Checking GitHub integration...
vercel project ls | findstr /I "%VERCEL_PROJECT_NAME%" >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Project not found. Make sure Vercel GitHub integration is set up.
    echo Alternatively, you can manually deploy from the Vercel dashboard.
    cd ..
    exit /b 1
)

REM Trigger production deployment
echo Triggering production deployment...
call vercel --prod
if %ERRORLEVEL% neq 0 (
    echo Error: Vercel deployment failed
    cd ..
    exit /b 1
)
echo √ Deployment triggered
cd ..

REM Verify deployment
echo.
echo ========================================================================
echo Deployment process complete!
echo.
echo Important post-deployment steps:
echo 1. Verify the deployment on Vercel dashboard
echo 2. Check the application at your production URL
echo 3. Verify API connectivity
echo 4. Test critical user journeys
echo ========================================================================

REM Open browser to deployment URL
set /p REPLY=Would you like to open your deployment in a browser? (y/n) 
if /i "%REPLY%"=="y" (
    set DEPLOY_URL=https://%VERCEL_PROJECT_NAME%.vercel.app
    echo Opening %DEPLOY_URL%
    start %DEPLOY_URL%
)

echo Done!
exit /b 0
