@echo off
echo ===================================
echo Auto AGI Builder Package.json Repair
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

echo Step 2: Creating a new clean package.json file...
echo { > package.json
echo   "name": "auto-agi-builder", >> package.json
echo   "version": "1.0.0", >> package.json
echo   "description": "Auto AGI Builder Application", >> package.json
echo   "private": true, >> package.json
echo   "scripts": { >> package.json
echo     "dev": "next dev", >> package.json
echo     "build": "next build", >> package.json
echo     "start": "next start", >> package.json
echo     "lint": "next lint" >> package.json
echo   }, >> package.json
echo   "dependencies": { >> package.json
echo     "next": "^12.3.1", >> package.json
echo     "react": "^18.2.0", >> package.json
echo     "react-dom": "^18.2.0", >> package.json
echo     "axios": "^1.1.3" >> package.json
echo   }, >> package.json
echo   "devDependencies": { >> package.json
echo     "autoprefixer": "^10.4.12", >> package.json
echo     "eslint": "^8.25.0", >> package.json
echo     "eslint-config-next": "^12.3.1", >> package.json
echo     "postcss": "^8.4.17", >> package.json
echo     "tailwindcss": "^3.1.8" >> package.json
echo   } >> package.json
echo } >> package.json
echo Successfully created a clean package.json file.
echo.

echo Step 3: Setting up Vercel configuration...
mkdir ".vercel" 2>nul
echo {> .vercel\project.json
echo   "projectId": "prj_zJDsetW3XUQ8Pgw0EhEgeZVUk0Ss",>> .vercel\project.json
echo   "orgId": "team_hIVuEbN4ena7UPqg1gt1jb6s">> .vercel\project.json
echo }>> .vercel\project.json
echo Successfully created .vercel/project.json configuration.
echo.

echo Step 4: Creating Vercel environment configuration...
echo {> vercel.json
echo   "env": {>> vercel.json
echo     "SENTRY_DSN": "">> vercel.json
echo   },>> vercel.json
echo   "build": {>> vercel.json
echo     "env": {>> vercel.json
echo       "SENTRY_DSN": "">> vercel.json
echo     }>> vercel.json
echo   }>> vercel.json
echo }>> vercel.json
echo Successfully created vercel.json configuration.
echo.

echo Step 5: Ready for deployment
echo.
echo The package.json file has been fixed. You can now run:
echo vercel --prod
echo.
echo Press any key to exit...
pause > nul
