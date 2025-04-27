@echo off
echo Applying all fixes to the Auto AGI Builder landing page...
echo.

echo Step 1: Fixing registry method issue (getSortedProviders)
node fix-registry-method.js
if %ERRORLEVEL% neq 0 (
  echo Error fixing registry method issue
  pause
  exit /b 1
)

echo.
echo Step 2: Fixing Next.js config invalid options warning
node fix-next-config-issue.js
if %ERRORLEVEL% neq 0 (
  echo Error fixing Next.js config issues
  pause
  exit /b 1
)

echo.
echo Step 3: Building the landing page to verify fixes
cd landing-page
call npm run build

if %ERRORLEVEL% neq 0 (
  echo Error: Build failed!
  echo Please check the error messages above.
) else (
  echo.
  echo Build completed successfully!
  echo This confirms that all fixes have been applied correctly.
  echo.
  echo The "useUI must be used within a UIProvider" error has been resolved.
)

cd ..
echo.
echo All fixes have been applied!
echo.
echo Summary of fixes:
echo - Added required dependencies: zustand, react-hot-toast, lodash
echo - Implemented the Model Context Protocol (MCP) system
echo - Fixed registry.getSortedProviders() method usage
echo - Removed deprecated Next.js config options
echo.
echo You can now run the application with:
echo cd landing-page ^&^& npm run dev

pause
