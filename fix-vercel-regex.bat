@echo off
echo ===================================
echo Direct Vercel.json Regex Fix
echo ===================================
echo.
echo This script will fix the backslash escaping issue in your vercel.json file
echo that is causing the JSON parsing error.
echo.

:: Create a temporary file for the fixed content
set TEMP_FILE=fixed-vercel.json

:: Make a backup of the original file
if exist vercel.json (
    copy vercel.json vercel.json.bak
    echo Created backup at vercel.json.bak
)

:: Create the fixed file with properly escaped backslashes
echo Generating fixed vercel.json with proper escaping...

:: Read the original file and fix the escaping
powershell -Command "(Get-Content vercel.json) -replace '\"source\": \"/\(\.\*\)\\.\(', '\"source\": \"/\(\.\*\)\\\\.\('" > %TEMP_FILE%

:: If PowerShell command fails, use direct file creation
if not exist %TEMP_FILE% (
    echo Direct replacement failed, creating new file with correct syntax...
    echo {> %TEMP_FILE%
    echo   "version": 2,>> %TEMP_FILE%
    echo   "name": "auto-agi-builder-staging",>> %TEMP_FILE%
    echo   "buildCommand": "cd frontend ^&^& npm install ^&^& npm run build",>> %TEMP_FILE%
    echo   "outputDirectory": "frontend/out",>> %TEMP_FILE%
    echo   "framework": "nextjs",>> %TEMP_FILE%
    echo   "regions": ["sfo1"],>> %TEMP_FILE%
    echo   "env": {>> %TEMP_FILE%
    echo     "ENVIRONMENT": "staging">> %TEMP_FILE%
    echo   },>> %TEMP_FILE%
    echo   "headers": [>> %TEMP_FILE%
    echo     {>> %TEMP_FILE%
    echo       "source": "/static/(.*)",>> %TEMP_FILE%
    echo       "headers": [>> %TEMP_FILE%
    echo         {>> %TEMP_FILE%
    echo           "key": "Cache-Control",>> %TEMP_FILE%
    echo           "value": "public, max-age=31536000, immutable">> %TEMP_FILE%
    echo         }>> %TEMP_FILE%
    echo       ]>> %TEMP_FILE%
    echo     },>> %TEMP_FILE%
    echo     {>> %TEMP_FILE%
    echo       "source": "/(.*)\\\.(js|css|webp|jpg|jpeg|png|svg|ico)$",>> %TEMP_FILE%
    echo       "headers": [>> %TEMP_FILE%
    echo         {>> %TEMP_FILE%
    echo           "key": "Cache-Control",>> %TEMP_FILE%
    echo           "value": "public, max-age=86400, stale-while-revalidate=31536000">> %TEMP_FILE%
    echo         }>> %TEMP_FILE%
    echo       ]>> %TEMP_FILE%
    echo     },>> %TEMP_FILE%
    echo     {>> %TEMP_FILE%
    echo       "source": "/(.*)",>> %TEMP_FILE%
    echo       "headers": [>> %TEMP_FILE%
    echo         {>> %TEMP_FILE%
    echo           "key": "X-Environment",>> %TEMP_FILE%
    echo           "value": "staging">> %TEMP_FILE%
    echo         }>> %TEMP_FILE%
    echo       ]>> %TEMP_FILE%
    echo     }>> %TEMP_FILE%
    echo   ]>> %TEMP_FILE%
    echo }>> %TEMP_FILE%
)

:: Validate the JSON
echo.
echo Validating fixed JSON...
node -e "try { const data = require('./%TEMP_FILE%'); console.log('JSON is valid!'); process.exit(0); } catch(e) { console.error('Error: ' + e.message); process.exit(1); }"

if %ERRORLEVEL% neq 0 (
    echo ERROR: The fixed JSON still has syntax issues.
    echo Please check the file manually.
    echo Possible solution: Edit vercel.json and ensure all backslashes are doubled.
    goto :error
) else (
    echo JSON validation successful!
)

:: Replace the original file
echo.
echo Replacing vercel.json with fixed version...
copy %TEMP_FILE% vercel.json
echo Fixed vercel.json file created successfully.

echo.
echo ===================================
echo FIX COMPLETE - SPECIFIC ISSUE FIXED
echo ===================================
echo.
echo The specific escaping issue in vercel.json has been fixed.
echo.
echo You should now be able to run your deployment scripts without
echo the "Couldn't parse JSON file" error.
echo.
echo Note: We've kept your project name as "auto-agi-builder-staging"
echo and environment as "staging" to match your original configuration.
echo.

goto :cleanup

:error
echo.
echo Failed to fix vercel.json file.

:cleanup
:: Clean up temporary files
if exist %TEMP_FILE% del %TEMP_FILE%

pause
