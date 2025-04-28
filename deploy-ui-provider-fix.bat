@echo off
echo ========================================================
echo Auto AGI Builder - Deploy UI Provider Fix
echo ========================================================
echo.
echo This script will commit and push the UI Provider fix
echo to your repository, which will trigger a new Vercel deployment.
echo.
echo Press any key to continue...
pause > nul

echo.
echo Adding files to git...
git add deployment/frontend/contexts/UIContext.js
git add deployment/frontend/next.config.js
git add fix-ui-provider.js
git add run-ui-provider-fix.bat

echo.
echo Committing changes...
git commit -m "Fix: Resolve useUI must be used within a UIProvider error for SSR"

echo.
echo Pushing changes to repository...
git push

echo.
echo ========================================================
echo Push completed! 
echo.
echo The UI Provider fix has been pushed to your repository and should
echo trigger a new Vercel deployment. The fix:
echo.
echo 1. Added default values to UIContext to prevent SSR errors
echo 2. Modified the useUI hook to be SSR-compatible
echo 3. Updated environment settings to prevent static optimization issues
echo.
echo Your site should now properly render without the 404 errors.
echo Allow 5-10 minutes for the deployment to complete.
echo ========================================================
echo.
echo Press any key to exit...
pause > nul
