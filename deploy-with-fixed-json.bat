@echo off
echo ===================================
echo Deployment with Fixed vercel.json
echo ===================================
echo.
echo This script will verify the vercel.json is valid and then deploy
echo the Auto AGI Builder to Vercel.
echo.

:: Validate the JSON before proceeding
echo Validating JSON syntax...
node -e "try { const data = require('./vercel.json'); console.log('JSON is valid!'); process.exit(0); } catch(e) { console.error('Error: ' + e.message); process.exit(1); }"

if %ERRORLEVEL% neq 0 (
    echo ERROR: The vercel.json file has syntax issues.
    echo Please run fix-vercel-regex.bat first to fix the JSON format.
    goto :error
) else (
    echo JSON validation successful!
)

echo.
echo Your vercel.json configuration is valid with proper escaping.
echo.
echo ===================================
echo DEPLOYING TO VERCEL
echo ===================================
echo.

:: Deploy to Vercel using the CLI
echo Running deployment...
vercel --prod

if %ERRORLEVEL% neq 0 (
    echo.
    echo Deployment encountered an error.
    echo Please check the logs above for details.
    goto :error
) else (
    echo.
    echo ===================================
    echo DEPLOYMENT SUCCESSFUL
    echo ===================================
    echo.
    echo Your Auto AGI Builder has been deployed to Vercel
    echo with the fixed configuration.
    echo.
)

goto :end

:error
echo.
echo Deployment process failed.
echo.

:end
pause
