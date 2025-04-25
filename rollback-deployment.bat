@echo off
echo ===================================
echo AUTO AGI BUILDER ROLLBACK
echo ===================================
echo.

REM Rollback frontend to previous deployment
echo Rolling back frontend...
echo.
echo This will revert the frontend to the previous deployment version.
echo To proceed, you'll need to:
echo 1. Navigate to the Vercel dashboard for the frontend project
echo 2. Go to the "Deployments" section
echo 3. Find the previous working deployment
echo 4. Click the "..." menu and select "Promote to Production"
echo.
echo You can also use the Vercel CLI with:
echo cd frontend
echo vercel rollback
echo.

REM Rollback backend to previous deployment 
echo.
echo ===================================
echo Rolling back backend...
echo ===================================
echo.
echo This will revert the backend API to the previous deployment version.
echo To proceed, you'll need to:
echo 1. Navigate to the Vercel dashboard for the backend project
echo 2. Go to the "Deployments" section
echo 3. Find the previous working deployment
echo 4. Click the "..." menu and select "Promote to Production" 
echo.
echo You can also use the Vercel CLI with:
echo cd app
echo vercel rollback
echo.

echo Would you like to perform an automatic rollback using Vercel CLI?
echo NOTE: This requires Vercel CLI to be installed and authenticated.
set /p choice=Enter Y for automatic rollback, N to exit [Y/N]: 

if /i "%choice%"=="Y" (
  echo.
  echo ===================================
  echo Performing automatic rollback...
  echo ===================================
  echo.
  
  if exist frontend (
    echo Rolling back frontend deployment...
    cd frontend
    vercel rollback
    cd ..
  ) else (
    echo Frontend directory not found. Manual rollback required.
  )
  
  if exist app (
    echo Rolling back backend deployment...
    cd app
    vercel rollback
    cd ..
  ) else (
    echo Backend directory not found. Manual rollback required.
  )
  
  echo.
  echo Rollback attempted. Please verify in Vercel dashboard.
) else (
  echo.
  echo Rollback canceled. Please perform a manual rollback via the Vercel dashboard.
)

echo.
echo ===================================
echo Rollback process instructions provided
echo ===================================
echo.

pause
