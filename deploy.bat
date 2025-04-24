@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo AUTO AGI BUILDER - DEPLOYMENT SCRIPT
echo ===================================================
echo This script will:
echo  1. Commit all recent changes to Git
echo  2. Push changes to GitHub
echo  3. Deploy to Vercel
echo ===================================================
echo.

REM Check if Git is installed
where git >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Git is not installed or not in your PATH.
    echo Please install Git from https://git-scm.com/downloads
    echo and try again.
    exit /b 1
)

REM Check if Vercel CLI is installed
where vercel >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Vercel CLI is not installed or not in your PATH.
    echo Please install Vercel CLI by running 'npm install -g vercel'
    echo and try again.
    exit /b 1
)

REM Confirm with the user before proceeding
echo.
set /p CONTINUE=Do you want to continue with deployment? (Y/N): 
if /i "!CONTINUE!" neq "Y" (
    echo Deployment cancelled by user.
    exit /b 0
)

echo.
echo [1/5] Checking Git repository status...
git status
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to check Git status. Are you in a valid Git repository?
    exit /b 1
)

echo.
echo [2/5] Adding all changes to Git...
git add .
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to add changes to Git.
    exit /b 1
)

echo.
echo [3/5] Committing changes to Git...
set /p COMMIT_MSG=Enter commit message (or press Enter for default message): 
if "!COMMIT_MSG!"=="" (
    set COMMIT_MSG=Update Auto AGI Builder with UI/UX improvements
)
git commit -m "!COMMIT_MSG!"
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to commit changes to Git.
    echo No changes to commit or Git configuration issue.
    exit /b 1
)

echo.
echo [4/5] Pushing changes to GitHub...
echo If you see an error about diverged branches, you may need to resolve conflicts.

REM Check if branches have diverged and offer options
git push
if %ERRORLEVEL% neq 0 (
    echo.
    echo [WARNING] Failed to push changes to GitHub.
    echo Your local branch and the remote branch have diverged.
    echo.
    echo Options to resolve this issue:
    echo 1. Pull and merge remote changes: git pull
    echo 2. Force push your changes (overwrites remote): git push -f
    echo 3. Pull with rebase: git pull --rebase
    echo.
    set /p RESOLVE_OPTION=Choose an option (1, 2, 3, or any other key to cancel): 
    
    if "!RESOLVE_OPTION!"=="1" (
        echo Pulling and merging remote changes...
        git pull
        if %ERRORLEVEL% neq 0 (
            echo [ERROR] Failed to pull changes from GitHub.
            exit /b 1
        )
        echo Pushing merged changes...
        git push
        if %ERRORLEVEL% neq 0 (
            echo [ERROR] Failed to push changes to GitHub.
            exit /b 1
        )
    ) else if "!RESOLVE_OPTION!"=="2" (
        echo WARNING: Force pushing will overwrite remote changes.
        set /p CONFIRM_FORCE=Are you sure you want to force push? (Y/N): 
        if /i "!CONFIRM_FORCE!"=="Y" (
            echo Force pushing changes...
            git push -f
            if %ERRORLEVEL% neq 0 (
                echo [ERROR] Failed to force push changes to GitHub.
                exit /b 1
            )
        ) else (
            echo Force push cancelled.
            exit /b 1
        )
    ) else if "!RESOLVE_OPTION!"=="3" (
        echo Pulling with rebase...
        git pull --rebase
        if %ERRORLEVEL% neq 0 (
            echo [ERROR] Failed to pull with rebase from GitHub.
            exit /b 1
        )
        echo Pushing rebased changes...
        git push
        if %ERRORLEVEL% neq 0 (
            echo [ERROR] Failed to push changes to GitHub.
            exit /b 1
        )
    ) else (
        echo Deployment cancelled.
        exit /b 1
    )
)

echo.
echo [5/5] Deploying to Vercel...
echo This may take a few minutes...
vercel --prod
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to deploy to Vercel.
    echo Check your Vercel configuration and try again.
    exit /b 1
)

echo.
echo ===================================================
echo DEPLOYMENT COMPLETED SUCCESSFULLY!
echo ===================================================
echo Your Auto AGI Builder has been deployed to Vercel.
echo You can now access your application at your Vercel domain.
echo.

REM Optional: Open the deployed site in the default browser
set /p OPEN_SITE=Do you want to open the deployed site in your browser? (Y/N): 
if /i "!OPEN_SITE!"=="Y" (
    echo Opening deployed site...
    for /f "tokens=*" %%a in ('vercel ls --prod -l 1 ^| findstr "https://"') do (
        start "" "%%a"
    )
)

echo.
echo Thank you for using Auto AGI Builder!
echo ===================================================

endlocal
exit /b 0
