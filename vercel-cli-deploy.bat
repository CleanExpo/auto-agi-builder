@echo off
echo ===================================
echo AUTO AGI BUILDER VERCEL CLI DEPLOY
echo ===================================
echo.

echo This script will:
echo 1. Check if Vercel CLI is installed and install if needed
echo 2. Configure deployment settings for frontend/backend
echo 3. Deploy directly using Vercel CLI commands
echo 4. Track deployment performance metrics
echo.

REM Start timing
set start_time=%time%
echo Start time: %time%
echo Start date: %date%
echo.

REM Check for Vercel CLI installation
echo Checking Vercel CLI installation...
where vercel >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo Vercel CLI not found. Installing...
  call npm install -g vercel
  if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install Vercel CLI.
    echo Please run 'npm install -g vercel' manually.
    exit /b 1
  )
  echo Vercel CLI installed successfully.
) else (
  echo Vercel CLI is already installed.
)

echo.
echo ===================================
echo VERCEL DEPLOYMENT CONFIGURATION
echo ===================================
echo.

set /p project_name=Enter project name (or press Enter for default "auto-agi-builder"):
if "%project_name%"=="" set project_name=auto-agi-builder

echo.
echo Select deployment type:
echo 1. Production deployment (vercel --prod)
echo 2. Preview deployment
echo 3. Development deployment
echo.
set /p deploy_type=Enter option (1-3):

if "%deploy_type%"=="1" (
  set deploy_flag=--prod
  echo Selected: Production deployment
) else if "%deploy_type%"=="2" (
  set deploy_flag=
  echo Selected: Preview deployment
) else if "%deploy_type%"=="3" (
  set deploy_flag=--dev
  echo Selected: Development deployment
) else (
  echo Invalid option. Defaulting to preview deployment.
  set deploy_flag=
)

echo.
echo Select which components to deploy:
echo 1. Full stack (frontend and backend)
echo 2. Frontend only
echo 3. Backend only
echo.
set /p deploy_components=Enter option (1-3):

echo.
echo ===================================
echo VERCEL PROJECT LINKING
echo ===================================
echo.

REM Check if the user wants to force new project linking
set /p force_link=Force new Vercel project linking? (Y/N):

if /i "%force_link%"=="Y" (
  echo Removing existing Vercel project links...
  vercel logout
  vercel login
  echo Linking will be forced during deployment.
  set link_flag=--force
) else (
  set link_flag=
)

echo.
echo ===================================
echo DEPLOYMENT EXECUTION
echo ===================================
echo.

