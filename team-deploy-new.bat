@echo off
echo ===================================
echo DEPLOY TO VERCEL TEAM PROJECT with New Token
echo ===================================
echo.

REM Set your token and team scope here
set VERCEL_TOKEN=Pw7I99gIA8XMPDsfmENaZ7Nq
set /p VERCEL_SCOPE=Enter your Vercel team name: 

REM Create .vercelignore file
echo Creating .vercelignore file...
echo node_modules > .vercelignore
echo .env >> .vercelignore
echo .env.* >> .vercelignore
echo .git >> .vercelignore

REM Update vercel.json
echo Updating vercel.json...
echo { > vercel.json
echo   "version": 2, >> vercel.json
echo   "public": true, >> vercel.json
echo   "github": { >> vercel.json
echo     "silent": true, >> vercel.json
echo     "enabled": true >> vercel.json
echo   }, >> vercel.json
echo   "rewrites": [ >> vercel.json
echo     { "source": "/(.*)", "destination": "/index.html" } >> vercel.json
echo   ] >> vercel.json
echo } >> vercel.json

REM Create production environment for frontend
echo Creating frontend/.env.production...
if not exist frontend mkdir frontend
echo NEXT_PUBLIC_API_URL=https://api.yourdomain.com > frontend\.env.production
echo NEXT_PUBLIC_ENVIRONMENT=production >> frontend\.env.production

REM Fix Next.js config
echo Updating next.config.js...
if exist frontend\next.config.js (
  echo const nextConfig = { > frontend\next.config.js.new
  echo   output: 'export', >> frontend\next.config.js.new
  echo   distDir: 'out', >> frontend\next.config.js.new
  echo   trailingSlash: true, >> frontend\next.config.js.new
  echo   images: { >> frontend\next.config.js.new
  echo     unoptimized: true >> frontend\next.config.js.new
  echo   } >> frontend\next.config.js.new
  echo }; >> frontend\next.config.js.new
  echo. >> frontend\next.config.js.new
  echo module.exports = nextConfig; >> frontend\next.config.js.new
  
  move /y frontend\next.config.js.new frontend\next.config.js
)

REM Add the modified files to git
echo Adding configuration files to git...
git add vercel.json .vercelignore frontend\.env.production
if exist frontend\next.config.js git add frontend\next.config.js
if exist public\index.html git add public\index.html

REM Commit the changes
echo Committing changes...
git commit -m "Configure deployment for team access with new token"

REM Push to remote repository
echo Pushing to remote repository...
git push origin main

REM Install Vercel CLI if not already installed
where vercel >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo Installing Vercel CLI...
  npm install -g vercel
)

REM Link project to team
echo Linking project to team...
vercel link --scope %VERCEL_SCOPE% --confirm --token %VERCEL_TOKEN%

REM Deploy to team project with public access
echo Deploying to Vercel team project with public access...
vercel --prod --token %VERCEL_TOKEN% --scope %VERCEL_SCOPE% --public

echo.
echo ===================================
echo POST-DEPLOYMENT VERIFICATION
echo ===================================
echo.
echo After deployment completes, please:
echo.
echo 1. Visit the Vercel Dashboard: https://vercel.com/dashboard
echo 2. Select your team: %VERCEL_SCOPE%
echo 3. Click on your project
echo 4. Go to Settings > General
echo 5. Under "Privacy" verify that "Public" is selected
echo.
echo Test your deployment URL in an incognito/private window
echo to ensure it loads without requiring authentication.
echo.
echo ===================================
echo DEPLOYMENT COMPLETED
echo ===================================

pause
