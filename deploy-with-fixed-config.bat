@echo off
echo "===== Starting deployment with fixed configuration ====="
echo "1. Adding latest changes to git..."
git add .
git commit -m "Deploying with fixed configuration"

echo "2. Pushing changes to remote repository..."
git push

echo "3. Verifying frontend configuration..."
cd frontend
echo "Checking package.json and next.config.js..."
if not exist package.json (
  echo "ERROR: package.json not found in frontend directory!"
  exit /b 1
)

if not exist next.config.js (
  echo "ERROR: next.config.js not found in frontend directory!"
  exit /b 1
)

echo "4. Creating optimized production build..."
call npm run build

if %ERRORLEVEL% NEQ 0 (
  echo "Build failed. Checking for common issues..."
  echo "- Ensure all environment variables are properly set"
  echo "- Check for syntax errors in components"
  echo "- Verify dependencies are properly installed"
  echo "Please check the error messages above for more details."
  exit /b 1
) else (
  echo "Build successful!"
)

echo "5. Deploying to Vercel production environment..."
npx vercel --prod

if %ERRORLEVEL% NEQ 0 (
  echo "Deployment failed. Please check the error messages above."
  exit /b 1
) else (
  echo "===== Deployment completed successfully! ====="
  echo "Your application should now be available on your Vercel production URL."
)

cd ..
