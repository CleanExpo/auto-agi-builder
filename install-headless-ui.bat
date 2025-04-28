@echo off
echo ===================================================
echo    Installing @headlessui/react Package
echo ===================================================

cd deployment\frontend

echo Installing @headlessui/react...
call npm install @headlessui/react --save

echo ===================================================
echo    Headless UI installed successfully!
echo ===================================================
echo You can now run the build process again.
pause
