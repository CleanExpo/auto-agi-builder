@echo off
setlocal enabledelayedexpansion

echo ===================================
echo Auto AGI Builder - Production Deployment
echo ===================================
echo.
echo This script will prepare and deploy the Auto AGI Builder to the Vercel production environment.
echo This is the final step in the deployment pipeline after staging and canary deployments.
echo.
echo IMPORTANT: This will deploy to your production environment!
echo Make sure you have tested the application in staging and canary environments first.
echo.

:: Create log file
set LOGFILE=%~dp0production-deploy.log
echo Production Deployment Log > %LOGFILE%
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

:: Check if canary deployment exists and has been verified
echo.
echo Step 2: Verifying canary deployment status...
echo This step ensures that production deployment only proceeds after successful canary deployment.

if not exist canary-deploy.log (
    echo WARNING: No canary deployment log found. It's recommended to run deploy-to-canary.bat first.
    echo WARNING: No canary deployment log found >> %LOGFILE%
    
    echo Do you want to proceed without canary verification? (Y/N)
    set /p SKIP_CANARY=
    if /i "!SKIP_CANARY!" neq "Y" (
        echo Deployment aborted by user: Canary verification required >> %LOGFILE%
        goto :error
    ) else (
        echo User chose to skip canary verification >> %LOGFILE%
    )
) else (
    findstr /C:"Canary deployment verification passed" canary-deploy.log >nul
    if %ERRORLEVEL% neq 0 (
        echo WARNING: Canary deployment has not been verified successfully.
        echo It's recommended to run deploy-to-canary.bat and ensure it completes successfully.
        echo WARNING: Canary deployment verification not confirmed >> %LOGFILE%
        
        echo Do you want to proceed without canary verification? (Y/N)
        set /p SKIP_CANARY=
        if /i "!SKIP_CANARY!" neq "Y" (
            echo Deployment aborted by user: Canary verification required >> %LOGFILE%
            goto :error
        ) else (
            echo User chose to skip canary verification >> %LOGFILE%
        )
    ) else (
        echo Canary deployment verification confirmed
        echo Canary deployment verification confirmed >> %LOGFILE%
    )
)

:: Remove any existing production environment configuration
echo.
echo Step 3: Cleaning up previous production configuration...
if exist ".vercel-production" (
    echo Removing existing .vercel-production directory...
    rmdir /s /q .vercel-production
    if !ERRORLEVEL! neq 0 (
        echo ERROR: Failed to remove .vercel-production directory
        echo ERROR: Failed to remove .vercel-production directory >> %LOGFILE%
        
        echo Attempting PowerShell removal...
        powershell -Command "Remove-Item -Path '.vercel-production' -Recurse -Force -ErrorAction SilentlyContinue"
        if !ERRORLEVEL! neq 0 (
            echo ERROR: PowerShell removal also failed >> %LOGFILE%
        else
            echo Successfully removed .vercel-production using PowerShell >> %LOGFILE%
        )
    ) else (
        echo Removed existing .vercel-production directory >> %LOGFILE%
    )
) else (
    echo No existing .vercel-production directory found
    echo No existing .vercel-production directory found >> %LOGFILE%
)

:: Set up production environment variables
echo.
echo Step 4: Setting up production environment...
if not exist frontend\.env.production (
    echo Creating production environment file...
    echo # Production Environment Settings > frontend\.env.production
    echo NEXT_PUBLIC_ENV=production >> frontend\.env.production
    echo NEXT_PUBLIC_API_URL=https://api.example.com >> frontend\.env.production
    echo NEXT_PUBLIC_VERSION=%date:~6,4%%date:~0,2%%date:~3,2%.%time:~0,2%%time:~3,2% >> frontend\.env.production
    echo Created frontend/.env.production >> %LOGFILE%
) else (
    echo Production environment file already exists
    echo Updating version tag in production environment file...
    powershell -Command "(Get-Content frontend\.env.production) | ForEach-Object { $_ -replace 'NEXT_PUBLIC_VERSION=.*', 'NEXT_PUBLIC_VERSION=%date:~6,4%%date:~0,2%%date:~3,2%.%time:~0,2%%time:~3,2%' } | Set-Content frontend\.env.production"
    echo Updated version tag in production environment file >> %LOGFILE%
)

