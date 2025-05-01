@echo off
echo ======================================================
echo   Auto AGI Builder - Deploy Fixes Launcher
echo ======================================================
echo.
echo This script will detect your shell and run the appropriate deployment script.
echo.

powershell -command "if ($PSVersionTable.PSVersion -ne $null) { exit 0 } else { exit 1 }"
if %ERRORLEVEL% EQU 0 (
  echo PowerShell detected. Running PowerShell deployment script...
  echo.
  powershell -ExecutionPolicy Bypass -File deploy-all-fixes.ps1
) else (
  echo Command Prompt detected. Running batch deployment script...
  echo.
  call deploy-all-fixes.bat
)

echo.
echo Script execution completed.
echo.
pause
