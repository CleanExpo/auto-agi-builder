@echo off
REM AUTO AGI BUILDER - SIMPLIFIED UI PROVIDER FIX
REM This batch file runs the simplified-ui-context-fix.js script

echo ========================================================================
echo              AUTO AGI BUILDER - SIMPLIFIED UI PROVIDER FIX
echo ========================================================================
echo.
echo This script will fix the "useUI must be used within a UIProvider" error 
echo by performing the following actions:
echo.
echo  1. Modifying AuthContext.js to accept toast as a prop
echo  2. Updating _app.js to have a clean provider hierarchy
echo  3. Creating backups of all modified files
echo.
echo This is a simplified version of the fix that focuses only on the
echo core issue without adding error boundaries or node version handling.
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause > nul

echo.
echo Running simplified UI context fix...
echo.

REM Navigate to project directory
cd /d "C:\Users\PhillMcGurk\OneDrive - Disaster Recovery\1111\Auto AGI Builder"

REM Create logs directory if it doesn't exist
if not exist "logs" mkdir logs

REM Run the simplified fix script
node "%USERPROFILE%\Desktop\simplified-ui-context-fix.js"

REM Check exit code
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================================
    echo SIMPLIFIED FIX APPLIED SUCCESSFULLY!
    echo.
    echo The UIProvider circular dependency has been fixed. Backups of the original
    echo files have been created with the .bak extension.
    echo.
    echo To verify the fix, run the build process with:
    echo   cd frontend
    echo   npm run build
    echo ========================================================================
) else (
    echo.
    echo ========================================================================
    echo FIX APPLICATION ENCOUNTERED ISSUES
    echo.
    echo Please check the logs directory for detailed error information.
    echo Backups have been created, so you can restore the original files if needed.
    echo ========================================================================
)

echo.
echo Press any key to exit...
pause > nul