:: Prepare production config for Next.js
echo.
echo Step 5: Setting up production Next.js configuration...
echo // next.config.js for production> frontend\next.config.production.js
echo const nextConfig = {>> frontend\next.config.production.js
echo   output: 'export',>> frontend\next.config.production.js
echo   distDir: 'out',>> frontend\next.config.production.js
echo   images: {>> frontend\next.config.production.js
echo     domains: [],>> frontend\next.config.production.js
echo     deviceSizes: [640, 750, 828, 1080, 1200, 1920],>> frontend\next.config.production.js
echo     imageSizes: [16, 32, 48, 64, 96, 128, 256],>> frontend\next.config.production.js
echo     formats: ['image/webp'],>> frontend\next.config.production.js
echo     minimumCacheTTL: 60,>> frontend\next.config.production.js
echo   },>> frontend\next.config.production.js
echo   env: {>> frontend\next.config.production.js
echo     ENVIRONMENT: 'production',>> frontend\next.config.production.js
echo   },>> frontend\next.config.production.js
echo   webpack: (config, { isServer }) => {>> frontend\next.config.production.js
echo     // Add tree shaking and dead code elimination>> frontend\next.config.production.js
echo     config.optimization.usedExports = true;>> frontend\next.config.production.js
echo     // Production optimization flags>> frontend\next.config.production.js
echo     if (!isServer) {>> frontend\next.config.production.js
echo       config.optimization.splitChunks = {>> frontend\next.config.production.js
echo         chunks: 'all',>> frontend\next.config.production.js
echo         cacheGroups: {>> frontend\next.config.production.js
echo           vendors: {>> frontend\next.config.production.js
echo             test: /[\\/]node_modules[\\/]/,>> frontend\next.config.production.js
echo             priority: -10,>> frontend\next.config.production.js
echo             reuseExistingChunk: true,>> frontend\next.config.production.js
echo           },>> frontend\next.config.production.js
echo         },>> frontend\next.config.production.js
echo       };>> frontend\next.config.production.js
echo     }>> frontend\next.config.production.js
echo     return config;>> frontend\next.config.production.js
echo   },>> frontend\next.config.production.js
echo   experimental: {>> frontend\next.config.production.js
echo     optimizeCss: true,>> frontend\next.config.production.js
echo   },>> frontend\next.config.production.js
echo };>> frontend\next.config.production.js
echo >> frontend\next.config.production.js
echo module.exports = nextConfig;>> frontend\next.config.production.js
echo Created production Next.js configuration >> %LOGFILE%

:: Backup and replace the regular Next.js config with our production config
echo.
echo Step 6: Backing up and replacing Next.js config...
if exist frontend\next.config.js (
    copy frontend\next.config.js frontend\next.config.backup.js
    echo Backed up next.config.js to next.config.backup.js >> %LOGFILE%
)
copy frontend\next.config.production.js frontend\next.config.js
echo Replaced next.config.js with production configuration >> %LOGFILE%

