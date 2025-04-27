@echo off
echo ========================================================
echo     AUTO AGI BUILDER - FINAL SOLUTION INSTALLER
echo ========================================================
echo.
echo This script will apply the comprehensive Next.js Context Provider Fix
echo solving all prerendering errors with a dynamic import + SSR compatibility solution.
echo.
echo The solution includes:
echo  1. Enhanced Context Providers with SSR compatibility
echo  2. Dynamic imports for problematic context providers
echo  3. Client-side only rendering for specific routes
echo  4. Webpack configuration to skip SSR for problematic pages
echo  5. Error boundaries for graceful error handling
echo.
echo Press any key to start the installation...
pause > nul
echo.

node final-build-solution.js

if %ERRORLEVEL% EQU 0 (
  echo.
  echo ========================================================
  echo     INSTALLATION COMPLETE
  echo ========================================================
  echo.
  echo The comprehensive solution has been applied successfully.
  echo.
  echo Next steps:
  echo.
  echo 1. Install additional dependencies:
  echo    cd deployment\frontend ^&^& npm install
  echo.
  echo 2. Build the application:
  echo    cd deployment\frontend ^&^& npm run build
  echo.
  echo 3. Start the application to test:
  echo    cd deployment\frontend ^&^& npm run start
  echo.
  echo Note: This solution ensures all problematic pages will be:
  echo  - Excluded from static generation
  echo  - Rendered only on the client side
  echo  - Safely wrapped with proper error boundaries
  echo.
  echo The application should now build without any prerendering errors.
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
  echo If you encounter "module not found" errors, try installing the required dependencies:
  echo    cd deployment\frontend ^&^& npm install chalk null-loader
  echo.
  echo Then run this script again.
  echo.
)

pause
