@echo off
setlocal enabledelayedexpansion

echo ===================================
echo Auto AGI Builder - Deployment Pipeline
echo ===================================
echo.
echo This script orchestrates the complete deployment pipeline:
echo  1. Staging deployment
echo  2. Canary deployment (10%% traffic)
echo  3. Production deployment
echo.
echo Each step includes verification and monitoring to ensure reliability.
echo.

:: Create log file
set LOGFILE=%~dp0pipeline-deploy.log
echo Deployment Pipeline Log > %LOGFILE%
echo Started at: %date% %time% >> %LOGFILE%
echo. >> %LOGFILE%

:: Check if verify-deployment.js exists
if not exist verify-deployment.js (
    echo ERROR: verify-deployment.js is required but not found.
    echo Please ensure all deployment toolkit components are present.
    echo ERROR: verify-deployment.js not found >> %LOGFILE%
    goto :error
)

:: Check if deployment scripts exist
if not exist deploy-to-staging.bat (
    echo ERROR: deploy-to-staging.bat is required but not found.
    echo ERROR: deploy-to-staging.bat not found >> %LOGFILE%
    goto :error
)

if not exist deploy-to-canary.bat (
    echo ERROR: deploy-to-canary.bat is required but not found.
    echo ERROR: deploy-to-canary.bat not found >> %LOGFILE%
    goto :error
)

if not exist deploy-to-production.bat (
    echo ERROR: deploy-to-production.bat is required but not found.
    echo ERROR: deploy-to-production.bat not found >> %LOGFILE%
    goto :error
)

:: Explain the deployment process
echo ===================================
echo PROGRESSIVE DEPLOYMENT PROCESS
echo ===================================
echo.
echo This process implements a progressive deployment strategy:
echo.
echo 1. STAGING DEPLOYMENT
echo    - Deploys to a staging environment
echo    - Runs verification checks
echo    - Creates monitoring tools
echo.
echo 2. CANARY DEPLOYMENT
echo    - Routes 10%% of traffic to new version
echo    - Monitors for errors
echo    - Can be rolled back if issues occur
echo.
echo 3. PRODUCTION DEPLOYMENT
echo    - Full deployment to all users
echo    - Final verification
echo    - Continuous monitoring
echo.
echo This approach minimizes risk by validating the deployment
echo in controlled environments before full production release.
echo.
echo ===================================

:: Ask for confirmation to start pipeline
echo.
echo Do you want to proceed with the full deployment pipeline? (Y/N)
set /p START_PIPELINE=

if /i "%START_PIPELINE%" neq "Y" (
    echo Deployment pipeline aborted by user >> %LOGFILE%
    echo Pipeline aborted!
    goto :end
)

:: STAGE 1: Staging Deployment
echo.
echo ===================================
echo STAGE 1: STAGING DEPLOYMENT
echo ===================================
echo.
echo This stage will deploy the application to a staging environment 
echo for testing. This environment is separate from production and
echo allows for verification without affecting end users.
echo.
echo Starting staging deployment at: %date% %time%
echo Starting staging deployment >> %LOGFILE%

echo Press any key to begin staging deployment...
pause > nul

call deploy-to-staging.bat
set STAGING_RESULT=%ERRORLEVEL%

if %STAGING_RESULT% neq 0 (
    echo ERROR: Staging deployment failed with error code %STAGING_RESULT%
    echo ERROR: Staging deployment failed with error code %STAGING_RESULT% >> %LOGFILE%
    echo Deployment pipeline cannot continue until staging is successful.
    
    echo Do you want to retry staging deployment? (Y/N)
    set /p RETRY_STAGING=
    
    if /i "%RETRY_STAGING%" neq "Y" (
        echo Deployment pipeline aborted during staging >> %LOGFILE%
        goto :error
    ) else (
        echo Retrying staging deployment...
        call deploy-to-staging.bat
        set STAGING_RESULT=%ERRORLEVEL%
        
        if %STAGING_RESULT% neq 0 (
            echo ERROR: Staging deployment failed again with error code %STAGING_RESULT%
            echo ERROR: Staging deployment failed again with error code %STAGING_RESULT% >> %LOGFILE%
            echo Deployment pipeline cannot continue.
            goto :error
        )
    )
)

echo.
echo Staging deployment completed successfully!
echo Staging deployment completed successfully >> %LOGFILE%

:: Verify staging deployment
echo.
echo Verifying staging deployment...
node verify-deployment.js staging
set VERIFY_RESULT=%ERRORLEVEL%

if %VERIFY_RESULT% neq 0 (
    echo WARNING: Staging verification reported issues.
    echo WARNING: Staging verification reported issues >> %LOGFILE%
    
    echo Do you want to continue to canary deployment despite verification issues? (Y/N)
    set /p CONTINUE_DESPITE_ISSUES=
    
    if /i "%CONTINUE_DESPITE_ISSUES%" neq "Y" (
        echo Deployment pipeline aborted after staging verification >> %LOGFILE%
        goto :error
    ) else {
        echo User chose to continue despite verification issues >> %LOGFILE%
    }
) else (
    echo Staging verification successful >> %LOGFILE%
)

