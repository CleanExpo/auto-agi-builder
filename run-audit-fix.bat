@echo off
echo ===================================================
echo    Running npm audit fix for security vulnerabilities
echo ===================================================

cd deployment\frontend
call npm audit fix --force

echo ===================================================
echo    Audit fix completed
echo ===================================================
cd ..\..\
pause
