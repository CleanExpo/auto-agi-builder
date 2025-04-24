@echo off
setlocal enabledelayedexpansion

echo ===================================
echo Auto AGI Builder - Quick Deployment
echo ===================================
echo.
echo This script will prepare and deploy the Auto AGI Builder directly to Vercel.
echo This is a simplified deployment script that bypasses the staging and canary steps.
echo.

:: Create log file
set LOGFILE=%~dp0quick-deploy.log
echo Quick Deployment Log > %LOGFILE%
echo Started at: %date% %time% >> %LOGFILE%
echo. >> %LOGFILE%

:: Check if vercel.json exists
if not exist vercel.json (
    echo Creating vercel.json configuration...
    echo {> vercel.json
    echo   "version": 2,>> vercel.json
    echo   "name": "auto-agi-builder",>> vercel.json
    echo   "buildCommand": "cd frontend && npm install && npm run build",>> vercel.json
    echo   "outputDirectory": "frontend/out",>> vercel.json
    echo   "framework": "nextjs",>> vercel.json
    echo   "regions": ["sfo1"],>> vercel.json
    echo   "headers": [>> vercel.json
    echo     {>> vercel.json
    echo       "source": "/static/(.*)",>> vercel.json
    echo       "headers": [>> vercel.json
    echo         {>> vercel.json
    echo           "key": "Cache-Control",>> vercel.json
    echo           "value": "public, max-age=31536000, immutable">> vercel.json
    echo         }>> vercel.json
    echo       ]>> vercel.json
    echo     },>> vercel.json
    echo     {>> vercel.json
    echo       "source": "/(.*)\\.(js|css|webp|jpg|jpeg|png|svg|ico)$",>> vercel.json
    echo       "headers": [>> vercel.json
    echo         {>> vercel.json
    echo           "key": "Cache-Control",>> vercel.json
    echo           "value": "public, max-age=86400, stale-while-revalidate=31536000">> vercel.json
    echo         }>> vercel.json
    echo       ]>> vercel.json
    echo     },>> vercel.json
    echo     {>> vercel.json
    echo       "source": "/(.*)",>> vercel.json
    echo       "headers": [>> vercel.json
    echo         {>> vercel.json
    echo           "key": "X-Environment",>> vercel.json
    echo           "value": "production">> vercel.json
    echo         }>> vercel.json
    echo       ]>> vercel.json
    echo     }>> vercel.json
    echo   ]>> vercel.json
    echo }>> vercel.json
    echo Created vercel.json configuration >> %LOGFILE%
) else (
    echo Vercel configuration already exists
    echo Vercel configuration already exists >> %LOGFILE%
)

:: Check for Next.js config
if not exist frontend\next.config.js (
    echo ERROR: frontend/next.config.js not found
    echo ERROR: frontend/next.config.js not found >> %LOGFILE%
    echo Please ensure the frontend directory exists and contains a Next.js project
    goto :error
)

:: Set up next.config.js for static export if needed
echo.
echo Setting up Next.js configuration for static export...

:: Backup next.config.js if it exists
if exist frontend\next.config.js (
    copy frontend\next.config.js frontend\next.config.backup.js
    echo Backed up next.config.js to next.config.backup.js >> %LOGFILE%
)

:: Create a properly configured next.config.js
echo // next.config.js for production> frontend\next.config.js
echo const nextConfig = {>> frontend\next.config.js
echo   output: 'export',>> frontend\next.config.js
echo   distDir: 'out',>> frontend\next.config.js
echo   images: {>> frontend\next.config.js
echo     domains: [],>> frontend\next.config.js
echo     deviceSizes: [640, 750, 828, 1080, 1200, 1920],>> frontend\next.config.js
echo     imageSizes: [16, 32, 48, 64, 96, 128, 256],>> frontend\next.config.js
echo     formats: ['image/webp'],>> frontend\next.config.js
echo     minimumCacheTTL: 60,>> frontend\next.config.js
echo   },>> frontend\next.config.js
echo   env: {>> frontend\next.config.js
echo     ENVIRONMENT: 'production',>> frontend\next.config.js
echo   },>> frontend\next.config.js
echo   webpack: (config, { isServer }) => {>> frontend\next.config.js
echo     // Add tree shaking and dead code elimination>> frontend\next.config.js
echo     config.optimization.usedExports = true;>> frontend\next.config.js
echo     // Production optimization flags>> frontend\next.config.js
echo     if (!isServer) {>> frontend\next.config.js
echo       config.optimization.splitChunks = {>> frontend\next.config.js
echo         chunks: 'all',>> frontend\next.config.js
echo         cacheGroups: {>> frontend\next.config.js
echo           vendors: {>> frontend\next.config.js
echo             test: /[\\/]node_modules[\\/]/,>> frontend\next.config.js
echo             priority: -10,>> frontend\next.config.js
echo             reuseExistingChunk: true,>> frontend\next.config.js
echo           },>> frontend\next.config.js
echo         },>> frontend\next.config.js
echo       };>> frontend\next.config.js
echo     }>> frontend\next.config.js
echo     return config;>> frontend\next.config.js
echo   },>> frontend\next.config.js
echo   experimental: {>> frontend\next.config.js
echo     optimizeCss: true,>> frontend\next.config.js
echo   },>> frontend\next.config.js
echo };>> frontend\next.config.js
echo >> frontend\next.config.js
echo module.exports = nextConfig;>> frontend\next.config.js
echo Created production Next.js configuration >> %LOGFILE%

