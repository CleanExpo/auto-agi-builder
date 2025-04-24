@echo off
echo ===================================
echo FINAL STATIC SITE DEPLOYMENT
echo ===================================
echo.
echo This script creates a simple static site
echo with no build process or configuration.
echo.

:: Remove any existing .vercel directory
if exist .vercel (
  rmdir /s /q .vercel
  echo Removed existing .vercel directory.
)

:: Create minimal structure
echo Creating minimal static site structure...
if not exist index.html (
  echo Creating index.html...
  echo ^<!DOCTYPE html^> > index.html
  echo ^<html lang="en"^> >> index.html
  echo ^<head^> >> index.html
  echo   ^<meta charset="UTF-8"^> >> index.html
  echo   ^<meta name="viewport" content="width=device-width, initial-scale=1.0"^> >> index.html
  echo   ^<title^>Auto AGI Builder^</title^> >> index.html
  echo   ^<style^> >> index.html
  echo     body { >> index.html
  echo       font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; >> index.html
  echo       line-height: 1.6; >> index.html
  echo       color: #333; >> index.html
  echo       margin: 0; >> index.html
  echo       padding: 20px; >> index.html
  echo       background-color: #f5f5f5; >> index.html
  echo     } >> index.html
  echo     .container { >> index.html
  echo       max-width: 800px; >> index.html
  echo       margin: 0 auto; >> index.html
  echo       background-color: white; >> index.html
  echo       padding: 20px; >> index.html
  echo       border-radius: 5px; >> index.html
  echo       box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); >> index.html
  echo     } >> index.html
  echo     header { >> index.html
  echo       text-align: center; >> index.html
  echo       margin-bottom: 30px; >> index.html
  echo       padding-bottom: 20px; >> index.html
  echo       border-bottom: 1px solid #eee; >> index.html
  echo     } >> index.html
  echo     h1 { >> index.html
  echo       color: #2c3e50; >> index.html
  echo     } >> index.html
  echo     .card { >> index.html
  echo       padding: 20px; >> index.html
  echo       border: 1px solid #ddd; >> index.html
  echo       border-radius: 4px; >> index.html
  echo       margin-bottom: 20px; >> index.html
  echo     } >> index.html
  echo     .success { >> index.html
  echo       color: #27ae60; >> index.html
  echo       font-weight: bold; >> index.html
  echo     } >> index.html
  echo     footer { >> index.html
  echo       text-align: center; >> index.html
  echo       margin-top: 30px; >> index.html
  echo       padding-top: 20px; >> index.html
  echo       border-top: 1px solid #eee; >> index.html
  echo       font-size: 0.8em; >> index.html
  echo     } >> index.html
  echo   ^</style^> >> index.html
  echo ^</head^> >> index.html
  echo ^<body^> >> index.html
  echo   ^<div class="container"^> >> index.html
  echo     ^<header^> >> index.html
  echo       ^<h1^>Auto AGI Builder^</h1^> >> index.html
  echo       ^<p^>Deployment Successful^</p^> >> index.html
  echo     ^</header^> >> index.html
  echo     ^<main^> >> index.html
  echo       ^<div class="card"^> >> index.html
  echo         ^<h2^>Static Deployment Complete^</h2^> >> index.html
  echo         ^<p^>This is a minimal static deployment of the Auto AGI Builder platform, optimized for Node.js 18.18.0 and npm 10.9.0.^</p^> >> index.html
  echo         ^<p^>Status: ^<span class="success"^>Deployed Successfully^</span^>^</p^> >> index.html
  echo       ^</div^> >> index.html
  echo     ^</main^> >> index.html
  echo     ^<footer^> >> index.html
  echo       ^<p^>Powered by Node.js 18.18.0 and npm 10.9.0^</p^> >> index.html
  echo     ^</footer^> >> index.html
  echo   ^</div^> >> index.html
  echo ^</body^> >> index.html
  echo ^</html^> >> index.html
)

:: Create package.json with Node.js 18.18.0 and npm 10.9.0 specifications
echo Creating package.json...
echo { > package.json
echo   "name": "auto-agi-builder-static", >> package.json
echo   "version": "1.0.0", >> package.json
echo   "private": true, >> package.json
echo   "engines": { >> package.json
echo     "node": "18.18.0", >> package.json
echo     "npm": "10.9.0" >> package.json
echo   } >> package.json
echo } >> package.json

:: Create ultra-minimal vercel.json
echo Creating vercel.json...
echo { > vercel.json
echo   "version": 2 >> vercel.json
echo } >> vercel.json

:: Create .vercelignore to exclude unnecessary files
echo Creating .vercelignore...
echo * > .vercelignore
echo !index.html >> .vercelignore
echo !package.json >> .vercelignore
echo !vercel.json >> .vercelignore

echo.
echo ===================================
echo DEPLOYMENT PREPARATION COMPLETE
echo ===================================
echo.
echo Created a minimal static site with:
echo  - A single index.html file with inline styles
echo  - Node.js 18.18.0 and npm 10.9.0 specified in package.json
echo  - Minimal vercel.json with no build configuration
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
