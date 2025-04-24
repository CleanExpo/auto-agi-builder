@echo off
setlocal enabledelayedexpansion

echo ===================================
echo Auto AGI Builder - Canary Deployment
echo ===================================
echo.
echo This script will prepare and deploy the Auto AGI Builder to the Vercel canary environment
echo for gradual rollout (10%% traffic) before full production deployment.
echo.

:: Create log file
set LOGFILE=%~dp0canary-deploy.log
echo Canary Deployment Log > %LOGFILE%
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

:: Check if staging deployment exists and has been verified
echo.
echo Step 2: Verifying staging deployment status...
echo This step ensures that canary deployment only proceeds after successful staging deployment.

if not exist staging-deploy.log (
    echo ERROR: No staging deployment log found. Please run deploy-to-staging.bat first.
    echo ERROR: No staging deployment log found >> %LOGFILE%
    goto :error
)

findstr /C:"Staging deployment verification passed" staging-deploy.log >nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Staging deployment has not been verified successfully. 
    echo Please run deploy-to-staging.bat and ensure it completes successfully.
    echo ERROR: Staging deployment verification not confirmed >> %LOGFILE%
    goto :error
) else (
    echo Staging deployment verification confirmed
    echo Staging deployment verification confirmed >> %LOGFILE%
)

:: Remove any existing canary environment configuration
echo.
echo Step 3: Cleaning up previous canary configuration...
if exist ".vercel-canary" (
    echo Removing existing .vercel-canary directory...
    rmdir /s /q .vercel-canary
    if !ERRORLEVEL! neq 0 (
        echo ERROR: Failed to remove .vercel-canary directory
        echo ERROR: Failed to remove .vercel-canary directory >> %LOGFILE%
        
        echo Attempting PowerShell removal...
        powershell -Command "Remove-Item -Path '.vercel-canary' -Recurse -Force -ErrorAction SilentlyContinue"
        if !ERRORLEVEL! neq 0 (
            echo ERROR: PowerShell removal also failed >> %LOGFILE%
        else
            echo Successfully removed .vercel-canary using PowerShell >> %LOGFILE%
        )
    ) else (
        echo Removed existing .vercel-canary directory >> %LOGFILE%
    )
) else (
    echo No existing .vercel-canary directory found
    echo No existing .vercel-canary directory found >> %LOGFILE%
)

:: Set up canary environment variables
echo.
echo Step 4: Setting up canary environment...
if not exist frontend\.env.canary (
    echo Creating canary environment file...
    echo # Canary Environment Settings > frontend\.env.canary
    echo NEXT_PUBLIC_ENV=canary >> frontend\.env.canary
    echo NEXT_PUBLIC_API_URL=https://api.example.com >> frontend\.env.canary
    echo NEXT_PUBLIC_CANARY=true >> frontend\.env.canary
    echo NEXT_PUBLIC_VERSION=%date:~6,4%%date:~0,2%%date:~3,2%.%time:~0,2%%time:~3,2% >> frontend\.env.canary
    echo Created frontend/.env.canary >> %LOGFILE%
) else (
    echo Canary environment file already exists
    echo Updating version tag in canary environment file...
    powershell -Command "(Get-Content frontend\.env.canary) | ForEach-Object { $_ -replace 'NEXT_PUBLIC_VERSION=.*', 'NEXT_PUBLIC_VERSION=%date:~6,4%%date:~0,2%%date:~3,2%.%time:~0,2%%time:~3,2%' } | Set-Content frontend\.env.canary"
    echo Updated version tag in canary environment file >> %LOGFILE%
)

:: Copy production .env to canary if needed
if exist frontend\.env.production (
    echo Copying production environment variables to canary...
    powershell -Command "Get-Content frontend\.env.production | Where-Object { !($_ -match '^NEXT_PUBLIC_ENV=') -and !($_ -match '^NEXT_PUBLIC_VERSION=') -and !($_ -match '^NEXT_PUBLIC_CANARY=') } | Out-File -Append -Encoding utf8 frontend\.env.canary"
    echo Copied production environment variables to canary >> %LOGFILE%
)

