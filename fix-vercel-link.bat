@echo off
echo ===================================
echo Vercel Project Linking Fix
echo ===================================
echo.
echo This script will remove the .vercel directory and 
echo re-initialize the project link with Vercel.
echo.

:: Check if .vercel directory exists
if exist .vercel (
    echo Found .vercel directory. Removing...
    rmdir /s /q .vercel
    echo .vercel directory removed successfully.
) else (
    echo No .vercel directory found. This is normal for a fresh project.
)

:: Check for hidden .vercel directory (just in case)
if exist ".\.vercel" (
    echo Found hidden .vercel directory. Removing...
    rmdir /s /q ".\.vercel"
    echo Hidden .vercel directory removed successfully.
)

echo.
echo ===================================
echo INITIALIZE NEW PROJECT LINK
echo ===================================
echo.
echo We will now initialize a new link to Vercel.
echo You will be prompted to:
echo  1. Login to Vercel (if not already logged in)
echo  2. Select the scope/team for your project
echo  3. Set up and link to an existing project or create a new one
echo.
echo Press any key to continue...
pause > nul

:: Run vercel to reinitialize the project link
echo.
echo Running 'vercel' to link your project...
vercel

if %ERRORLEVEL% neq 0 (
    echo.
    echo Project linking encountered an error.
    echo Please check the logs above for details.
    goto :error
) else (
    echo.
    echo ===================================
    echo PROJECT LINKING SUCCESSFUL
    echo ===================================
    echo.
    echo Your project has been successfully linked to Vercel.
    echo You can now deploy using 'vercel --prod' or 'deploy-with-fixed-json.bat'
    echo.
)

goto :end

:error
echo.
echo Project linking process failed.
echo.

:end
pause
