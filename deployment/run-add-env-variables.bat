@echo off
echo ===================================================
echo   Setting Up Vercel Environment Variables
echo ===================================================
echo.

echo Step 1: Installing required dependencies...
cd deployment
call npm install -g vercel

echo.
echo Step 2: Checking Vercel login status...
vercel whoami 2>nul
if %ERRORLEVEL% neq 0 (
  echo You're not logged in to Vercel. Please login now:
  vercel login
)

echo.
echo Step 3: Running the environment variables setup script...
node add-vercel-env-variables.js

echo.
echo If the script didn't complete successfully, you can:
echo 1. Try running it again after resolving any issues
echo 2. Set the environment variables manually through the Vercel dashboard
echo    (See deployment/SETUP-VERCEL-ENV-VARIABLES.md for instructions)
echo.
echo Don't forget to redeploy your application after setting environment variables!

pause