if "%deploy_components%"=="1" (
  echo Deploying full stack application...

  echo.
  echo === FRONTEND DEPLOYMENT ===
  cd frontend 2>nul
  if %ERRORLEVEL% EQU 0 (
    echo Frontend directory found.
    echo Executing: vercel %link_flag% --name %project_name%-frontend %deploy_flag%
    call vercel %link_flag% --name %project_name%-frontend %deploy_flag%
    cd ..
  ) else (
    echo ERROR: Frontend directory not found.
    echo Looking for frontend directory...
    if exist "../OneDrive - Disaster Recovery/1111/Auto AGI Builder/frontend" (
      echo Frontend directory found at alternate location.
      cd "../OneDrive - Disaster Recovery/1111/Auto AGI Builder/frontend"
      call vercel %link_flag% --name %project_name%-frontend %deploy_flag%
      cd "../../.."
    ) else (
      echo WARNING: Cannot find frontend directory. Skipping frontend deployment.
    )
  )

  echo.
  echo === BACKEND DEPLOYMENT ===
  cd app 2>nul
  if %ERRORLEVEL% EQU 0 (
    echo Backend directory found.
    echo Executing: vercel %link_flag% --name %project_name%-backend %deploy_flag%
    call vercel %link_flag% --name %project_name%-backend %deploy_flag%
    cd ..
  ) else (
    echo ERROR: Backend directory not found.
    echo Looking for backend directory...
    if exist "../OneDrive - Disaster Recovery/1111/Auto AGI Builder/app" (
      echo Backend directory found at alternate location.
      cd "../OneDrive - Disaster Recovery/1111/Auto AGI Builder/app"
      call vercel %link_flag% --name %project_name%-backend %deploy_flag%
      cd "../../.."
    ) else (
      echo WARNING: Cannot find backend directory. Skipping backend deployment.
    )
  )

) else if "%deploy_components%"=="2" (
  echo Deploying frontend only...

  cd frontend 2>nul
  if %ERRORLEVEL% EQU 0 (
    echo Frontend directory found.
    echo Executing: vercel %link_flag% --name %project_name%-frontend %deploy_flag%
    call vercel %link_flag% --name %project_name%-frontend %deploy_flag%
    cd ..
  ) else (
    echo ERROR: Frontend directory not found.
    echo Looking for frontend directory...
    if exist "../OneDrive - Disaster Recovery/1111/Auto AGI Builder/frontend" (
      echo Frontend directory found at alternate location.
      cd "../OneDrive - Disaster Recovery/1111/Auto AGI Builder/frontend"
      call vercel %link_flag% --name %project_name%-frontend %deploy_flag%
      cd "../../.."
    ) else (
      echo ERROR: Cannot find frontend directory. Aborting deployment.
      exit /b 1
    )
  )

) else if "%deploy_components%"=="3" (
  echo Deploying backend only...

  cd app 2>nul
  if %ERRORLEVEL% EQU 0 (
    echo Backend directory found.
    echo Executing: vercel %link_flag% --name %project_name%-backend %deploy_flag%
    call vercel %link_flag% --name %project_name%-backend %deploy_flag%
    cd ..
  ) else (
    echo ERROR: Backend directory not found.
    echo Looking for backend directory...
    if exist "../OneDrive - Disaster Recovery/1111/Auto AGI Builder/app" (
      echo Backend directory found at alternate location.
      cd "../OneDrive - Disaster Recovery/1111/Auto AGI Builder/app"
      call vercel %link_flag% --name %project_name%-backend %deploy_flag%
      cd "../../.."
    ) else (
      echo ERROR: Cannot find backend directory. Aborting deployment.
      exit /b 1
    )
  )

) else (
  echo Invalid option. Deploying full stack as default...
  
  echo.
  echo === FRONTEND DEPLOYMENT ===
  cd frontend 2>nul
  if %ERRORLEVEL% EQU 0 (
    echo Frontend directory found.
    echo Executing: vercel %link_flag% --name %project_name%-frontend %deploy_flag%
    call vercel %link_flag% --name %project_name%-frontend %deploy_flag%
    cd ..
  ) else (
    echo ERROR: Frontend directory not found.
    echo Looking for frontend directory...
    if exist "../OneDrive - Disaster Recovery/1111/Auto AGI Builder/frontend" (
      echo Frontend directory found at alternate location.
      cd "../OneDrive - Disaster Recovery/1111/Auto AGI Builder/frontend"
      call vercel %link_flag% --name %project_name%-frontend %deploy_flag%
      cd "../../.."
    ) else (
      echo WARNING: Cannot find frontend directory. Skipping frontend deployment.
    )
  )

  echo.
  echo === BACKEND DEPLOYMENT ===
  cd app 2>nul
  if %ERRORLEVEL% EQU 0 (
    echo Backend directory found.
    echo Executing: vercel %link_flag% --name %project_name%-backend %deploy_flag%
    call vercel %link_flag% --name %project_name%-backend %deploy_flag%
    cd ..
  ) else (
    echo ERROR: Backend directory not found.
    echo Looking for backend directory...
    if exist "../OneDrive - Disaster Recovery/1111/Auto AGI Builder/app" (
      echo Backend directory found at alternate location.
      cd "../OneDrive - Disaster Recovery/1111/Auto AGI Builder/app"
      call vercel %link_flag% --name %project_name%-backend %deploy_flag%
      cd "../../.."
    ) else (
      echo WARNING: Cannot find backend directory. Skipping backend deployment.
    )
  )
)

echo.
echo ===================================
echo PROJECT INFORMATION
echo ===================================
echo.

echo Getting project information from Vercel...
vercel projects ls | findstr "%project_name%"

echo.
echo ===================================
echo DEPLOYMENT SUMMARY
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
echo Deployment process completed.
echo.
echo Total deployment time: %hh% hours, %mm% minutes, %ss%.%ms% seconds
echo.

REM Generate deployment report
echo Generating deployment report...
(
  echo =======================================
  echo AUTO AGI BUILDER VERCEL DEPLOYMENT REPORT
  echo =======================================
  echo.
  echo Deployment Date: %date%
  echo Start Time: %start_time%
  echo End Time: %end_time%
  echo Total Duration: %hh% hours, %mm% minutes, %ss%.%ms% seconds
  echo.
  echo Project Name: %project_name%
  echo Deployment Type: %deploy_type% (%deploy_flag%)
  echo Components Deployed: %deploy_components%
  echo.
  echo Vercel Projects:
  vercel projects ls | findstr "%project_name%"
  echo.
  echo =======================================
) > "vercel-deployment-report-%date:~-4,4%%date:~-7,2%%date:~-10,2%-%time:~0,2%%time:~3,2%.log"

echo Report saved as "vercel-deployment-report-%date:~-4,4%%date:~-7,2%%date:~-10,2%-%time:~0,2%%time:~3,2%.log"
echo.

REM Check if user wants to open the Vercel dashboard
set /p open_dashboard=Open Vercel dashboard in browser? (Y/N):
if /i "%open_dashboard%"=="Y" (
  echo Opening Vercel dashboard...
  start https://vercel.com/dashboard
)

echo.
echo ===================================
echo DEPLOYMENT COMPLETE
echo ===================================
echo.

pause
