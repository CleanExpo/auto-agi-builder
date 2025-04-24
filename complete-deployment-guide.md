# Auto AGI Builder - Complete Deployment Guide

This guide provides comprehensive instructions for deploying the Auto AGI Builder application to Vercel.

## Deployment Issues Overview

We've addressed several issues with the deployment process:

1. **Corrupted Configuration Files**: The package.json file contained merge conflict markers
2. **Python Dependencies**: pip installation is failing in the Vercel build process
3. **Vercel Configuration**: Missing proper project and organization linking
4. **Environment Variables**: Issues with Sentry DSN and other environment variables

## Deployment Scripts

We've created multiple scripts to fix these issues:

### 1. fix-package-json.bat

This script creates a clean package.json file to replace the corrupted one:

```batch
.\fix-package-json.bat
```

### 2. vercel-requirements-fix.bat

This script creates a proper requirements.txt with pinned versions and sets up the Vercel configuration:

```batch
.\vercel-requirements-fix.bat
```

### 3. final-run-deploy.bat

This script handles the final deployment with proper settings:

```batch
.\final-run-deploy.bat
```

## Step-by-Step Deployment Instructions

For the best chance of success, follow these steps in order:

1. **Fix Package.json**
   ```
   .\fix-package-json.bat
   ```
   This creates a clean package.json with proper dependencies.

2. **Fix Python Requirements**
   ```
   .\vercel-requirements-fix.bat
   ```
   This creates a proper requirements.txt and Vercel configuration.

3. **Run Final Deployment**
   ```
   .\final-run-deploy.bat
   ```
   This performs the actual deployment to Vercel.

## Manual Deployment Alternative

If the scripts don't work, you can manually perform these steps:

1. Navigate to the project directory:
   ```
   cd "C:\Users\PhillMcGurk\OneDrive - Disaster Recovery\1111\Auto AGI Builder"
   ```

2. Create proper .vercel configuration:
   ```
   mkdir .vercel
   echo { > .vercel\project.json
   echo   "projectId": "prj_zJDsetW3XUQ8Pgw0EhEgeZVUk0Ss", >> .vercel\project.json
   echo   "orgId": "team_hIVuEbN4ena7UPqg1gt1jb6s", >> .vercel\project.json
   echo   "settings": { >> .vercel\project.json
   echo     "framework": null, >> .vercel\project.json
   echo     "pythonVersion": "3.9" >> .vercel\project.json
   echo   } >> .vercel\project.json
   echo } >> .vercel\project.json
   ```

3. Create a working requirements.txt file:
   ```
   echo fastapi==0.95.0 > requirements.txt
   echo uvicorn==0.21.1 >> requirements.txt
   echo pydantic==1.10.7 >> requirements.txt
   echo python-dotenv==1.0.0 >> requirements.txt
   echo requests==2.28.2 >> requirements.txt
   ```

4. Deploy with Vercel:
   ```
   vercel --prod
   ```

## Troubleshooting

If you encounter deployment issues:

1. **Python Dependency Issues**: Try setting SKIP_INSTALL_DEPS=true in your environment variables

2. **JSON Parsing Errors**: Check for merge conflict markers in your JSON files (<<<<<<< HEAD, etc.)

3. **Vercel Project Association**: Ensure your .vercel/project.json file has the correct projectId and orgId

4. **Missing pip packages**: Look at Vercel logs for specific package errors and add them to requirements.txt

## Checking Deployment Status

To check if your deployment was successful:

```
vercel logs auto-agi-builder-4j8mlqdcr-admin-cleanexpo247s-projects.vercel.app
```

## Production URL

When successfully deployed, your application will be available at:
https://auto-agi-builder-4j8mlqdcr-admin-cleanexpo247s-projects.vercel.app
