@echo off
echo ===================================
echo AUTO AGI BUILDER TIME PUSH-DEPLOY
echo ===================================
echo.

echo This script will:
echo 1. Time the full deployment process
echo 2. Commit and push changes to Git
echo 3. Deploy both frontend and backend to Vercel
echo.

echo Starting deployment process...
echo Start time: %time%
echo Start date: %date%
echo.

REM Start timing
set start_time=%time%
for /F "tokens=1-4 delims=:.," %%a in ("%time%") do (
   set /A "start=(((%%a*60)+1%%b %% 100)*60+1%%c %% 100)*100+1%%d %% 100"
)

REM Check dependencies
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Git is not installed or not in PATH.
  echo Please install Git from https://git-scm.com/
  exit /b 1
)

where vercel >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo WARNING: Vercel CLI is not installed or not in PATH.
  echo Installing Vercel CLI...
  npm install -g vercel
  if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install Vercel CLI.
    echo Please install it manually with 'npm install -g vercel'
    exit /b 1
  ) else (
    echo Vercel CLI installed successfully.
  )
)

echo.
echo ===================================
echo GIT OPERATIONS
echo ===================================
echo.

REM Check Git status
echo Checking Git status...
git status
echo.

REM Stage all changes
echo Staging all changes...
git add .
echo All changes staged.
echo.

REM Create commit
echo Creating commit...
set commit_msg=Time-tracked deployment - %date% %time%
echo Using commit message: "%commit_msg%"
git commit -m "%commit_msg%"
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Failed to create commit.
  echo Please check Git configuration and try again.
  exit /b 1
)
echo Commit created successfully.
echo.

REM Push changes
echo Pushing to remote repository...

REM Get current branch
for /f "tokens=* USEBACKQ" %%g in (`git branch --show-current`) do (set CURRENT_BRANCH=%%g)

REM Push to remote
git push origin %CURRENT_BRANCH%
if %ERRORLEVEL% NEQ 0 (
  echo WARNING: Failed to push. Trying to set upstream...
  git push -u origin %CURRENT_BRANCH%
  if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to push to remote repository.
    echo Please check your Git remote configuration.
  ) else (
    echo Push successful.
  )
) else (
  echo Push successful.
)

echo.
echo ===================================
echo DEPLOYMENT PREPARATION
echo ===================================
echo.

REM Prepare frontend deployment
echo Preparing frontend for deployment...
if not exist "deployment\frontend" (
  echo Creating frontend deployment directory...
  mkdir deployment\frontend 2>nul
)

REM Copy frontend files and build
echo Copying frontend files...
xcopy /E /Y /I frontend\* deployment\frontend\ >nul
echo Frontend files copied.

echo Building frontend...
cd deployment\frontend
echo Running npm install...
npm install --silent
if %ERRORLEVEL% NEQ 0 (
  echo WARNING: npm install encountered issues.
)

echo Building production version...
npm run build
if %ERRORLEVEL% NEQ 0 (
  echo WARNING: build process encountered issues.
)
cd ..\..
echo Frontend prepared for deployment.
echo.

REM Prepare backend deployment
echo Preparing backend for deployment...
if not exist "deployment\backend" (
  echo Creating backend deployment directory...
  mkdir deployment\backend 2>nul
)

REM Copy backend files
echo Copying backend files...
xcopy /E /Y /I app\* deployment\backend\app\ >nul
copy requirements.txt deployment\backend\ >nul
copy app\main.py deployment\backend\ >nul
echo Backend files copied.

echo Installing backend dependencies...
cd deployment\backend
pip install -r requirements.txt --quiet
if %ERRORLEVEL% NEQ 0 (
  echo WARNING: pip install encountered issues.
)
cd ..\..
echo Backend prepared for deployment.
echo.

echo ===================================
echo DEPLOYING TO VERCEL
echo ===================================
echo.

REM Deploy frontend
echo Deploying frontend to Vercel production...
cd deployment\frontend
vercel --prod
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Frontend deployment failed.
) else (
  echo Frontend deployed successfully.
)
cd ..\..

REM Deploy backend
echo Deploying backend to Vercel production...
cd deployment\backend
vercel --prod
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Backend deployment failed.
) else (
  echo Backend deployed successfully.
)
cd ..\..

echo.
echo ===================================
echo DEPLOYMENT VERIFICATION
echo ===================================
echo.

echo Running basic deployment verification...

REM Check frontend deployment
echo Checking frontend deployment...
set frontend_url=
for /f "tokens=* USEBACKQ" %%g in (`vercel --cwd deployment\frontend ls -l`) do (
  set frontend_url=%%g
  goto :frontend_url_found
)
:frontend_url_found

if "%frontend_url%"=="" (
  echo WARNING: Could not verify frontend deployment.
) else (
  echo Frontend deployed at: %frontend_url% 
  echo Frontend deployment verified.
)

REM Check backend deployment
echo Checking backend deployment...
set backend_url=
for /f "tokens=* USEBACKQ" %%g in (`vercel --cwd deployment\backend ls -l`) do (
  set backend_url=%%g
  goto :backend_url_found
)
:backend_url_found

if "%backend_url%"=="" (
  echo WARNING: Could not verify backend deployment.
) else (
  echo Backend deployed at: %backend_url%
  echo Backend deployment verified.
)

REM Calculate elapsed time
for /F "tokens=1-4 delims=:.," %%a in ("%time%") do (
   set /A "end=(((%%a*60)+1%%b %% 100)*60+1%%c %% 100)*100+1%%d %% 100"
)
set /A elapsed=end-start
set /A hh=elapsed/(60*60*100)
set /A elapsed=elapsed-hh*(60*60*100)
set /A mm=elapsed/(60*100)
set /A elapsed=elapsed-mm*(60*100)
set /A ss=elapsed/100
set /A ms=elapsed-ss*100

echo.
echo ===================================
echo DEPLOYMENT SUMMARY
echo ===================================
echo.
echo Deployment process completed.
echo.
echo Start time: %start_time%
echo End time: %time%
echo.
echo Total deployment time: %hh% hours, %mm% minutes, %ss% seconds, %ms% milliseconds
echo.

if defined frontend_url (
  echo Frontend URL: %frontend_url%
)
if defined backend_url (
  echo Backend URL: %backend_url%
)

echo.
echo Would you like to save this report to a log file?
set /p save_log=Enter Y to save, any other key to skip:
if /i "%save_log%"=="Y" (
  echo Saving deployment log...
  (
    echo ========================================
    echo AUTO AGI BUILDER DEPLOYMENT REPORT
    echo ========================================
    echo.
    echo Deployment date: %date%
    echo Start time: %start_time%
    echo End time: %time%
    echo Total deployment time: %hh% hours, %mm% minutes, %ss% seconds
    echo.
    echo Git branch: %CURRENT_BRANCH%
    echo Commit message: %commit_msg%
    echo.
    echo Frontend URL: %frontend_url%
    echo Backend URL: %backend_url%
    echo.
    echo ========================================
  ) > deployment-report-%date:~-4,4%%date:~-10,2%%date:~-7,2%-%time:~0,2%%time:~3,2%.log
  echo Log saved.
)

echo.
echo ===================================
echo OPERATION COMPLETED
echo ===================================
echo.
pause
