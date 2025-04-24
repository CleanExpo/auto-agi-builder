@echo off
echo "===== Starting Deployment Diagnosis ====="
echo "This script will help diagnose deployment issues by checking each step of the build process"

echo.
echo "Step 1: Checking Node.js and npm versions..."
node -v
npm -v

echo.
echo "Step 2: Validating package.json structure..."
cd frontend
type package.json

echo.
echo "Step 3: Checking for required dependencies..."
echo "Checking if next.js is installed..."
npm list next

echo.
echo "Step 4: Testing npm install..."
echo "Installing dependencies (this may take a while)..."
call npm install > npm-install-log.txt 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo "ERROR: npm install failed. See details below:"
  type npm-install-log.txt
) else (
  echo "npm install completed successfully."
)

echo.
echo "Step 5: Testing build process..."
echo "Running build (this may take a while)..."
call npm run build > npm-build-log.txt 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo "ERROR: Build failed. See details below:"
  type npm-build-log.txt
) else (
  echo "Build completed successfully."
)

echo.
echo "===== Diagnosis Complete ====="
cd ..
