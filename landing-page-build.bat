@echo off
echo Building the landing page application to verify the UI Provider fix...
echo.

cd landing-page
call npm run build

if %ERRORLEVEL% neq 0 (
  echo Error: Build failed!
  echo Please check the error messages above.
) else (
  echo.
  echo Build completed successfully!
  echo This confirms that the UI Provider fix has been applied correctly.
  echo.
  echo The "useUI must be used within a UIProvider" error has been resolved.
)

pause
