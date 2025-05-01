@echo off
echo ============================================================
echo    Vercel Standalone Deployment Fix Script
echo    Creates a fresh project for clean Vercel deployment
echo ============================================================
echo.

echo Running vercel-deploy-fix.js script...
node vercel-deploy-fix.js

echo.
echo If successful, you will see your deployment URL above.
echo IMPORTANT: Choose to create a NEW project when prompted, not link to existing.
echo.
pause
