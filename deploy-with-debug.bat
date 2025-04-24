@echo off
echo "===== Starting deployment with enhanced debugging ====="

echo "1. Cleaning up any previous build artifacts..."
if exist "frontend\.next" (
  rmdir /s /q "frontend\.next"
  echo "   Cleaned .next directory"
)

echo "2. Setting up environment variables..."
copy .env.example frontend\.env.local
echo "   Environment variables copied to frontend/.env.local"

echo "3. Installing frontend dependencies with detailed logging..."
cd frontend
call npm install --verbose > npm-install-log.txt 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo "   ERROR: npm install failed! Check npm-install-log.txt for details"
  cd ..
  exit /b 1
)
echo "   Dependencies installed successfully"

echo "4. Building frontend with detailed logging..."
call npm run build > npm-build-log.txt 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo "   ERROR: npm build failed! Check npm-build-log.txt for details"
  cd ..
  exit /b 1
)
echo "   Build completed successfully"
cd ..

echo "5. Deploying to Vercel..."
call vercel --prod

echo "===== Deployment process completed ====="
