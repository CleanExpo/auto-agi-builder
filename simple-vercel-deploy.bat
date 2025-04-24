@echo off
echo ===================================
echo SIMPLE VERCEL DEPLOYMENT
echo ===================================
echo.
echo This script creates the minimal files needed for deployment
echo and deploys only the frontend to Vercel.
echo.

:: Remove .vercel directory if it exists
echo Removing .vercel directory if it exists...
if exist .vercel rmdir /s /q .vercel
echo Done.

:: Create a strict .vercelignore file
echo Creating .vercelignore file...
echo * > .vercelignore
echo !frontend/** >> .vercelignore
echo !package.json >> .vercelignore
echo !vercel.json >> .vercelignore
echo .vercelignore file created.

:: Create simplified vercel.json
echo Creating vercel.json...
echo { > vercel.json
echo   "version": 2, >> vercel.json
echo   "buildCommand": "npm run build", >> vercel.json
echo   "outputDirectory": "frontend/out", >> vercel.json
echo   "framework": "nextjs" >> vercel.json
echo } >> vercel.json
echo vercel.json created.

:: Create simplified package.json
echo Creating package.json...
echo { > package.json
echo   "name": "auto-agi-builder", >> package.json
echo   "version": "1.0.0", >> package.json
echo   "private": true, >> package.json
echo   "scripts": { >> package.json
echo     "build": "cd frontend && npm install && npm run build", >> package.json
echo     "start": "cd frontend && npm run start" >> package.json
echo   }, >> package.json
echo   "dependencies": { >> package.json
echo     "next": "^13.5.2" >> package.json
echo   } >> package.json
echo } >> package.json
echo package.json created.

echo.
echo ===================================
echo DEPLOYING TO VERCEL
echo ===================================
echo.
echo Press any key to deploy to Vercel...
pause > nul

:: Run vercel
echo.
echo Running 'vercel' to deploy...
vercel

echo.
echo If deployment was successful, you can deploy to production with:
echo vercel --prod
echo.
pause
