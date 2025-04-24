@echo off
echo ===================================
echo Auto AGI Builder Domain Verification
echo ===================================
echo.

echo Running domain verification...
node verify-domain-status.js

echo.
echo Verification completed!
echo.
echo Press any key to exit...
pause > nul