:: Prompt to continue to canary
echo.
echo ===================================
echo Stage 1 (Staging) is complete!
echo ===================================
echo.
echo The application has been successfully deployed to staging.
echo.
echo Do you want to continue to Stage 2 (Canary Deployment)? (Y/N)
set /p CONTINUE_TO_CANARY=

if /i "%CONTINUE_TO_CANARY%" neq "Y" (
    echo User chose to stop after staging deployment >> %LOGFILE%
    goto :success_staging
)

:: STAGE 2: Canary Deployment
echo.
echo ===================================
echo STAGE 2: CANARY DEPLOYMENT
echo ===================================
echo.
echo This stage will deploy the application to a canary environment 
echo that receives approximately 10%% of production traffic. This
echo allows testing with real users but in a controlled manner.
echo.
echo Starting canary deployment at: %date% %time%
echo Starting canary deployment >> %LOGFILE%

echo Press any key to begin canary deployment...
pause > nul

call deploy-to-canary.bat
set CANARY_RESULT=%ERRORLEVEL%

if %CANARY_RESULT% neq 0 (
    echo ERROR: Canary deployment failed with error code %CANARY_RESULT%
    echo ERROR: Canary deployment failed with error code %CANARY_RESULT% >> %LOGFILE%
    echo Deployment pipeline cannot continue until canary is successful.
    
    echo Do you want to retry canary deployment? (Y/N)
    set /p RETRY_CANARY=
    
    if /i "%RETRY_CANARY%" neq "Y" (
        echo Deployment pipeline aborted during canary >> %LOGFILE%
        goto :error
    ) else (
        echo Retrying canary deployment...
        call deploy-to-canary.bat
        set CANARY_RESULT=%ERRORLEVEL%
        
        if %CANARY_RESULT% neq 0 (
            echo ERROR: Canary deployment failed again with error code %CANARY_RESULT%
            echo ERROR: Canary deployment failed again with error code %CANARY_RESULT% >> %LOGFILE%
            echo Deployment pipeline cannot continue.
            goto :error
        )
    )
)

echo.
echo Canary deployment completed successfully!
echo Canary deployment completed successfully >> %LOGFILE%

:: Verify canary deployment
echo.
echo Verifying canary deployment...
node verify-deployment.js canary
set VERIFY_RESULT=%ERRORLEVEL%

if %VERIFY_RESULT% neq 0 (
    echo WARNING: Canary verification reported issues.
    echo WARNING: Canary verification reported issues >> %LOGFILE%
    
    echo Do you want to continue to production deployment despite verification issues? (Y/N)
    set /p CONTINUE_DESPITE_ISSUES=
    
    if /i "%CONTINUE_DESPITE_ISSUES%" neq "Y" (
        echo Deployment pipeline aborted after canary verification >> %LOGFILE%
        goto :error
    )
    
    echo User chose to continue despite verification issues >> %LOGFILE%
) else (
    echo Canary verification successful >> %LOGFILE%
)

:: Run canary monitoring for a brief period
echo.
echo Running canary monitoring for 5 minutes...
echo This will help ensure there are no immediate issues in the canary environment.
echo Press any key to begin monitoring...
pause > nul

if exist monitor-canary.bat (
    echo Starting canary monitoring at %date% %time% >> %LOGFILE%
    call monitor-canary.bat
) else (
    echo WARNING: monitor-canary.bat not found. Skipping automated monitoring. >> %LOGFILE%
    echo WARNING: monitor-canary.bat not found. Skipping automated monitoring.
    echo Please manually verify the canary deployment before proceeding.
    echo Press any key when verification is complete...
    pause > nul
)

:: Prompt to continue to production
echo.
echo ===================================
echo Stage 2 (Canary) is complete!
echo ===================================
echo.
echo The application has been successfully deployed to canary environment
echo and is receiving approximately 10%% of production traffic.
echo.
echo Do you want to continue to Stage 3 (Production Deployment)? (Y/N)
set /p CONTINUE_TO_PRODUCTION=

if /i "%CONTINUE_TO_PRODUCTION%" neq "Y" (
    echo User chose to stop after canary deployment >> %LOGFILE%
    goto :success_canary
)

:: STAGE 3: Production Deployment
echo.
echo ===================================
echo STAGE 3: PRODUCTION DEPLOYMENT
echo ===================================
echo.
echo This is the FINAL STAGE where the application will be deployed
echo to the production environment and made available to ALL users.
echo.
echo Starting production deployment at: %date% %time%
echo Starting production deployment >> %LOGFILE%

echo WARNING: This is the final step that will deploy to PRODUCTION!
echo Press any key to begin production deployment...
pause > nul

