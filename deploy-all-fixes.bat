@echo off
echo ======================================================
echo   Auto AGI Builder - Deploy All Fixes Script
echo ======================================================

echo.
echo Step 1: Running UI Provider Fix...
echo -------------------------
node fix-ui-provider.js
if %ERRORLEVEL% NEQ 0 (
  echo Error fixing UI Provider!
  pause
  exit /b 1
)

echo.
echo Step 2: Running Vercel JSON Configuration Fix...
echo -------------------------
node fix-vercel-json.js
if %ERRORLEVEL% NEQ 0 (
  echo Error fixing vercel.json!
  pause
  exit /b 1
)

echo.
echo Step 3: Running Domain Verification...
echo -------------------------
node fix-domain-issues.js
if %ERRORLEVEL% NEQ 0 (
  echo Error in domain verification!
  pause
  exit /b 1
)

echo.
echo Step 4: Setting deployment variables...
echo ------------------------
set DEPLOYMENT_TARGET=production
set DISABLE_STATIC_GENERATION=true

echo.
echo Step 5: Building project...
echo ------------------------
call npm run build
if %ERRORLEVEL% NEQ 0 (
  echo Error building project!
  pause
  exit /b 1
)

echo.
echo Step 6: Deploying to Vercel...
echo ------------------------
echo This step will deploy the project to Vercel.
echo Please make sure you have the Vercel CLI installed and are logged in.
echo.
echo To install Vercel CLI: npm install -g vercel
echo To login: vercel login
echo.
choice /C YN /M "Do you want to proceed with deployment?"
if %ERRORLEVEL% EQU 2 goto :skip_deploy

vercel --prod
if %ERRORLEVEL% NEQ 0 (
  echo Error deploying to Vercel!
  pause
  exit /b 1
)

echo.
echo Step 7: Verifying domain configuration...
echo ------------------------
echo.
echo Please check the following:
echo 1. Go to the Vercel dashboard and check domain configurations
echo 2. Verify DNS records are correctly set up
echo 3. A record for autoagibuilder.app should point to 76.76.21.21
echo 4. CNAME record for www.autoagibuilder.app should point to cname.vercel-dns.com
echo.
echo For detailed instructions, check DOMAIN-TROUBLESHOOTING-GUIDE.md

:skip_deploy
echo.
echo ======================================================
echo   Deployment process completed!
echo ======================================================
echo.
echo If you encounter any issues, please refer to the following guides:
echo - DOMAIN-TROUBLESHOOTING-GUIDE.md - For DNS and domain configuration issues
echo - UI-PROVIDER-SSR-SOLUTION.md - For UI Provider and SSR issues
echo.
echo Remember that DNS changes may take up to 48 hours to fully propagate.
echo.
pause
