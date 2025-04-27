@echo off
REM AUTO AGI BUILDER - Complete Context Provider Error Fix Script
REM This batch file runs the fix-all-providers.js script to resolve
REM all React context provider issues in Next.js prerendering

echo ========================================================================
echo         AUTO AGI BUILDER - COMPREHENSIVE CONTEXT PROVIDERS FIX
echo ========================================================================
echo.
echo This script performs a comprehensive fix for NextJS build errors by:
echo.
echo  1. Removing redundant ProjectProvider wrapper in _app.js
echo  2. Verifying correct provider hierarchy in CombinedProvider
echo  3. Checking for proper exports in all context files
echo  4. Creating backups of all modified files
echo.
echo This fix addresses both the "ProjectProvider is not defined" error
echo and potential provider hierarchy issues that may cause other errors.
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause > nul

echo.
echo Running comprehensive context provider fix script...
echo.

REM Run the fix script
node "%USERPROFILE%\Desktop\fix-all-providers.js"

REM Check exit code
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================================
    echo CONTEXT PROVIDER FIXES APPLIED SUCCESSFULLY!
    echo.
    echo All context provider issues have been addressed. The _app.js file
    echo has been updated to remove redundant ProjectProvider wrapper and the
    echo context provider hierarchy has been verified.
    echo.
    echo To test the fixes, try building the project with:
    echo   cd deployment/frontend && npm run build
    echo.
    echo If issues persist, check the console output above for warnings that
    echo may require manual intervention.
    echo ========================================================================
) else (
    echo.
    echo ========================================================================
    echo CONTEXT PROVIDER FIX APPLICATION ENCOUNTERED ISSUES
    echo.
    echo The script encountered problems. You may need to manually fix:
    echo.
    echo 1. Remove the redundant ProjectProvider wrapper in _app.js
    echo 2. Ensure proper nesting order in contexts/index.js (CombinedProvider)
    echo 3. Check that all context files export their hooks and providers correctly
    echo.
    echo See the log output above for more specific details on what needs fixing.
    echo ========================================================================
)

echo.
echo Backups of modified files have been created with the .backup extension.
echo.
echo Press any key to exit...
pause > nul
