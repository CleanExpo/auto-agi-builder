@echo off
echo Installing missing dependencies and applying UI Provider fix...
echo.

echo Step 1: Adding missing dependencies to landing-page package.json
node install-landing-page-dependencies.js
if %ERRORLEVEL% neq 0 (
  echo Error updating package.json
  pause
  exit /b 1
)

echo.
echo Step 2: Installing the new dependencies
cd landing-page
call npm install
if %ERRORLEVEL% neq 0 (
  echo Error installing dependencies
  pause
  exit /b 1
)
cd ..

echo.
echo Step 3: Applying the UI Provider fix
call run-ui-provider-fix.bat

echo.
echo All fixes have been applied!
echo Launching the landing page application...
echo.
echo Press any key to start the landing page app...
pause >nul

cd landing-page
call npm run dev

pause
