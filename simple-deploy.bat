@echo off
echo ===================================
echo SIMPLE VERCEL STATIC SITE DEPLOYMENT
echo ===================================
echo.

REM Clean up previous Vercel configuration if it exists
if exist .vercel (
  echo Removing existing Vercel configuration...
  rd /s /q .vercel
)

REM Create .vercelignore file to control what gets deployed
echo Creating .vercelignore file...
echo node_modules > .vercelignore
echo .env >> .vercelignore
echo .env.* >> .vercelignore
echo !frontend/.env.production >> .vercelignore
echo .git >> .vercelignore
echo app/ >> .vercelignore
echo frontend/ >> .vercelignore
echo !frontend/pages >> .vercelignore
echo !frontend/components >> .vercelignore
echo !frontend/styles >> .vercelignore
echo !frontend/public >> .vercelignore
echo quadrants/ >> .vercelignore
echo *.py >> .vercelignore
echo !public/ >> .vercelignore

REM Update vercel.json with API routing and public access
echo Creating vercel.json for proper configuration...
echo { > vercel.json
echo   "version": 2, >> vercel.json
echo   "public": true, >> vercel.json
echo   "buildCommand": null, >> vercel.json
echo   "outputDirectory": "public", >> vercel.json
echo   "rewrites": [ >> vercel.json
echo     { "source": "/api/(.*)", "destination": "https://api-auto-agi-builder.vercel.app/api/$1" }, >> vercel.json
echo     { "source": "/(.*)", "destination": "/index.html" } >> vercel.json
echo   ] >> vercel.json
echo } >> vercel.json

REM Deploy using the simplest method possible
echo Deploying static site to Vercel...
vercel --public --yes

echo.
echo ===================================
echo Deployment process initiated
echo ===================================
echo.
echo Note: You may need to complete the login process in the browser if prompted.
echo After deployment, you'll get a URL to access your site.
echo.

pause
