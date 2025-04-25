@echo off
echo ===================================
echo DEPLOY HOMEPAGE UI ENHANCEMENTS
echo ===================================
echo.
echo This script will commit the homepage UI enhancements and deploy to Vercel.
echo.

REM Add the modified files to git
echo Adding changes to git...
git add frontend/pages/index.js
git add frontend/components/home/HeroSection.js
git add frontend/styles/animation.css
git add frontend/pages/_app.js

REM Commit the changes
echo Committing changes...
git commit -m "Enhancement: Improve homepage UI and functionality"

REM Push to remote repository
echo Pushing to remote repository...
git push origin main

REM Deploy to Vercel production
echo Deploying to Vercel...
vercel --prod

echo.
echo ===================================
echo DEPLOYMENT COMPLETED
echo ===================================
echo.
echo Please check the deployment URL to verify the homepage UI improvements.

pause
