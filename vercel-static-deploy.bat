@echo off
echo ===================================
echo VERCEL STATIC DEPLOYMENT
echo ===================================
echo.
echo This script properly prepares a static site for Vercel deployment
echo and runs vercel build locally to avoid memory issues.
echo.

:: Remove .vercel directory if it exists
echo Removing .vercel directory if it exists...
if exist .vercel rmdir /s /q .vercel
echo Done.

:: Create a simplified vercel.json for static deployment
echo Creating optimized vercel.json...
echo { > vercel.json
echo   "version": 2, >> vercel.json
echo   "framework": "nextjs", >> vercel.json
echo   "buildCommand": "cd frontend && npm install && npm run build && npm run export", >> vercel.json
echo   "outputDirectory": "frontend/out" >> vercel.json
echo } >> vercel.json
echo vercel.json created.

:: Create a simplified package.json in root
echo Creating root package.json...
echo { > package.json
echo   "name": "auto-agi-builder", >> package.json
echo   "version": "1.0.0", >> package.json
echo   "private": true, >> package.json
echo   "scripts": { >> package.json
echo     "build": "cd frontend && npm install && npm run build && npm run export", >> package.json
echo     "start": "cd frontend && npm run start" >> package.json
echo   }, >> package.json
echo   "dependencies": { >> package.json
echo     "next": "^13.5.2" >> package.json
echo   } >> package.json
echo } >> package.json
echo package.json created.

:: Add an export script to frontend package.json if it doesn't exist
echo Updating frontend package.json to add export command...
cd frontend

:: Check if package.json has the export script
findstr /C:"export" package.json > nul
if %errorlevel% neq 0 (
  echo Current package.json doesn't have export script, creating backup...
  copy package.json package.json.bak
  
  :: Add export script using node
  node -e "const fs = require('fs'); const pkg = JSON.parse(fs.readFileSync('package.json')); pkg.scripts.export = 'next export'; fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));"
  echo Export script added to frontend package.json
) else (
  echo Export script already exists in frontend package.json
)

cd ..

:: Create a strict .vercelignore file
echo Creating .vercelignore file...
echo * > .vercelignore
echo !frontend/** >> .vercelignore
echo !package.json >> .vercelignore
echo !vercel.json >> .vercelignore
echo .vercelignore file created.

echo.
echo ===================================
echo RUNNING VERCEL BUILD LOCALLY
echo ===================================
echo.
echo This will run the build process locally and prepare
echo the output in the correct format for deployment.
echo.
echo Press any key to start the build process...
pause > nul

:: Run vercel build
echo.
echo Running 'vercel build' to prepare deployment...
vercel build

if %ERRORLEVEL% neq 0 (
  echo.
  echo Build process encountered an error.
  echo Check the logs above for details.
  goto :error
) else (
  echo.
  echo Build process completed successfully!
  echo Static files are prepared for deployment.
)

echo.
echo ===================================
echo DEPLOYING TO VERCEL
echo ===================================
echo.
echo Ready to deploy using the prebuilt files.
echo.
echo Press any key to deploy to Vercel...
pause > nul

:: Run vercel deploy with prebuilt flag
echo.
echo Running 'vercel deploy --prebuilt' to deploy static files...
vercel deploy --prebuilt

echo.
echo If preview deployment was successful, you can deploy to production with:
echo vercel deploy --prebuilt --prod
echo.
pause

goto :end

:error
echo.
echo Deployment process failed.
echo.

:end
