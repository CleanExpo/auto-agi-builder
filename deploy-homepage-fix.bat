@echo off
echo ===================================
echo DEPLOY HOMEPAGE FIX TO VERCEL
echo ===================================
echo.
echo This script will commit the vercel.json changes and redeploy to Vercel.
echo.

REM Add the modified file to git
echo Adding vercel.json to git...
git add vercel.json

REM Commit the changes
echo Committing changes...
git commit -m "Fix: Update vercel.json with SPA routing configuration"

REM Push to remote repository
echo Pushing to remote repository...
git push origin main

REM Deploy to Vercel production
echo Deploying to Vercel...
vercel --prod

echo.
echo ===================================
echo DEPLOYMENT COMPLETED
echo ===================================
echo.
echo Please check the deployment URL to verify the fix.

pause
