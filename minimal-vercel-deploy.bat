@echo off
echo ===================================
echo MINIMAL VERCEL DEPLOYMENT
echo ===================================
echo.
echo This script creates an absolute minimal deployment
echo that only includes essential frontend files.
echo.

:: Remove any existing .vercel directory
if exist .vercel (
  rmdir /s /q .vercel
  echo Removed existing .vercel directory.
)

:: Create minimal package.json
echo Creating minimal package.json with specific Node/npm engines...
echo {^
  "name": "auto-agi-builder",^
  "version": "1.0.0",^
  "private": true,^
  "engines": {^
    "node": "18.18.0",^
    "npm": "10.9.0"^
  },^
  "scripts": {^
    "build": "cd frontend && npm install && npm run build",^
    "start": "cd frontend && npm run start"^
  },^
  "dependencies": {^
    "next": "^13.5.2"^
  }^
} > package.json

:: Create minimal vercel.json
echo Creating minimal vercel.json...
echo {^
  "version": 2,^
  "framework": "nextjs",^
  "buildCommand": "cd frontend && npm install && npm run build",^
  "outputDirectory": "frontend/.next"^
} > vercel.json

:: Create strict .vercelignore that ignores everything except what's necessary
echo Creating strict .vercelignore...
echo * > .vercelignore
echo !frontend/pages/** >> .vercelignore
echo !frontend/components/** >> .vercelignore
echo !frontend/styles/** >> .vercelignore
echo !frontend/public/** >> .vercelignore
echo !frontend/next.config.js >> .vercelignore
echo !frontend/package.json >> .vercelignore
echo !frontend/tailwind.config.js >> .vercelignore
echo !frontend/postcss.config.js >> .vercelignore
echo !frontend/jsconfig.json >> .vercelignore
echo !package.json >> .vercelignore
echo !vercel.json >> .vercelignore

echo.
echo ===================================
echo READY TO DEPLOY
echo ===================================
echo.
echo Files prepared for minimal deployment.
echo Run the following commands to deploy:
echo.
echo   vercel
echo.
echo After successful project setup, deploy to production with:
echo.
echo   vercel --prod
echo.
echo Press any key to run vercel now...
pause > nul

vercel
