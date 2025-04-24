@echo off
echo ===================================
echo Auto AGI Builder Production Deployment
echo ===================================
echo.

echo Installing dependencies...
call npm install axios dotenv

echo.
echo Setting production mode...
set PRODUCTION=true

echo.
echo Running full deployment process...
node deploy-to-vercel.js

echo.
echo Press any key to exit...
pause > nul
