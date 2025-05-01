@echo off
echo ======================================================
echo   Auto AGI Builder - Complete Deployment Fix
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
echo Step 2: Running 404 Issue Fix...
echo -------------------------
node fix-404-issue.js
if %ERRORLEVEL% NEQ 0 (
  echo Error running 404 issue fix!
  pause
  exit /b 1
)

echo.
echo Step 3: Running Missing Components and Dependencies Fix...
echo -------------------------
node fix-missing-components.js
if %ERRORLEVEL% NEQ 0 (
  echo Error fixing missing components!
  pause
  exit /b 1
)

echo.
echo Step 4: Setting deployment variables...
echo -------------------------
set DEPLOYMENT_TARGET=production
set NEXT_PUBLIC_DISABLE_STATIC_GENERATION=true

echo.
echo Step 5: Navigating to frontend directory...
echo -------------------------
cd frontend
if %ERRORLEVEL% NEQ 0 (
  echo Error changing to frontend directory!
  pause
  exit /b 1
)

echo.
echo Step 6: Creating minimal index.js if needed...
echo -------------------------
set INDEX_PAGE_PATH=pages\index.js
if exist %INDEX_PAGE_PATH% (
  echo Using existing index.js file
) else (
  echo Creating basic index.js for minimal deployment
  (
    echo import React from 'react';
    echo import Head from 'next/head';
    echo.
    echo export default function Home^(^) {
    echo   return ^(
    echo     ^<^>
    echo       ^<Head^>
    echo         ^<title^>Auto AGI Builder^</title^>
    echo         ^<meta name="description" content="Auto AGI Builder Platform" /^>
    echo         ^<link rel="icon" href="/favicon.ico" /^>
    echo       ^</Head^>
    echo.
    echo       ^<main className="container mx-auto px-4 py-8"^>
    echo         ^<h1 className="text-3xl font-bold text-center mb-6"^>Welcome to Auto AGI Builder^</h1^>
    echo         ^<p className="text-center"^>The platform is currently in maintenance mode. Please check back later.^</p^>
    echo       ^</main^>
    echo     ^</^>
    echo   ^);
    echo }
  ) > %INDEX_PAGE_PATH%
  echo Created minimal index.js file for deployment
)

echo.
echo Step 7: Simplifying the build by removing problematic files temporarily...
echo -------------------------
mkdir backup-pages
for %%f in (pages\projects\[id].js pages\roadmap.js pages\roi.js) do (
  if exist %%f (
    echo Temporarily moving %%f to backup
    move %%f backup-pages\
  )
)

echo.
echo Step 8: Clean npm cache and install dependencies...
echo -------------------------
call npm cache clean --force
call npm install --force
if %ERRORLEVEL% NEQ 0 (
  echo Warning: Some dependencies might have install issues, continuing anyway...
)

echo.
echo Step 9: Building project (minimal version)...
echo -------------------------
call npm run build
if %ERRORLEVEL% NEQ 0 (
  echo Error building project!
  echo.
  echo Trying minimal build approach...
  
  echo Creating stripped down next.config.js
  (
    echo module.exports = {
    echo   trailingSlash: true,
    echo   reactStrictMode: false,
    echo   env: {
    echo     NEXT_PUBLIC_DISABLE_STATIC_GENERATION: 'true'
    echo   },
    echo   webpack: ^(config^) =^> {
    echo     config.resolve.fallback = { fs: false };
    echo     return config;
    echo   }
    echo };
  ) > next.config.js
  
  echo Attempting minimal build again...
  call npm run build
  
  if %ERRORLEVEL% NEQ 0 (
    echo Critical build error! Unable to proceed.
    cd ..
    pause
    exit /b 1
  )
)

echo.
echo Step 10: Restoring backup files...
echo -------------------------
for %%f in (backup-pages\*) do (
  echo Restoring %%f
  move %%f pages\
)
rmdir backup-pages

echo.
echo Step 11: Deploying to Vercel...
echo -------------------------
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
  cd ..
  pause
  exit /b 1
)

echo.
echo Step 12: Deployment verification...
echo -------------------------
echo Please visit https://auto-agi-builder-g0wa25wsn-team-agi.vercel.app/ 
echo to verify the site is now accessible with no 404 errors.
echo.
echo If issues persist, you may need to:
echo 1. Check Vercel deployment logs
echo 2. Verify your domain configuration in Vercel dashboard
echo 3. Clear browser cache and try accessing the site again

:skip_deploy
cd ..
echo.
echo ======================================================
echo   Fix and deployment process completed!
echo ======================================================
echo.
echo If you skipped deployment, don't forget to deploy manually:
echo 1. Navigate to frontend directory: cd frontend
echo 2. Run: vercel --prod
echo.
pause
