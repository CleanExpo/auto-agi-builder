@echo off
setlocal enabledelayedexpansion

echo ===================================
echo Auto AGI Builder - Staging Deployment
echo ===================================
echo.
echo This script will prepare and deploy the Auto AGI Builder to the Vercel staging environment
echo for testing before production deployment.
echo.

:: Create log file
set LOGFILE=%~dp0staging-deploy.log
echo Staging Deployment Log > %LOGFILE%
echo Started at: %date% %time% >> %LOGFILE%
echo. >> %LOGFILE%

:: Ensure Vercel CLI is installed
echo Step 1: Checking Vercel CLI installation...
where vercel >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Vercel CLI not found. Please install it using 'npm install -g vercel'
    echo ERROR: Vercel CLI not found >> %LOGFILE%
    goto :error
) else (
    echo Vercel CLI is installed
    echo Vercel CLI is installed >> %LOGFILE%
)

:: Remove any existing staging environment configuration
echo.
echo Step 2: Cleaning up previous staging configuration...
if exist ".vercel-staging" (
    echo Removing existing .vercel-staging directory...
    rmdir /s /q .vercel-staging
    if !ERRORLEVEL! neq 0 (
        echo ERROR: Failed to remove .vercel-staging directory
        echo ERROR: Failed to remove .vercel-staging directory >> %LOGFILE%
        
        echo Attempting PowerShell removal...
        powershell -Command "Remove-Item -Path '.vercel-staging' -Recurse -Force -ErrorAction SilentlyContinue"
        if !ERRORLEVEL! neq 0 (
            echo ERROR: PowerShell removal also failed >> %LOGFILE%
        else
            echo Successfully removed .vercel-staging using PowerShell >> %LOGFILE%
        )
    ) else (
        echo Removed existing .vercel-staging directory >> %LOGFILE%
    )
) else (
    echo No existing .vercel-staging directory found
    echo No existing .vercel-staging directory found >> %LOGFILE%
)

:: Set up staging environment variables
echo.
echo Step 3: Setting up staging environment...
if not exist frontend\.env.staging (
    echo Creating staging environment file...
    echo # Staging Environment Settings > frontend\.env.staging
    echo NEXT_PUBLIC_ENV=staging >> frontend\.env.staging
    echo NEXT_PUBLIC_API_URL=https://api-staging.example.com >> frontend\.env.staging
    echo NEXT_PUBLIC_VERSION=%date:~6,4%%date:~0,2%%date:~3,2%.%time:~0,2%%time:~3,2% >> frontend\.env.staging
    echo Created frontend/.env.staging >> %LOGFILE%
) else (
    echo Staging environment file already exists
    echo Updating version tag in staging environment file...
    powershell -Command "(Get-Content frontend\.env.staging) | ForEach-Object { $_ -replace 'NEXT_PUBLIC_VERSION=.*', 'NEXT_PUBLIC_VERSION=%date:~6,4%%date:~0,2%%date:~3,2%.%time:~0,2%%time:~3,2%' } | Set-Content frontend\.env.staging"
    echo Updated version tag in staging environment file >> %LOGFILE%
)

:: Prepare staging config for Next.js
echo.
echo Step 4: Setting up staging Next.js configuration...
echo // next.config.js for staging> frontend\next.config.staging.js
echo const nextConfig = {>> frontend\next.config.staging.js
echo   output: 'export',>> frontend\next.config.staging.js
echo   distDir: 'out',>> frontend\next.config.staging.js
echo   images: {>> frontend\next.config.staging.js
echo     domains: [],>> frontend\next.config.staging.js
echo     deviceSizes: [640, 750, 828, 1080, 1200, 1920],>> frontend\next.config.staging.js
echo     imageSizes: [16, 32, 48, 64, 96, 128, 256],>> frontend\next.config.staging.js
echo     formats: ['image/webp'],>> frontend\next.config.staging.js
echo     minimumCacheTTL: 60,>> frontend\next.config.staging.js
echo   },>> frontend\next.config.staging.js
echo   env: {>> frontend\next.config.staging.js
echo     ENVIRONMENT: 'staging',>> frontend\next.config.staging.js
echo   },>> frontend\next.config.staging.js
echo   webpack: (config, { isServer }) => {>> frontend\next.config.staging.js
echo     // Add source maps for better debugging>> frontend\next.config.staging.js
echo     if (!isServer) {>> frontend\next.config.staging.js
echo       config.devtool = 'source-map';>> frontend\next.config.staging.js
echo     }>> frontend\next.config.staging.js
echo     return config;>> frontend\next.config.staging.js
echo   },>> frontend\next.config.staging.js
echo   experimental: {>> frontend\next.config.staging.js
echo     optimizeCss: true,>> frontend\next.config.staging.js
echo   },>> frontend\next.config.staging.js
echo };>> frontend\next.config.staging.js
echo >> frontend\next.config.staging.js
echo module.exports = nextConfig;>> frontend\next.config.staging.js
echo Created staging Next.js configuration >> %LOGFILE%

