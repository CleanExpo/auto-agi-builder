@echo off
echo ===================================================
echo    Complete UI Provider Fix Solution
echo ===================================================

echo Step 1: Installing required packages...
call install-dependencies.bat
call install-headless-ui.bat

echo Step 2: Fixing registry.ts syntax error...
node fix-registry.js

echo Step 3: Building the project...
call build-project.bat

echo ===================================================
echo    All fixes completed!
echo ===================================================
echo All required packages have been installed,
echo registry.ts has been fixed, and the project has been built.
pause
