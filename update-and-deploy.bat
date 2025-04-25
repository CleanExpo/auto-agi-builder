@echo off
echo ===================================
echo UPDATING AND DEPLOYING TO VERCEL
echo ===================================
echo.

REM Store environment variables
set VERCEL_TOKEN=Pw7I99gIA8XMPDsfmENaZ7Nq
set VERCEL_PROJECT_ID=prj_wuOhCATnCSZnmDCu74ukhwo8WARW
set VERCEL_ORG_ID=team_QkT75lccZOIUTtTXahk4QKVm
set PROJECT_NAME=auto-agi-landing

echo Using Vercel Token: %VERCEL_TOKEN%
echo Using Project ID: %VERCEL_PROJECT_ID%
echo Using Org ID: %VERCEL_ORG_ID%
echo Using Project Name: %PROJECT_NAME%
echo.

REM Clean up previous Vercel configuration
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

REM Install Vercel CLI if not already installed
where vercel >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo Installing Vercel CLI...
  npm install -g vercel
)

REM Deploy with simplified approach, no scope
echo Deploying to Vercel with simplified approach...
vercel --token %VERCEL_TOKEN% --public --yes

echo.
echo ===================================
echo Deployment Completed
echo ===================================
echo.
echo Your site should now be accessible at:
echo - https://%PROJECT_NAME%.vercel.app
echo.
echo For full access capabilities, use: 
echo vercel --token %VERCEL_TOKEN% alias set [deployment-url] %PROJECT_NAME%.vercel.app
echo.

pause
