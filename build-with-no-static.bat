@echo off
echo Building Auto AGI Builder with all static generation disabled...

cd %~dp0deployment\frontend

echo Creating production build with static generation disabled...
set NODE_OPTIONS=--max-old-space-size=4096
npx next build

if %ERRORLEVEL% EQU 0 (
  echo =========================================
  echo BUILD SUCCEEDED!
  echo =========================================
  echo You can now start the application with: npx next start
) else (
  echo =========================================
  echo BUILD FAILED!
  echo =========================================
  echo If problems persist, consider using the development server instead:
  echo npx next dev
)

pause
