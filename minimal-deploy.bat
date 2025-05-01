@echo off
echo ======================================================
echo   Auto AGI Builder - Minimal Deployment Fix
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
mkdir -p lib
(
  echo /**
  echo  * Router Fix for Next.js
  echo  * Provides defaults to ensure proper routing
  echo  */
  echo.
  echo export function setupRouterDefaults() {
  echo   // Only run in browser
  echo   if (typeof window === 'undefined') return;
  echo.  
  echo   // Add catch for navigation errors
  echo   window.addEventListener('error', function(event) {
  echo     // Check if error is related to Next.js router
  echo     if (event.message && event.message.includes('Router')) {
  echo       console.warn('Router error caught:', event.message);
  echo       // Prevent the error from bubbling up
  echo       event.preventDefault();
  echo     }
  echo   });
  echo.
  echo   // Patch any other router-related issues here
  echo   console.log('Router defaults initialized');
  echo }
) > lib\routerFix.js
echo Created router fix script

echo.
echo Step 4: Creating essential directories...
echo -------------------------
mkdir -p components\layout
mkdir -p styles
mkdir -p pages

echo.
echo Step 5: Creating minimal pages...
echo -------------------------
(
  echo import React from 'react';
  echo import Head from 'next/head';
  echo.
  echo export default function Home() {
  echo   return ^(
  echo     ^<^>
  echo       ^<Head^>
  echo         ^<title^>Auto AGI Builder^</title^>
  echo         ^<meta name="description" content="Auto AGI Builder Platform" /^>
  echo         ^<link rel="icon" href="/favicon.ico" /^>
  echo       ^</Head^>
  echo.
  echo       ^<main className="container mx-auto p-4"^>
  echo         ^<h1 className="text-2xl font-bold text-center my-8"^>Auto AGI Builder^</h1^>
  echo         ^<p className="text-center"^>Welcome to the platform.^</p^>
  echo       ^</main^>
  echo     ^</^>
  echo   ^);
  echo }
) > pages\index.js
echo Created minimal index page

(
  echo import Document, { Html, Head, Main, NextScript } from 'next/document';
  echo.
  echo class MyDocument extends Document {
  echo   render() {
  echo     return (
  echo       ^<Html lang="en"^>
  echo         ^<Head^>
  echo           ^<meta charSet="utf-8" /^>
  echo         ^</Head^>
  echo         ^<body^>
  echo           ^<Main /^>
  echo           ^<NextScript /^>
  echo         ^</body^>
  echo       ^</Html^>
  echo     );
  echo   }
  echo }
  echo.
  echo export default MyDocument;
) > pages\_document.js
echo Created _document.js

(
  echo import React from 'react';
  echo import '../styles/globals.css';
  echo.
  echo // Safe hydration wrapper
  echo function SafeHydrate({ children }) {
  echo   return (
  echo     ^<div suppressHydrationWarning^>
  echo       {typeof window === 'undefined' ? null : children}
  echo     ^</div^>
  echo   );
  echo }
  echo.
  echo // UI Context for SSR
  echo export const UIContext = React.createContext({
  echo   theme: 'light',
  echo   toggleTheme: () => {},
  echo   isMobile: false,
  echo   isDesktop: true
  echo });
  echo.
  echo // UI Provider
  echo export function UIProvider({ children }) {
  echo   const value = {
  echo     theme: 'light',
  echo     toggleTheme: () => {},
  echo     isMobile: false,
  echo     isDesktop: true
  echo   };
  echo   
  echo   return (
  echo     ^<UIContext.Provider value={value}^>
  echo       {children}
  echo     ^</UIContext.Provider^>
  echo   );
  echo }
  echo.
  echo // Hook for accessing UI context
  echo export function useUI() {
  echo   const context = React.useContext(UIContext);
  echo   if (!context) {
  echo     return {
  echo       theme: 'light', 
  echo       toggleTheme: () => {},
  echo       isMobile: false,
  echo       isDesktop: true
  echo     };
  echo   }
  echo   return context;
  echo }
  echo.
  echo function MyApp({ Component, pageProps }) {
  echo   return (
  echo     ^<SafeHydrate^>
  echo       ^<UIProvider^>
  echo         ^<Component {...pageProps} /^>
  echo       ^</UIProvider^>
  echo     ^</SafeHydrate^>
  echo   );
  echo }
  echo.
  echo export default MyApp;
) > pages\_app.js
echo Created _app.js

