@echo off
REM AUTO AGI BUILDER - BUILD PROJECT WITH FIXED UI PROVIDER
REM This script builds the project after fixing the circular dependency issue

echo ====================================================================
echo               AUTO AGI BUILDER - BUILD PROJECT
echo ====================================================================
echo.
echo This script will build the Auto AGI Builder project with the fixed
echo UIProvider and AuthProvider components to resolve the circular
echo dependency issue.
echo.

echo Changing to project directory...
cd /d "C:\Users\PhillMcGurk\OneDrive - Disaster Recovery\1111\Auto AGI Builder\frontend"

echo.
echo Building the project...
echo.
call npm run build

echo.
echo ====================================================================
if %ERRORLEVEL% EQU 0 (
  echo BUILD SUCCESSFUL: The "useUI must be used within a UIProvider" error has been resolved!
  echo The project should now build without prerendering errors.
) else (
  echo BUILD FAILED: There may still be issues to resolve.
  echo Check the error messages above for more information.
)
echo ====================================================================
echo.
pause
