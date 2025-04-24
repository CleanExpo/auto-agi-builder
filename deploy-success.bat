@echo off
echo ===================================
echo Auto AGI Builder Final Deployment Solution
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

echo Step 2: Checking and fixing frontend package.json...
cd frontend
echo Ensuring Next.js is properly listed in dependencies...

echo {> package.json
echo   "name": "auto-agi-builder-frontend",>> package.json
echo   "version": "1.0.0",>> package.json
echo   "private": true,>> package.json
echo   "dependencies": {>> package.json
echo     "next": "^13.4.19",>> package.json
echo     "react": "^18.2.0",>> package.json
echo     "react-dom": "^18.2.0">> package.json
echo   },>> package.json
echo   "scripts": {>> package.json
echo     "dev": "next dev",>> package.json
echo     "build": "next build",>> package.json
echo     "start": "next start">> package.json
echo   }>> package.json
echo }>> package.json
echo Successfully created frontend package.json with proper Next.js dependency.
echo.

echo Step 3: Creating proper next.config.js file...
echo // next.config.js> next.config.js
echo module.exports = {>> next.config.js
echo   output: 'export',>> next.config.js
echo   distDir: 'out',>> next.config.js
echo   images: {>> next.config.js
echo     unoptimized: true>> next.config.js
echo   }>> next.config.js
echo };>> next.config.js
echo Successfully created proper next.config.js file with static export configuration.
echo.

echo Step 4: Returning to root directory and cleaning root configuration...
cd ..
echo { > package.json
echo   "name": "auto-agi-builder",>> package.json
echo   "version": "1.0.0",>> package.json
echo   "private": true,>> package.json
echo   "scripts": {>> package.json
echo     "vercel-build": "cd frontend && npm install && npm run build",>> package.json
echo     "start": "cd frontend && npm run start">> package.json
echo   }>> package.json
echo }>> package.json
echo Successfully created root package.json with proper build script.
echo.

echo Step 5: Setting up simplified Vercel configuration...
echo { > vercel.json
echo   "version": 2, >> vercel.json
echo   "buildCommand": "npm run vercel-build", >> vercel.json
echo   "outputDirectory": "frontend/out", >> vercel.json
echo   "framework": null, >> vercel.json
echo   "installCommand": "npm install", >> vercel.json
echo   "routes": [ >> vercel.json
echo     { "handle": "filesystem" }, >> vercel.json
echo     { "src": "/(.*)", "dest": "/$1" } >> vercel.json
echo   ] >> vercel.json
echo } >> vercel.json
echo Successfully created clean vercel.json for static site deployment.
echo.

echo Step 6: Setting up .vercelignore file...
echo # Python backend files > .vercelignore
echo app/ >> .vercelignore
echo tests/ >> .vercelignore
echo requirements.txt >> .vercelignore
echo *.py >> .vercelignore
echo Successfully created .vercelignore file.
echo.

echo Step 7: Creating project.json with correct IDs...
mkdir ".vercel" 2>nul
echo {> .vercel\project.json
echo   "projectId": "prj_zJDsetW3XUQ8Pgw0EhEgeZVUk0Ss",>> .vercel\project.json
echo   "orgId": "team_hIVuEbN4ena7UPqg1gt1jb6s">> .vercel\project.json
echo }>> .vercel\project.json
echo Successfully created .vercel/project.json with essential IDs.
echo.

echo Step 8: Ready to deploy...
echo.
echo Final deployment solution is ready:
echo - Fixed frontend package.json to include Next.js
echo - Set up static export configuration
echo - Created clean root package.json with proper build command
echo - Simplified Vercel configuration to focus on static deployment
echo - Excluded Python backend entirely
echo.
echo Press any key to proceed with deployment...
pause > nul

echo Starting final Vercel deployment...
vercel --prod

:end
echo.
echo Press any key to exit...
pause > nul
