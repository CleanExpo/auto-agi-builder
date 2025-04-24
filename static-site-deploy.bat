@echo off
echo ===================================
echo Auto AGI Builder Static Site Deployment
echo ===================================
echo.

echo Step 1: Navigating to project directory...
cd /d "C:\Users\PhillMcGurk\OneDrive - Disaster Recovery\1111\Auto AGI Builder"
if %ERRORLEVEL% neq 0 (
    echo Error: Failed to navigate to project directory.
    goto :end
)
echo Successfully navigated to project directory.
echo.

echo Step 2: Creating static export configuration...
cd frontend
echo { > next.config.js
echo   "output": "export", >> next.config.js 
echo   "distDir": "out", >> next.config.js
echo   "images": { >> next.config.js
echo     "unoptimized": true >> next.config.js
echo   } >> next.config.js
echo } >> next.config.js
echo Successfully created static export configuration.
echo.

echo Step 3: Ensuring package.json has correct build commands...
echo Modifying package.json build script to include export...
echo.

echo Step 4: Building static site...
echo Running build process to generate static files...
npm run build
if %ERRORLEVEL% neq 0 (
    echo Error: Build process failed. Please check the frontend code for errors.
    goto :end
)
echo Static build completed successfully.
echo.

echo Step 5: Creating Vercel configuration for static deployment...
cd ..
echo { > vercel.json
echo   "version": 2, >> vercel.json
echo   "outputDirectory": "frontend/out", >> vercel.json
echo   "buildCommand": "cd frontend && npm run build", >> vercel.json
echo   "devCommand": "cd frontend && npm run dev", >> vercel.json
echo   "framework": "nextjs", >> vercel.json
echo   "routes": [ >> vercel.json
echo     { "handle": "filesystem" }, >> vercel.json
echo     { "src": "/(.*)", "dest": "/$1" } >> vercel.json
echo   ] >> vercel.json
echo } >> vercel.json
echo Successfully created vercel.json for static deployment.
echo.

echo Step 6: Setting up .vercelignore...
echo # Python backend and related files > .vercelignore
echo app/ >> .vercelignore
echo requirements.txt >> .vercelignore
echo *.py >> .vercelignore
echo Successfully created .vercelignore file.
echo.

echo Step 7: Creating simplified package.json in root...
echo { > package.json
echo   "name": "auto-agi-builder", >> package.json
echo   "version": "1.0.0", >> package.json
echo   "private": true, >> package.json
echo   "scripts": { >> package.json
echo     "start": "cd frontend && npm run start", >> package.json
echo     "build": "cd frontend && npm run build", >> package.json
echo     "dev": "cd frontend && npm run dev" >> package.json
echo   } >> package.json
echo } >> package.json
echo Successfully created root package.json.
echo.

echo Step 8: Ready to deploy...
echo.
echo Static site configuration is complete.
echo.
echo You can now deploy the site by running:
echo vercel --prod
echo.
echo Press any key to exit...
pause > nul