call deploy-to-production.bat
set PRODUCTION_RESULT=%ERRORLEVEL%

if %PRODUCTION_RESULT% neq 0 (
    echo ERROR: Production deployment failed with error code %PRODUCTION_RESULT%
    echo ERROR: Production deployment failed with error code %PRODUCTION_RESULT% >> %LOGFILE%
    
    echo Do you want to retry production deployment? (Y/N)
    set /p RETRY_PRODUCTION=
    
    if /i "%RETRY_PRODUCTION%" neq "Y" (
        echo Deployment pipeline aborted during production deployment >> %LOGFILE%
        goto :error
    ) else (
        echo Retrying production deployment...
        call deploy-to-production.bat
        set PRODUCTION_RESULT=%ERRORLEVEL%
        
        if %PRODUCTION_RESULT% neq 0 (
            echo ERROR: Production deployment failed again with error code %PRODUCTION_RESULT%
            echo ERROR: Production deployment failed again with error code %PRODUCTION_RESULT% >> %LOGFILE%
            echo Consider rolling back using production-rollback.bat
            goto :error
        )
    )
)

echo.
echo Production deployment completed successfully!
echo Production deployment completed successfully >> %LOGFILE%

:: Verify production deployment
echo.
echo Verifying production deployment...
node verify-deployment.js production
set VERIFY_RESULT=%ERRORLEVEL%

if %VERIFY_RESULT% neq 0 (
    echo WARNING: Production verification reported issues.
    echo WARNING: Production verification reported issues >> %LOGFILE%
    
    echo Do you want to roll back the production deployment? (Y/N)
    set /p ROLLBACK_PRODUCTION=
    
    if /i "%ROLLBACK_PRODUCTION%" == "Y" (
        echo User requested rollback after verification issues >> %LOGFILE%
        
        if exist production-rollback.bat (
            call production-rollback.bat
            if !ERRORLEVEL! neq 0 (
                echo ERROR: Rollback failed >> %LOGFILE%
                echo Rollback failed. Please attempt manual rollback.
            ) else (
                echo Production rollback completed successfully >> %LOGFILE%
                echo Production rollback completed successfully
            )
        ) else (
            echo ERROR: production-rollback.bat not found >> %LOGFILE%
            echo ERROR: production-rollback.bat not found
            echo Please run 'vercel rollback --prod' manually to roll back the deployment.
        }
        
        goto :error
    ) else (
        echo User chose to keep production deployment despite verification warnings >> %LOGFILE%
    )
) else (
    echo Production verification successful >> %LOGFILE%
)

echo.
echo ===================================
echo DEPLOYMENT PIPELINE COMPLETE!
echo ===================================
echo.
echo The application has been successfully deployed to ALL environments:
echo  - Staging: For internal testing
echo  - Canary: For gradual rollout (10%% traffic)
echo  - Production: For all users
echo.
echo Monitoring scripts have been created for each environment:
echo  - monitor-canary.bat: For monitoring canary deployment
if exist monitor-production.bat (
    echo  - monitor-production.bat: For monitoring production deployment
)
echo.
echo Rollback scripts are available if needed:
if exist canary-rollback.bat (
    echo  - canary-rollback.bat: For rolling back canary deployment
)
if exist production-rollback.bat (
    echo  - production-rollback.bat: For rolling back production deployment
)
echo.
echo Pipeline completed at: %date% %time% >> %LOGFILE%
echo Pipeline completed successfully >> %LOGFILE%
goto :end

:success_staging
echo.
echo ===================================
echo DEPLOYMENT PIPELINE PARTIALLY COMPLETE
echo ===================================
echo.
echo Staged completed:
echo  - Staging: COMPLETE
echo  - Canary: NOT STARTED
echo  - Production: NOT STARTED
echo.
echo To continue the deployment pipeline later, run:
echo  - deploy-to-canary.bat
echo  - deploy-to-production.bat
echo.
echo Pipeline stopped after staging at: %date% %time% >> %LOGFILE%
goto :end

:success_canary
echo.
echo ===================================
echo DEPLOYMENT PIPELINE PARTIALLY COMPLETE
echo ===================================
echo.
echo Staged completed:
echo  - Staging: COMPLETE
echo  - Canary: COMPLETE
echo  - Production: NOT STARTED
echo.
echo To continue the deployment pipeline later, run:
echo  - deploy-to-production.bat
echo.
echo You can monitor the canary deployment by running:
echo  - monitor-canary.bat
echo.
echo Pipeline stopped after canary at: %date% %time% >> %LOGFILE%
goto :end

:error
echo.
echo ===================================
echo DEPLOYMENT PIPELINE FAILED
echo ===================================
echo.
echo The deployment pipeline encountered errors. 
echo See %LOGFILE% for details.
echo.
echo Pipeline failed at: %date% %time% >> %LOGFILE%
goto :end

:end
echo.
echo Thank you for using the Auto AGI Builder deployment pipeline.
echo.
pause
endlocal