:: Create production vercel configuration
echo.
echo Step 7: Creating production Vercel configuration...
echo {> vercel.production.json
echo   "version": 2,>> vercel.production.json
echo   "name": "auto-agi-builder",>> vercel.production.json
echo   "buildCommand": "cd frontend && npm install && npm run build",>> vercel.production.json
echo   "outputDirectory": "frontend/out",>> vercel.production.json
echo   "framework": "nextjs",>> vercel.production.json
echo   "regions": ["sfo1"],>> vercel.production.json
echo   "env": {>> vercel.production.json
echo     "ENVIRONMENT": "production">> vercel.production.json
echo   },>> vercel.production.json
echo   "headers": [>> vercel.production.json
echo     {>> vercel.production.json
echo       "source": "/static/(.*)",>> vercel.production.json
echo       "headers": [>> vercel.production.json
echo         {>> vercel.production.json
echo           "key": "Cache-Control",>> vercel.production.json
echo           "value": "public, max-age=31536000, immutable">> vercel.production.json
echo         }>> vercel.production.json
echo       ]>> vercel.production.json
echo     },>> vercel.production.json
echo     {>> vercel.production.json
echo       "source": "/(.*)\.(js|css|webp|jpg|jpeg|png|svg|ico)$",>> vercel.production.json
echo       "headers": [>> vercel.production.json
echo         {>> vercel.production.json
echo           "key": "Cache-Control",>> vercel.production.json
echo           "value": "public, max-age=86400, stale-while-revalidate=31536000">> vercel.production.json
echo         }>> vercel.production.json
echo       ]>> vercel.production.json
echo     },>> vercel.production.json
echo     {>> vercel.production.json
echo       "source": "/(.*)",>> vercel.production.json
echo       "headers": [>> vercel.production.json
echo         {>> vercel.production.json
echo           "key": "X-Environment",>> vercel.production.json
echo           "value": "production">> vercel.production.json
echo         }>> vercel.production.json
echo       ]>> vercel.production.json
echo     }>> vercel.production.json
echo   ]>> vercel.production.json
echo }>> vercel.production.json
echo Created enhanced production vercel.json configuration >> %LOGFILE%

:: Backup and replace the regular vercel.json with production version
if exist vercel.json (
    copy vercel.json vercel.backup.json
    echo Backed up vercel.json to vercel.backup.json >> %LOGFILE%
)
copy vercel.production.json vercel.json
echo Replaced vercel.json with production configuration >> %LOGFILE%

:: Create production .vercelignore similar to staging
echo.
echo Step 8: Creating production .vercelignore...
echo app > .vercelignore
echo requirements.txt >> .vercelignore
echo tests >> .vercelignore
echo docs >> .vercelignore
echo *.py >> .vercelignore
echo quadrants >> .vercelignore
echo *.production.* >> .vercelignore
echo *.backup.* >> .vercelignore
echo Created production .vercelignore >> %LOGFILE%

:: Run pre-deployment validation
echo.
echo Step 9: Running pre-deployment validation...
echo @echo off > validate-production.bat
echo echo Validating production deployment configuration... >> validate-production.bat
echo if not exist "frontend\next.config.js" (>> validate-production.bat
echo   echo ERROR: next.config.js not found >> validate-production.bat
echo   exit /b 1>> validate-production.bat
echo )>> validate-production.bat
echo if not exist "vercel.json" (>> validate-production.bat
echo   echo ERROR: vercel.json not found >> validate-production.bat
echo   exit /b 1>> validate-production.bat
echo )>> validate-production.bat
echo if not exist "frontend\.env.production" (>> validate-production.bat
echo   echo ERROR: frontend/.env.production not found >> validate-production.bat
echo   exit /b 1>> validate-production.bat
echo )>> validate-production.bat
echo echo All production configuration files validated successfully! >> validate-production.bat
echo exit /b 0>> validate-production.bat

call validate-production.bat
if %ERRORLEVEL% neq 0 (
    echo ERROR: Pre-deployment validation failed
    echo ERROR: Pre-deployment validation failed >> %LOGFILE%
    goto :error
) else (
    echo Pre-deployment validation passed >> %LOGFILE%
    echo All production configuration files validated successfully!
)

:: Create rollback script for emergencies
echo.
echo Step 10: Creating emergency rollback script...
echo @echo off > production-rollback.bat
echo echo Rolling back production deployment... >> production-rollback.bat
echo vercel rollback --prod >> production-rollback.bat
echo if %%ERRORLEVEL%% neq 0 ( >> production-rollback.bat
echo   echo ERROR: Rollback failed >> production-rollback.bat
echo   exit /b 1 >> production-rollback.bat
echo ) >> production-rollback.bat
echo echo Production rollback successful >> production-rollback.bat
echo exit /b 0 >> production-rollback.bat

echo Created emergency rollback script: production-rollback.bat >> %LOGFILE%
echo Emergency rollback script created: production-rollback.bat

:: Final confirmation before production deployment
echo.
echo ===================================
echo FINAL PRODUCTION DEPLOYMENT WARNING
echo ===================================
echo.
echo You are about to deploy to PRODUCTION.
echo This will make your application live to all users.
echo.
echo Are you absolutely sure you want to proceed? (Y/N)
set /p FINAL_CONFIRM=

