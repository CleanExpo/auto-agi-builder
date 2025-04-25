@echo off
echo ===================================
echo AUTO AGI BUILDER STORAGE SETUP
echo ===================================
echo.

echo This script will configure the storage settings for your Auto AGI Builder deployment.
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
echo Choose storage provider:
echo 1. AWS S3 (recommended for production)
echo 2. Azure Blob Storage
echo 3. Google Cloud Storage
echo 4. Local File Storage (simplest for development)
echo.

set /p STORAGE_CHOICE=Enter your choice (1-4): 

if "%STORAGE_CHOICE%"=="1" (
  set STORAGE_TYPE=s3
  echo.
  echo Selected storage type: AWS S3
  echo.
  
  echo Please enter your AWS S3 details:
  set /p AWS_ACCESS_KEY=AWS Access Key: 
  set /p AWS_SECRET_KEY=AWS Secret Key: 
  set /p AWS_REGION=AWS Region (default: us-east-1): 
  if "%AWS_REGION%"=="" set AWS_REGION=us-east-1
  set /p S3_BUCKET_NAME=S3 Bucket Name: 
  
  echo.
  echo Setting up AWS S3 configuration...
  echo STORAGE_PROVIDER=s3 > %ENV_FILE%.tmp
  echo AWS_ACCESS_KEY_ID=%AWS_ACCESS_KEY% >> %ENV_FILE%.tmp
  echo AWS_SECRET_ACCESS_KEY=%AWS_SECRET_KEY% >> %ENV_FILE%.tmp
  echo AWS_REGION=%AWS_REGION% >> %ENV_FILE%.tmp
  echo S3_BUCKET_NAME=%S3_BUCKET_NAME% >> %ENV_FILE%.tmp
  
) else if "%STORAGE_CHOICE%"=="2" (
  set STORAGE_TYPE=azure
  echo.
  echo Selected storage type: Azure Blob Storage
  echo.
  
  echo Please enter your Azure Blob Storage details:
  set /p AZURE_CONNECTION_STRING=Azure Connection String: 
  set /p AZURE_CONTAINER_NAME=Azure Container Name: 
  
  echo.
  echo Setting up Azure Blob Storage configuration...
  echo STORAGE_PROVIDER=azure > %ENV_FILE%.tmp
  echo AZURE_STORAGE_CONNECTION_STRING=%AZURE_CONNECTION_STRING% >> %ENV_FILE%.tmp
  echo AZURE_STORAGE_CONTAINER=%AZURE_CONTAINER_NAME% >> %ENV_FILE%.tmp
  
) else if "%STORAGE_CHOICE%"=="3" (
  set STORAGE_TYPE=gcs
  echo.
  echo Selected storage type: Google Cloud Storage
  echo.
  
  echo Please enter your Google Cloud Storage details:
  set /p GCS_PROJECT_ID=GCS Project ID: 
  set /p GCS_BUCKET_NAME=GCS Bucket Name: 
  echo Enter the path to your Google service account credentials JSON file
  echo (Leave blank to skip - you will need to set GOOGLE_APPLICATION_CREDENTIALS env var manually):
  set /p GCS_CREDENTIALS_PATH=GCS Credentials Path: 
  
  echo.
  echo Setting up Google Cloud Storage configuration...
  echo STORAGE_PROVIDER=gcs > %ENV_FILE%.tmp
  echo GCS_PROJECT_ID=%GCS_PROJECT_ID% >> %ENV_FILE%.tmp
  echo GCS_BUCKET_NAME=%GCS_BUCKET_NAME% >> %ENV_FILE%.tmp
  if not "%GCS_CREDENTIALS_PATH%"=="" (
    echo GCS_CREDENTIALS_PATH=%GCS_CREDENTIALS_PATH% >> %ENV_FILE%.tmp
  )
  
) else if "%STORAGE_CHOICE%"=="4" (
  set STORAGE_TYPE=local
  echo.
  echo Selected storage type: Local File Storage
  echo.
  
  echo Please enter your local storage settings:
  set /p STORAGE_DIR=Storage Directory (default: ./storage): 
  if "%STORAGE_DIR%"=="" set STORAGE_DIR=./storage
  
  echo.
  echo Setting up Local File Storage configuration...
  echo STORAGE_PROVIDER=local > %ENV_FILE%.tmp
  echo STORAGE_DIR=%STORAGE_DIR% >> %ENV_FILE%.tmp
  
  REM Check if directory exists and create it if needed
  if not exist "%STORAGE_DIR%" (
    echo Storage directory does not exist. Creating it now...
    mkdir "%STORAGE_DIR%"
    if %ERRORLEVEL% EQU 0 (
      echo Storage directory created successfully.
    ) else (
      echo Failed to create storage directory. Please check permissions and path.
    )
  )
  
) else (
  echo Invalid choice. Defaulting to Local File Storage.
  set STORAGE_TYPE=local
  set STORAGE_DIR=./storage
  
  echo.
  echo Setting up Local File Storage configuration...
  echo STORAGE_PROVIDER=local > %ENV_FILE%.tmp
  echo STORAGE_DIR=%STORAGE_DIR% >> %ENV_FILE%.tmp
  
  REM Create storage directory if it doesn't exist
  if not exist "%STORAGE_DIR%" (
    echo Storage directory does not exist. Creating it now...
    mkdir "%STORAGE_DIR%"
    if %ERRORLEVEL% EQU 0 (
      echo Storage directory created successfully.
    ) else (
      echo Failed to create storage directory. Please check permissions and path.
    )
  )
)

