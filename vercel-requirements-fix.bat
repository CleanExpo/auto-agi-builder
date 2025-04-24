@echo off
echo ===================================
echo Auto AGI Builder Python Requirements Fix
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

echo Step 2: Creating proper requirements.txt file...
echo fastapi==0.95.0 > requirements.txt
echo uvicorn==0.21.1 >> requirements.txt
echo pydantic==1.10.7 >> requirements.txt
echo python-dotenv==1.0.0 >> requirements.txt
echo requests==2.28.2 >> requirements.txt
echo starlette==0.26.1 >> requirements.txt
echo typing-extensions==4.5.0 >> requirements.txt
echo aiohttp==3.8.4 >> requirements.txt
echo setuptools==65.5.0 >> requirements.txt
echo wheel==0.38.4 >> requirements.txt
echo Successfully created proper requirements.txt with pinned versions.
echo.

echo Step 3: Creating Vercel Python runtime config...
echo { > vercel.json
echo   "version": 2, >> vercel.json
echo   "builds": [ >> vercel.json
echo     { "src": "app/main.py", "use": "@vercel/python" }, >> vercel.json
echo     { "src": "frontend/package.json", "use": "@vercel/next" } >> vercel.json
echo   ], >> vercel.json
echo   "routes": [ >> vercel.json
echo     { "src": "/api/(.*)", "dest": "app/main.py" }, >> vercel.json
echo     { "src": "/(.*)", "dest": "frontend/$1" } >> vercel.json
echo   ], >> vercel.json
echo   "env": { >> vercel.json
echo     "SENTRY_DSN": "", >> vercel.json
echo     "PYTHONUNBUFFERED": "1" >> vercel.json
echo   } >> vercel.json
echo } >> vercel.json
echo Successfully created enhanced vercel.json configuration.
echo.

echo Step 4: Creating Python build hints...
mkdir .vercel 2>nul
echo {> .vercel\project.json
echo   "projectId": "prj_zJDsetW3XUQ8Pgw0EhEgeZVUk0Ss",>> .vercel\project.json
echo   "orgId": "team_hIVuEbN4ena7UPqg1gt1jb6s",>> .vercel\project.json
echo   "settings": {>> .vercel\project.json
echo     "framework": null,>> .vercel\project.json
echo     "pythonVersion": "3.9",>> .vercel\project.json
echo     "installCommand": "pip install -r requirements.txt">> .vercel\project.json
echo   }>> .vercel\project.json
echo }>> .vercel\project.json
echo Successfully created .vercel/project.json with Python configuration.
echo.

echo Step 5: Creating runtime verification file...
mkdir app 2>nul
echo import os > app\runtime.py
echo def handler(event, context): >> app\runtime.py
echo     return { >> app\runtime.py
echo         "statusCode": 200, >> app\runtime.py
echo         "body": "Python runtime is working correctly" >> app\runtime.py
echo     } >> app\runtime.py
echo Successfully created Python runtime verification file.
echo.

echo Step 6: Ready for deployment!
echo.
echo The Python configuration has been fixed. You can now run:
echo vercel --prod
echo.
echo Press any key to exit...
pause > nul
