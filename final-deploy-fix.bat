@echo off
echo ===================================
echo FINAL DEPLOYMENT FIX
echo ===================================
echo.
echo This script combines all fixes for the deployment issues:
echo 1. Fixes the vercel.json configuration
echo 2. Fixes the project linking
echo 3. Fixes the Next.js detection
echo.

:: Check if .vercel directory exists and remove it
if exist .vercel (
    echo Found .vercel directory. Removing...
    rmdir /s /q .vercel
    echo .vercel directory removed successfully.
) else (
    echo No .vercel directory found.
)

:: Update vercel.json with proper configuration
echo Updating vercel.json with proper configuration...
(
echo {
echo   "version": 2,
echo   "name": "auto-agi-builder",
echo   "buildCommand": "npm run build",
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
echo       "source": "/(.*)\\.(js|css|webp|jpg|jpeg|png|svg|ico)$",
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

echo Vercel configuration updated with proper syntax.

:: Create .vercelignore to exclude unnecessary files
echo Creating .vercelignore file...
(
echo node_modules
echo .git
echo .gitignore
echo .env
echo app/
echo launch_preparation/
echo deployment/
echo scripts/
echo docs/
echo tests/
echo e2e-tests/
echo **/*.bat
echo **/*.sh
echo **/*.ps1
echo **/*.py
echo !frontend/**/*
echo !package.json
echo !vercel.json
) > .vercelignore

echo .vercelignore file created.

:: Verify JSON syntax
echo.
echo Validating JSON syntax...
node -e "try { const data = require('./vercel.json'); console.log('JSON is valid!'); process.exit(0); } catch(e) { console.error('Error: ' + e.message); process.exit(1); }"

if %ERRORLEVEL% neq 0 (
    echo ERROR: The vercel.json still has syntax issues.
    goto :error
) else (
    echo JSON validation successful!
)

echo.
echo All fixes have been applied. Now initializing Vercel project link...
echo.
echo ===================================
echo VERCEL PROJECT SETUP
echo ===================================
echo.
echo You will now be prompted to:
echo  1. Login to Vercel (if not already logged in)
echo  2. Select the scope/team for your project
echo  3. Set up a new project
echo.
echo Press any key to continue...
pause > nul

:: Run vercel to set up the project
echo.
echo Running 'vercel' to initialize project...
vercel

if %ERRORLEVEL% neq 0 (
    echo.
    echo Project setup encountered an error.
    goto :error
) else (
    echo.
    echo Project setup completed successfully.
)

echo.
echo ===================================
echo DEPLOYING TO PRODUCTION
echo ===================================
echo.
echo Now deploying to production...
echo.
vercel --prod

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
    echo Your Auto AGI Builder has been deployed to Vercel with all fixes applied.
    echo.
)

goto :end

:error
echo.
echo Deployment process failed.
echo.

:end
pause
