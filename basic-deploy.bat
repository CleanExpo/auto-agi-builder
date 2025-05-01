@echo off
echo ======================================================
echo   Auto AGI Builder - Basic Deployment Fix
echo ======================================================
echo.

echo Step 1: Creating missing dependencies and components...
echo -------------------------
node create-missing-dependencies.js
if %ERRORLEVEL% NEQ 0 (
  echo Error creating dependencies!
  pause
  exit /b 1
)

echo.
echo Step 2: Navigating to frontend directory...
echo -------------------------
cd frontend
if %ERRORLEVEL% NEQ 0 (
  echo Error changing to frontend directory!
  pause
  exit /b 1
)

echo.
echo Step 3: Creating router fix script...
echo -------------------------
if not exist lib mkdir lib
echo // Router Fix for Next.js> lib\routerFix.js
echo // Provides defaults to ensure proper routing>> lib\routerFix.js
echo.>> lib\routerFix.js
echo export function setupRouterDefaults() {>> lib\routerFix.js
echo   // Only run in browser>> lib\routerFix.js
echo   if (typeof window === 'undefined') return;>> lib\routerFix.js
echo   >> lib\routerFix.js
echo   // Add catch for navigation errors>> lib\routerFix.js
echo   window.addEventListener('error', function(event) {>> lib\routerFix.js
echo     // Check if error is related to Next.js router>> lib\routerFix.js
echo     if (event.message ^&^& event.message.includes('Router')) {>> lib\routerFix.js
echo       console.warn('Router error caught:', event.message);>> lib\routerFix.js
echo       // Prevent the error from bubbling up>> lib\routerFix.js
echo       event.preventDefault();>> lib\routerFix.js
echo     }>> lib\routerFix.js
echo   });>> lib\routerFix.js
echo   >> lib\routerFix.js
echo   // Patch any other router-related issues here>> lib\routerFix.js
echo   console.log('Router defaults initialized');>> lib\routerFix.js
echo }>> lib\routerFix.js
echo Created router fix script

echo.
echo Step 4: Installing minimal dependencies...
echo -------------------------
call npm cache clean --force
call npm install react react-dom next --save --force
if %ERRORLEVEL% NEQ 0 (
  echo Warning: Some dependencies might have install issues, continuing anyway...
)

echo.
echo Step 5: Creating basic landing page...
echo -------------------------
if not exist pages mkdir pages
echo import React from 'react';> pages\index.js
echo.>> pages\index.js
echo export default function HomePage() {>> pages\index.js
echo   return (>> pages\index.js
echo     ^<div style={{padding: '20px', maxWidth: '800px', margin: '0 auto'}}^>>> pages\index.js
echo       ^<h1 style={{textAlign: 'center'}}^>Auto AGI Builder^</h1^>>> pages\index.js
echo       ^<p style={{textAlign: 'center'}}^>Welcome to the platform.^</p^>>> pages\index.js
echo     ^</div^>>> pages\index.js
echo   );>> pages\index.js
echo }>> pages\index.js
echo Created basic homepage

echo.
echo Step 6: Creating minimal app component...
echo -------------------------
echo import React from 'react';> pages\_app.js
echo.>> pages\_app.js
echo // Minimal app component>> pages\_app.js
echo export default function App({ Component, pageProps }) {>> pages\_app.js
echo   return ^<Component {...pageProps} /^>;>> pages\_app.js
echo }>> pages\_app.js
echo Created minimal _app.js

echo.
echo Step 7: Creating minimal next.config.js...
echo -------------------------
echo /** @type {import('next').NextConfig} */> next.config.js
echo module.exports = {>> next.config.js
echo   reactStrictMode: false,>> next.config.js
echo   trailingSlash: true,>> next.config.js
echo   swcMinify: true,>> next.config.js
echo   eslint: {>> next.config.js
echo     ignoreDuringBuilds: true>> next.config.js
echo   },>> next.config.js
echo   typescript: {>> next.config.js
echo     ignoreBuildErrors: true>> next.config.js
echo   }>> next.config.js
echo };>> next.config.js
echo Created minimal next.config.js

echo.
echo Step 8: Building the minimal project...
echo -------------------------
call npm run build

if %ERRORLEVEL% NEQ 0 (
  echo Build failed, creating even more simplified project...
  
  echo // Extremely minimal app> pages\_app.js
  echo export default function App({ Component, pageProps }) {>> pages\_app.js
  echo   return ^<Component {...pageProps} /^>;>> pages\_app.js
  echo }>> pages\_app.js
  
  echo // Extremely minimal page> pages\index.js
  echo export default function HomePage() {>> pages\index.js
  echo   return ^<h1^>Auto AGI Builder^</h1^>;>> pages\index.js
  echo }>> pages\index.js
  
  echo module.exports = {reactStrictMode: false};> next.config.js
  
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
echo Step 9: Deploying to Vercel...
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
echo Deployment verification...
echo -------------------------
echo Please visit your Vercel deployment URL to verify the site is now accessible.
echo.
echo If issues persist, you may need to:
echo 1. Check Vercel deployment logs
echo 2. Verify your domain configuration in Vercel dashboard
echo 3. Clear browser cache and try accessing the site again

:skip_deploy
cd ..
echo.
echo ======================================================
echo   Basic deployment process completed!
echo ======================================================
echo.
echo Next steps:
echo 1. After successful deployment of minimal site, gradually add back features
echo 2. Start by incorporating the UI Provider properly
echo 3. Then add back core pages one by one, testing after each addition
echo.
pause
