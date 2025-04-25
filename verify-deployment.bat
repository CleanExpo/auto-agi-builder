@echo off
echo ===================================
echo AUTO AGI BUILDER DEPLOYMENT VERIFICATION
echo ===================================
echo.

echo This script will verify your Vercel deployment.
echo.

REM Check if curl is available for HTTP requests
where curl >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo WARNING: curl is not available. Some verification tests will be skipped.
  echo Please install curl for more comprehensive testing.
  set CURL_AVAILABLE=false
) else (
  set CURL_AVAILABLE=true
)

echo.
echo Please enter the deployment URLs to verify:
set /p FRONTEND_URL=Frontend URL (e.g., https://auto-agi-builder.vercel.app): 
set /p BACKEND_URL=Backend API URL (optional, press Enter to skip): 

echo.
echo Choose verification level:
echo 1. Basic (check if URLs are accessible)
echo 2. Standard (basic + check key pages and endpoints)
echo 3. Comprehensive (standard + test core functionality)
echo.

set /p VERIFICATION_LEVEL=Enter your choice (1-3): 

echo.
echo ===================================
echo RUNNING DEPLOYMENT VERIFICATION
echo ===================================
echo.

REM Basic verification - Check if URLs are accessible
echo Running basic verification...
echo.

if not "%FRONTEND_URL%"=="" (
  echo Checking frontend URL: %FRONTEND_URL%
  
  if "%CURL_AVAILABLE%"=="true" (
    curl -s -o nul -w "Status code: %%{http_code}\n" --connect-timeout 10 %FRONTEND_URL%
    if %ERRORLEVEL% NEQ 0 (
      echo [FAIL] Frontend URL is not accessible.
      set FRONTEND_ACCESSIBLE=false
    ) else (
      echo [PASS] Frontend URL is accessible.
      set FRONTEND_ACCESSIBLE=true
    )
  ) else (
    echo Unable to verify frontend URL (curl not available).
    set /p FRONTEND_ACCESSIBLE=Is the frontend URL accessible in your browser? (Y/N): 
    if /i "%FRONTEND_ACCESSIBLE%"=="Y" (
      set FRONTEND_ACCESSIBLE=true
    ) else (
      set FRONTEND_ACCESSIBLE=false
    )
  )
)

if not "%BACKEND_URL%"=="" (
  echo Checking backend API URL: %BACKEND_URL%
  
  if "%CURL_AVAILABLE%"=="true" (
    curl -s -o nul -w "Status code: %%{http_code}\n" --connect-timeout 10 %BACKEND_URL%
    if %ERRORLEVEL% NEQ 0 (
      echo [FAIL] Backend API URL is not accessible.
      set BACKEND_ACCESSIBLE=false
    ) else (
      echo [PASS] Backend API URL is accessible.
      set BACKEND_ACCESSIBLE=true
    )
  ) else (
    echo Unable to verify backend API URL (curl not available).
    set /p BACKEND_ACCESSIBLE=Is the backend API URL accessible in your browser? (Y/N): 
    if /i "%BACKEND_ACCESSIBLE%"=="Y" (
      set BACKEND_ACCESSIBLE=true
    ) else (
      set BACKEND_ACCESSIBLE=false
    )
  )
)

REM Standard verification - Check key pages and endpoints
if "%VERIFICATION_LEVEL%"=="2" (
  echo.
  echo Running standard verification...
  echo.
  
  if "%FRONTEND_ACCESSIBLE%"=="true" (
    echo Checking key frontend pages...
    
    if "%CURL_AVAILABLE%"=="true" (
      REM Check home page
      curl -s -o nul -w "Home page: %%{http_code}\n" --connect-timeout 10 "%FRONTEND_URL%/"
      
      REM Check other critical pages
      curl -s -o nul -w "Dashboard page: %%{http_code}\n" --connect-timeout 10 "%FRONTEND_URL%/dashboard"
      curl -s -o nul -w "Login page: %%{http_code}\n" --connect-timeout 10 "%FRONTEND_URL%/auth/login"
      
      echo Frontend page checks completed.
    ) else (
      echo Unable to check key pages (curl not available).
      echo Please manually verify the following pages:
      echo - Home page: %FRONTEND_URL%/
      echo - Dashboard page: %FRONTEND_URL%/dashboard
      echo - Login page: %FRONTEND_URL%/auth/login
    )
  )
  
  if "%BACKEND_ACCESSIBLE%"=="true" (
    echo Checking key backend endpoints...
    
    if "%CURL_AVAILABLE%"=="true" (
      REM Check health endpoint
      curl -s -o nul -w "Health endpoint: %%{http_code}\n" --connect-timeout 10 "%BACKEND_URL%/health"
      
      REM Check docs (if available)
      curl -s -o nul -w "API docs: %%{http_code}\n" --connect-timeout 10 "%BACKEND_URL%/docs"
      
      echo Backend endpoint checks completed.
    ) else (
      echo Unable to check key endpoints (curl not available).
      echo Please manually verify the following endpoints:
      echo - Health endpoint: %BACKEND_URL%/health
      echo - API docs: %BACKEND_URL%/docs
    )
  )
)

REM Comprehensive verification - Test core functionality
if "%VERIFICATION_LEVEL%"=="3" (
  echo.
  echo Running comprehensive verification...
  echo.
  
  if "%FRONTEND_ACCESSIBLE%"=="true" (
    echo Please manually verify the following core functionality:
    echo 1. User registration/login
    echo 2. Project creation
    echo 3. Document upload
    echo 4. Requirements management
    echo 5. ROI calculation
    echo 6. Prototype generation
    echo.
    
    set /p FRONTEND_FUNCTIONALITY=Does the frontend core functionality work correctly? (Y/N): 
    if /i "%FRONTEND_FUNCTIONALITY%"=="Y" (
      echo [PASS] Frontend core functionality verification passed.
    ) else (
      echo [FAIL] Frontend core functionality verification failed.
      set /p FRONTEND_ISSUES=Please describe the issues encountered: 
      echo Frontend issues: %FRONTEND_ISSUES% > verification_report.txt
    )
  )
  
  if "%BACKEND_ACCESSIBLE%"=="true" (
    if "%CURL_AVAILABLE%"=="true" (
      echo Testing backend API endpoints...
      
      REM Test API with example calls
      curl -s -H "Content-Type: application/json" "%BACKEND_URL%/api/v1/health" > api_test_result.json
      echo API health check result saved to api_test_result.json
      
      REM You could add more comprehensive tests here
    ) else (
      echo Unable to test backend API endpoints (curl not available).
      echo Please manually verify the API functionality.
    )
    
    set /p BACKEND_FUNCTIONALITY=Does the backend API functionality work correctly? (Y/N): 
    if /i "%BACKEND_FUNCTIONALITY%"=="Y" (
      echo [PASS] Backend API functionality verification passed.
    ) else (
      echo [FAIL] Backend API functionality verification failed.
      set /p BACKEND_ISSUES=Please describe the issues encountered: 
      echo Backend issues: %BACKEND_ISSUES% >> verification_report.txt
    )
  )
)

echo.
echo ===================================
echo VERIFICATION RESULTS
echo ===================================
echo.

REM Display summary results
if "%FRONTEND_URL%"=="" (
  echo Frontend verification: SKIPPED
) else if "%FRONTEND_ACCESSIBLE%"=="true" (
  echo Frontend accessibility: PASSED
  if "%VERIFICATION_LEVEL%"=="3" (
    if /i "%FRONTEND_FUNCTIONALITY%"=="Y" (
      echo Frontend functionality: PASSED
    ) else (
      echo Frontend functionality: FAILED (see verification_report.txt)
    )
  )
) else (
  echo Frontend accessibility: FAILED
)

if "%BACKEND_URL%"=="" (
  echo Backend verification: SKIPPED
) else if "%BACKEND_ACCESSIBLE%"=="true" (
  echo Backend accessibility: PASSED
  if "%VERIFICATION_LEVEL%"=="3" (
    if /i "%BACKEND_FUNCTIONALITY%"=="Y" (
      echo Backend functionality: PASSED
    ) else (
      echo Backend functionality: FAILED (see verification_report.txt)
    )
  )
) else (
  echo Backend accessibility: FAILED
)

REM Generate verification timestamp
echo Verification completed on %DATE% at %TIME% >> verification_report.txt

REM Provide troubleshooting tips if issues were found
if "%FRONTEND_ACCESSIBLE%"=="false" (
  echo.
  echo TROUBLESHOOTING TIPS FOR FRONTEND:
  echo 1. Check if the deployment completed successfully in Vercel dashboard
  echo 2. Verify the URL is correct and accessible
  echo 3. Check for build errors in the Vercel logs
  echo 4. Ensure your frontend configuration is correct
  echo 5. Check if CORS settings are properly configured
)

if "%BACKEND_ACCESSIBLE%"=="false" (
  echo.
  echo TROUBLESHOOTING TIPS FOR BACKEND:
  echo 1. Check if the deployment completed successfully in Vercel dashboard
  echo 2. Verify the URL is correct and accessible
  echo 3. Check for serverless function errors in the Vercel logs
  echo 4. Ensure your environment variables are properly set
  echo 5. Verify the API routes are correctly configured
)

echo.
echo Deployment verification completed.
if exist verification_report.txt (
  echo Detailed report saved to verification_report.txt
)
echo.

pause
