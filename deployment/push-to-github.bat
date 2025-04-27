@echo off
REM Script to commit and push UIContext fixes and Vercel deployment configurations to GitHub
REM This will prepare the repository for Vercel deployment

echo ===== Preparing for Vercel Deployment =====
echo This script will commit and push all deployment-related changes to GitHub
echo.

REM Check if git is installed
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Git is not installed. Please install git first.
    exit /b 1
)

REM Ensure we're in the correct directory
if not exist "frontend" (
    echo Error: This script should be run from the deployment directory.
    echo Please navigate to the deployment directory and try again.
    exit /b 1
)

echo 1. Adding all files to git...
git add frontend\next.config.js
git add frontend\components\common\ErrorBoundary.js
git add frontend\pages\api\log-error.js
git add frontend\vercel.json
git add .github\workflows\vercel-deployment.yml
git add VERCEL-DEPLOYMENT-GUIDE.md
git add DEPLOYMENT-SOLUTION-SUMMARY.md
git add push-to-github.bat
git add push-to-github.sh
git add view-markdown.bat
git add git-push.ps1

echo.
echo 2. Committing changes...
git commit -m "Fix UIContext provider issue and add Vercel deployment configuration"

echo.
echo 3. Do you want to push these changes to GitHub now?
echo.
echo Type 'Y' and press Enter to continue, or any other key to skip:
set /p choice=
if /i "%choice%"=="Y" (
    REM Ask for branch name
    echo Enter the branch name you want to push to (e.g., main):
    set /p branch=
    
    echo Pushing to %branch%...
    git push origin %branch%
    
    echo.
    echo ===== Next Steps =====
    echo 1. Configure your Vercel project following the instructions in VERCEL-DEPLOYMENT-GUIDE.md
    echo 2. Set up the GitHub secrets for automatic deployments
    echo 3. Your site will automatically deploy when changes are pushed to GitHub
) else (
    echo.
    echo Changes have been committed locally but not pushed to GitHub.
    echo When you're ready to deploy, run: git push origin YOUR_BRANCH_NAME
)

echo.
echo ===== Deployment Setup Complete =====
pause
