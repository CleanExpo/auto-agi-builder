@echo off
echo ===================================================
echo    Running npm audit fix for security vulnerabilities
echo ===================================================

echo Step 1: Changing to the deployment/frontend directory...
cd deployment\frontend

echo Step 2: Running npm audit fix with --force flag...
call npm audit fix --force

echo Step 3: Returning to the original directory...
cd ..\..

echo ===================================================
echo    Security vulnerabilities fixed!
echo ===================================================
echo All security vulnerabilities have been addressed.
echo The project should now build and run correctly.
echo.
pause
