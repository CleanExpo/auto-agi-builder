@echo off
echo ===================================
echo Fix Vercel Root Directory Issue
echo ===================================
echo.
echo This script will update the Vercel configuration
echo to properly detect the Next.js project in the frontend directory.
echo.

:: Check if there is a package.json in the root (might be causing confusion)
if exist package.json (
    echo Found package.json in root directory.
    echo Creating backup of root package.json
    copy package.json package.json.bak
    echo Backup created at package.json.bak
)

:: Update vercel.json to specifically set rootDirectory
echo Updating vercel.json to specify frontend as the root directory...

:: Create a new vercel.json with the rootDirectory property
(
echo {
echo   "version": 2,
echo   "name": "auto-agi-builder-staging",
echo   "rootDirectory": "frontend",
echo   "buildCommand": "npm install && npm run build",
echo   "outputDirectory": "out",
echo   "framework": "nextjs",
echo   "regions": ["sfo1"],
echo   "env": {
echo     "ENVIRONMENT": "staging"
echo   },
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
echo           "value": "staging"
echo         }
echo       ]
echo     }
echo   ]
echo }
) > vercel.json

echo.
echo Vercel configuration updated with correct root directory.
echo Next.js detection should now work properly.
echo.
echo ===================================
echo DEPLOYMENT COMMANDS
echo ===================================
echo.
echo Now run the following commands to deploy:
echo.
echo 1. First, fix the project linking: 
echo    ./fix-vercel-link.bat
echo.
echo 2. Then deploy with the fixed configuration:
echo    vercel --prod
echo.

pause
