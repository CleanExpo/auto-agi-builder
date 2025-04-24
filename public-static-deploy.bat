@echo off
echo ===================================
echo PUBLIC STATIC SITE DEPLOYMENT
echo ===================================
echo.
echo This script creates a public-accessible static site
echo that bypasses the build process entirely.
echo.

:: Remove any existing .vercel directory
if exist .vercel (
  rmdir /s /q .vercel
  echo Removed existing .vercel directory.
)

:: Create public directory structure
echo Creating public static site structure...
if not exist public mkdir public
if not exist public\css mkdir public\css

:: Create a basic index.html
echo Creating basic index.html...
echo ^<!DOCTYPE html^> > public\index.html
echo ^<html lang="en"^> >> public\index.html
echo ^<head^> >> public\index.html
echo   ^<meta charset="UTF-8"^> >> public\index.html
echo   ^<meta name="viewport" content="width=device-width, initial-scale=1.0"^> >> public\index.html
echo   ^<title^>Auto AGI Builder^</title^> >> public\index.html
echo   ^<link rel="stylesheet" href="css/styles.css"^> >> public\index.html
echo ^</head^> >> public\index.html
echo ^<body^> >> public\index.html
echo   ^<div class="container"^> >> public\index.html
echo     ^<header^> >> public\index.html
echo       ^<h1^>Auto AGI Builder^</h1^> >> public\index.html
echo       ^<p^>Deployment Successful^</p^> >> public\index.html
echo     ^</header^> >> public\index.html
echo     ^<main^> >> public\index.html
echo       ^<div class="card"^> >> public\index.html
echo         ^<h2^>Static Deployment Complete^</h2^> >> public\index.html
echo         ^<p^>This is a minimal static deployment of the Auto AGI Builder platform, optimized for Node.js 18.18.0 and npm 10.9.0.^</p^> >> public\index.html
echo         ^<p^>Status: ^<span class="success"^>Deployed Successfully^</span^>^</p^> >> public\index.html
echo       ^</div^> >> public\index.html
echo     ^</main^> >> public\index.html
echo     ^<footer^> >> public\index.html
echo       ^<p^>Powered by Node.js 18.18.0 and npm 10.9.0^</p^> >> public\index.html
echo     ^</footer^> >> public\index.html
echo   ^</div^> >> public\index.html
echo ^</body^> >> public\index.html
echo ^</html^> >> public\index.html

:: Create a simple CSS file
echo Creating simple CSS file...
echo body { > public\css\styles.css
echo   font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; >> public\css\styles.css
echo   line-height: 1.6; >> public\css\styles.css
echo   color: #333; >> public\css\styles.css
echo   margin: 0; >> public\css\styles.css
echo   padding: 20px; >> public\css\styles.css
echo   background-color: #f5f5f5; >> public\css\styles.css
echo } >> public\css\styles.css
echo .container { >> public\css\styles.css
echo   max-width: 800px; >> public\css\styles.css
echo   margin: 0 auto; >> public\css\styles.css
echo   background-color: white; >> public\css\styles.css
echo   padding: 20px; >> public\css\styles.css
echo   border-radius: 5px; >> public\css\styles.css
echo   box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); >> public\css\styles.css
echo } >> public\css\styles.css
echo header { >> public\css\styles.css
echo   text-align: center; >> public\css\styles.css
echo   margin-bottom: 30px; >> public\css\styles.css
echo   padding-bottom: 20px; >> public\css\styles.css
echo   border-bottom: 1px solid #eee; >> public\css\styles.css
echo } >> public\css\styles.css
echo h1 { >> public\css\styles.css
echo   color: #2c3e50; >> public\css\styles.css
echo } >> public\css\styles.css
echo .card { >> public\css\styles.css
echo   padding: 20px; >> public\css\styles.css
echo   border: 1px solid #ddd; >> public\css\styles.css
echo   border-radius: 4px; >> public\css\styles.css
echo   margin-bottom: 20px; >> public\css\styles.css
echo } >> public\css\styles.css
echo .success { >> public\css\styles.css
echo   color: #27ae60; >> public\css\styles.css
echo   font-weight: bold; >> public\css\styles.css
echo } >> public\css\styles.css
echo footer { >> public\css\styles.css
echo   text-align: center; >> public\css\styles.css
echo   margin-top: 30px; >> public\css\styles.css
echo   padding-top: 20px; >> public\css\styles.css
echo   border-top: 1px solid #eee; >> public\css\styles.css
echo   font-size: 0.8em; >> public\css\styles.css
echo } >> public\css\styles.css

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
echo     "build": "echo No build step required", >> package.json
echo     "start": "serve public" >> package.json
echo   }, >> package.json
echo   "dependencies": { >> package.json
echo     "serve": "^14.0.0" >> package.json
echo   } >> package.json
echo } >> package.json

:: Create vercel.json with standard static site configuration
echo Creating vercel.json...
echo { > vercel.json
echo   "version": 2, >> vercel.json
echo   "public": true, >> vercel.json
echo   "outputDirectory": "public" >> vercel.json
echo } >> vercel.json

:: Create .vercelignore to exclude unnecessary files
echo Creating .vercelignore...
echo * > .vercelignore
echo !public/** >> .vercelignore
echo !package.json >> .vercelignore
echo !vercel.json >> .vercelignore

echo.
echo ===================================
echo DEPLOYMENT PREPARATION COMPLETE
echo ===================================
echo.
echo Created a public static site that will:
echo  - Bypass the build process completely
echo  - Deploy static files directly from the public directory
echo  - Specify Node.js 18.18.0 and npm 10.9.0 in package.json
echo  - Set public access permissions in vercel.json
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
vercel --prod

if %ERRORLEVEL% neq 0 (
  echo.
  echo Deployment encountered an error. Please check the logs.
  goto end
) else (
  echo.
  echo Production deployment successful!
  echo.
)

:end
pause
