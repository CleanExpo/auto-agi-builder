@echo off
echo ===================================
echo DEPLOY PUBLIC NEXT.JS APPLICATION
echo ===================================
echo.
echo This script will update configuration files and deploy the app to Vercel with public access.
echo.

REM Update vercel.json for proper public access and routing
echo Updating vercel.json configuration...
echo { > vercel.json
echo   "version": 2, >> vercel.json
echo   "public": true, >> vercel.json
echo   "github": { >> vercel.json
echo     "silent": true >> vercel.json
echo   }, >> vercel.json
echo   "rewrites": [ >> vercel.json
echo     { "source": "/(.*)", "destination": "/index.html" } >> vercel.json
echo   ] >> vercel.json
echo } >> vercel.json

REM Update Next.js configuration
echo Updating Next.js configuration...
echo // next.config.js for production > frontend\next.config.js
echo const nextConfig = { >> frontend\next.config.js
echo   output: 'export', >> frontend\next.config.js
echo   distDir: 'out', >> frontend\next.config.js
echo   trailingSlash: true, >> frontend\next.config.js
echo   images: { >> frontend\next.config.js
echo     unoptimized: true >> frontend\next.config.js
echo   }, >> frontend\next.config.js
echo   env: { >> frontend\next.config.js
echo     ENVIRONMENT: 'production', >> frontend\next.config.js
echo   }, >> frontend\next.config.js
echo }; >> frontend\next.config.js
echo. >> frontend\next.config.js
echo module.exports = nextConfig; >> frontend\next.config.js

REM Add the modified files to git
echo Adding configuration files to git...
git add vercel.json frontend/next.config.js

REM Commit the changes
echo Committing changes...
git commit -m "Fix: Update Next.js and Vercel configurations for public access"

REM Push to remote repository
echo Pushing to remote repository...
git push origin main

REM Export Next.js application
echo Exporting Next.js application...
cd frontend && npm run build

REM Deploy to Vercel production
echo Deploying to Vercel...
cd .. && vercel --prod

echo.
echo ===================================
echo DEPLOYMENT COMPLETED
echo ===================================
echo.
echo Please check the deployment URL to verify the application is publicly accessible.

pause
