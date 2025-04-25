@echo off
echo ===================================
echo DIRECT STATIC DEPLOYMENT TO VERCEL
echo ===================================
echo.

REM Set token for new team
set VERCEL_TOKEN=Pw7I99gIA8XMPDsfmENaZ7Nq

echo Using new token: %VERCEL_TOKEN%
echo.

REM Create a clean setup by removing any existing Vercel config
if exist .vercel (
  echo Removing existing Vercel configuration...
  rd /s /q .vercel
)

REM Create .vercelignore file
echo Creating .vercelignore file...
echo node_modules > .vercelignore
echo .env >> .vercelignore
echo .env.* >> .vercelignore
echo .git >> .vercelignore
echo app/ >> .vercelignore
echo frontend/ >> .vercelignore
echo quadrants/ >> .vercelignore
echo *.py >> .vercelignore
echo *.js >> .vercelignore
echo !public/ >> .vercelignore

REM Update vercel.json with public access
echo Creating minimal vercel.json...
echo { > vercel.json
echo   "version": 2, >> vercel.json
echo   "public": true, >> vercel.json
echo   "buildCommand": null, >> vercel.json
echo   "outputDirectory": "public", >> vercel.json
echo   "rewrites": [ >> vercel.json
echo     { "source": "/(.*)", "destination": "/index.html" } >> vercel.json
echo   ] >> vercel.json
echo } >> vercel.json

REM Install Vercel CLI if not already installed
where vercel >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo Installing Vercel CLI...
  npm install -g vercel
)

REM Deploy directly with no linking to avoid previous configuration issues
echo Deploying static site directly to Vercel...
vercel --token %VERCEL_TOKEN% --public --confirm

echo.
echo ===================================
echo Deployment Completed
echo ===================================
echo.
echo If the deployment was successful, your site should now be accessible at:
echo - The deployment URL shown above
echo - https://auto-agi-builder.vercel.app (if that's the project name)
echo.
echo If you're still experiencing access issues:
echo 1. Check the deployment URL in an incognito/private window
echo 2. Note the deployment URL and check if it's publicly accessible
echo.
echo Remember to check your Vercel dashboard as well.
echo.

pause
