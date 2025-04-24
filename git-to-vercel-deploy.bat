@echo off
echo ===================================
echo DEPLOY FROM GIT TO VERCEL
echo ===================================
echo.
echo This script deploys your project to Vercel directly from your Git repository.
echo.

:: Check if vercel CLI is installed
vercel --version > nul 2>&1
if %ERRORLEVEL% neq 0 (
  echo Vercel CLI is not installed or not in PATH.
  echo Install it with: npm i -g vercel
  echo.
  set /p INSTALL_VERCEL="Do you want to install Vercel CLI now? (y/n): "
  if /I "%INSTALL_VERCEL%" == "y" (
    echo Installing Vercel CLI...
    npm i -g vercel
    if %ERRORLEVEL% neq 0 (
      echo Failed to install Vercel CLI.
      goto end
    )
  ) else (
    echo Please install Vercel CLI and try again.
    goto end
  )
)

:: Check if git remote exists
git remote -v | findstr "origin" > nul
if %ERRORLEVEL% neq 0 (
  echo No git remote 'origin' found.
  echo Please run git-commit-and-push.bat first.
  goto end
)

:: Create or update vercel.json if it doesn't exist
if not exist vercel.json (
  echo Creating vercel.json...
  echo { > vercel.json
  echo   "version": 2, >> vercel.json
  echo   "public": true, >> vercel.json
  echo   "cleanUrls": true, >> vercel.json
  echo   "trailingSlash": false, >> vercel.json
  echo   "github": { >> vercel.json
  echo     "silent": true >> vercel.json
  echo   } >> vercel.json
  echo } >> vercel.json
)

echo.
echo Before proceeding, make sure:
echo 1. You have pushed all changes to your Git repository
echo 2. You are logged in to Vercel (run 'vercel login' if not)
echo.
pause

:: Get the Git repository URL
for /f "tokens=2" %%a in ('git remote get-url origin') do set GIT_REPO=%%a

echo.
echo ===================================
echo DEPLOYING TO VERCEL FROM GIT
echo ===================================
echo.
echo Git Repository: %GIT_REPO%
echo.

:: Deploy to Vercel from Git
echo Deploying to Vercel from Git...
vercel --prod
if %ERRORLEVEL% neq 0 (
  echo.
  echo Failed to deploy to Vercel.
  echo Try running:
  echo   vercel link
  echo   vercel --prod
  echo.
  set /p LINK_PROJECT="Would you like to link to an existing project first? (y/n): "
  if /I "%LINK_PROJECT%" == "y" (
    vercel link
    if %ERRORLEVEL% eq 0 (
      echo Project linked. Deploying...
      vercel --prod
    )
  )
)

echo.
echo ===================================
echo DEPLOYMENT COMPLETE
echo ===================================
echo.
echo Note: If the deployment shows authentication issues, try accessing your 
echo Vercel dashboard and check the project settings:
echo.
echo 1. Go to https://vercel.com/dashboard
echo 2. Select your project
echo 3. Go to Settings -> Authentication
echo 4. Disable authentication requirements if needed
echo 5. Set visibility to "Public"

:end
pause
