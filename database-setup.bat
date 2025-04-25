@echo off
echo ===================================
echo AUTO AGI BUILDER DATABASE SETUP
echo ===================================
echo.

echo This script will configure the database connection for your Auto AGI Builder deployment.
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
echo Choose database type:
echo 1. PostgreSQL (recommended for production)
echo 2. MySQL
echo 3. SQLite (simplest for development)
echo 4. MongoDB
echo.

set /p DB_CHOICE=Enter your choice (1-4): 

if "%DB_CHOICE%"=="1" (
  set DB_TYPE=postgres
  set DB_DEFAULT_PORT=5432
  set DB_URL_PREFIX=postgresql://
) else if "%DB_CHOICE%"=="2" (
  set DB_TYPE=mysql
  set DB_DEFAULT_PORT=3306
  set DB_URL_PREFIX=mysql://
) else if "%DB_CHOICE%"=="3" (
  set DB_TYPE=sqlite
  set DB_DEFAULT_PORT=0
  set DB_URL_PREFIX=sqlite:///
) else if "%DB_CHOICE%"=="4" (
  set DB_TYPE=mongodb
  set DB_DEFAULT_PORT=27017
  set DB_URL_PREFIX=mongodb://
) else (
  echo Invalid choice. Defaulting to PostgreSQL.
  set DB_TYPE=postgres
  set DB_DEFAULT_PORT=5432
  set DB_URL_PREFIX=postgresql://
)

echo.
echo Selected database type: %DB_TYPE%
echo.

REM If SQLite, just need a file path
if "%DB_TYPE%"=="sqlite" (
  set /p DB_PATH=Enter database file path (default: ./auto_agi.db): 
  if "%DB_PATH%"=="" set DB_PATH=./auto_agi.db
  
  echo.
  echo Setting up SQLite connection string...
  echo DATABASE_URL=%DB_URL_PREFIX%%DB_PATH% >> %ENV_FILE%.tmp
  echo.
  echo Database configuration complete.
  goto config_complete
)

REM For other database types, gather connection details
echo Please enter your database connection details:
set /p DB_HOST=Host (default: localhost): 
if "%DB_HOST%"=="" set DB_HOST=localhost

set /p DB_PORT=Port (default: %DB_DEFAULT_PORT%): 
if "%DB_PORT%"=="" set DB_PORT=%DB_DEFAULT_PORT%

set /p DB_NAME=Database name (default: auto_agi): 
if "%DB_NAME%"=="" set DB_NAME=auto_agi

set /p DB_USER=Username: 
set /p DB_PASS=Password: 

echo.
echo Setting up database connection string...

if "%DB_TYPE%"=="mongodb" (
  echo DATABASE_URL=%DB_URL_PREFIX%%DB_USER%:%DB_PASS%@%DB_HOST%:%DB_PORT%/%DB_NAME% >> %ENV_FILE%.tmp
) else (
  echo DATABASE_URL=%DB_URL_PREFIX%%DB_USER%:%DB_PASS%@%DB_HOST%:%DB_PORT%/%DB_NAME% >> %ENV_FILE%.tmp
)

echo.
echo Database configuration complete.

:config_complete

REM Update .env file, preserving other variables
if exist %ENV_FILE% (
  type %ENV_FILE% | findstr /v "DATABASE_URL" > %ENV_FILE%.combined
  type %ENV_FILE%.tmp >> %ENV_FILE%.combined
  move /y %ENV_FILE%.combined %ENV_FILE% > nul
  del %ENV_FILE%.tmp
) else (
  move /y %ENV_FILE%.tmp %ENV_FILE% > nul
)

echo.
echo Database connection string added to .env file.

REM Attempt connection test for supported databases
echo.
echo Would you like to test the database connection?
set /p TEST_CONNECTION=Enter Y for yes, any other key to skip: 

if /i not "%TEST_CONNECTION%"=="Y" goto end

echo.
echo Testing database connection...
echo.

if "%DB_TYPE%"=="postgres" (
  where psql >nul 2>&1
  if %ERRORLEVEL% EQU 0 (
    psql %DB_URL_PREFIX%%DB_USER%:%DB_PASS%@%DB_HOST%:%DB_PORT%/%DB_NAME% -c "SELECT 1" >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
      echo Connection successful!
    ) else (
      echo Connection failed. Please check your database credentials and ensure the database server is running.
    )
  ) else (
    echo PostgreSQL client (psql) not found. Skipping connection test.
    echo To test manually, ensure your database is running and accessible.
  )
) else if "%DB_TYPE%"=="mysql" (
  where mysql >nul 2>&1
  if %ERRORLEVEL% EQU 0 (
    mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASS% -e "SELECT 1" %DB_NAME% >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
      echo Connection successful!
    ) else (
      echo Connection failed. Please check your database credentials and ensure the database server is running.
    )
  ) else (
    echo MySQL client not found. Skipping connection test.
    echo To test manually, ensure your database is running and accessible.
  )
) else (
  echo Connection test not available for %DB_TYPE%.
  echo Please ensure your database is properly configured and accessible.
)

:end
echo.
echo Database setup completed.
echo The database configuration has been saved to your .env file.
echo.
pause
