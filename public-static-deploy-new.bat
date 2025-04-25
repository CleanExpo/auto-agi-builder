@echo off
echo ===================================
echo DEPLOY STATIC HTML SITE TO VERCEL WITH NEW TOKEN
echo ===================================
echo.

REM Set token
set VERCEL_TOKEN=Pw7I99gIA8XMPDsfmENaZ7Nq

echo Setting up a static site deployment with your new token...
echo.

REM Create .vercelignore file
echo Creating .vercelignore file...
echo node_modules > .vercelignore
echo .env >> .vercelignore
echo .env.* >> .vercelignore
echo .git >> .vercelignore

REM Update vercel.json with public access
echo Updating vercel.json...
echo { > vercel.json
echo   "version": 2, >> vercel.json
echo   "public": true >> vercel.json
echo } >> vercel.json

REM Add the modified files to git
echo Adding configuration files to git...
git add vercel.json .vercelignore
if exist public\index.html git add public\index.html

REM Commit the changes
echo Committing changes...
git commit -m "Configure static-site with public access"

REM Install Vercel CLI if not already installed
where vercel >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo Installing Vercel CLI...
  npm install -g vercel
)

REM Deploy directly as a fresh project with no linking to avoid scope issues
echo Deploying static site to Vercel with public access...
vercel --token %VERCEL_TOKEN% --public --prod --yes

echo.
echo ===================================
echo Deployment Completed
echo ===================================
echo.
echo Your static site should now be deployed to Vercel with public access.
echo.
echo If you're still experiencing access issues:
echo.
echo 1. Check the deployment URL in an incognito/private window
echo 2. Ensure vercel.json has the "public": true setting
echo 3. Try one of these options:
echo    a. Login to Vercel and create a team, then link your project to that team
echo    b. Try deploying without any linking (current approach)
echo.
echo See VERCEL-PUBLIC-ACCESS-GUIDE.md for additional troubleshooting options.
echo.

pause
