@echo off
echo ===================================
echo GIT COMMIT AND PUSH CHANGES
echo ===================================
echo.

:: Initialize git repo if it doesn't exist
if not exist .git (
  echo Initializing git repository...
  git init
  if %ERRORLEVEL% neq 0 (
    echo Failed to initialize git repository.
    goto end
  )
)

:: Stage all files
echo Staging all files...
git add .
if %ERRORLEVEL% neq 0 (
  echo Failed to stage files.
  goto end
)

:: Commit with message
echo Committing changes...
git commit -m "Add Vercel static deployment files with Node.js 18.18.0 compatibility"
if %ERRORLEVEL% neq 0 (
  echo Failed to commit changes.
  goto end
)

:: Check if remote origin exists, add it if needed
git remote -v | findstr "origin" > nul
if %ERRORLEVEL% neq 0 (
  echo.
  echo No remote 'origin' found.
  echo.
  set /p REPO_URL="Enter your GitHub/GitLab repository URL: "
  
  git remote add origin %REPO_URL%
  if %ERRORLEVEL% neq 0 (
    echo Failed to add remote origin.
    goto end
  )
)

:: Push to remote
echo.
echo Pushing to remote repository...
git push -u origin master
if %ERRORLEVEL% neq 0 (
  echo Failed to push to remote repository.
  echo.
  echo If this is your first push, try:
  echo git push -u origin main
  echo.
  set /p BRANCH="Which branch would you like to push to? (main/master/other): "
  
  git push -u origin %BRANCH%
  if %ERRORLEVEL% neq 0 (
    echo Failed to push to remote repository on branch %BRANCH%.
    goto end
  )
)

echo.
echo ===================================
echo GIT OPERATIONS COMPLETE
echo ===================================
echo.
echo All changes have been committed and pushed to the remote repository.
echo You can now proceed with deploying from Git to Vercel.
echo.
echo Next, run git-to-vercel-deploy.bat to deploy from Git to Vercel.

:end
pause
