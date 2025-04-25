@echo off
echo ===================================
echo VERCEL STATIC SITE DEPLOYMENT - WITH PROJECT NAME
echo ===================================
echo.

REM Clean up previous Vercel configuration if it exists
if exist .vercel (
  echo Removing existing Vercel configuration...
  rd /s /q .vercel
)

REM Create .vercelignore file to control what gets deployed
echo Creating .vercelignore file...
echo node_modules > .vercelignore
echo .env >> .vercelignore
echo .env.* >> .vercelignore
echo !frontend/.env.production >> .vercelignore
echo .git >> .vercelignore
echo app/ >> .vercelignore
echo frontend/ >> .vercelignore
echo !frontend/pages >> .vercelignore
echo !frontend/components >> .vercelignore
echo !frontend/styles >> .vercelignore
echo !frontend/public >> .vercelignore
echo quadrants/ >> .vercelignore
echo *.py >> .vercelignore
echo !public/ >> .vercelignore

REM Create simple index.html if it doesn't exist
if not exist public (
  mkdir public
)

if not exist public\index.html (
  echo Creating a simple landing page...
  echo ^<!DOCTYPE html^> > public\index.html
  echo ^<html lang="en"^> >> public\index.html
  echo ^<head^> >> public\index.html
  echo   ^<meta charset="UTF-8"^> >> public\index.html
  echo   ^<meta name="viewport" content="width=device-width, initial-scale=1.0"^> >> public\index.html
  echo   ^<title^>Auto AGI Builder^</title^> >> public\index.html
  echo   ^<style^> >> public\index.html
  echo     body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; line-height: 1.6; margin: 0; padding: 0; color: #333; background-color: #f9f9f9; } >> public\index.html
  echo     .container { max-width: 1200px; margin: 0 auto; padding: 2rem; } >> public\index.html
  echo     header { background-color: #2563eb; color: white; padding: 2rem 0; } >> public\index.html
  echo     header .container { display: flex; justify-content: space-between; align-items: center; } >> public\index.html
  echo     .hero { padding: 4rem 0; text-align: center; } >> public\index.html
  echo     h1 { font-size: 2.5rem; margin-bottom: 1rem; } >> public\index.html
  echo     .button { display: inline-block; background-color: #2563eb; color: white; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 4px; font-weight: 600; margin-top: 1rem; } >> public\index.html
  echo     .button:hover { background-color: #1d4ed8; } >> public\index.html
  echo     .features { padding: 4rem 0; background-color: white; } >> public\index.html
  echo     .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; } >> public\index.html
  echo     .feature { padding: 1.5rem; border-radius: 8px; background-color: #f3f4f6; } >> public\index.html
  echo     footer { background-color: #1f2937; color: white; padding: 2rem 0; text-align: center; } >> public\index.html
  echo   ^</style^> >> public\index.html
  echo ^</head^> >> public\index.html
  echo ^<body^> >> public\index.html
  echo   ^<header^> >> public\index.html
  echo     ^<div class="container"^> >> public\index.html
  echo       ^<h2^>Auto AGI Builder^</h2^> >> public\index.html
  echo       ^<nav^> >> public\index.html
  echo         ^<a href="#" class="button"^>Get Started^</a^> >> public\index.html
  echo       ^</nav^> >> public\index.html
  echo     ^</div^> >> public\index.html
  echo   ^</header^> >> public\index.html
  echo   ^<section class="hero"^> >> public\index.html
  echo     ^<div class="container"^> >> public\index.html
  echo       ^<h1^>Build AI-powered Applications Automatically^</h1^> >> public\index.html
  echo       ^<p^>Auto AGI Builder streamlines the development process from requirements to deployment.^</p^> >> public\index.html
  echo       ^<a href="#" class="button"^>Start Building^</a^> >> public\index.html
  echo     ^</div^> >> public\index.html
  echo   ^</section^> >> public\index.html
  echo   ^<section class="features"^> >> public\index.html
  echo     ^<div class="container"^> >> public\index.html
  echo       ^<h2^>Key Features^</h2^> >> public\index.html
  echo       ^<div class="features-grid"^> >> public\index.html
  echo         ^<div class="feature"^> >> public\index.html
  echo           ^<h3^>AI-Powered Requirements Analysis^</h3^> >> public\index.html
  echo           ^<p^>Extract and prioritize requirements automatically from your documentation.^</p^> >> public\index.html
  echo         ^</div^> >> public\index.html
  echo         ^<div class="feature"^> >> public\index.html
  echo           ^<h3^>Prototype Generation^</h3^> >> public\index.html
  echo           ^<p^>Create interactive prototypes directly from your requirements.^</p^> >> public\index.html
  echo         ^</div^> >> public\index.html
  echo         ^<div class="feature"^> >> public\index.html
  echo           ^<h3^>ROI Calculator^</h3^> >> public\index.html
  echo           ^<p^>Estimate the return on investment for your project.^</p^> >> public\index.html
  echo         ^</div^> >> public\index.html
  echo       ^</div^> >> public\index.html
  echo     ^</div^> >> public\index.html
  echo   ^</section^> >> public\index.html
  echo   ^<footer^> >> public\index.html
  echo     ^<div class="container"^> >> public\index.html
  echo       ^<p^>© 2025 Auto AGI Builder. All rights reserved.^</p^> >> public\index.html
  echo     ^</div^> >> public\index.html
  echo   ^</footer^> >> public\index.html
  echo ^</body^> >> public\index.html
  echo ^</html^> >> public\index.html
)

REM Create vercel.json manually
echo Creating vercel.json configuration file...
echo { > vercel.json
echo   "version": 2, >> vercel.json
echo   "public": true, >> vercel.json
echo   "buildCommand": null, >> vercel.json
echo   "outputDirectory": "public", >> vercel.json
echo   "rewrites": [ >> vercel.json
echo     { "source": "/api/(.*)", "destination": "https://api-auto-agi-builder.vercel.app/api/$1" }, >> vercel.json
echo     { "source": "/(.*)", "destination": "/index.html" } >> vercel.json
echo   ] >> vercel.json
echo } >> vercel.json

REM Deploy using the simplest method possible with a custom project name
echo Deploying static site to Vercel with a specific project name...
vercel --name auto-agi-landing --public --confirm

echo.
echo ===================================
echo Deployment process initiated
echo ===================================
echo.
echo Note: You may need to complete the login process in the browser if prompted.
echo After deployment, you'll get a URL to access your site.
echo.

pause
