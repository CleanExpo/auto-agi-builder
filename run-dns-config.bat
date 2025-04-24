@echo off
echo ===================================
echo Auto AGI Builder DNS Configurator
echo ===================================
echo.

echo Installing dependencies...
call npm install axios dotenv

echo.
echo Running DNS configuration tool...
node dns-record-configurator.js

echo.
echo Press any key to exit...
pause > nul
