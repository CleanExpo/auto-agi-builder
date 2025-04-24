@echo off
echo ===================================
echo Auto AGI Builder Fixed Next.js Configuration
echo ===================================
echo.

echo Step 1: Navigating to project directory...
cd /d "C:\Users\PhillMcGurk\OneDrive - Disaster Recovery\1111\Auto AGI Builder\frontend"
if %ERRORLEVEL% neq 0 (
    echo Error: Failed to navigate to project directory.
    goto :end
)
echo Successfully navigated to frontend directory.
echo.

echo Step 2: Creating proper next.config.js file...
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

echo Step 3: Returning to root directory...
cd ..
echo Successfully returned to root directory.
echo.

echo Step 4: Setting up static deployment...
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
echo Successfully created vercel.json for static site deployment.
echo.

echo Step 5: Setting up .vercelignore file...
echo # Python backend files > .vercelignore
echo app/ >> .vercelignore
echo tests/ >> .vercelignore
echo requirements.txt >> .vercelignore
echo *.py >> .vercelignore
echo Successfully created .vercelignore file.
echo.

echo Step 6: Configuring project.json...
mkdir ".vercel" 2>nul
echo {> .vercel\project.json
echo   "projectId": "prj_zJDsetW3XUQ8Pgw0EhEgeZVUk0Ss",>> .vercel\project.json
echo   "orgId": "team_hIVuEbN4ena7UPqg1gt1jb6s",>> .vercel\project.json
echo   "settings": {>> .vercel\project.json
echo     "framework": "nextjs",>> .vercel\project.json
echo     "buildCommand": null,>> .vercel\project.json
echo     "devCommand": null,>> .vercel\project.json
echo     "outputDirectory": null>> .vercel\project.json
echo   }>> .vercel\project.json
echo }>> .vercel\project.json
echo Successfully created .vercel/project.json configuration.
echo.

echo Step 7: Creating package.json in root...
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
echo Configuration is complete. You can now run:
echo vercel --prod
echo.
echo Press any key to proceed with deployment...
pause > nul

echo Starting Vercel deployment...
vercel --prod

:end
echo.
echo Press any key to exit...
pause > nul
