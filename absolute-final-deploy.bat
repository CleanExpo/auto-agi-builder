@echo off
echo ===================================
echo Auto AGI Builder Final Production Deployment
echo ===================================
echo.

echo Installing dependencies...
call npm install axios dotenv

echo.
echo Setting proper environment configuration...
set NODE_ENV=production
set SENTRY_DSN=
set PRODUCTION=true

echo.
echo Creating .vercel configuration directory...
mkdir .vercel 2>nul

echo.
echo Creating .vercel/project.json configuration...
echo {> .vercel\project.json
echo   "projectId": "prj_zJDsetW3XUQ8Pgw0EhEgeZVUk0Ss",>> .vercel\project.json
echo   "orgId": "team_hIVuEbN4ena7UPqg1gt1jb6s">> .vercel\project.json
echo }>> .vercel\project.json

echo.
echo Creating vercel.json configuration...
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

echo.
echo Preparing project directory...
set LOCAL_PROJECT_PATH="..\OneDrive - Disaster Recovery\1111\Auto AGI Builder"

echo.
echo Copying configuration files to project directory...
mkdir "%LOCAL_PROJECT_PATH%\.vercel" 2>nul
copy ".vercel\project.json" "%LOCAL_PROJECT_PATH%\.vercel\project.json"
copy "vercel.json" "%LOCAL_PROJECT_PATH%\vercel.json"
copy "frontend\.env.production" "%LOCAL_PROJECT_PATH%\frontend\.env.production"

echo.
echo Running Vercel deployment...
cd /d %LOCAL_PROJECT_PATH%
echo Installing Vercel CLI globally...
call npm install -g vercel
echo Deploying with Vercel CLI...
call vercel --prod

echo.
echo Press any key to exit...
pause > nul
