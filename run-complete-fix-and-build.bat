@echo off
echo ====================================================
echo           Auto AGI Builder UI Provider Fix
echo ====================================================
echo This script will:
echo  1. Apply fixes to the UI Provider to resolve SSR errors
echo  2. Update context provider registration
echo  3. Update Next.js configuration
echo  4. Rebuild the project
echo ====================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Node.js is not installed or not in your PATH.
  echo Please install Node.js and try again.
  exit /b 1
)

echo Running UI Provider Fix...
node fix-ui-provider.js

if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Fix script failed with error code %ERRORLEVEL%
  echo Please check the error message and try again.
  pause
  exit /b %ERRORLEVEL%
)

echo.
echo UI Provider Fix completed successfully.
echo.

:PROMPT_BUILD
set /p BUILD_PROJECT="Do you want to rebuild the project now? (Y/N): "

if /i "%BUILD_PROJECT%"=="Y" goto BUILD
if /i "%BUILD_PROJECT%"=="N" goto SKIP_BUILD
echo Invalid input. Please enter Y or N.
goto PROMPT_BUILD

:BUILD
echo.
echo ====================================================
echo               Building the project
echo ====================================================
echo.

echo Navigating to frontend directory...
cd deployment\frontend

echo Installing dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Failed to install dependencies.
  cd ..\..
  pause
  exit /b %ERRORLEVEL%
)

echo.
echo Building the project...
call npm run build

if %ERRORLEVEL% NEQ 0 (
  echo.
  echo WARNING: Build completed with errors.
  echo This may require further fixes.
  cd ..\..
  pause
  exit /b %ERRORLEVEL%
)

echo.
echo Build completed successfully!
echo.

echo Starting development server for testing...
start cmd /k "title Auto AGI Builder Dev Server && npm run dev"

cd ..\..
goto END

:SKIP_BUILD
echo.
echo Skipped building the project.
echo You can build it manually later by running:
echo   cd deployment\frontend
echo   npm run build
echo.

:END
echo.
echo ====================================================
echo                   Fix Summary
echo ====================================================
echo.
echo The following changes were made:
echo  - Added default values to UIContext to prevent SSR errors
echo  - Modified the useUI hook to be SSR-compatible
echo  - Updated context provider registration for SSR compatibility
echo  - Added environment settings to prevent static optimization issues
echo.
echo For more details, please see fix-ui-provider-solution.md
echo.
echo ====================================================
echo.
pause
