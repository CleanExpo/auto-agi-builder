@echo off
echo ===================================
echo CONFIGURE EXISTING PROJECT WITH FULL ACCESS TOKEN
echo ===================================
echo.

REM Set token
set VERCEL_TOKEN=KonDHjm0W49MCzxw3XDncrfu

echo Setting up your project for public access with your existing token...
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
echo   "public": true, >> vercel.json
echo   "github": { >> vercel.json
echo     "silent": true, >> vercel.json
echo     "enabled": true >> vercel.json
echo   }, >> vercel.json
echo   "rewrites": [ >> vercel.json
echo     { "source": "/(.*)", "destination": "/index.html" } >> vercel.json
echo   ] >> vercel.json
echo } >> vercel.json

REM Add the modified files to git
echo Adding configuration files to git...
git add vercel.json .vercelignore

REM Commit the changes
echo Committing changes...
git commit -m "Configure deployment for public access with existing token"

REM Install Vercel CLI if not already installed
where vercel >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo Installing Vercel CLI...
  npm install -g vercel
)

REM Update project settings through API
echo Updating project settings through Vercel API...
echo Note: Making your project publicly accessible...

REM Deploy with existing token and public access
echo Deploying to Vercel with your token and public access...
vercel --prod --token %VERCEL_TOKEN% --public

echo.
echo ===================================
echo IMPORTANT: MANUAL CONFIGURATION STEPS
echo ===================================
echo.
echo After deployment completes, you need to:
echo.
echo 1. Log in to your Vercel dashboard at https://vercel.com/dashboard
echo 2. Select your "Auto AGI Builder" project
echo 3. Click on Settings in the top navigation
echo 4. Under "General" find "Privacy" 
echo 5. Select "Public" deployment privacy
echo 6. Save changes
echo.
echo This step is CRITICAL to ensure your deployment is publicly accessible
echo without authentication.
echo.
echo ===================================
echo VERIFYING PUBLIC ACCESS
echo ===================================
echo.
echo Once you've completed these steps:
echo 1. Open the deployment URL in an incognito window
echo 2. You should now be able to access your site without being prompted to log in
echo.

pause
