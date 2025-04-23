@echo off
REM Homepage Validation Script for Windows
REM This script runs the homepage validation utility to verify the implementation

echo Running Auto AGI Builder Homepage Validation...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed. Please install Node.js to run this validation script.
    exit /b 1
)

REM Check if chalk is installed (required for formatting)
call npm list chalk >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Installing chalk package (required for validation)...
    call npm install chalk --save-dev
)

REM Run the validation script
node frontend/tests/homepage-validation.js

REM Check the exit code
if %ERRORLEVEL% EQU 0 (
    echo.
    echo Validation completed successfully! Your homepage implementation meets all requirements.
    echo.
    echo Next step: Run 'npm run dev' to start the development server and test the homepage in your browser.
) else (
    echo.
    echo Validation failed. Please fix the issues reported above and run this validation script again.
)

pause
