@echo off
echo ========================================================
echo     AUTO AGI BUILDER - ULTIMATE CONTEXT FIX
echo ========================================================
echo.
echo This script applies a complete solution to the context provider errors
echo by disabling static generation and providing mock implementations
echo for problematic context hooks during server-side rendering.
echo.
echo The solution includes:
echo  1. Complete static generation disabling with 'output: standalone'
echo  2. Webpack module aliasing to mock context hooks during SSR
echo  3. Empty context providers that safely render without errors
echo.
echo Press any key to start the installation...
pause > nul
echo.

node disable-static-generation.js

if %ERRORLEVEL% EQU 0 (
  echo.
  echo ========================================================
  echo     INSTALLATION COMPLETE
  echo ========================================================
  echo.
  echo The ultimate solution has been applied successfully.
  echo.
  echo Next steps:
  echo.
  echo 1. Install dependencies:
  echo    cd deployment\frontend ^&^& npm install
  echo.
  echo 2. Build the application:
  echo    cd deployment\frontend ^&^& npm run build
  echo.
  echo 3. Start the application:
  echo    cd deployment\frontend ^&^& npm start
  echo.
  echo This solution disables static generation and mocks the context hooks
  echo during server-side rendering, ensuring all pages build successfully.
  echo.
) else (
  echo.
  echo ========================================================
  echo     INSTALLATION FAILED
  echo ========================================================
  echo.
  echo An error occurred during installation.
  echo Please check the error messages above for more information.
  echo.
)

pause
