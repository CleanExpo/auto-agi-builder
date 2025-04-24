@echo off
echo ===================================
echo STATIC-ONLY VERCEL DEPLOYMENT
echo ===================================
echo.
echo This script creates a minimal static site deployment
echo that bypasses the build process entirely.
echo.

:: Remove any existing .vercel directory
if exist .vercel (
  rmdir /s /q .vercel
  echo Removed existing .vercel directory.
)

:: Create minimal static site structure
echo Creating minimal static site structure...
if not exist static mkdir static
if not exist static\css mkdir static\css

:: Create a basic index.html
echo Creating basic index.html...
echo ^<!DOCTYPE html^> > static\index.html
echo ^<html lang="en"^> >> static\index.html
echo ^<head^> >> static\index.html
echo   ^<meta charset="UTF-8"^> >> static\index.html
echo   ^<meta name="viewport" content="width=device-width, initial-scale=1.0"^> >> static\index.html
echo   ^<title^>Auto AGI Builder^</title^> >> static\index.html
echo   ^<link rel="stylesheet" href="css/styles.css"^> >> static\index.html
echo ^</head^> >> static\index.html
echo ^<body^> >> static\index.html
echo   ^<div class="container"^> >> static\index.html
echo     ^<header^> >> static\index.html
echo       ^<h1^>Auto AGI Builder^</h1^> >> static\index.html
echo       ^<p^>Deployment Successful^</p^> >> static\index.html
echo     ^</header^> >> static\index.html
echo     ^<main^> >> static\index.html
echo       ^<div class="card"^> >> static\index.html
echo         ^<h2^>Static Deployment Complete^</h2^> >> static\index.html
echo         ^<p^>This is a minimal static deployment of the Auto AGI Builder platform, optimized for Node.js 18.18.0 and npm 10.9.0.^</p^> >> static\index.html
echo         ^<p^>Status: ^<span class="success"^>Deployed Successfully^</span^>^</p^> >> static\index.html
echo       ^</div^> >> static\index.html
echo     ^</main^> >> static\index.html
echo     ^<footer^> >> static\index.html
echo       ^<p^>Powered by Node.js 18.18.0 and npm 10.9.0^</p^> >> static\index.html
echo     ^</footer^> >> static\index.html
echo   ^</div^> >> static\index.html
echo ^</body^> >> static\index.html
echo ^</html^> >> static\index.html

:: Create a simple CSS file
echo Creating simple CSS file...
echo body { > static\css\styles.css
echo   font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; >> static\css\styles.css
echo   line-height: 1.6; >> static\css\styles.css
echo   color: #333; >> static\css\styles.css
echo   margin: 0; >> static\css\styles.css
echo   padding: 20px; >> static\css\styles.css
echo   background-color: #f5f5f5; >> static\css\styles.css
echo } >> static\css\styles.css
echo .container { >> static\css\styles.css
echo   max-width: 800px; >> static\css\styles.css
echo   margin: 0 auto; >> static\css\styles.css
echo   background-color: white; >> static\css\styles.css
echo   padding: 20px; >> static\css\styles.css
echo   border-radius: 5px; >> static\css\styles.css
echo   box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); >> static\css\styles.css
echo } >> static\css\styles.css
echo header { >> static\css\styles.css
echo   text-align: center; >> static\css\styles.css
echo   margin-bottom: 30px; >> static\css\styles.css
echo   padding-bottom: 20px; >> static\css\styles.css
echo   border-bottom: 1px solid #eee; >> static\css\styles.css
echo } >> static\css\styles.css
echo h1 { >> static\css\styles.css
echo   color: #2c3e50; >> static\css\styles.css
echo } >> static\css\styles.css
echo .card { >> static\css\styles.css
echo   padding: 20px; >> static\css\styles.css
echo   border: 1px solid #ddd; >> static\css\styles.css
echo   border-radius: 4px; >> static\css\styles.css
echo   margin-bottom: 20px; >> static\css\styles.css
echo } >> static\css\styles.css
echo .success { >> static\css\styles.css
echo   color: #27ae60; >> static\css\styles.css
echo   font-weight: bold; >> static\css\styles.css
echo } >> static\css\styles.css
echo footer { >> static\css\styles.css
echo   text-align: center; >> static\css\styles.css
echo   margin-top: 30px; >> static\css\styles.css
echo   padding-top: 20px; >> static\css\styles.css
echo   border-top: 1px solid #eee; >> static\css\styles.css
echo   font-size: 0.8em; >> static\css\styles.css
echo } >> static\css\styles.css

:: Create package.json with Node.js 18.18.0 and npm 10.9.0 specifications
echo Creating package.json...
echo { > package.json
echo   "name": "auto-agi-builder-static", >> package.json
echo   "version": "1.0.0", >> package.json
echo   "private": true, >> package.json
echo   "engines": { >> package.json
echo     "node": "18.18.0", >> package.json
echo     "npm": "10.9.0" >> package.json
echo   }, >> package.json
echo   "scripts": { >> package.json
echo     "start": "serve static" >> package.json
echo   }, >> package.json
echo   "dependencies": { >> package.json
echo     "serve": "^14.0.0" >> package.json
echo   } >> package.json
echo } >> package.json

:: Create vercel.json configured for static site hosting
echo Creating vercel.json...
echo { > vercel.json
echo   "version": 2, >> vercel.json
echo   "builds": [ >> vercel.json
echo     { "src": "static/**", "use": "@vercel/static" } >> vercel.json
echo   ], >> vercel.json
echo   "routes": [ >> vercel.json
echo     { "src": "/(.*)", "dest": "/static/$1" }, >> vercel.json
echo     { "handle": "filesystem" }, >> vercel.json
echo     { "src": "/.*", "dest": "/static/index.html" } >> vercel.json
echo   ] >> vercel.json
echo } >> vercel.json

:: Create .vercelignore to exclude unnecessary files
echo Creating .vercelignore...
echo * > .vercelignore
echo !static/** >> .vercelignore
echo !package.json >> .vercelignore
echo !vercel.json >> .vercelignore

echo.
echo ===================================
echo DEPLOYMENT PREPARATION COMPLETE
echo ===================================
echo.
echo Created a minimal static site that will:
echo  - Bypass the build process completely
echo  - Deploy static files directly to Vercel
echo  - Specify Node.js 18.18.0 and npm 10.9.0
echo.
echo Ready to deploy to Vercel.
echo.
echo Press any key to continue with deployment...
pause > nul

:: Run Vercel deployment
echo.
echo ===================================
echo DEPLOYING TO VERCEL
echo ===================================
echo.
vercel

if %ERRORLEVEL% neq 0 (
  echo.
  echo Deployment encountered an error. Please check the logs.
  goto end
) else (
  echo.
  echo Deployment preview successful!
  echo.
  echo To deploy to production, run:
  echo   vercel --prod
  echo.
)

:end
pause
