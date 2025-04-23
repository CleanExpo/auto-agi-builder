@echo off
REM Run Local Homepage Development Server for Windows
REM This script starts the Next.js development server for testing the homepage

echo Starting Auto AGI Builder development server...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed. Please install Node.js to run this script.
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: npm is not installed. Please install npm to run this script.
    pause
    exit /b 1
)

REM Run validation first
echo Validating homepage implementation...
node frontend/tests/homepage-validation.js

REM Check if validation was successful
if %ERRORLEVEL% EQU 0 (
    echo.
    echo Validation successful! Starting development server...
    echo.
    
    REM Start the Next.js development server
    call npm run dev
) else (
    echo.
    echo Validation failed. Please fix the issues before starting the server.
    pause
    exit /b 1
)
