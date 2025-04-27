@echo off
echo ===================================
echo Building and verifying UI Provider fix
echo ===================================

echo.
echo Step 1: Applying the fix to property names...
node fix-provider-options.js

echo.
echo Step 2: Running npm install to ensure all dependencies are installed...
cd landing-page
call npm install

echo.
echo Step 3: Building the project to verify fix...
call npm run build

echo.
echo Build verification complete!

if %errorlevel% == 0 (
    echo ✅ Build successful! The property name fix has resolved the issue.
    echo You can now run 'npm start' to test the application.
) else (
    echo ❌ Build failed. Additional issues may need to be addressed.
)

echo.
echo ===================================
