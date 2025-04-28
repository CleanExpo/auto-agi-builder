@echo off
echo ===================================================
echo     Auto AGI Builder - Dev to Production Migration
echo ===================================================
echo.

echo Step 1: Checking prerequisites...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo ERROR: Node.js is not installed or not in PATH
  echo Please install Node.js from https://nodejs.org/
  pause
  exit /b 1
)
echo Node.js found: 
node --version

echo.
echo Step 2: Checking for Vercel CLI...
where vercel >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo NOTICE: Vercel CLI not found. It's recommended but not required.
  echo Consider installing it with: npm install -g vercel
) else (
  echo Vercel CLI found:
  vercel --version
)

echo.
echo Step 3: Creating backup of development files...
if not exist "deployment\backups" mkdir "deployment\backups"
echo Backing up .env.local (if exists)...
if exist "deployment\frontend\.env.local" copy "deployment\frontend\.env.local" "deployment\backups\.env.local.bak"
echo Backing up next.config.js...
if exist "deployment\frontend\next.config.js" copy "deployment\frontend\next.config.js" "deployment\backups\next.config.js.bak"

echo.
echo Step 4: Configuring for production...
echo Running finalize-vercel-deployment.js script...
node deployment/finalize-vercel-deployment.js

if %ERRORLEVEL% neq 0 (
  echo ERROR: Failed to execute deployment script. Please check the logs above.
  pause
  exit /b 1
)

echo.
echo ===================================================
echo Dev to Production migration process completed!
echo.
echo Next steps:
echo 1. Verify the build succeeded in Vercel dashboard
echo 2. If you didn't use Vercel CLI, deploy manually through the Vercel dashboard:
echo    - Framework: Next.js
echo    - Root Directory: deployment/frontend
echo    - Build Command: npm run build
echo    - Output Directory: .next
echo 3. Configure your production domain if needed
echo.
echo For detailed instructions refer to:
echo - deployment/DEV-TO-PRODUCTION-GUIDE.md
echo - deployment/VERCEL-DEPLOYMENT-GUIDE.md
echo - deployment/CUSTOM-DOMAIN-SETUP.md
echo ===================================================

pause
