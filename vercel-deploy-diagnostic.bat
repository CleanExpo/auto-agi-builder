@echo off
setlocal enabledelayedexpansion

echo ===================================
echo Auto AGI Builder - Vercel Deployment Diagnostic
echo ===================================
echo.

:: Initialize log file
set LOGFILE=%~dp0vercel-deploy.log
echo Vercel Deployment Diagnostic Log > %LOGFILE%
echo Started at: %date% %time% >> %LOGFILE%
echo. >> %LOGFILE%

:: Check for Vercel CLI
echo Step 1: Checking Vercel CLI installation...
where vercel >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Vercel CLI not found. Please install it using 'npm install -g vercel'
    echo ERROR: Vercel CLI not found >> %LOGFILE%
    goto :error
) else (
    echo Vercel CLI is installed
    echo Vercel CLI is installed >> %LOGFILE%
)

:: Verify Next.js package in frontend
echo.
echo Step 2: Checking Next.js dependencies...
if not exist "frontend\package.json" (
    echo ERROR: frontend/package.json not found
    echo ERROR: frontend/package.json not found >> %LOGFILE%
    goto :error
)

echo Creating a temporary file to check package.json
type frontend\package.json > temp-pkg.json

:: Check for Next.js dependency
findstr /C:"\"next\":" temp-pkg.json >nul
if %ERRORLEVEL% neq 0 (
    echo WARNING: Next.js dependency not found in package.json
    echo Fixing frontend package.json...
    
    echo {> frontend\package.json
    echo   "name": "auto-agi-builder-frontend",>> frontend\package.json
    echo   "version": "1.0.0",>> frontend\package.json
    echo   "private": true,>> frontend\package.json
    echo   "scripts": {>> frontend\package.json
    echo     "dev": "next dev",>> frontend\package.json
    echo     "build": "next build",>> frontend\package.json
    echo     "export": "next export",>> frontend\package.json
    echo     "start": "next start",>> frontend\package.json
    echo     "lint": "next lint">> frontend\package.json
    echo   },>> frontend\package.json
    echo   "dependencies": {>> frontend\package.json
    echo     "next": "^13.4.10",>> frontend\package.json
    echo     "react": "^18.2.0",>> frontend\package.json
    echo     "react-dom": "^18.2.0">> frontend\package.json
    echo   }>> frontend\package.json
    echo }>> frontend\package.json
    
    echo Fixed frontend package.json with Next.js dependency
    echo Fixed frontend package.json with Next.js dependency >> %LOGFILE%
) else (
    echo Next.js dependency found in package.json
    echo Next.js dependency found in package.json >> %LOGFILE%
)

del temp-pkg.json

:: Check and fix next.config.js
echo.
echo Step 3: Verifying Next.js configuration...
if not exist "frontend\next.config.js" (
    echo Creating next.config.js...
    echo module.exports = {> frontend\next.config.js
    echo   output: 'export',>> frontend\next.config.js
    echo   distDir: 'out'>> frontend\next.config.js
    echo };>> frontend\next.config.js
    echo Created next.config.js
    echo Created next.config.js >> %LOGFILE%
) else (
    echo Fixing next.config.js format...
    echo module.exports = {> frontend\next.config.js
    echo   output: 'export',>> frontend\next.config.js
    echo   distDir: 'out'>> frontend\next.config.js
    echo };>> frontend\next.config.js
    echo Fixed next.config.js
    echo Fixed next.config.js >> %LOGFILE%
)

:: Create root package.json for build command
echo.
echo Step 4: Setting up root package.json...
echo {> package.json
echo   "name": "auto-agi-builder",>> package.json
echo   "version": "1.0.0",>> package.json
echo   "private": true,>> package.json
echo   "scripts": {>> package.json
echo     "vercel-build": "cd frontend && npm install && npm run build && npm run export",>> package.json
echo     "build": "cd frontend && npm install && npm run build && npm run export">> package.json
echo   }>> package.json
echo }>> package.json
echo Created root package.json
echo Created root package.json >> %LOGFILE%

:: Create vercel.json configuration
echo.
echo Step 5: Creating Vercel configuration...
echo {> vercel.json
echo   "version": 2,>> vercel.json
echo   "buildCommand": "npm run build",>> vercel.json
echo   "outputDirectory": "frontend/out",>> vercel.json
echo   "framework": "nextjs",>> vercel.json
echo   "regions": ["sfo1"]>> vercel.json
echo }>> vercel.json
echo Created vercel.json configuration
echo Created vercel.json configuration >> %LOGFILE%

:: Create .vercelignore
echo.
echo Step 6: Setting up .vercelignore...
echo app > .vercelignore
echo requirements.txt >> .vercelignore
echo tests >> .vercelignore
echo docs >> .vercelignore
echo *.py >> .vercelignore
echo Created .vercelignore
echo Created .vercelignore >> %LOGFILE%

:: Setup .vercel/project.json
echo.
echo Step 7: Setting up Vercel project configuration...
if not exist .vercel mkdir .vercel
echo {> .vercel\project.json
echo   "projectId": "prj_abcdefghijklmnopqrstuvwxyz",>> .vercel\project.json
echo   "orgId": "team_abcdefghijklmnopqrstuvwxyz">> .vercel\project.json
echo }>> .vercel\project.json
echo Created .vercel/project.json
echo Created .vercel/project.json >> %LOGFILE%

:: Pre-deployment verification
echo.
echo Step 8: Running pre-deployment verification...
echo Checking for frontend directory...
if not exist frontend\ (
    echo ERROR: frontend directory not found
    echo ERROR: frontend directory not found >> %LOGFILE%
    goto :error
)

echo Checking key files...
if not exist frontend\pages\ (
    echo ERROR: frontend/pages directory not found
    echo ERROR: frontend/pages directory not found >> %LOGFILE%
    goto :error
)

if not exist frontend\pages\index.js (
    echo WARNING: frontend/pages/index.js not found, checking for index.jsx...
    if not exist frontend\pages\index.jsx (
        echo ERROR: No index page found
        echo ERROR: No index page found >> %LOGFILE%
        goto :error
    )
)

echo.
echo ===================================
echo Deployment Diagnostic Complete
echo ===================================
echo.
echo The project has been configured for a successful static site deployment.
echo.
echo Recommended next steps:
echo 1. Run: vercel --prod
echo 2. If deployment fails, review the logs for specific errors
echo.
echo Deployment diagnostic completed successfully >> %LOGFILE%
goto :end

:error
echo.
echo Deployment diagnostic encountered errors. See %LOGFILE% for details.
echo Exited with errors at %date% %time% >> %LOGFILE%

:end
echo.
pause
endlocal
