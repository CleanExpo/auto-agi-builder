# Auto AGI Builder Deployment Toolkit

This toolkit provides a comprehensive deployment system for the Auto AGI Builder project with multiple options for deploying to Vercel environments.

## Overview

The deployment toolkit follows modern DevOps practices with progressive deployment capabilities, verification steps, and rollback mechanisms. It's designed to handle the Auto AGI Builder's frontend-first architecture on Vercel.

## Available Tools

### Core Deployment Scripts

| Script | Purpose |
|--------|---------|
| `run-deploy-pipeline.bat` | Master orchestration script that handles the complete deployment pipeline (staging → canary → production) with verification at each stage |
| `deploy-to-staging.bat` | Deploys to staging environment for initial testing |
| `deploy-to-canary.bat` | Deploys to canary environment with 10% traffic |
| `deploy-to-production.bat` | Deploys to production environment for all users |
| `fresh-deploy.bat` | Quick single-step deployment directly to production (bypasses the staging and canary stages) |

### Utility Scripts

| Script | Purpose |
|--------|---------|
| `fix-vercel-config.bat` | Fixes JSON parsing issues with vercel.json - **use this first if you encounter deployment errors** |
| `verify-deployment.js` | Validates deployments at each stage |
| `monitor-canary.bat` | Monitors the canary deployment for issues |

## Deployment Strategy

### Progressive Deployment (Recommended)

This approach minimizes risk by testing changes in controlled environments before full release:

1. **Staging Deployment**: Deploy to an isolated environment for testing
2. **Canary Deployment**: Route 10% of traffic to the new version
3. **Production Deployment**: Full deployment to all users after validation

Run the progressive deployment with:
```
./run-deploy-pipeline.bat
```

### Direct Deployment

For quick deployments that bypass the staging and canary steps:
```
./fresh-deploy.bat
```

## Common Issues & Solutions

### JSON Parsing Errors in vercel.json

**Error**: `Error: Couldn't parse JSON file ...vercel.json`

**Solution**: Run the fix-vercel-config script to create a properly formatted vercel.json file:
```
./fix-vercel-config.bat
```

This script:
- Creates a backup of the existing vercel.json
- Generates a new vercel.json with proper syntax and escaping
- Verifies the JSON is valid with Node.js
- Creates a .vercelignore file for proper deployment

### Deployment Pipeline Fails at Verification

**Error**: `Verification failed with error code...`

**Solution**: 
- Check the verification output for specific issues
- Run the stage-specific deployment script directly to retry with any needed adjustments
- Use manual verification through the Vercel dashboard if needed

## Configuration Files

### vercel.json

Contains the Vercel-specific deployment configuration:
- Build command and output directory
- Headers for caching optimization
- Framework specification
- Region configuration

### .vercelignore

Specifies which files and directories should be excluded from deployment:
- Python backend files
- Development artifacts
- Test directories
- Documentation

## Usage Recommendations

1. **First Deployment?** Start with:
   ```
   ./fix-vercel-config.bat
   ```
   Then:
   ```
   ./fresh-deploy.bat
   ```

2. **Subsequent Deployments?** Use the pipeline for safer deploys:
   ```
   ./run-deploy-pipeline.bat
   ```

3. **Experiencing Errors?** Try:
   ```
   ./fix-vercel-config.bat
   ```
   to resolve configuration issues before deployment.

## Requirements

- Node.js installed
- Vercel CLI installed (`npm i -g vercel`)
- Valid Vercel account configuration
- Next.js frontend codebase in the /frontend directory

## Monitoring & Rollbacks

The deployment scripts automatically create rollback capabilities:
- `rollback.bat` is generated during deployment for emergency rollbacks
- Monitoring scripts are called automatically during staged deployments
- Manual verification is available through the Vercel dashboard

## Advanced Usage

### Manual Component Testing

You can test individual components of the deployment system:

```
node -e "try { require('./vercel.json'); console.log('JSON syntax is valid'); } catch(e) { console.error('Error parsing JSON: ' + e.message); process.exit(1); }"
```

### Vercel CLI Manual Commands

```
vercel --prod                  # Deploy to production
vercel                         # Deploy to preview
vercel rollback                # Rollback the latest deployment
vercel --cwd frontend          # Deploy just the frontend directory
