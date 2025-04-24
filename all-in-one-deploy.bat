@echo off
echo ===================================
echo ALL-IN-ONE DEPLOYMENT SCRIPT
echo ===================================
echo.
echo This script manages the entire deployment process
echo optimized for Node.js 18.18.0 and npm 10.9.0
echo.

echo Step 1: Verifying Node.js version...
node -v > temp_version.txt
set /p NODE_VERSION=<temp_version.txt
del temp_version.txt

echo Current Node.js version: %NODE_VERSION%
echo Required Node.js version: v18.18.0
echo.

:: Check for correct Node.js version
if "%NODE_VERSION%"=="v18.18.0" (
  echo [√] Using correct Node.js version
) else (
  echo [!] WARNING: You are not using Node.js 18.18.0
  echo     Current version: %NODE_VERSION%
  echo     This deployment is optimized for Node.js 18.18.0
  echo     Install it or use nvm to switch versions before continuing
  echo.
  echo To proceed anyway with the current version, press any key.
  echo To exit and install the correct version, press Ctrl+C.
  pause > nul
)

echo.
echo Step 2: Checking npm version...
npm -v > temp_npm_version.txt
set /p NPM_VERSION=<temp_npm_version.txt
del temp_npm_version.txt

echo Current npm version: %NPM_VERSION%
echo Required npm version: 10.9.0
echo.

:: Check for correct npm version
if "%NPM_VERSION%"=="10.9.0" (
  echo [√] Using correct npm version
) else (
  echo [!] WARNING: You are not using npm 10.9.0
  echo     Current version: %NPM_VERSION%
  echo     This deployment is optimized for npm 10.9.0
  echo     Install it or upgrade npm before continuing
  echo.
  echo To proceed anyway with the current version, press any key.
  echo To exit and install the correct version, press Ctrl+C.
  pause > nul
)

echo.
echo Step 3: Updating configuration for Node.js 18.18.0 and npm 10.9.0...
call node-version-fix.bat

echo.
echo Step 4: Removing any existing .vercel directory...
if exist .vercel (
  rmdir /s /q .vercel
  echo [√] Removed existing .vercel directory
) else (
  echo [√] No existing .vercel directory found
)

echo.
echo Step 5: Creating optimized vercel.json...
echo {^
  "version": 2,^
  "framework": "nextjs",^
  "buildCommand": "cd frontend && npm ci && npm run build",^
  "outputDirectory": "frontend/.next",^
  "nodeVersion": "18.18.0"^
} > vercel.json
echo [√] Created optimized vercel.json

echo.
echo Step 6: Creating strict .vercelignore file...
echo * > .vercelignore
echo !frontend/pages/** >> .vercelignore
echo !frontend/components/** >> .vercelignore
echo !frontend/styles/** >> .vercelignore
echo !frontend/public/** >> .vercelignore
echo !frontend/utils/** >> .vercelignore
echo !frontend/contexts/** >> .vercelignore
echo !frontend/lib/** >> .vercelignore
echo !frontend/next.config.js >> .vercelignore
echo !frontend/package.json >> .vercelignore
echo !frontend/tailwind.config.js >> .vercelignore
echo !frontend/postcss.config.js >> .vercelignore
echo !frontend/jsconfig.json >> .vercelignore
echo !package.json >> .vercelignore
echo !vercel.json >> .vercelignore
echo !.npmrc >> .vercelignore
echo !.nvmrc >> .vercelignore
echo [√] Created strict .vercelignore file

echo.
echo Step 7: Checking for frontend package.json...
if exist frontend\package.json (
  echo [√] Frontend package.json found
) else (
  echo [!] ERROR: Frontend package.json not found!
  echo     This deployment script requires a Next.js frontend
  echo     in the 'frontend' directory.
  goto error
)

echo.
echo Step 8: Preparing for deployment...
echo.
echo This script will now deploy your application to Vercel
echo using the following configuration:
echo.
echo - Node.js version: 18.18.0
echo - npm version: 10.9.0
echo - Frontend build only (backend excluded)
echo - Memory-optimized configuration
echo.
echo Press any key to continue with deployment...
pause > nul

echo.
echo Step 9: Running Vercel CLI...
echo.
echo The Vercel CLI will now prompt you to log in and
echo set up your project. Follow the prompts to continue.
echo.
vercel

if %ERRORLEVEL% neq 0 (
  echo.
  echo [!] Vercel deployment encountered an error.
  echo     Check the output above for details.
  echo.
  echo Common solutions to try:
  echo - Make sure you're logged in to Vercel CLI
  echo - Check your internet connection
  echo - Verify your project configuration
  echo.
  goto error
) else (
  echo.
  echo [√] Vercel preview deployment completed!
  echo.
  echo To deploy to production, run:
  echo   vercel --prod
  echo.
  echo To troubleshoot any deployment issues, run:
  echo   node simplified-mcp.js diagnose "your error message"
  echo.
  goto success
)

:error
echo.
echo ===================================
echo DEPLOYMENT PROCESS FAILED
echo ===================================
echo.
echo Please fix the errors above and try again.
echo For troubleshooting help, run: node simplified-mcp.js diagnose "your error message"
echo.
pause
exit /b 1

:success
echo.
echo ===================================
echo DEPLOYMENT PROCESS COMPLETED
echo ===================================
echo.
echo Your application has been successfully deployed to Vercel!
echo.
echo You can view your deployment by visiting your Vercel dashboard
echo or by clicking the URL provided in the output above.
echo.
pause
exit /b 0
