@echo off
echo ===================================
echo AUTO AGI BUILDER CONTEXT COMPRESSION
echo ===================================
echo.

echo This script will:
echo 1. Compress large files for deployment or LLM context
echo 2. Integrate with deployment process
echo 3. Create compressed versions preserving original files
echo.

REM Start timing
set start_time=%time%
echo Start time: %time%
echo Start date: %date%
echo.

REM Determine environment
set /p env_choice=Select environment (1=development, 2=staging, 3=production, 4=llm):
if "%env_choice%"=="1" (
  set NODE_ENV=development
  echo Setting environment to DEVELOPMENT
) else if "%env_choice%"=="2" (
  set NODE_ENV=staging
  echo Setting environment to STAGING
) else if "%env_choice%"=="3" (
  set NODE_ENV=production
  echo Setting environment to PRODUCTION
) else if "%env_choice%"=="4" (
  set NODE_ENV=llm
  echo Setting environment to LLM (context optimization)
) else (
  echo Invalid choice. Using production as default.
  set NODE_ENV=production
)

echo.
echo ===================================
echo RUNNING COMPRESSION
echo ===================================
echo.

REM Check Node.js installation
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Node.js is not installed or not in PATH.
  echo Please install Node.js from https://nodejs.org/
  goto :end
)

REM Check if required files exist
if not exist "deployment-compress.js" (
  echo ERROR: File deployment-compress.js not found.
  echo Please make sure you are running this script from the project root.
  goto :end
)

if not exist "middle-out-compress.js" (
  echo ERROR: File middle-out-compress.js not found.
  echo Please make sure the compression tool is installed.
  goto :end
)

if not exist "compression-config.js" (
  echo ERROR: File compression-config.js not found.
  echo Please make sure the compression configuration is installed.
  goto :end
)

echo Running deployment compression for %NODE_ENV% environment...
node deployment-compress.js

if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Compression failed with error code %ERRORLEVEL%.
  goto :end
)

echo.
echo ===================================
echo FINISHING UP
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
echo COMPRESSION SUMMARY
echo ===================================
echo.
echo Compression process completed.
echo.
echo Total compression time: %hh% hours, %mm% minutes, %ss%.%ms% seconds
echo.

REM Ask if user wants to integrate with deployment
echo.
echo Would you like to proceed with deployment?
set /p deploy_choice=Enter Y to deploy, any other key to skip:

if /i "%deploy_choice%"=="Y" (
  echo.
  echo ===================================
  echo STARTING DEPLOYMENT PROCESS
  echo ===================================
  echo.
  
  if exist "unified-deploy.bat" (
    echo Running unified deployment process...
    call unified-deploy.bat
  ) else (
    echo Running Vercel deployment...
    vercel --prod
  )
  
  echo.
  echo Deployment completed.
)

:end
echo.
echo ===================================
echo COMPRESSION PROCESS FINISHED
echo ===================================

pause
