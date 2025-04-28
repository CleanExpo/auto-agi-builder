@echo off
echo ========================================================
echo Auto AGI Builder - Domain Configuration Fix Tool
echo ========================================================
echo.
echo This tool will fix common issues with Vercel domain configurations
echo and help resolve 404 errors on your custom domain.
echo.
echo IMPORTANT: Make sure you have Node.js installed on your system.
echo.
echo Press any key to continue...
pause > nul

echo.
echo Running domain configuration fix...
echo.

node fix-domain-issue.js

echo.
echo ========================================================
echo Script execution completed!
echo.
echo If the script ran successfully, you should now:
echo 1. Commit and push these changes to your repository
echo 2. Trigger a new Vercel deployment
echo 3. Run "node verify-domains.js" to check domain status
echo 4. Wait up to 24 hours for SSL certificates to fully provision
echo ========================================================
echo.
echo Press any key to exit...
pause > nul
