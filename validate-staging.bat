@echo off 
echo Validating staging deployment configuration... 
if not exist "frontend\next.config.js" (
  echo ERROR: next.config.js not found 
  exit /b 
)
if not exist "vercel.json" (
  echo ERROR: vercel.json not found 
  exit /b 
)
if not exist "frontend\.env.staging" (
  echo ERROR: frontend/.env.staging not found 
  exit /b 
)
echo All staging configuration files validated successfully 
