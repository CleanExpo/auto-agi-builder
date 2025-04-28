@echo off
echo ===================================================
echo    Installing Missing npm Dependencies
echo ===================================================

cd deployment\frontend

echo Installing recharts...
call npm install recharts --save

echo Installing date-fns...
call npm install date-fns --save

echo Installing heroicons...
call npm install @heroicons/react --save

echo ===================================================
echo    All dependencies installed successfully!
echo ===================================================
echo You can now run the build process again.
pause
