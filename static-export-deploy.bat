@echo off
echo ===================================
echo STATIC EXPORT DEPLOYMENT
echo ===================================
echo.
echo This script builds the site locally and deploys
echo the static export to Vercel to avoid memory issues.
echo.

:: Remove .vercel directory if it exists
echo Removing .vercel directory if it exists...
if exist .vercel rmdir /s /q .vercel
echo Done.

:: First, build the frontend locally to create static files
echo Building frontend locally...
cd frontend
echo Installing dependencies...
call npm install
echo Running static export build...
call npm run build
call npx next export
cd ..
echo Static export completed successfully.

:: Create a simplified vercel.json for static deployment
echo Creating vercel.json for static deployment...
echo { > vercel.json
echo   "version": 2, >> vercel.json
echo   "public": true, >> vercel.json
echo   "cleanUrls": true, >> vercel.json
echo   "outputDirectory": "frontend/out" >> vercel.json
echo } >> vercel.json
echo vercel.json created for static deployment.

:: Create a strict .vercelignore file
echo Creating .vercelignore file...
echo * > .vercelignore
echo !frontend/out/** >> .vercelignore
echo !vercel.json >> .vercelignore
echo .vercelignore file created.

echo.
echo ===================================
echo DEPLOYING TO VERCEL
echo ===================================
echo.
echo Ready to deploy pre-built static files to Vercel.
echo This approach avoids memory issues during deployment.
echo.
echo Press any key to deploy to Vercel...
pause > nul

:: Run vercel
echo.
echo Running 'vercel --prebuilt' to deploy static files...
vercel --prebuilt

echo.
echo If preview deployment was successful, you can deploy to production with:
echo vercel --prebuilt --prod
echo.
pause
