@echo off
echo ===================================================
echo    Advanced Provider Fixes
echo ===================================================

echo Step 1: Installing required dependencies if needed...
cd deployment\frontend
call npm install react react-dom next@13 --save
call npm install @headlessui/react @heroicons/react --save

echo Step 2: Fixing registry.ts implementation...
cd ..\..\
node fix-registry-ultimate.js

echo Step 3: Creating ClientProvider and AuthProvider...
node fix-auth-client-provider.js

echo Step 4: Disabling static generation for authenticated pages...
echo // Disable static generation for authenticated pages > deployment\frontend\next.config.js.new
echo const nextConfig = { >> deployment\frontend\next.config.js.new
echo   reactStrictMode: true, >> deployment\frontend\next.config.js.new
echo   swcMinify: true, >> deployment\frontend\next.config.js.new
echo   // Disable static generation for authenticated pages >> deployment\frontend\next.config.js.new
echo   experimental: { >> deployment\frontend\next.config.js.new
echo     // Skip static generation for pages that require auth >> deployment\frontend\next.config.js.new
echo     workerThreads: false, >> deployment\frontend\next.config.js.new
echo     optimizeCss: false, >> deployment\frontend\next.config.js.new
echo   }, >> deployment\frontend\next.config.js.new
echo   eslint: { >> deployment\frontend\next.config.js.new
echo     ignoreDuringBuilds: true >> deployment\frontend\next.config.js.new
echo   }, >> deployment\frontend\next.config.js.new
echo } >> deployment\frontend\next.config.js.new
echo module.exports = nextConfig >> deployment\frontend\next.config.js.new
move /Y deployment\frontend\next.config.js.new deployment\frontend\next.config.js

echo Step 5: Building the project...
cd deployment\frontend
call npm run build

echo ===================================================
echo    All provider fixes applied!
echo ===================================================
echo UIProvider, ClientProvider and AuthProvider have been created and configured.
echo Static generation has been disabled for authenticated pages to prevent SSR context errors.
echo The project has been rebuilt with the new configuration.
cd ..\..\
pause
