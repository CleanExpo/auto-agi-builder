@echo off
setlocal enabledelayedexpansion

echo ===================================
echo Auto AGI Builder - Vercel Config Fix
echo ===================================
echo.
echo This script will fix JSON parsing issues with vercel.json
echo and allow you to verify the configuration before deployment.
echo.

:: Create log file
set LOGFILE=%~dp0vercel-config-fix.log
echo Vercel Configuration Fix Log > %LOGFILE%
echo Started at: %date% %time% >> %LOGFILE%
echo. >> %LOGFILE%

:: Ensure proper vercel.json exists with correct syntax
echo Creating clean vercel.json configuration...

:: First, backup the existing vercel.json if it exists
if exist vercel.json (
    echo Backing up existing vercel.json...
    copy vercel.json vercel.json.backup
    echo Backed up existing vercel.json to vercel.json.backup >> %LOGFILE%
)

:: Create a new vercel.json file with proper formatting and escaping
echo Creating a properly formatted vercel.json file...
(
echo {
echo   "version": 2,
echo   "name": "auto-agi-builder",
echo   "buildCommand": "cd frontend ^&^& npm install ^&^& npm run build",
echo   "outputDirectory": "frontend/out",
echo   "framework": "nextjs",
echo   "regions": ["sfo1"],
echo   "headers": [
echo     {
echo       "source": "/static/(.*)",
echo       "headers": [
echo         {
echo           "key": "Cache-Control",
echo           "value": "public, max-age=31536000, immutable"
echo         }
echo       ]
echo     },
echo     {
echo       "source": "/(.*)\\\.(js|css|webp|jpg|jpeg|png|svg|ico)$",
echo       "headers": [
echo         {
echo           "key": "Cache-Control",
echo           "value": "public, max-age=86400, stale-while-revalidate=31536000"
echo         }
echo       ]
echo     },
echo     {
echo       "source": "/(.*)",
echo       "headers": [
echo         {
echo           "key": "X-Environment",
echo           "value": "production"
echo         }
echo       ]
echo     }
echo   ]
echo }
) > vercel.json

echo Created clean vercel.json >> %LOGFILE%

:: Verify the JSON syntax
echo.
echo Verifying vercel.json syntax...
node -e "try { require('./vercel.json'); console.log('JSON syntax is valid'); } catch(e) { console.error('Error parsing JSON: ' + e.message); process.exit(1); }"

if %ERRORLEVEL% neq 0 (
    echo ERROR: vercel.json has syntax errors. Please check the file manually.
    echo ERROR: vercel.json has syntax errors >> %LOGFILE%
    goto :error
) else (
    echo vercel.json syntax verified successfully! >> %LOGFILE%
    echo vercel.json syntax verified successfully!
)

:: Create a .vercelignore file
echo.
echo Setting up .vercelignore file...
(
echo # Python files and directories
echo app
echo requirements.txt
echo tests
echo docs
echo *.py
echo __pycache__
echo .pytest_cache
echo .venv
echo venv
echo # Backup files
echo *.backup.*
echo # Development files
echo .git
echo node_modules
echo .DS_Store
echo # Quadrants directory
echo quadrants
) > .vercelignore

echo Created .vercelignore file >> %LOGFILE%

:: Test vercel configuration
echo.
echo Would you like to test the configuration with 'vercel --version' to ensure the CLI is available? (Y/N)
set /p TEST_VERCEL=

if /i "%TEST_VERCEL%" == "Y" (
    echo Testing Vercel CLI...
    vercel --version
    
    if %ERRORLEVEL% neq 0 (
        echo ERROR: Vercel CLI is not available or not installed.
        echo ERROR: Vercel CLI is not available or not installed >> %LOGFILE%
        echo Please install Vercel CLI with: npm i -g vercel
        goto :error
    ) else (
        echo Vercel CLI is available >> %LOGFILE%
        echo Vercel CLI test successful!
    )
)

:: Explain next steps
echo.
echo ===================================
echo CONFIGURATION FIXED
echo ===================================
echo.
echo The vercel.json configuration has been fixed and verified.
echo.
echo You can now:
echo  1. Run deployment scripts (run-deploy-pipeline.bat or fresh-deploy.bat)
echo  2. Manually deploy with 'vercel --prod'
echo  3. Use 'vercel' for development deployment
echo.
echo Completed at: %date% %time% >> %LOGFILE%

goto :end

:error
echo.
echo Configuration fix encountered errors. See %LOGFILE% for details.
echo Configuration fix failed at: %date% %time% >> %LOGFILE%

:end
echo.
echo Thank you for using Auto AGI Builder configuration fix.
echo.
pause
endlocal
