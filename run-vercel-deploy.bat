@echo off
echo ========================================================
echo Auto AGI Builder - Comprehensive Vercel Deployment Fix
echo ========================================================
echo.
echo This script will:
echo 1. Apply comprehensive fixes to UI Provider and SSR issues
echo 2. Rebuild the project with optimized settings
echo 3. Deploy to Vercel with proper configuration
echo.
echo Press any key to continue...
pause > nul

echo.
echo Step 1: Applying comprehensive fixes...
node fix-vercel-deployment.js

if %ERRORLEVEL% NEQ 0 (
  echo Error: Fix script failed with error code %ERRORLEVEL%
  exit /b %ERRORLEVEL%
)

echo.
echo Step 2: Rebuilding the project...
cd deployment/frontend
call npm run build

if %ERRORLEVEL% NEQ 0 (
  echo Error: Build failed with error code %ERRORLEVEL%
  cd ../..
  exit /b %ERRORLEVEL%
)

echo.
echo Step 3: Preparing for deployment...
cd ../..

echo.
echo Step 4: Committing changes to repository...
git add deployment/frontend/contexts/UIContext.js
git add deployment/frontend/pages/_app.js
git add deployment/frontend/components/common/ErrorBoundary.js
git add deployment/frontend/next.config.js
git add deployment/frontend/vercel.json
git add fix-vercel-deployment.js
git add run-vercel-deploy.bat

git commit -m "Fix: Comprehensive solution for UIProvider SSR errors and Vercel deployment"

echo.
echo Step 5: Pushing changes to repository to trigger Vercel deployment...
git push

echo.
echo ========================================================
echo Deployment process completed! 
echo.
echo The comprehensive fix has been deployed to Vercel.
echo Key improvements:
echo.
echo 1. Enhanced UIContext with robust SSR compatibility
echo 2. Completely restructured provider architecture
echo 3. Added error boundary for improved error handling
echo 4. Optimized Vercel configuration for Next.js
echo 5. Disabled problematic static optimization
echo.
echo Your site should now properly render without 404 errors.
echo Deployment will take 5-10 minutes to fully propagate.
echo ========================================================
echo.
echo Press any key to exit...
pause > nul
