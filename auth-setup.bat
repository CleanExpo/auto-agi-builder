@echo off
echo ===================================
echo AUTO AGI BUILDER AUTHENTICATION SETUP
echo ===================================
echo.

echo This script will configure the authentication settings for your Auto AGI Builder deployment.
echo.

REM Check if .env file exists
set ENV_FILE=.env
if exist %ENV_FILE% (
  echo Found existing .env file.
) else (
  echo .env file not found. Creating new file.
  copy nul %ENV_FILE% > nul
)

echo.
echo Choose authentication provider:
echo 1. JWT (JSON Web Tokens - simplest for development)
echo 2. Auth0
echo 3. Firebase Authentication
echo 4. Custom OAuth Provider
echo 5. Public Access (no authentication - for demo purposes only)
echo.

set /p AUTH_CHOICE=Enter your choice (1-5): 

if "%AUTH_CHOICE%"=="1" (
  set AUTH_TYPE=jwt
  echo.
  echo Selected authentication type: JWT
  echo.
  
  REM Generate a random JWT secret or use provided one
  echo Would you like to:
  echo 1. Generate a random secure JWT secret
  echo 2. Enter your own JWT secret
  echo.
  set /p JWT_GEN_CHOICE=Enter your choice (1-2): 
  
  if "%JWT_GEN_CHOICE%"=="1" (
    echo Generating random JWT secret...
    set JWT_SECRET=
    for /L %%i in (1,1,32) do call :APPEND_RANDOM
    echo JWT secret generated successfully.
  ) else (
    set /p JWT_SECRET=Enter your JWT secret key: 
  )
  
  set /p JWT_EXPIRY=JWT token expiry time in hours (default: 24): 
  if "%JWT_EXPIRY%"=="" set JWT_EXPIRY=24
  
  echo.
  echo Setting up JWT authentication...
  echo AUTH_PROVIDER=jwt > %ENV_FILE%.tmp
  echo JWT_SECRET=%JWT_SECRET% >> %ENV_FILE%.tmp
  echo JWT_EXPIRY=%JWT_EXPIRY%h >> %ENV_FILE%.tmp
  
) else if "%AUTH_CHOICE%"=="2" (
  set AUTH_TYPE=auth0
  echo.
  echo Selected authentication type: Auth0
  echo.
  
  echo Please enter your Auth0 credentials:
  set /p AUTH0_DOMAIN=Auth0 Domain (e.g., your-tenant.auth0.com): 
  set /p AUTH0_CLIENT_ID=Auth0 Client ID: 
  set /p AUTH0_CLIENT_SECRET=Auth0 Client Secret: 
  set /p AUTH0_AUDIENCE=Auth0 API Audience (default: https://api.auto-agi-builder.com): 
  if "%AUTH0_AUDIENCE%"=="" set AUTH0_AUDIENCE=https://api.auto-agi-builder.com
  
  echo.
  echo Setting up Auth0 authentication...
  echo AUTH_PROVIDER=auth0 > %ENV_FILE%.tmp
  echo AUTH0_DOMAIN=%AUTH0_DOMAIN% >> %ENV_FILE%.tmp
  echo AUTH0_CLIENT_ID=%AUTH0_CLIENT_ID% >> %ENV_FILE%.tmp
  echo AUTH0_CLIENT_SECRET=%AUTH0_CLIENT_SECRET% >> %ENV_FILE%.tmp
  echo AUTH0_AUDIENCE=%AUTH0_AUDIENCE% >> %ENV_FILE%.tmp
  
) else if "%AUTH_CHOICE%"=="3" (
  set AUTH_TYPE=firebase
  echo.
  echo Selected authentication type: Firebase Authentication
  echo.
  
  echo Please enter your Firebase credentials:
  set /p FIREBASE_API_KEY=Firebase API Key: 
  set /p FIREBASE_AUTH_DOMAIN=Firebase Auth Domain: 
  set /p FIREBASE_PROJECT_ID=Firebase Project ID: 
  
  echo Enter the path to your Firebase service account credentials JSON file
  echo (Leave blank to skip - you will need to provide service account manually):
  set /p FIREBASE_CREDENTIALS_PATH=Firebase Credentials Path: 
  
  echo.
  echo Setting up Firebase authentication...
  echo AUTH_PROVIDER=firebase > %ENV_FILE%.tmp
  echo FIREBASE_API_KEY=%FIREBASE_API_KEY% >> %ENV_FILE%.tmp
  echo FIREBASE_AUTH_DOMAIN=%FIREBASE_AUTH_DOMAIN% >> %ENV_FILE%.tmp
  echo FIREBASE_PROJECT_ID=%FIREBASE_PROJECT_ID% >> %ENV_FILE%.tmp
  
  if not "%FIREBASE_CREDENTIALS_PATH%"=="" (
    echo FIREBASE_CREDENTIALS_PATH=%FIREBASE_CREDENTIALS_PATH% >> %ENV_FILE%.tmp
  )
  
) else if "%AUTH_CHOICE%"=="4" (
  set AUTH_TYPE=oauth
  echo.
  echo Selected authentication type: Custom OAuth Provider
  echo.
  
  echo Please enter your OAuth credentials:
  set /p OAUTH_PROVIDER=OAuth Provider Name (e.g., github, google): 
  set /p OAUTH_CLIENT_ID=OAuth Client ID: 
  set /p OAUTH_CLIENT_SECRET=OAuth Client Secret: 
  set /p OAUTH_REDIRECT_URI=OAuth Redirect URI: 
  set /p OAUTH_AUTH_URL=OAuth Authorization URL: 
  set /p OAUTH_TOKEN_URL=OAuth Token URL: 
  set /p OAUTH_USER_INFO_URL=OAuth User Info URL: 
  
  echo.
  echo Setting up Custom OAuth authentication...
  echo AUTH_PROVIDER=oauth > %ENV_FILE%.tmp
  echo OAUTH_PROVIDER=%OAUTH_PROVIDER% >> %ENV_FILE%.tmp
  echo OAUTH_CLIENT_ID=%OAUTH_CLIENT_ID% >> %ENV_FILE%.tmp
  echo OAUTH_CLIENT_SECRET=%OAUTH_CLIENT_SECRET% >> %ENV_FILE%.tmp
  echo OAUTH_REDIRECT_URI=%OAUTH_REDIRECT_URI% >> %ENV_FILE%.tmp
  echo OAUTH_AUTH_URL=%OAUTH_AUTH_URL% >> %ENV_FILE%.tmp
  echo OAUTH_TOKEN_URL=%OAUTH_TOKEN_URL% >> %ENV_FILE%.tmp
  echo OAUTH_USER_INFO_URL=%OAUTH_USER_INFO_URL% >> %ENV_FILE%.tmp
  
) else if "%AUTH_CHOICE%"=="5" (
  set AUTH_TYPE=public
  echo.
  echo Selected authentication type: Public Access (No Authentication)
  echo.
  echo WARNING: This mode is intended for demonstration or development purposes only.
  echo It provides no security for your application.
  echo.
  
  set /p CONFIRM_PUBLIC=Are you sure you want to use public access mode? (Y/N): 
  if /i not "%CONFIRM_PUBLIC%"=="Y" (
    echo Configuration canceled. Please run the script again to choose a secure authentication method.
    goto end
  )
  
  echo.
  echo Setting up Public Access mode...
  echo AUTH_PROVIDER=public > %ENV_FILE%.tmp
  echo PUBLIC_ACCESS=true >> %ENV_FILE%.tmp
  
) else (
  echo Invalid choice. Defaulting to JWT authentication.
  set AUTH_TYPE=jwt
  
  echo Generating random JWT secret...
  set JWT_SECRET=
  for /L %%i in (1,1,32) do call :APPEND_RANDOM
  set JWT_EXPIRY=24
  
  echo.
  echo Setting up JWT authentication...
  echo AUTH_PROVIDER=jwt > %ENV_FILE%.tmp
  echo JWT_SECRET=%JWT_SECRET% >> %ENV_FILE%.tmp
  echo JWT_EXPIRY=%JWT_EXPIRY%h >> %ENV_FILE%.tmp
)

REM Configure CORS settings
echo.
echo Configure Cross-Origin Resource Sharing (CORS):
set /p CORS_ORIGINS=Allowed origins (comma-separated, default: http://localhost:3000): 
if "%CORS_ORIGINS%"=="" set CORS_ORIGINS=http://localhost:3000

echo CORS_ORIGINS=%CORS_ORIGINS% >> %ENV_FILE%.tmp

REM Configure cookie settings if applicable
if not "%AUTH_TYPE%"=="public" (
  echo.
  echo Configure cookie settings:
  set /p COOKIE_SECURE=Use secure cookies (requires HTTPS)? (Y/N, default: Y):
  if "%COOKIE_SECURE%"=="" set COOKIE_SECURE=Y
  
  if /i "%COOKIE_SECURE%"=="Y" (
    echo COOKIE_SECURE=true >> %ENV_FILE%.tmp
  ) else (
    echo COOKIE_SECURE=false >> %ENV_FILE%.tmp
  )
  
  set /p COOKIE_DOMAIN=Cookie domain (default: empty for same-origin): 
  if not "%COOKIE_DOMAIN%"=="" (
    echo COOKIE_DOMAIN=%COOKIE_DOMAIN% >> %ENV_FILE%.tmp
  )
)

REM Update .env file, preserving other variables
if exist %ENV_FILE% (
  type %ENV_FILE% | findstr /v "AUTH_PROVIDER JWT_SECRET JWT_EXPIRY AUTH0_DOMAIN AUTH0_CLIENT_ID AUTH0_CLIENT_SECRET AUTH0_AUDIENCE FIREBASE_API_KEY FIREBASE_AUTH_DOMAIN FIREBASE_PROJECT_ID FIREBASE_CREDENTIALS_PATH OAUTH_PROVIDER OAUTH_CLIENT_ID OAUTH_CLIENT_SECRET OAUTH_REDIRECT_URI OAUTH_AUTH_URL OAUTH_TOKEN_URL OAUTH_USER_INFO_URL PUBLIC_ACCESS CORS_ORIGINS COOKIE_SECURE COOKIE_DOMAIN" > %ENV_FILE%.combined
  type %ENV_FILE%.tmp >> %ENV_FILE%.combined
  move /y %ENV_FILE%.combined %ENV_FILE% > nul
  del %ENV_FILE%.tmp
) else (
  move /y %ENV_FILE%.tmp %ENV_FILE% > nul
)

echo.
echo Authentication configuration saved to .env file.

REM For JWT auth, check if secret is valid/strong
if "%AUTH_TYPE%"=="jwt" (
  echo.
  echo Validating JWT secret...
  
  set JWT_LENGTH=0
  set TEMP_SECRET=%JWT_SECRET%
  :COUNT_LOOP
  if defined TEMP_SECRET (
    set TEMP_SECRET=%TEMP_SECRET:~1%
    set /a JWT_LENGTH+=1
    goto COUNT_LOOP
  )
  
  if %JWT_LENGTH% LSS 16 (
    echo WARNING: JWT secret is shorter than recommended (16+ characters).
    echo This may pose a security risk.
  ) else (
    echo JWT secret validated - meets minimum length requirements.
  )
)

goto end

:APPEND_RANDOM
REM Generate a random character for the JWT secret
set CHAR_SET=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_
set /a RAND=%RANDOM% %% 64
set CHAR=!CHAR_SET:~%RAND%,1!
set JWT_SECRET=%JWT_SECRET%%CHAR%
exit /b

:end
echo.
echo Authentication setup completed.
echo The authentication configuration has been saved to your .env file.
echo.
pause
