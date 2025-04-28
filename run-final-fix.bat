@echo off
echo ===================================================
echo    Final UI Provider Fix Solution
echo ===================================================

echo Step 1: Installing required dependencies...
cd deployment\frontend

echo Installing required npm packages...
call npm install recharts date-fns @heroicons/react @headlessui/react --save

echo Step 2: Fixing registry.ts syntax error...
cd ..\..\
node fix-registry-properly.js

echo Step 3: Building the project...
cd deployment\frontend
call npm run build

echo ===================================================
echo    All fixes applied!
echo ===================================================
echo All required packages have been installed,
echo registry.ts has been fixed, and the project has been built.
cd ..\..\
pause
