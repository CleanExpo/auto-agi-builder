@echo off
echo ===================================
echo LIGHTWEIGHT FRONTEND DEPLOYMENT
echo ===================================
echo.
echo This script creates a minimal deployment that only includes
echo the frontend files and ignores everything else to stay
echo under the 10MB upload limit.
echo.

:: Check if .vercel directory exists and remove it
if exist .vercel (
    echo Found .vercel directory. Removing...
    rmdir /s /q .vercel
    echo .vercel directory removed successfully.
) else (
    echo No .vercel directory found.
)

:: Create a very strict .vercelignore file that ignores everything except frontend
echo Creating strict .vercelignore file...
(
echo *
echo !frontend/**/*
echo !package.json
echo !vercel.json
) > .vercelignore

echo Strict .vercelignore created. This will only include frontend files.

:: Update vercel.json with minimal configuration
echo Creating minimal vercel.json...
(
echo {
echo   "version": 2,
echo   "buildCommand": "npm run build",
echo   "outputDirectory": "frontend/out",
echo   "framework": "nextjs"
echo }
) > vercel.json

echo Minimal vercel.json created.

:: Delete any large files in frontend that aren't needed (fixed syntax)
echo Checking for unnecessarily large files...

:: Check for node_modules
if exist "frontend\node_modules" (
    echo Removing frontend/node_modules (will be reinstalled during build)...
    rmdir /s /q "frontend\node_modules"
)

:: Check for .next directory (fixed syntax by quoting the path)
if exist "frontend\.next" (
    echo Removing frontend/.next build cache...
    rmdir /s /q "frontend\.next"
)

:: Create a temporary version of the package.json that only has what's needed
echo Creating minimal root package.json...
(
echo {
echo   "name": "auto-agi-builder",
echo   "version": "1.0.0",
echo   "private": true,
echo   "scripts": {
echo     "build": "cd frontend && npm install && npm run build",
echo     "start": "cd frontend && npm run start"
echo   },
echo   "dependencies": {
echo     "next": "^13.5.2"
echo   }
echo }
) > package.json

echo Root package.json simplified.

echo.
echo ===================================
echo DEPLOYING FRONTEND ONLY
echo ===================================
echo.
echo This will link to your Vercel project and deploy only the frontend.
echo Files outside the frontend directory will be ignored.
echo.
echo Press any key to initialize project...
pause > nul

:: Run vercel to set up the project
echo.
echo Running 'vercel' to initialize project...
vercel --confirm

if %ERRORLEVEL% neq 0 (
    echo.
    echo Project setup encountered an error.
    goto :error
) else (
    echo.
    echo Project initialization completed successfully.
)

echo.
echo ===================================
echo DEPLOYING TO PRODUCTION
echo ===================================
echo.
echo Now deploying to production...
echo.
vercel --prod --confirm

if %ERRORLEVEL% neq 0 (
    echo.
    echo Deployment encountered an error.
    echo Please check the logs above for details.
    goto :error
) else (
    echo.
    echo ===================================
    echo DEPLOYMENT SUCCESSFUL
    echo ===================================
    echo.
    echo Your Auto AGI Builder frontend has been deployed to Vercel.
    echo.
)

goto :end

:error
echo.
echo Deployment process failed.
echo.

:end
pause
