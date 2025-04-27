@echo off
echo Building the Auto AGI Builder frontend with context provider fixes...
echo.

cd deployment\frontend
echo Changed directory to deployment\frontend
echo.

echo Running Next.js build process...
echo This may take a few minutes...
call npm run build

if %ERRORLEVEL% EQU 0 (
  echo.
  echo ========================================================
  echo BUILD SUCCESSFUL!
  echo ========================================================
  echo.
  echo The Next.js application has been built successfully!
  echo Our comprehensive fix solution has been applied:
  echo  1. Enhanced Context Providers with SSR compatibility
  echo  2. Next.js configuration updated to exclude problematic pages from SSG
  echo  3. Webpack configuration customized to skip SSR for specific components
  echo.
  echo The application should now be ready for deployment.
  echo.
) else (
  echo.
  echo ========================================================
  echo BUILD FAILED!
  echo ========================================================
  echo.
  echo The build process encountered errors. 
  echo Please check the error messages above.
  echo.
)

pause
