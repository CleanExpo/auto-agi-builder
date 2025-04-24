@echo off
echo ===================================
echo Auto AGI Builder Python Deployment Fix
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

echo Step 2: Creating enhanced Vercel configuration...
echo { > vercel.json
echo   "version": 2, >> vercel.json
echo   "builds": [ >> vercel.json
echo     { "src": "frontend/package.json", "use": "@vercel/next" }, >> vercel.json
echo     { "src": "app/main.py", "use": "@vercel/python" } >> vercel.json
echo   ], >> vercel.json
echo   "routes": [ >> vercel.json
echo     { "src": "/api/(.*)", "dest": "app/main.py" }, >> vercel.json
echo     { "src": "/(.*)", "dest": "frontend/$1" } >> vercel.json
echo   ], >> vercel.json
echo   "env": { >> vercel.json
echo     "SENTRY_DSN": "" >> vercel.json
echo   } >> vercel.json
echo } >> vercel.json
echo Successfully created enhanced vercel.json configuration.
echo.

echo Step 3: Creating Python build requirements...
echo -e "fastapi\nuvicorn\npydantic" > requirements.txt
echo Successfully created basic requirements.txt.
echo.

echo Step 4: Setting up Vercel project config...
mkdir ".vercel" 2>nul
echo {> .vercel\project.json
echo   "projectId": "prj_zJDsetW3XUQ8Pgw0EhEgeZVUk0Ss",>> .vercel\project.json
echo   "orgId": "team_hIVuEbN4ena7UPqg1gt1jb6s">> .vercel\project.json
echo }>> .vercel\project.json
echo Successfully created .vercel/project.json configuration.
echo.

echo Step 5: Creating build-specific configuration...
echo { > .vercelignore
echo   "**/*.log" >> .vercelignore
echo   "**/.git" >> .vercelignore
echo   "**/.env.local" >> .vercelignore
echo   "**/.DS_Store" >> .vercelignore
echo } >> .vercelignore
echo Successfully created .vercelignore file.
echo.

echo Step 6: Ready for deployment!
echo.
echo The Python configuration has been fixed. You can now run:
echo vercel --prod
echo.
echo Press any key to exit...
pause > nul
