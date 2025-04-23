@echo off
setlocal EnableDelayedExpansion
REM Auto AGI Builder - Vercel Deployment Script
REM This script finalizes the Vercel deployment for the Auto AGI Builder SaaS application

echo ===== Auto AGI Builder - Vercel Deployment =====
echo This script will deploy your application to Vercel.

REM Check if Vercel CLI is installed
where vercel >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Vercel CLI is not installed. Installing...
    npm install -g vercel
    if %ERRORLEVEL% neq 0 (
        echo Failed to install Vercel CLI. Please install it manually.
        exit /b 1
    )
    echo Vercel CLI installed successfully.
)

REM Check if logged in to Vercel
echo Checking Vercel login status...
vercel whoami >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Not logged in to Vercel. Please login:
    vercel login
    if %ERRORLEVEL% neq 0 (
        echo Failed to login to Vercel. Please try again.
        exit /b 1
    )
)
echo Successfully logged in to Vercel.

REM Link project to Vercel
echo Linking project to Vercel...
vercel link
if %ERRORLEVEL% neq 0 (
    echo Failed to link project to Vercel. Please try again.
    exit /b 1
)

REM Set up environment variables
echo Setting up environment variables...
set /p SET_ENV="Would you like to set up environment variables now? (y/n): "

if /i "%SET_ENV%"=="y" (
    REM Check if .env.example exists
    if exist "frontend\.env.example" (
        echo Using frontend\.env.example as a template...
        for /f "tokens=*" %%a in (frontend\.env.example) do (
            REM Skip comments and empty lines
            echo %%a | findstr /b "#" >nul 2>&1 || (
                echo %%a | findstr /r "^$" >nul 2>&1 || (
                    for /f "tokens=1,* delims==" %%b in ("%%a") do (
                        set VAR_NAME=%%b
                        set DEFAULT_VALUE=%%c
                        
                        echo Setting !VAR_NAME! (default: !DEFAULT_VALUE!)
                        set /p VALUE="Enter value for !VAR_NAME! (press Enter to use default): "
                        
                        if "!VALUE!"=="" (
                            set VALUE=!DEFAULT_VALUE!
                        )
                        
                        REM Set environment variable in Vercel
                        vercel env add !VAR_NAME! production
                        echo !VALUE! | vercel env add !VAR_NAME! production
                    )
                )
            )
        )
    ) else (
        echo No .env.example file found. Please set up environment variables manually in the Vercel dashboard.
    )
)

REM Run pre-deployment checks
echo Running pre-deployment checks...
node scripts/deployment_checklist.js
if %ERRORLEVEL% neq 0 (
    echo Warning: Pre-deployment checks failed. Do you want to continue anyway? (y/n)
    set /p CONTINUE=""
    if /i not "%CONTINUE%"=="y" (
        echo Deployment aborted.
        exit /b 1
    )
)

REM Deploy to Vercel
echo Deploying to Vercel...
vercel --prod
if %ERRORLEVEL% neq 0 (
    echo Failed to deploy to Vercel. Please check the error message and try again.
    exit /b 1
)

echo ===== Deployment Complete =====
echo Your Auto AGI Builder application has been successfully deployed to Vercel.
echo Please check the Vercel dashboard for deployment status and URL.
