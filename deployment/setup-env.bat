@echo off
echo Setting up environment variables for Vercel deployment...
echo.

:: Make sure we're in the right directory
cd %~dp0

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo Error: Node.js is not installed or not in PATH
  echo Please install Node.js from https://nodejs.org/
  pause
  exit /b 1
)

:: Make the script executable
chmod +x create-env-file.js 2>nul

:: Run the environment setup script
node create-env-file.js

echo.
echo Next steps:
echo 1. Copy these same values to your Vercel project environment variables
echo 2. Set up GitHub repository secrets for automated deployments
echo.
echo See deployment/UPDATE-ENV-VARIABLES.md for detailed instructions.
echo.

pause