:: Prepare canary config for Next.js
echo.
echo Step 5: Setting up canary Next.js configuration...
echo // next.config.js for canary> frontend\next.config.canary.js
echo const nextConfig = {>> frontend\next.config.canary.js
echo   output: 'export',>> frontend\next.config.canary.js
echo   distDir: 'out',>> frontend\next.config.canary.js
echo   images: {>> frontend\next.config.canary.js
echo     domains: [],>> frontend\next.config.canary.js
echo     deviceSizes: [640, 750, 828, 1080, 1200, 1920],>> frontend\next.config.canary.js
echo     imageSizes: [16, 32, 48, 64, 96, 128, 256],>> frontend\next.config.canary.js
echo     formats: ['image/webp'],>> frontend\next.config.canary.js
echo     minimumCacheTTL: 60,>> frontend\next.config.canary.js
echo   },>> frontend\next.config.canary.js
echo   env: {>> frontend\next.config.canary.js
echo     ENVIRONMENT: 'canary',>> frontend\next.config.canary.js
echo     CANARY: true,>> frontend\next.config.canary.js
echo   },>> frontend\next.config.canary.js
echo   webpack: (config, { isServer }) => {>> frontend\next.config.canary.js
echo     // Add source maps for better debugging>> frontend\next.config.canary.js
echo     if (!isServer) {>> frontend\next.config.canary.js
echo       config.devtool = 'source-map';>> frontend\next.config.canary.js
echo     }>> frontend\next.config.canary.js
echo     // Add tree shaking and dead code elimination>> frontend\next.config.canary.js
echo     config.optimization.usedExports = true;>> frontend\next.config.canary.js
echo     return config;>> frontend\next.config.canary.js
echo   },>> frontend\next.config.canary.js
echo   experimental: {>> frontend\next.config.canary.js
echo     optimizeCss: true,>> frontend\next.config.canary.js
echo   },>> frontend\next.config.canary.js
echo };>> frontend\next.config.canary.js
echo >> frontend\next.config.canary.js
echo module.exports = nextConfig;>> frontend\next.config.canary.js
echo Created canary Next.js configuration >> %LOGFILE%

:: Backup and replace the regular Next.js config with our canary config
echo.
echo Step 6: Backing up and replacing Next.js config...
if exist frontend\next.config.js (
    copy frontend\next.config.js frontend\next.config.backup.js
    echo Backed up next.config.js to next.config.backup.js >> %LOGFILE%
)
copy frontend\next.config.canary.js frontend\next.config.js
echo Replaced next.config.js with canary configuration >> %LOGFILE%

