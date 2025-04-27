@echo off
REM AUTO AGI BUILDER - NODE COMPATIBILITY & UI PROVIDER FIX DEPLOYMENT
REM This batch file runs the auto-deploy-node-ui-fix.js script to fix the UIProvider circular dependencies
REM and handle Node.js version compatibility issues

echo ========================================================================
echo               AUTO AGI BUILDER - AUTOMATED DEPLOYMENT
echo ========================================================================
echo.
echo This script will:
echo  1. Fix the circular dependency between UIProvider and AuthProvider
echo  2. Handle Node.js version compatibility issues
echo  3. Add error boundaries to improve error handling
echo  4. Verify the build process works correctly
echo  5. Deploy the application to production
echo.
echo The script will generate detailed logs in the logs directory.
echo.
echo Please ensure you have Node.js installed and are connected to the internet.
echo.
echo Press Ctrl+C to cancel or any key to continue...
pause > nul

echo.
echo Starting the automated deployment process...
echo.

REM Navigate to project directory
cd /d "C:\Users\PhillMcGurk\OneDrive - Disaster Recovery\1111\Auto AGI Builder"

REM Create logs directory if it doesn't exist
if not exist "logs" mkdir logs

REM Run the deployment script
node "%USERPROFILE%\Desktop\auto-deploy-node-ui-fix.js" > logs\auto-deploy-output.log 2>&1

REM Check if the script executed successfully
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================================
    echo DEPLOYMENT COMPLETED SUCCESSFULLY!
    echo.
    echo The UIProvider circular dependency has been fixed and the application
    echo has been deployed. Check the logs directory for detailed information.
    echo ========================================================================
) else (
    echo.
    echo ========================================================================
    echo DEPLOYMENT ENCOUNTERED ISSUES
    echo.
    echo Please check the logs directory for detailed error information.
    echo You may need to manually inspect and fix any remaining issues.
    echo ========================================================================
)

echo.
echo Log file is available at: "%CD%\logs\auto-deploy-output.log"
echo.
echo Press any key to exit...
pause > nul
