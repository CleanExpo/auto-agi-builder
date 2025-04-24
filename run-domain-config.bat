@echo off
echo ===================================
echo Auto AGI Builder Domain Configurator
echo ===================================
echo.

echo Installing dependencies...
call npm install

echo.
echo Running domain configuration...
call npm run configure-domain

echo.
echo Domain configuration completed!
echo Please check the output above for required DNS records.
echo.
echo Press any key to exit...
pause > nul
