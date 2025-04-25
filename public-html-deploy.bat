@echo off
echo ===================================
echo DEPLOY PUBLIC HTML SITE TO VERCEL
echo ===================================
echo.
echo This script creates a minimal public HTML site and deploys it to Vercel
echo to verify public access and routing configurations work correctly.
echo.

REM Create public directory if it doesn't exist
if not exist "public" mkdir public

REM Create a simple HTML page
echo Creating index.html...
echo ^<!DOCTYPE html^> > public\index.html
echo ^<html lang="en"^> >> public\index.html
echo ^<head^> >> public\index.html
echo   ^<meta charset="UTF-8"^> >> public\index.html
echo   ^<meta name="viewport" content="width=device-width, initial-scale=1.0"^> >> public\index.html
echo   ^<title^>Auto AGI Builder^</title^> >> public\index.html
echo   ^<style^> >> public\index.html
echo     body { >> public\index.html
echo       font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; >> public\index.html
echo       margin: 0; >> public\index.html
echo       padding: 0; >> public\index.html
echo       box-sizing: border-box; >> public\index.html
echo       background: linear-gradient(135deg, #f5f7fa 0%%, #c3cfe2 100%%); >> public\index.html
echo       min-height: 100vh; >> public\index.html
echo       display: flex; >> public\index.html
echo       flex-direction: column; >> public\index.html
echo       justify-content: center; >> public\index.html
echo       align-items: center; >> public\index.html
echo     } >> public\index.html
echo     .container { >> public\index.html
echo       background-color: white; >> public\index.html
echo       border-radius: 12px; >> public\index.html
echo       box-shadow: 0 10px 25px rgba(0,0,0,0.1); >> public\index.html
echo       padding: 2rem; >> public\index.html
echo       max-width: 800px; >> public\index.html
echo       width: 90%%; >> public\index.html
echo       text-align: center; >> public\index.html
echo     } >> public\index.html
echo     h1 { >> public\index.html
echo       color: #333; >> public\index.html
echo       margin-bottom: 1rem; >> public\index.html
echo       font-size: 2.5rem; >> public\index.html
echo     } >> public\index.html
echo     p { >> public\index.html
echo       color: #666; >> public\index.html
echo       font-size: 1.2rem; >> public\index.html
echo       line-height: 1.6; >> public\index.html
echo     } >> public\index.html
echo     .status { >> public\index.html
echo       margin: 2rem 0; >> public\index.html
echo       padding: 1rem; >> public\index.html
echo       background-color: #e8f5e9; >> public\index.html
echo       border-radius: 8px; >> public\index.html
echo       color: #2e7d32; >> public\index.html
echo       font-weight: bold; >> public\index.html
echo     } >> public\index.html
echo     .footer { >> public\index.html
echo       margin-top: 2rem; >> public\index.html
echo       font-size: 0.9rem; >> public\index.html
echo       color: #999; >> public\index.html
echo     } >> public\index.html
echo   ^</style^> >> public\index.html
echo ^</head^> >> public\index.html
echo ^<body^> >> public\index.html
echo   ^<div class="container"^> >> public\index.html
echo     ^<h1^>Auto AGI Builder^</h1^> >> public\index.html
echo     ^<p^>Intelligent software solution for automating your development workflow^</p^> >> public\index.html
echo     ^<div class="status"^> >> public\index.html
echo       ✅ Deployment Successful! Public access is working correctly. >> public\index.html
echo     ^</div^> >> public\index.html
echo     ^<p^>This simplified page confirms that the Vercel deployment configuration is functioning properly with public access enabled.^</p^> >> public\index.html
echo     ^<div class="footer"^> >> public\index.html
echo       © 2025 Auto AGI Builder >> public\index.html
echo     ^</div^> >> public\index.html
echo   ^</div^> >> public\index.html
echo ^</body^> >> public\index.html
echo ^</html^> >> public\index.html

REM Create a proper vercel.json configuration
echo Creating vercel.json...
echo { > vercel.json
echo   "version": 2, >> vercel.json
echo   "public": true, >> vercel.json
echo   "github": { >> vercel.json
echo     "silent": true >> vercel.json 
echo   } >> vercel.json
echo } >> vercel.json

REM Create a package.json file for deploying static files
echo Creating package.json...
echo { > package.json
echo   "name": "auto-agi-builder-public-demo", >> package.json
echo   "version": "1.0.0", >> package.json
echo   "description": "Public deployment demo for Auto AGI Builder", >> package.json
echo   "scripts": { >> package.json
echo     "start": "serve public" >> package.json
echo   } >> package.json
echo } >> package.json

REM Add the files to git
echo Adding files to git...
git add public\index.html vercel.json package.json

REM Commit the changes
echo Committing changes...
git commit -m "Add public HTML deployment files for testing"

REM Push to remote repository
echo Pushing to remote repository...
git push origin main

REM Deploy to Vercel
echo Deploying to Vercel...
vercel --prod

echo.
echo ===================================
echo DEPLOYMENT COMPLETED
echo ===================================
echo.
echo Check the deployment URL to verify the public HTML site is accessible.

pause