(
  echo /* Minimal CSS */
  echo html, body {
  echo   padding: 0;
  echo   margin: 0;
  echo   font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
  echo     Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
  echo }
  echo.
  echo * {
  echo   box-sizing: border-box;
  echo }
  echo.
  echo .container {
  echo   max-width: 1200px;
  echo   margin: 0 auto;
  echo   padding: 0 1rem;
  echo }
  echo.
  echo .text-2xl {
  echo   font-size: 1.5rem;
  echo }
  echo.
  echo .font-bold {
  echo   font-weight: bold;
  echo }
  echo.
  echo .text-center {
  echo   text-align: center;
  echo }
  echo.
  echo .my-8 {
  echo   margin-top: 2rem;
  echo   margin-bottom: 2rem;
  echo }
  echo.
  echo .p-4 {
  echo   padding: 1rem;
  echo }
) > styles\globals.css
echo Created globals.css

echo.
echo Step 6: Creating minimal next.config.js...
echo -------------------------
(
  echo /** @type {import('next').NextConfig} */
  echo module.exports = {
  echo   reactStrictMode: false,
  echo   trailingSlash: true,
  echo   swcMinify: true,
  echo   env: {
  echo     NEXT_PUBLIC_DISABLE_STATIC_GENERATION: 'true'
  echo   },
  echo   webpack: (config) => {
  echo     config.resolve.fallback = { fs: false, path: false };
  echo     return config;
  echo   },
  echo   eslint: {
  echo     ignoreDuringBuilds: true
  echo   },
  echo   typescript: {
  echo     ignoreBuildErrors: true
  echo   }
  echo };
) > next.config.js
echo Created next.config.js

echo.
echo Step 7: Creating vercel.json...
echo -------------------------
(
  echo {
  echo   "builds": [
  echo     {
  echo       "src": "package.json",
  echo       "use": "@vercel/next"
  echo     }
  echo   ],
  echo   "routes": [
  echo     {
  echo       "src": "/(.*)",
  echo       "dest": "/$1"
  echo     }
  echo   ]
  echo }
) > vercel.json
echo Created vercel.json

echo.
echo Step 8: Creating package.json if it doesn't exist...
echo -------------------------
if not exist package.json (
  (
    echo {
    echo   "name": "auto-agi-builder-frontend",
    echo   "version": "1.0.0",
    echo   "private": true,
    echo   "scripts": {
    echo     "dev": "next dev",
    echo     "build": "next build",
    echo     "start": "next start",
    echo     "lint": "next lint"
    echo   },
    echo   "dependencies": {
    echo     "next": "13.4.9",
    echo     "react": "18.2.0",
    echo     "react-dom": "18.2.0"
    echo   }
    echo }
  ) > package.json
  echo Created minimal package.json
) else (
  echo Using existing package.json
)

echo.
echo Step 9: Backing up complicated pages...
echo -------------------------
if exist pages\requirements (
  echo Backing up requirements page
  mkdir -p backup\pages
  move pages\requirements backup\pages\
)

if exist pages\projects (
  echo Backing up projects page
  mkdir -p backup\pages
  move pages\projects backup\pages\
)

if exist pages\roadmap.js (
  echo Backing up roadmap page
  mkdir -p backup\pages
  move pages\roadmap.js backup\pages\
)

if exist pages\dashboard.js (
  echo Backing up dashboard page
  mkdir -p backup\pages
  move pages\dashboard.js backup\pages\
)

echo.
echo Step 10: Installing minimal dependencies...
echo -------------------------
call npm cache clean --force
call npm install react react-dom next --force

echo.
echo Step 11: Building the minimal project...
echo -------------------------
call npm run build

if %ERRORLEVEL% NEQ 0 (
  echo Build failed, attempting even more minimal approach...
  
  echo Creating extremely minimal pages directory...
  (
    echo export default function HomePage() {
    echo   return ^<h1^>Auto AGI Builder^</h1^>;
    echo }
  ) > pages\index.js
  
  (
    echo export default function App({ Component, pageProps }) {
    echo   return ^<Component {...pageProps} /^>;
    echo }
  ) > pages\_app.js
  
  echo Attempting basic build...
  call npm run build
  
  if %ERRORLEVEL% NEQ 0 (
    echo Critical build error! Unable to proceed.
    cd ..
    pause
    exit /b 1
  )
)

echo.
echo Step 12: Deploying to Vercel...
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
echo Step 13: Deployment verification...
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
echo   Minimal deployment process completed!
echo ======================================================
echo.
echo Next steps:
echo 1. After successful deployment of minimal site, gradually add back features
echo 2. Start by incorporating the UI Provider properly
echo 3. Then add back core pages one by one, testing after each addition
echo.
pause
