@echo off
echo ======================================================
echo   Auto AGI Builder - Complete Deployment Fix
echo ======================================================
echo.

echo Step 1: Running UI Provider Fix...
echo -------------------------
node fix-ui-provider.js
if %ERRORLEVEL% NEQ 0 (
  echo Error fixing UI Provider!
  pause
  exit /b 1
)

echo.
echo Step 2: Running 404 Issue Fix...
echo -------------------------
node fix-404-issue.js
if %ERRORLEVEL% NEQ 0 (
  echo Error running 404 issue fix!
  pause
  exit /b 1
)

echo.
echo Step 3: Installing Missing Dependencies...
echo -------------------------
node install-dependencies.js
if %ERRORLEVEL% NEQ 0 (
  echo Error installing dependencies!
  pause
  exit /b 1
)

echo.
echo Step 4: Setting deployment variables...
echo -------------------------
set DEPLOYMENT_TARGET=production
set NEXT_PUBLIC_DISABLE_STATIC_GENERATION=true

echo.
echo Step 5: Navigating to frontend directory...
echo -------------------------
cd frontend
if %ERRORLEVEL% NEQ 0 (
  echo Error changing to frontend directory!
  pause
  exit /b 1
)

echo.
echo Step 6: Building project...
echo -------------------------
call npm run build
if %ERRORLEVEL% NEQ 0 (
  echo Error building project!
  echo.
  echo This could be due to remaining dependency issues.
  echo Try running: npm install --force
  echo Then run this script again.
  cd ..
  pause
  exit /b 1
)

echo.
echo Step 7: Deploying to Vercel...
echo -------------------------
echo This step will deploy the project to Vercel.
echo Please make sure you have the Vercel CLI installed and are logged in.
echo.
echo To install Vercel CLI: npm install -g vercel
echo To login: vercel login
echo.
choice /C YN /M "Do you want to proceed with deployment?"
if %ERRORLEVEL% EQU 2 goto :skip_deploy

vercel --prod
if %ERRORLEVEL% NEQ 0 (
  echo Error deploying to Vercel!
  cd ..
  pause
  exit /b 1
)

echo.
echo Step 8: Deployment verification...
echo -------------------------
echo Please visit https://auto-agi-builder-g0wa25wsn-team-agi.vercel.app/ 
echo to verify the site is now accessible with no 404 errors.
echo.
echo If issues persist, you may need to:
echo 1. Check Vercel deployment logs
echo 2. Verify your domain configuration in Vercel dashboard
echo 3. Clear browser cache and try accessing the site again

:skip_deploy
cd ..
echo.
echo ======================================================
echo   Fix and deployment process completed!
echo ======================================================
echo.
echo If you skipped deployment, don't forget to deploy manually:
echo 1. Navigate to frontend directory: cd frontend
echo 2. Run: vercel --prod
echo.
pause