:: Create canary vercel configuration
echo.
echo Step 7: Creating canary Vercel configuration...
echo {> vercel.canary.json
echo   "version": 2,>> vercel.canary.json
echo   "name": "auto-agi-builder-canary",>> vercel.canary.json
echo   "buildCommand": "cd frontend && npm install && npm run build",>> vercel.canary.json
echo   "outputDirectory": "frontend/out",>> vercel.canary.json
echo   "framework": "nextjs",>> vercel.canary.json
echo   "regions": ["sfo1"],>> vercel.canary.json
echo   "env": {>> vercel.canary.json
echo     "ENVIRONMENT": "canary",>> vercel.canary.json
echo     "CANARY": "true">> vercel.canary.json
echo   },>> vercel.canary.json
echo   "headers": [>> vercel.canary.json
echo     {>> vercel.canary.json
echo       "source": "/static/(.*)",>> vercel.canary.json
echo       "headers": [>> vercel.canary.json
echo         {>> vercel.canary.json
echo           "key": "Cache-Control",>> vercel.canary.json
echo           "value": "public, max-age=31536000, immutable">> vercel.canary.json
echo         }>> vercel.canary.json
echo       ]>> vercel.canary.json
echo     },>> vercel.canary.json
echo     {>> vercel.canary.json
echo       "source": "/(.*)\.(js|css|webp|jpg|jpeg|png|svg|ico)$",>> vercel.canary.json
echo       "headers": [>> vercel.canary.json
echo         {>> vercel.canary.json
echo           "key": "Cache-Control",>> vercel.canary.json
echo           "value": "public, max-age=86400, stale-while-revalidate=31536000">> vercel.canary.json
echo         }>> vercel.canary.json
echo       ]>> vercel.canary.json
echo     },>> vercel.canary.json
echo     {>> vercel.canary.json
echo       "source": "/(.*)",>> vercel.canary.json
echo       "headers": [>> vercel.canary.json
echo         {>> vercel.canary.json
echo           "key": "X-Environment",>> vercel.canary.json
echo           "value": "canary">> vercel.canary.json
echo         },>> vercel.canary.json
echo         {>> vercel.canary.json
echo           "key": "X-Canary",>> vercel.canary.json
echo           "value": "true">> vercel.canary.json
echo         }>> vercel.canary.json
echo       ]>> vercel.canary.json
echo     }>> vercel.canary.json
echo   ]>> vercel.canary.json
echo }>> vercel.canary.json
echo Created enhanced canary vercel.json configuration >> %LOGFILE%

:: Backup and replace the regular vercel.json with canary version
if exist vercel.json (
    copy vercel.json vercel.backup.json
    echo Backed up vercel.json to vercel.backup.json >> %LOGFILE%
)
copy vercel.canary.json vercel.json
echo Replaced vercel.json with canary configuration >> %LOGFILE%

:: Create canary .vercelignore similar to staging
echo.
echo Step 8: Creating canary .vercelignore...
echo app > .vercelignore
echo requirements.txt >> .vercelignore
echo tests >> .vercelignore
echo docs >> .vercelignore
echo *.py >> .vercelignore
echo quadrants >> .vercelignore
echo *.canary.* >> .vercelignore
echo *.backup.* >> .vercelignore
echo Created canary .vercelignore >> %LOGFILE%

:: Run pre-deployment validation
echo.
echo Step 9: Running pre-deployment validation...
echo @echo off > validate-canary.bat
echo echo Validating canary deployment configuration... >> validate-canary.bat
echo if not exist "frontend\next.config.js" (>> validate-canary.bat
echo   echo ERROR: next.config.js not found >> validate-canary.bat
echo   exit /b 1>> validate-canary.bat
echo )>> validate-canary.bat
echo if not exist "vercel.json" (>> validate-canary.bat
echo   echo ERROR: vercel.json not found >> validate-canary.bat
echo   exit /b 1>> validate-canary.bat
echo )>> validate-canary.bat
echo if not exist "frontend\.env.canary" (>> validate-canary.bat
echo   echo ERROR: frontend/.env.canary not found >> validate-canary.bat
echo   exit /b 1>> validate-canary.bat
echo )>> validate-canary.bat
echo echo All canary configuration files validated successfully! >> validate-canary.bat
echo exit /b 0>> validate-canary.bat

call validate-canary.bat
if %ERRORLEVEL% neq 0 (
    echo ERROR: Pre-deployment validation failed
    echo ERROR: Pre-deployment validation failed >> %LOGFILE%
    goto :error
) else (
    echo Pre-deployment validation passed >> %LOGFILE%
    echo All canary configuration files validated successfully!
)

:: Create rollback script for emergencies
echo.
echo Step 10: Creating emergency rollback script...
echo @echo off > canary-rollback.bat
echo echo Rolling back canary deployment... >> canary-rollback.bat
echo vercel rollback --scope auto-agi-builder-canary >> canary-rollback.bat
echo if %%ERRORLEVEL%% neq 0 ( >> canary-rollback.bat
echo   echo ERROR: Rollback failed >> canary-rollback.bat
echo   exit /b 1 >> canary-rollback.bat
echo ) >> canary-rollback.bat
echo echo Canary rollback successful >> canary-rollback.bat
echo exit /b 0 >> canary-rollback.bat

