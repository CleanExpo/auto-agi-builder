@echo off
REM AUTO AGI BUILDER - WEBPACK ERROR FIX
REM This batch file runs the webpack-error-fix.js script to resolve
REM webpack and Node.js compatibility issues in the Next.js project

echo ========================================================================
echo              AUTO AGI BUILDER - WEBPACK ERROR RESOLUTION
echo ========================================================================
echo.
echo This script will fix webpack and Node.js compatibility issues by:
echo.
echo  1. Checking Node.js version and applying ESM compatibility fixes if needed
echo  2. Updating package.json with proper dependency versions
echo  3. Configuring next.config.js with correct webpack settings
echo  4. Installing required dependencies for compatibility
echo  5. Creating a special build script with Node.js environment variables
echo.
echo This is particularly important when running on Node.js 22+ which may cause
echo webpack compilation errors with Next.js.
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause > nul

echo.
echo Running webpack error fix script...
echo.

REM Navigate to project directory
cd /d "C:\Users\PhillMcGurk\OneDrive - Disaster Recovery\1111\Auto AGI Builder\frontend"

REM Run the webpack-error-fix.js script
node "%USERPROFILE%\Desktop\webpack-error-fix.js"

REM Check exit code
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================================
    echo WEBPACK FIXES APPLIED SUCCESSFULLY!
    echo.
    echo The webpack configuration has been updated for Node.js compatibility.
    echo.
    echo To build the project using the compatible settings, run:
    echo   npm run build:compatible
    echo.
    echo The fixes include:
    echo   - Updated webpack configuration in next.config.js
    echo   - Disabled SWC minification that may cause issues
    echo   - Added Node.js environment variables for compatibility
    echo   - Updated dependencies for proper compatibility
    echo ========================================================================
) else (
    echo.
    echo ========================================================================
    echo WEBPACK FIX APPLICATION ENCOUNTERED ISSUES
    echo.
    echo Some fixes were applied, but the build test may have failed.
    echo.
    echo Please check the webpack-fix.log file for detailed error information.
    echo.
    echo Try running the build manually with:
    echo   npm run build:compatible
    echo ========================================================================
)

echo.
echo Log file is available at: "%CD%\webpack-fix.log"
echo.
echo Press any key to exit...
pause > nul
