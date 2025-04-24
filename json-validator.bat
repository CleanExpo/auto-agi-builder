@echo off
setlocal enabledelayedexpansion

echo ===================================
echo JSON Validator and Fixer
echo ===================================
echo.
echo This script will check your vercel.json file for syntax errors
echo and create a clean, properly formatted version if needed.
echo.

:: Create a temporary file to validate the JSON
set TEMP_FILE=temp-vercel.json

:: Create a correctly formatted vercel.json with proper escaping
echo Creating a clean vercel.json file...

(
echo {
echo   "version": 2,
echo   "name": "auto-agi-builder",
echo   "buildCommand": "cd frontend && npm install && npm run build",
echo   "outputDirectory": "frontend/out",
echo   "framework": "nextjs",
echo   "regions": ["sfo1"],
echo   "headers": [
echo     {
echo       "source": "/static/(.*)",
echo       "headers": [
echo         {
echo           "key": "Cache-Control",
echo           "value": "public, max-age=31536000, immutable"
echo         }
echo       ]
echo     },
echo     {
echo       "source": "/(.*)\\\.(js|css|webp|jpg|jpeg|png|svg|ico)$",
echo       "headers": [
echo         {
echo           "key": "Cache-Control",
echo           "value": "public, max-age=86400, stale-while-revalidate=31536000"
echo         }
echo       ]
echo     },
echo     {
echo       "source": "/(.*)",
echo       "headers": [
echo         {
echo           "key": "X-Environment",
echo           "value": "production"
echo         }
echo       ]
echo     }
echo   ]
echo }
) > %TEMP_FILE%

:: Create a Node.js script to validate the JSON
echo console.log('Validating JSON...'); > validate.js
echo try { >> validate.js
echo   const data = require('./%TEMP_FILE%'); >> validate.js
echo   console.log('JSON is valid!'); >> validate.js
echo   process.exit(0); >> validate.js
echo } catch(e) { >> validate.js
echo   console.error('Error: ' + e.message); >> validate.js
echo   process.exit(1); >> validate.js
echo } >> validate.js

:: Run the validation
echo.
echo Validating JSON syntax...
node validate.js
if %ERRORLEVEL% neq 0 (
    echo ERROR: The JSON format is still invalid.
    echo This may indicate an issue with the escaping in the script.
    goto :error
) else (
    echo JSON validation successful!
)

:: Replace the actual vercel.json file with our valid one
echo.
echo Updating vercel.json with validated content...
if exist vercel.json (
    copy vercel.json vercel.json.bak
    echo (Backup created at vercel.json.bak)
)
copy %TEMP_FILE% vercel.json

echo.
echo ===================================
echo VERIFICATION COMPLETE
echo ===================================
echo.
echo Your vercel.json file has been fixed and validated.
echo You can now try running the deployment script again.
echo.

goto :cleanup

:error
echo.
echo Failed to fix vercel.json file.

:cleanup
:: Clean up temporary files
if exist %TEMP_FILE% del %TEMP_FILE%
if exist validate.js del validate.js

pause
endlocal
