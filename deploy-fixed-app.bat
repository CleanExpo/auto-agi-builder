@echo off
echo ===================================
echo Auto AGI Builder Fixed Deployment
echo ===================================
echo.

echo Setting up correct configuration...
set NODE_ENV=production

echo.
echo Running deployment process...
node deploy-to-vercel.js

echo.
echo Press any key to exit...
pause > nul