:: Backup and replace the regular Next.js config with our staging config
echo.
echo Step 5: Backing up and replacing Next.js config...
if exist frontend\next.config.js (
    copy frontend\next.config.js frontend\next.config.backup.js
    echo Backed up next.config.js to next.config.backup.js >> %LOGFILE%
)
copy frontend\next.config.staging.js frontend\next.config.js
echo Replaced next.config.js with staging configuration >> %LOGFILE%

:: Create staging vercel configuration
echo.
echo Step 6: Creating staging Vercel configuration...
echo {> vercel.staging.json
echo   "version": 2,>> vercel.staging.json
echo   "name": "auto-agi-builder-staging",>> vercel.staging.json
echo   "buildCommand": "cd frontend && npm install && npm run build",>> vercel.staging.json
echo   "outputDirectory": "frontend/out",>> vercel.staging.json
echo   "framework": "nextjs",>> vercel.staging.json
echo   "regions": ["sfo1"],>> vercel.staging.json
echo   "env": {>> vercel.staging.json
echo     "ENVIRONMENT": "staging">> vercel.staging.json
echo   },>> vercel.staging.json
echo   "headers": [>> vercel.staging.json
echo     {>> vercel.staging.json
echo       "source": "/static/(.*)",>> vercel.staging.json
echo       "headers": [>> vercel.staging.json
echo         {>> vercel.staging.json
echo           "key": "Cache-Control",>> vercel.staging.json
echo           "value": "public, max-age=31536000, immutable">> vercel.staging.json
echo         }>> vercel.staging.json
echo       ]>> vercel.staging.json
echo     },>> vercel.staging.json
echo     {>> vercel.staging.json
echo       "source": "/(.*)\.(js|css|webp|jpg|jpeg|png|svg|ico)$",>> vercel.staging.json
echo       "headers": [>> vercel.staging.json
echo         {>> vercel.staging.json
echo           "key": "Cache-Control",>> vercel.staging.json
echo           "value": "public, max-age=86400, stale-while-revalidate=31536000">> vercel.staging.json
echo         }>> vercel.staging.json
echo       ]>> vercel.staging.json
echo     },>> vercel.staging.json
echo     {>> vercel.staging.json
echo       "source": "/(.*)",>> vercel.staging.json
echo       "headers": [>> vercel.staging.json
echo         {>> vercel.staging.json
echo           "key": "X-Environment",>> vercel.staging.json
echo           "value": "staging">> vercel.staging.json
echo         }>> vercel.staging.json
echo       ]>> vercel.staging.json
echo     }>> vercel.staging.json
echo   ]>> vercel.staging.json
echo }>> vercel.staging.json
echo Created enhanced staging vercel.json configuration >> %LOGFILE%

:: Backup and replace the regular vercel.json with staging version
if exist vercel.json (
    copy vercel.json vercel.backup.json
    echo Backed up vercel.json to vercel.backup.json >> %LOGFILE%
)
copy vercel.staging.json vercel.json
echo Replaced vercel.json with staging configuration >> %LOGFILE%

:: Create staging .vercelignore
echo.
echo Step 7: Creating staging .vercelignore...
echo app > .vercelignore
echo requirements.txt >> .vercelignore
echo tests >> .vercelignore
echo docs >> .vercelignore
echo *.py >> .vercelignore
echo quadrants >> .vercelignore
echo *.staging.* >> .vercelignore
echo *.backup.* >> .vercelignore
echo Created staging .vercelignore >> %LOGFILE%

