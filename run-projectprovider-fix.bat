@echo off
REM AUTO AGI BUILDER - ProjectProvider Error Fix Script
REM This batch file runs the fix-projectprovider.js script to resolve
REM the "ProjectProvider is not defined" error in Next.js prerendering

echo ========================================================================
echo              AUTO AGI BUILDER - PROJECTPROVIDER ERROR FIX
echo ========================================================================
echo.
echo This script fixes the "ProjectProvider is not defined" error by:
echo.
echo  1. Removing the redundant ProjectProvider wrapper in _app.js
echo  2. Using the CombinedProvider that already contains ProjectProvider
echo  3. Ensuring all contexts are properly nested in the correct order
echo.
echo This fix resolves errors during Next.js static site generation
echo and prerendering of pages.
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause > nul

echo.
echo Running ProjectProvider fix script...
echo.

REM Run the fix script
node "%USERPROFILE%\Desktop\fix-projectprovider.js"

REM Check exit code
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================================
    echo PROJECTPROVIDER FIX APPLIED SUCCESSFULLY!
    echo.
    echo The _app.js file has been updated to remove the redundant
    echo ProjectProvider wrapper. The CombinedProvider already includes
    echo ProjectProvider in the correct provider hierarchy.
    echo.
    echo To test the fix, try building the project again with:
    echo   cd deployment/frontend && npm run build
    echo ========================================================================
) else (
    echo.
    echo ========================================================================
    echo PROJECTPROVIDER FIX APPLICATION ENCOUNTERED ISSUES
    echo.
    echo The script ran into problems. You may need to manually edit
    echo the _app.js file to remove the redundant ProjectProvider wrapper.
    echo.
    echo Look for code like:
    echo   {getLayout(^<ProjectProvider^>
    echo       ^<Component {...pageProps} /^>
    echo     ^</ProjectProvider^>)}
    echo.
    echo And change it to:
    echo   {getLayout(^<Component {...pageProps} /^>)}
    echo ========================================================================
)

echo.
echo Press any key to exit...
pause > nul
