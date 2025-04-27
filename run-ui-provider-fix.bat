@echo off
echo Running UI Provider Fix to resolve "useUI must be used within a UIProvider" errors...

REM Run the Node.js script
node fix-ui-provider.js

if %ERRORLEVEL% NEQ 0 (
  echo Error: Fix script failed with error code %ERRORLEVEL%
  exit /b %ERRORLEVEL%
)

echo.
echo UI Provider fix completed successfully!
echo Next steps:
echo  1. Rebuild the project with: cd deployment/frontend && npm run build
echo  2. Test the application with: npm run dev
echo.
echo The fix:
echo  - Added default values to UIContext to prevent SSR errors
echo  - Modified the useUI hook to be SSR-compatible
echo  - Updated context provider registration to work during SSR
echo  - Added environment settings to prevent static optimization issues
echo.
echo If you encounter any issues, check the documentation or contact support.
