@echo off
echo ===================================
echo NODE.JS AND NPM VERSION FIX
echo ===================================
echo.
echo This script updates all package.json files to use
echo Node.js 18.18.0 and npm 10.9.0 for compatibility.
echo.

:: Update root package.json
if exist package.json (
  echo Updating root package.json...
  
  :: Create a temporary file
  type package.json > temp_package.json
  
  :: Check if engines section already exists
  findstr /C:"\"engines\"" temp_package.json > nul
  if %errorlevel% equ 0 (
    :: Update existing engines section
    powershell -Command "(Get-Content temp_package.json) -replace '\"engines\":\s*\{[^}]*\}', '\"engines\": {\n    \"node\": \"18.18.0\",\n    \"npm\": \"10.9.0\"\n  }' | Set-Content package.json"
  ) else (
    :: Add engines section after first {
    powershell -Command "(Get-Content temp_package.json) -replace '{\s*', '{\n  \"engines\": {\n    \"node\": \"18.18.0\",\n    \"npm\": \"10.9.0\"\n  },' | Set-Content package.json"
  )
  
  del temp_package.json
  echo Root package.json updated.
)

:: Update frontend package.json
if exist frontend\package.json (
  echo Updating frontend\package.json...
  
  :: Create a temporary file
  type frontend\package.json > frontend\temp_package.json
  
  :: Check if engines section already exists
  findstr /C:"\"engines\"" frontend\temp_package.json > nul
  if %errorlevel% equ 0 (
    :: Update existing engines section
    powershell -Command "(Get-Content frontend\temp_package.json) -replace '\"engines\":\s*\{[^}]*\}', '\"engines\": {\n    \"node\": \"18.18.0\",\n    \"npm\": \"10.9.0\"\n  }' | Set-Content frontend\package.json"
  ) else (
    :: Add engines section after first {
    powershell -Command "(Get-Content frontend\temp_package.json) -replace '{\s*', '{\n  \"engines\": {\n    \"node\": \"18.18.0\",\n    \"npm\": \"10.9.0\"\n  },' | Set-Content frontend\package.json"
  )
  
  del frontend\temp_package.json
  echo Frontend package.json updated.
)

:: Create .nvmrc file in root
echo Creating .nvmrc file...
echo 18.18.0 > .nvmrc
echo Created .nvmrc in root directory.

:: Create .nvmrc file in frontend
if exist frontend (
  echo 18.18.0 > frontend\.nvmrc
  echo Created .nvmrc in frontend directory.
)

:: Create .npmrc file
echo Creating .npmrc file...
echo engine-strict=true > .npmrc
echo Created .npmrc in root directory.

:: Create .npmrc file in frontend
if exist frontend (
  echo engine-strict=true > frontend\.npmrc
  echo Created .npmrc in frontend directory.
)

:: Update vercel.json to include nodeVersion
if exist vercel.json (
  echo Updating vercel.json with nodeVersion...
  
  :: Create a temporary file
  type vercel.json > temp_vercel.json
  
  :: Check if "version" property exists and process accordingly
  findstr /C:"\"version\"" temp_vercel.json > nul
  if %errorlevel% equ 0 (
    powershell -Command "(Get-Content temp_vercel.json) -replace '\"version\":\s*[^,]*,', '\"version\": 2,\n  \"nodeVersion\": \"18.18.0\",' | Set-Content vercel.json"
  ) else (
    powershell -Command "(Get-Content temp_vercel.json) -replace '{\s*', '{\n  \"nodeVersion\": \"18.18.0\",' | Set-Content vercel.json"
  )
  
  del temp_vercel.json
  echo vercel.json updated with Node.js version.
)

echo.
echo ===================================
echo VERSION UPDATE COMPLETE
echo ===================================
echo.
echo All package.json files have been updated to use:
echo - Node.js 18.18.0
echo - npm 10.9.0
echo.
echo Additionally:
echo - .nvmrc files have been created for nvm users
echo - .npmrc files with engine-strict=true have been created
echo - vercel.json has been updated with nodeVersion
echo.
echo These changes ensure compatibility across all environments.
echo.
pause
