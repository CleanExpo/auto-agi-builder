@echo off
echo ===================================
echo AUTO AGI BUILDER DEPLOYMENT RUNNER
echo ===================================
echo.

echo This script will help launch the deployment pipeline scripts.
echo.

REM Check if in the Desktop directory
cd | find "Desktop" > nul
if %ERRORLEVEL% EQU 0 (
  echo Current directory is Desktop.
) else (
  echo WARNING: You are not in the Desktop directory.
  echo You might be in a different location than the deployment scripts.
  echo.
  echo Current directory:
  cd
  echo.
  set /p CONTINUE=Continue anyway? (Y/N): 
  if /i not "%CONTINUE%"=="Y" exit /b 1
)

REM Check if required scripts exist in current directory
set MISSING_SCRIPTS=0
if not exist "run-deploy-pipeline.bat" (
  echo ERROR: run-deploy-pipeline.bat not found in current directory
  set MISSING_SCRIPTS=1
)

if %MISSING_SCRIPTS% NEQ 0 (
  echo.
  echo One or more required scripts are missing from the current directory.
  echo.
  echo Files in current directory:
  dir *.bat *.ps1
  echo.
  echo Please ensure you're in the directory containing the deployment scripts.
  echo.
  set /p GO_TO_DESKTOP=Would you like to copy essential files to Desktop and run from there? (Y/N): 
  
  if /i "%GO_TO_DESKTOP%"=="Y" (
    echo.
    echo Copying scripts to Desktop...
    
    REM Copy necessary files to Desktop if they exist
    if exist "storage-setup.bat" copy "storage-setup.bat" %USERPROFILE%\Desktop\
    if exist "auth-setup.bat" copy "auth-setup.bat" %USERPROFILE%\Desktop\
    if exist "database-setup.bat" copy "database-setup.bat" %USERPROFILE%\Desktop\
    if exist "git-commit-and-push.bat" copy "git-commit-and-push.bat" %USERPROFILE%\Desktop\
    if exist "run-deploy-pipeline.bat" copy "run-deploy-pipeline.bat" %USERPROFILE%\Desktop\
    if exist "verify-deployment.bat" copy "verify-deployment.bat" %USERPROFILE%\Desktop\
    if exist "run-deploy-pipeline.ps1" copy "run-deploy-pipeline.ps1" %USERPROFILE%\Desktop\
    
    echo.
    echo Files copied to Desktop.
    echo Please navigate to Desktop and run the deployment from there.
    echo.
    echo cd %USERPROFILE%\Desktop
    echo run-deploy-pipeline.bat
    
    exit /b 0
  ) else (
    echo Operation cancelled.
    exit /b 1
  )
)

echo.
echo Choose how to run the deployment pipeline:
echo 1. Command Prompt (run-deploy-pipeline.bat)
echo 2. PowerShell with dot prefix (.\run-deploy-pipeline.bat)
echo 3. PowerShell with bypass (powershell -ExecutionPolicy Bypass -File .\run-deploy-pipeline.ps1)
echo.

set /p RUN_OPTION=Enter your choice (1-3): 

if "%RUN_OPTION%"=="1" (
  echo.
  echo Running deployment pipeline in Command Prompt...
  echo.
  call run-deploy-pipeline.bat
) else if "%RUN_OPTION%"=="2" (
  echo.
  echo Running deployment pipeline in PowerShell with dot prefix...
  echo.
  powershell -Command ".\run-deploy-pipeline.bat"
) else if "%RUN_OPTION%"=="3" (
  echo.
  echo Running deployment pipeline in PowerShell with execution policy bypass...
  echo.
  powershell -ExecutionPolicy Bypass -File .\run-deploy-pipeline.ps1
) else (
  echo Invalid option. Please run run-deploy-pipeline.bat directly.
  exit /b 1
)

exit /b 0
