@echo off
echo ========================================================
echo Auto AGI Builder - Commit and Push Domain Fixes
echo ========================================================
echo.
echo This script will commit and push all the domain configuration
echo fixes to your repository, which will trigger a new Vercel deployment.
echo.
echo Press any key to continue...
pause > nul

echo.
echo Adding files to git...
git add fix-domain-issue.js verify-domains.js run-domain-fix.bat DOMAIN-TROUBLESHOOTING-GUIDE.md

echo.
echo Committing changes...
git commit -m "Fix domain configuration for Vercel deployment"

echo.
echo Pushing changes to repository...
git push

echo.
echo ========================================================
echo Push completed! 
echo.
echo The changes have been pushed to your repository and should
echo trigger a new Vercel deployment. Please wait a few minutes
echo for the deployment to complete, then we can check the results.
echo ========================================================
echo.
echo Press any key to exit...
pause > nul