:: Set up environment variables
echo.
echo Setting up production environment variables...
if not exist frontend\.env.production (
    echo Creating .env.production file...
    echo # Production Environment Settings > frontend\.env.production
    echo NEXT_PUBLIC_ENV=production >> frontend\.env.production
    echo NEXT_PUBLIC_API_URL=https://api.example.com >> frontend\.env.production
    echo NEXT_PUBLIC_VERSION=%date:~6,4%%date:~0,2%%date:~3,2%.%time:~0,2%%time:~3,2% >> frontend\.env.production
    echo Created production environment file >> %LOGFILE%
) else (
    echo Production environment file already exists
    echo Updating version tag in production environment file...
    powershell -Command "(Get-Content frontend\.env.production) | ForEach-Object { $_ -replace 'NEXT_PUBLIC_VERSION=.*', 'NEXT_PUBLIC_VERSION=%date:~6,4%%date:~0,2%%date:~3,2%.%time:~0,2%%time:~3,2%' } | Set-Content frontend\.env.production"
    echo Updated version tag in production environment file >> %LOGFILE%
)

:: Create .vercelignore file
echo.
echo Setting up .vercelignore file...
echo app > .vercelignore
echo requirements.txt >> .vercelignore
echo tests >> .vercelignore
echo docs >> .vercelignore
echo *.py >> .vercelignore
echo quadrants >> .vercelignore
echo *.backup.* >> .vercelignore
echo Created .vercelignore file >> %LOGFILE%

:: Final confirmation before deployment
echo.
echo ===================================
echo DEPLOYMENT CONFIRMATION
echo ===================================
echo.
echo Configuration is complete. Ready to deploy to Vercel.
echo.
echo Do you want to proceed with deployment? (Y/N)
set /p FINAL_CONFIRM=

if /i "%FINAL_CONFIRM%" neq "Y" (
    echo Deployment aborted by user >> %LOGFILE%
    echo Deployment aborted!
    goto :abort
)

:: Deploy to Vercel
echo.
echo Deploying to Vercel...
echo This step requires your input. When prompted:
echo  - Select 'N' for any existing project
echo  - Use default settings for other options
echo.
echo Press any key to start deployment...
pause > nul

echo Running Vercel deploy command... >> %LOGFILE%
echo Executing: vercel --prod >> %LOGFILE%
vercel --prod

if %ERRORLEVEL% neq 0 (
    echo ERROR: Deployment failed with error code %ERRORLEVEL%
    echo ERROR: Deployment failed with error code %ERRORLEVEL% >> %LOGFILE%
    goto :error
) else (
    echo Deployment initiated >> %LOGFILE%
)

:: Verify deployment if verify-deployment.js exists
if exist verify-deployment.js (
    echo.
    echo Verifying deployment...
    echo Please wait for the deployment to complete (about 30 seconds)...
    timeout /t 30 /nobreak > nul

    echo Running post-deployment verification...
    node verify-deployment.js production

    if %ERRORLEVEL% neq 0 (
        echo WARNING: Automated verification reported issues.
        echo WARNING: Automated verification reported issues >> %LOGFILE%
        echo Check verify-deployment.js output for details.
    ) else (
        echo Deployment verification successful >> %LOGFILE%
        echo Deployment verification completed successfully!
    )
) else (
    echo Verification script not found, skipping verification.
    echo Verification script not found, skipping verification >> %LOGFILE%
)

echo.
echo ===================================
echo DEPLOYMENT COMPLETE
echo ===================================
echo.
echo Your application has been deployed to Vercel!
echo.
echo The production URL should be available in the Vercel output above.
echo You can also find it in your Vercel dashboard.
echo.
echo If you encountered any issues, please check the quick-deploy.log file.
echo.
echo Deployment completed at: %date% %time% >> %LOGFILE%

:: Create rollback script for emergencies
echo.
echo Creating emergency rollback script...
echo @echo off > rollback.bat
echo echo Rolling back to previous deployment... >> rollback.bat
echo vercel rollback --prod >> rollback.bat
echo if %%ERRORLEVEL%% neq 0 ( >> rollback.bat
echo   echo ERROR: Rollback failed >> rollback.bat
echo   exit /b 1 >> rollback.bat
echo ) >> rollback.bat
echo echo Rollback successful >> rollback.bat
echo exit /b 0 >> rollback.bat

echo Created emergency rollback script: rollback.bat >> %LOGFILE%
echo Created emergency rollback script: rollback.bat

goto :end

:error
echo.
echo Deployment encountered errors. See %LOGFILE% for details.
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

echo Configuration files restored >> %LOGFILE%

:end
echo.
echo Thank you for using Auto AGI Builder quick deployment.
echo.
pause
endlocal