if /i "%FINAL_CONFIRM%" neq "Y" (
    echo Production deployment aborted by user >> %LOGFILE%
    echo Production deployment aborted!
    goto :abort
)

:: Deploy to Vercel production
echo.
echo Step 11: Deploying to Vercel production environment...
echo This step requires your input. When prompted:
echo  - Select 'N' for any existing project
echo  - Use default settings for other options
echo.
echo Press any key to start deployment...
pause > nul

echo Running Vercel deploy command for production... >> %LOGFILE%
echo Executing: vercel --prod >> %LOGFILE%
vercel --prod

if %ERRORLEVEL% neq 0 (
    echo ERROR: Production deployment failed
    echo ERROR: Production deployment failed >> %LOGFILE%
    goto :error
) else (
    echo Production deployment initiated >> %LOGFILE%
)

:: Verify deployment
echo.
echo Step 12: Verifying production deployment...
echo Please wait for the deployment to complete (about 30 seconds)...
timeout /t 30 /nobreak > nul

echo Running post-deployment verification...
node verify-deployment.js production

if %ERRORLEVEL% neq 0 (
    echo WARNING: Automated verification of production deployment reported issues >> %LOGFILE%
    echo Some verification checks reported warnings. Check verify-deployment.js output for details.
    echo Consider running production-rollback.bat if issues are critical.
    
    echo Do you want to roll back the deployment? (Y/N)
    set /p ROLLBACK=
    if /i "%ROLLBACK%" == "Y" (
        echo User requested rollback after verification issues >> %LOGFILE%
        call production-rollback.bat
        if !ERRORLEVEL! neq 0 (
            echo ERROR: Rollback failed >> %LOGFILE%
            echo Rollback failed. Please try manual rollback using Vercel dashboard.
        ) else (
            echo Production rollback completed successfully >> %LOGFILE%
            echo Production rollback completed successfully
        )
        goto :error
    ) else (
        echo User chose to keep deployment despite verification warnings >> %LOGFILE%
    )
) else (
    echo Production deployment verification passed >> %LOGFILE%
    echo Production deployment verification completed successfully!
)

:: Set up production monitoring
echo.
echo Step 13: Setting up production monitoring...
echo @echo off > monitor-production.bat
echo echo Monitoring production deployment... >> monitor-production.bat
echo echo This will run continuously until stopped. >> monitor-production.bat
echo echo Press Ctrl+C to stop monitoring. >> monitor-production.bat
echo echo. >> monitor-production.bat
echo echo Starting monitoring at: %%date%% %%time%% >> monitor-production.bat
echo echo. >> monitor-production.bat
echo echo Checking production deployment health every 60 seconds... >> monitor-production.bat
echo :monitorloop >> monitor-production.bat
echo echo [%%date%% %%time%%] Running health check... >> monitor-production.bat
echo node verify-deployment.js production >> monitor-production.bat
echo timeout /t 60 /nobreak > nul >> monitor-production.bat
echo goto monitorloop >> monitor-production.bat
echo exit /b 0 >> monitor-production.bat

echo Created production monitoring script: monitor-production.bat >> %LOGFILE%
echo Production monitoring script created: monitor-production.bat

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
echo Production Deployment Complete
echo ===================================
echo.
echo Your application has been deployed to the production environment!
echo.
echo IMPORTANT:
echo 1. Monitor the production deployment using monitor-production.bat
echo 2. If critical issues are detected, roll back using production-rollback.bat
echo.
echo The production URL should be available in the Vercel output above.
echo The script also created:
echo  - production-rollback.bat (for emergency rollbacks)
echo  - monitor-production.bat (for continuous monitoring)
echo.
echo If you encountered any issues, please check the production-deploy.log file.
echo.
echo Deployment completed at: %date% %time% >> %LOGFILE%
goto :end

:error
echo.
echo Production deployment encountered errors. See %LOGFILE% for details.
echo Deployment failed at: %date% %time% >> %LOGFILE%

:abort
:: Restore original configuration files on error or abort
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
