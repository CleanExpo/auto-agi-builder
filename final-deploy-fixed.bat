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
set VERCEL_PROJECT_ID=prj_zJDsetW3XUQ8Pgw0EhEgeZVUk0Ss
set VERCEL_ORG_ID=team_hIVuEbN4ena7UPqg1gt1jb6s
set VERCEL_TOKEN=ETMf43Je9tpo7EOm9XBNPvQx
set DOMAIN=autoagibuilder.app
set WWW_DOMAIN=www.autoagibuilder.app
set LOCAL_PROJECT_PATH="..\OneDrive - Disaster Recovery\1111\Auto AGI Builder"
set PRODUCTION=true

echo.
echo Creating temporary vercel.json for deployment...
echo { > temp-vercel.json
echo   "env": { >> temp-vercel.json
echo     "SENTRY_DSN": "" >> temp-vercel.json
echo   }, >> temp-vercel.json
echo   "build": { >> temp-vercel.json
echo     "env": { >> temp-vercel.json
echo       "SENTRY_DSN": "" >> temp-vercel.json
echo     } >> temp-vercel.json
echo   } >> temp-vercel.json
echo } >> temp-vercel.json

echo.
echo Moving configuration to the OneDrive project folder...
copy "temp-vercel.json" "%LOCAL_PROJECT_PATH%\vercel.json"
copy "frontend\.env.production" "%LOCAL_PROJECT_PATH%\frontend\.env.production"

echo.
echo Running deployment process...
echo.
echo --- Attempting to deploy from local directory ---
echo.

cd /d %LOCAL_PROJECT_PATH% && npx vercel --prod

echo.
echo Press any key to exit...
pause > nul
