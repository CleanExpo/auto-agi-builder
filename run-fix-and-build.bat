@echo off
echo ===================================================
echo    UI Provider SSR Fix and Build Automation
echo ===================================================

echo Step 1: Running PowerShell fix script...
call run-powershell-fix.bat

echo.
echo Step 2: Building the project with fixes applied...
call build-project.bat

echo.
echo ===================================================
echo    All operations completed!
echo ===================================================
echo The UIProvider issue has been fixed and the project built.
echo Check the console output above for any errors.
pause
