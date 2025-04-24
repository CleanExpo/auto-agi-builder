@echo off
echo ===================================================
echo        Auto AGI Builder - Deployment Script
echo ===================================================

echo.
echo Checking prerequisites for deployment...

REM Check if git is installed
git --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Git is not installed or not in PATH.
    echo Please install Git from https://git-scm.com/downloads
    pause
    exit /b 1
)

REM Check if required files exist
if not exist "autonomous_builder_modular.py" (
    echo ERROR: autonomous_builder_modular.py is missing!
    echo Cannot proceed with deployment.
    pause
    exit /b 1
)

echo.
echo Which deployment target would you like to use?
echo.
echo 1. Vercel (recommended)
echo 2. Netlify
echo 3. AWS
echo 4. Custom
echo.

set /p DEPLOY_TARGET="Enter your choice (1-4): "

if "%DEPLOY_TARGET%"=="1" (
    set TARGET=vercel
    echo.
    echo Checking if Vercel CLI is installed...
    vercel --version >nul 2>&1
    if %ERRORLEVEL% neq 0 (
        echo Vercel CLI is not installed. Installing...
        npm install -g vercel
    ) else (
        echo Vercel CLI is already installed.
    )
) else if "%DEPLOY_TARGET%"=="2" (
    set TARGET=netlify
    echo.
    echo Checking if Netlify CLI is installed...
    netlify --version >nul 2>&1
    if %ERRORLEVEL% neq 0 (
        echo Netlify CLI is not installed. Installing...
        npm install -g netlify-cli
    ) else (
        echo Netlify CLI is already installed.
    )
) else if "%DEPLOY_TARGET%"=="3" (
    set TARGET=aws
    echo.
    echo Checking if AWS CLI is installed...
    aws --version >nul 2>&1
    if %ERRORLEVEL% neq 0 (
        echo AWS CLI is not installed.
        echo Please install AWS CLI from https://aws.amazon.com/cli/
        pause
        exit /b 1
    ) else (
        echo AWS CLI is already installed.
    )
) else if "%DEPLOY_TARGET%"=="4" (
    echo.
    set /p TARGET="Enter your custom deployment target: "
) else (
    echo Invalid choice. Exiting.
    pause
    exit /b 1
)

echo.
echo Preparing project for deployment...

REM Check if the project has been set up
if not exist "frontend\package.json" (
    echo WARNING: Frontend package.json not found. Running project setup first...
    echo.
    
    set /p PROJECT_NAME="Enter project name for setup: "
    python autonomous_builder_modular.py setup --name %PROJECT_NAME%
    
    if %ERRORLEVEL% neq 0 (
        echo ERROR: Project setup failed.
        pause
        exit /b 1
    )
    
    echo Project setup completed.
)

echo.
echo Running deployment to %TARGET%...
python autonomous_builder_modular.py deploy --target %TARGET%

if %ERRORLEVEL% neq 0 (
    echo.
    echo ERROR: Deployment failed. Please check the errors above.
    pause
    exit /b 1
)

echo.
echo ===================================================
echo Deployment completed successfully!
echo.
echo Your application has been deployed to %TARGET%.
echo.
echo If you need to check the deployment status or make changes,
echo please refer to the %TARGET% dashboard or documentation.
echo ===================================================
echo.

pause
