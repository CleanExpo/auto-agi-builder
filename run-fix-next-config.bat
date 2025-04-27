@echo off
echo Running the Next.js Configuration Fix Script...
echo.

node fix-next-config.js

if %ERRORLEVEL% EQU 0 (
  echo.
  echo The Next.js Config Fix has been applied successfully.
  echo This completes the full solution for context provider errors in the application.
  echo.
  echo We've implemented a comprehensive solution in two phases:
  echo  1. Enhanced Context Providers with SSR compatibility
  echo  2. Next.js configuration updates to disable static generation for problematic pages
  echo.
  echo All pages should now build successfully, with the problematic routes rendering
  echo properly on the client side without SSR errors.
  echo.
  echo Next steps:
  echo 1. Rebuild your Next.js application with: 
  echo    cd deployment\frontend ^&^& npm run build
  echo 2. Verify that the build completes without any prerendering errors
  echo 3. Test the application to ensure all pages render correctly
  echo.
) else (
  echo.
  echo Error: The Next.js Config Fix failed to apply.
  echo Please check the error messages above.
  echo.
)

pause