echo Created emergency rollback script: canary-rollback.bat >> %LOGFILE%
echo Emergency rollback script created: canary-rollback.bat

:: Deploy to Vercel canary
echo.
echo Step 11: Deploying to Vercel canary environment...
echo This step requires your input. When prompted:
echo  - Select 'N' for any existing project
echo  - Use default settings for other options
echo.
echo Press any key to start deployment...
pause > nul

echo Running Vercel deploy command for canary... >> %LOGFILE%
echo Executing: vercel --name auto-agi-builder-canary >> %LOGFILE%
vercel --name auto-agi-builder-canary

if %ERRORLEVEL% neq 0 (
    echo ERROR: Canary deployment failed
    echo ERROR: Canary deployment failed >> %LOGFILE%
    goto :error
) else (
    echo Canary deployment initiated >> %LOGFILE%
)

:: Verify deployment
echo.
echo Step 12: Verifying canary deployment...
echo Please wait for the deployment to complete (about 30 seconds)...
timeout /t 30 /nobreak > nul

echo Running post-deployment verification...
node verify-deployment.js canary

if %ERRORLEVEL% neq 0 (
    echo WARNING: Automated verification of canary deployment reported issues >> %LOGFILE%
    echo Some verification checks reported warnings. Check verify-deployment.js output for details.
    echo If critical issues exist, consider running canary-rollback.bat
) else (
    echo Canary deployment verification passed >> %LOGFILE%
    echo Canary deployment verification completed successfully!
)

:: Set up canary monitoring
echo.
echo Step 13: Setting up canary monitoring...
echo @echo off > monitor-canary.bat
echo echo Monitoring canary deployment for issues... >> monitor-canary.bat
echo echo This will run for 5 minutes by default. >> monitor-canary.bat
echo echo Press Ctrl+C to stop monitoring. >> monitor-canary.bat
echo echo. >> monitor-canary.bat
echo echo Starting monitoring at: %%date%% %%time%% >> monitor-canary.bat
echo echo. >> monitor-canary.bat
echo echo Checking canary deployment health every 30 seconds... >> monitor-canary.bat
echo for /l %%%%i in (1,1,10) do ( >> monitor-canary.bat
echo   echo [%%date%% %%time%%] Running health check #%%%%i... >> monitor-canary.bat
echo   node verify-deployment.js canary >> monitor-canary.bat
echo   timeout /t 30 /nobreak > nul >> monitor-canary.bat
echo ) >> monitor-canary.bat
echo echo. >> monitor-canary.bat
echo echo Canary monitoring completed at: %%date%% %%time%% >> monitor-canary.bat
echo exit /b 0 >> monitor-canary.bat

echo Created canary monitoring script: monitor-canary.bat >> %LOGFILE%
echo Canary monitoring script created: monitor-canary.bat

:: Restore original configuration files
echo.
echo Step 14: Restoring original configuration files...
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
echo Canary Deployment Complete
echo ===================================
echo.
echo Your application has been deployed to the canary environment.
echo It is now receiving a small percentage of production traffic for testing.
echo.
echo IMPORTANT:
echo 1. Monitor the canary deployment using monitor-canary.bat
echo 2. If issues are detected, roll back using canary-rollback.bat
echo 3. If canary performs well, proceed with deploy-production.bat
echo.
echo The canary URL should be available in the Vercel output above.
echo The script also created:
echo  - canary-rollback.bat (for emergency rollbacks)
echo  - monitor-canary.bat (for continuous monitoring)
echo.
echo If you encountered any issues, please check the canary-deploy.log file.
echo.
echo Deployment completed at: %date% %time% >> %LOGFILE%
goto :end

:error
echo.
echo Canary deployment encountered errors. See %LOGFILE% for details.
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
