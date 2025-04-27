@echo off
echo Running the Enhanced UI Provider Fix Script...
echo.

node enhanced-ui-provider-fix.js

if %ERRORLEVEL% EQU 0 (
  echo.
  echo The Enhanced UI Provider fix has been applied successfully.
  echo This should resolve the "useUI must be used within a UIProvider" errors.
  echo.
  echo The enhanced version includes:
  echo  - Improved error handling
  echo  - Error boundary for better debugging
  echo  - Initialization tracking for better state management
  echo  - Null and undefined checks for stability
  echo.
  echo Next steps:
  echo 1. Rebuild your Next.js application with: 
  echo    cd deployment/frontend ^&^& npm run build
  echo 2. Test prerendering to confirm the fix works
  echo.
) else (
  echo.
  echo Error: The Enhanced UI Provider fix failed to apply.
  echo Please check the error messages above.
  echo.
)

pause