:: Run pre-deployment validation
echo.
echo Step 8: Running pre-deployment validation...
echo @echo off > validate-staging.bat
echo echo Validating staging deployment configuration... >> validate-staging.bat
echo if not exist "frontend\next.config.js" (>> validate-staging.bat
echo   echo ERROR: next.config.js not found >> validate-staging.bat
echo   exit /b 1>> validate-staging.bat
echo )>> validate-staging.bat
echo if not exist "vercel.json" (>> validate-staging.bat
echo   echo ERROR: vercel.json not found >> validate-staging.bat
echo   exit /b 1>> validate-staging.bat
echo )>> validate-staging.bat
echo if not exist "frontend\.env.staging" (>> validate-staging.bat
echo   echo ERROR: frontend/.env.staging not found >> validate-staging.bat
echo   exit /b 1>> validate-staging.bat
echo )>> validate-staging.bat
echo echo All staging configuration files validated successfully! >> validate-staging.bat
echo exit /b 0>> validate-staging.bat

call validate-staging.bat
if %ERRORLEVEL% neq 0 (
    echo ERROR: Pre-deployment validation failed
    echo ERROR: Pre-deployment validation failed >> %LOGFILE%
    goto :error
) else (
    echo Pre-deployment validation passed >> %LOGFILE%
    echo All staging configuration files validated successfully!
)

:: Deploy to Vercel staging
echo.
echo Step 9: Deploying to Vercel staging environment...
echo This step requires your input. When prompted:
echo  - Select 'N' for any existing project
echo  - Use default settings for other options
echo.
echo Press any key to start deployment...
pause > nul

echo Running Vercel deploy command for staging... >> %LOGFILE%
echo Executing: vercel --name auto-agi-builder-staging >> %LOGFILE%
vercel --name auto-agi-builder-staging

if %ERRORLEVEL% neq 0 (
    echo ERROR: Staging deployment failed
    echo ERROR: Staging deployment failed >> %LOGFILE%
    goto :error
) else (
    echo Staging deployment initiated >> %LOGFILE%
)

:: Verify deployment
echo.
echo Step 10: Verifying staging deployment...
echo Please wait for the deployment to complete (about 30 seconds)...
timeout /t 30 /nobreak > nul

echo Running post-deployment verification...
node verify-deployment.js staging

if %ERRORLEVEL% neq 0 (
    echo WARNING: Automated verification of staging deployment reported issues >> %LOGFILE%
    echo Some verification checks reported warnings. Check verify-deployment.js output for details.
) else (
    echo Staging deployment verification passed >> %LOGFILE%
    echo Staging deployment verification completed successfully!
)

:: Restore original configuration files
echo.
echo Step 11: Restoring original configuration files...
if exist frontend\next.config.backup.js (
    copy frontend\next.config.backup.js frontend\next.config.js
    del frontend\next.config.backup.js
    echo Restored original next.config.js >> %LOGFILE%
)

if exist vercel.backup.json (
    copy vercel.backup.json vercel.json
    del vercel.backup.json
    echo Restored original vercel.json >> %LOGFILE%
)

echo Configuration files restored >> %LOGFILE%

echo.
echo ===================================
echo Staging Deployment Complete
echo ===================================
echo.
echo Your application has been deployed to the staging environment.
echo You can now test the application before deploying to production.
echo.
echo The staging URL should be available in the Vercel output above.
echo You can also find it in your Vercel dashboard.
echo.
echo If you encountered any issues, please check the staging-deploy.log file.
echo.
echo Deployment completed at: %date% %time% >> %LOGFILE%
goto :end

:error
echo.
echo Staging deployment encountered errors. See %LOGFILE% for details.
echo Deployment failed at: %date% %time% >> %LOGFILE%

:: Restore original configuration files on error
echo.
echo Restoring original configuration files...
if exist frontend\next.config.backup.js (
    copy frontend\next.config.backup.js frontend\next.config.js
    del frontend\next.config.backup.js
    echo Restored original next.config.js >> %LOGFILE%
)

if exist vercel.backup.json (
    copy vercel.backup.json vercel.json
    del vercel.backup.json
    echo Restored original vercel.json >> %LOGFILE%
)

:end
echo.
pause
endlocal