REM Add upload limit settings
echo.
echo Please specify maximum file upload size:
set /p MAX_UPLOAD_SIZE=Maximum file upload size in MB (default: 50): 
if "%MAX_UPLOAD_SIZE%"=="" set MAX_UPLOAD_SIZE=50

echo MAX_UPLOAD_SIZE=%MAX_UPLOAD_SIZE%MB >> %ENV_FILE%.tmp

REM Update .env file, preserving other variables
if exist %ENV_FILE% (
  type %ENV_FILE% | findstr /v "STORAGE_PROVIDER AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_REGION S3_BUCKET_NAME AZURE_STORAGE_CONNECTION_STRING AZURE_STORAGE_CONTAINER GCS_PROJECT_ID GCS_BUCKET_NAME GCS_CREDENTIALS_PATH STORAGE_DIR MAX_UPLOAD_SIZE" > %ENV_FILE%.combined
  type %ENV_FILE%.tmp >> %ENV_FILE%.combined
  move /y %ENV_FILE%.combined %ENV_FILE% > nul
  del %ENV_FILE%.tmp
) else (
  move /y %ENV_FILE%.tmp %ENV_FILE% > nul
)

echo.
echo Storage configuration saved to .env file.

REM Attempt connection test for supported storage providers
echo.
echo Would you like to test the storage connection?
set /p TEST_CONNECTION=Enter Y for yes, any other key to skip: 

if /i not "%TEST_CONNECTION%"=="Y" goto end

echo.
echo Testing storage connection...
echo.

if "%STORAGE_TYPE%"=="s3" (
  where aws >nul 2>&1
  if %ERRORLEVEL% EQU 0 (
    echo Testing AWS S3 connection...
    aws s3 ls s3://%S3_BUCKET_NAME% --region %AWS_REGION% >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
      echo Connection to AWS S3 successful!
    ) else (
      echo Connection to AWS S3 failed. Please check your credentials and bucket name.
    )
  ) else (
    echo AWS CLI not found. Skipping connection test.
    echo To test manually, ensure AWS CLI is installed and run: aws s3 ls s3://%S3_BUCKET_NAME% --region %AWS_REGION%
  )
) else if "%STORAGE_TYPE%"=="azure" (
  where az >nul 2>&1
  if %ERRORLEVEL% EQU 0 (
    echo Testing Azure Blob Storage connection...
    echo This may take a moment...
    az storage container exists --name %AZURE_CONTAINER_NAME% --connection-string "%AZURE_CONNECTION_STRING%" >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
      echo Connection to Azure Blob Storage successful!
    ) else (
      echo Connection to Azure Blob Storage failed. Please check your connection string and container name.
    )
  ) else (
    echo Azure CLI not found. Skipping connection test.
    echo To test manually, ensure Azure CLI is installed.
  )
) else if "%STORAGE_TYPE%"=="gcs" (
  where gcloud >nul 2>&1
  if %ERRORLEVEL% EQU 0 (
    echo Testing Google Cloud Storage connection...
    gcloud storage ls gs://%GCS_BUCKET_NAME% >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
      echo Connection to Google Cloud Storage successful!
    ) else (
      echo Connection to Google Cloud Storage failed. Please check your credentials and bucket name.
    )
  ) else (
    echo Google Cloud SDK not found. Skipping connection test.
    echo To test manually, ensure Google Cloud SDK is installed.
  )
) else if "%STORAGE_TYPE%"=="local" (
  echo Testing local storage directory...
  if exist "%STORAGE_DIR%" (
    echo Local storage directory exists and is accessible.
    
    REM Try to create a test file
    echo Test > "%STORAGE_DIR%\test.txt" 2>nul
    if exist "%STORAGE_DIR%\test.txt" (
      echo Successfully created test file. Storage is writable.
      del "%STORAGE_DIR%\test.txt"
    ) else (
      echo WARNING: Could not write to storage directory. Check permissions.
    )
  ) else (
    echo ERROR: Local storage directory does not exist or is not accessible.
  )
)

:end
echo.
echo Storage setup completed.
echo The storage configuration has been saved to your .env file.
echo.
pause
