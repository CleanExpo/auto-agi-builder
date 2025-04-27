@echo off
echo ===================================================
echo     Auto AGI Builder - Vercel Deployment
echo ===================================================
echo.

echo [1/3] Checking Node.js installation...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo ERROR: Node.js is not installed or not in PATH
  echo Please install Node.js from https://nodejs.org/
  pause
  exit /b 1
)
echo Node.js found: 
node --version

echo.
echo [2/3] Making deployment script executable...
chmod +x finalize-vercel-deployment.js 2>nul

echo.
echo [3/3] Running deployment script...
node finalize-vercel-deployment.js

echo.
echo ===================================================
echo Deployment process completed.
echo.
echo If any steps failed, see deployment/TROUBLESHOOTING.md
echo for detailed troubleshooting guidance.
echo ===================================================

pause
