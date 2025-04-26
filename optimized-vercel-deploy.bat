@echo off
echo ===================================
echo AUTO AGI BUILDER VERCEL DEPLOYMENT
echo ===================================
echo.

echo This script will:
echo 1. Optimize Git operations for fast deployment
echo 2. Selectively deploy both frontend and backend
echo 3. Record performance benchmarks
echo.

REM Start timing
set start_time=%time%
echo Start time: %time%
echo Start date: %date%
echo.

REM Check Git repository status
echo Checking Git repository status...
git rev-parse --is-inside-work-tree >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Not inside a Git repository.
  echo Please run this script from the root of the Auto AGI Builder repository.
  exit /b 1
)

REM Check for Vercel CLI
echo Checking for Vercel CLI...
where vercel >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo Installing Vercel CLI...
  call npm install -g vercel
  if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install Vercel CLI.
    echo Please run 'npm install -g vercel' manually.
    exit /b 1
  )
  echo Vercel CLI installed successfully.
) else (
  echo Vercel CLI found.
)

echo.
echo ===================================
echo OPTIMIZED GIT OPERATIONS
echo ===================================
echo.

REM Check for any changes to be staged
git status --porcelain | findstr "." >nul
if %ERRORLEVEL% EQU 0 (
  echo Changes detected in the working directory.
  
  REM Ask user what to stage
  echo.
  echo Select files to stage:
  echo 1. All files
  echo 2. Only frontend files
  echo 3. Only backend files
  echo 4. Specific files (manually select)
  echo.
  set /p stage_option=Enter option (1-4):
  
  if "%stage_option%"=="1" (
    echo Staging all files...
    git add .
  ) else if "%stage_option%"=="2" (
    echo Staging frontend files...
    git add frontend/
    git add vercel.json
    git add package.json
  ) else if "%stage_option%"=="3" (
    echo Staging backend files...
    git add app/
    git add requirements.txt
  ) else if "%stage_option%"=="4" (
    echo.
    echo Enter file patterns to stage (separate with spaces):
    echo Example: "frontend/components/*.js app/api/*.py"
    echo.
    set /p files_to_stage=Files to stage:
    git add %files_to_stage%
  ) else (
    echo Invalid option. Staging all files by default...
    git add .
  )
  
  REM Create commit with custom or default message
  echo.
  set /p commit_msg=Enter commit message (or press Enter for default message):
  if "%commit_msg%"=="" set commit_msg=Optimized deployment - %date% %time%
  
  git commit -m "%commit_msg%"
  if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to create commit.
    echo Please check Git configuration and try again.
    exit /b 1
  )
  echo Commit created successfully.
) else (
  echo No changes to commit. Proceeding with deployment...
)

REM Push to remote repository
echo.
echo Pushing to remote repository...
git push
if %ERRORLEVEL% NEQ 0 (
  echo WARNING: Failed to push to remote repository.
  echo This may not affect the deployment, but your repository won't be updated.
  
  set /p continue_deploy=Continue with deployment anyway? (Y/N):
  if /i not "%continue_deploy%"=="Y" (
    echo Operation cancelled by user.
    exit /b 0
  )
) else (
  echo Push successful.
)

echo.
echo ===================================
echo VERCEL DEPLOYMENT
echo ===================================
echo.

REM Deployment options
echo Select deployment option:
echo 1. Deploy both frontend and backend
echo 2. Deploy frontend only
echo 3. Deploy backend only
echo 4. Custom deployment
echo.
set /p deploy_option=Enter option (1-4):

REM Process deployment option
if "%deploy_option%"=="1" (
  echo Deploying both frontend and backend...
  
  echo.
  echo ===== FRONTEND DEPLOYMENT =====
  echo.
  cd frontend
  echo Running Vercel deployment for frontend...
  vercel --prod
  if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Frontend deployment might have issues.
  ) else (
    echo Frontend deployed successfully.
  )
  cd ..
  
  echo.
  echo ===== BACKEND DEPLOYMENT =====
  echo.
  cd app
  echo Running Vercel deployment for backend...
  vercel --prod
  if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Backend deployment might have issues.
  ) else (
    echo Backend deployed successfully.
  )
  cd ..
  
) else if "%deploy_option%"=="2" (
  echo Deploying frontend only...
  cd frontend
  vercel --prod
  if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Frontend deployment might have issues.
  ) else (
    echo Frontend deployed successfully.
  )
  cd ..
  
) else if "%deploy_option%"=="3" (
  echo Deploying backend only...
  cd app
  vercel --prod
  if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Backend deployment might have issues.
  ) else (
    echo Backend deployed successfully.
  )
  cd ..
  
) else if "%deploy_option%"=="4" (
  echo.
  echo Custom deployment selected.
  echo Enter deployment directory (relative to project root):
  set /p custom_dir=Directory:
  
  if exist "%custom_dir%" (
    cd %custom_dir%
    echo Deploying %custom_dir%...
    vercel --prod
    cd ..
  ) else (
    echo ERROR: Directory not found.
    exit /b 1
  )
) else (
  echo Invalid option. Deploying both frontend and backend by default...
  
  cd frontend
  echo Deploying frontend...
  vercel --prod
  cd ..
  
  cd app
  echo Deploying backend...
  vercel --prod
  cd ..
)

echo.
echo ===================================
echo DEPLOYMENT VERIFICATION
echo ===================================
echo.

REM Calculate elapsed time
set end_time=%time%
echo Start time: %start_time%
echo End time: %end_time%

REM Convert time format to comparable values
for /F "tokens=1-4 delims=:.," %%a in ("%start_time%") do (
   set /A "start=(((%%a*60)+1%%b %% 100)*60+1%%c %% 100)*100+1%%d %% 100"
)
for /F "tokens=1-4 delims=:.," %%a in ("%end_time%") do (
   set /A "end=(((%%a*60)+1%%b %% 100)*60+1%%c %% 100)*100+1%%d %% 100"
)

REM Calculate difference
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
echo Total deployment time: %hh% hours, %mm% minutes, %ss%.%ms% seconds
echo.

REM Get deployment URLs
echo Retrieving deployment URLs...
vercel ls --production | findstr "vercel" > deployment_urls.txt
if %ERRORLEVEL% EQU 0 (
  echo Deployment URLs saved to deployment_urls.txt
  type deployment_urls.txt
) else (
  echo Unable to retrieve deployment URLs.
  echo Please check the Vercel dashboard for your deployment status.
)

echo.
echo Would you like to save this deployment report?
set /p save_report=Enter Y to save, any other key to skip:

if /i "%save_report%"=="Y" (
  echo Saving deployment report...
  
  (
    echo =======================================
    echo     AUTO AGI BUILDER DEPLOYMENT REPORT
    echo =======================================
    echo.
    echo Deployment Date: %date%
    echo Start Time: %start_time%
    echo End Time: %end_time%
    echo Total Duration: %hh% hours, %mm% minutes, %ss%.%ms% seconds
    echo.
    echo Git Commit: %commit_msg%
    echo.
    echo Deployment Option: %deploy_option%
    echo.
    echo Deployed URLs:
    type deployment_urls.txt
    echo.
    echo =======================================
  ) > "deployment-report-%date:~-4,4%%date:~-7,2%%date:~-10,2%-%time:~0,2%%time:~3,2%.log"
  
  echo Report saved as "deployment-report-%date:~-4,4%%date:~-7,2%%date:~-10,2%-%time:~0,2%%time:~3,2%.log"
)

echo.
echo ===================================
echo DEPLOYMENT COMPLETE
echo ===================================

pause
