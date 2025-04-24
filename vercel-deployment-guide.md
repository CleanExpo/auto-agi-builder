# Auto AGI Builder - Vercel Deployment Guide

This document provides comprehensive instructions on deploying the Auto AGI Builder to Vercel, addressing common issues encountered during the deployment process.

## Deployment Scripts

We've created several deployment scripts to address specific issues:

| Script | Purpose |
|--------|---------|
| `frontend-only-deploy.bat` | **RECOMMENDED** - Deploys only the frontend to stay under Vercel's 10MB size limit |
| `fix-vercel-link.bat` | Fixes project linking issues by removing the .vercel directory |
| `fix-vercel-directory.bat` | Updates vercel.json to point to the correct root directory |
| `fix-vercel-regex.bat` | Fixes JSON escaping in vercel.json |
| `final-deploy-fix.bat` | Combines all fixes but may still hit size limits |

## Common Deployment Issues

### 1. JSON Parsing Error

**Error:** Unable to parse vercel.json due to improper escaping of backslashes.

**Solution:** Use `fix-vercel-regex.bat` which fixes the regex pattern in vercel.json.
```json
// Incorrect:
"source": "/(.*)\.(js|css|webp|jpg|jpeg|png|svg|ico)$"

// Fixed:
"source": "/(.*)\\.(js|css|webp|jpg|jpeg|png|svg|ico)$"
```

### 2. Project Linking Error

**Error:** "Could not retrieve Project Settings. To link your Project, remove the .vercel directory and deploy again."

**Solution:** Use `fix-vercel-link.bat` to remove the .vercel directory and re-link the project.

### 3. Next.js Detection Error

**Error:** "No Next.js version detected. Make sure your package.json has 'next' in either 'dependencies' or 'devDependencies'."

**Solution:** Use `fix-vercel-directory.bat` to:
- Update the package.json at the root level to include Next.js
- Configure vercel.json to point to the correct directory

### 4. Request Body Too Large

**Error:** "Request body too large. Limit: 10mb"

**Solution:** Use `frontend-only-deploy.bat` which:
- Creates a strict .vercelignore file to include only frontend files
- Removes unnecessary large files like node_modules and .next
- Uses a minimal vercel.json configuration
- Simplifies the root package.json

## Recommended Deployment Process

1. Run the `frontend-only-deploy.bat` script:
   ```
   ./frontend-only-deploy.bat
   ```

2. This script will:
   - Remove any previous .vercel directory to ensure a clean start
   - Create a strict .vercelignore file that only includes frontend files
   - Update vercel.json with minimal configuration
   - Remove large directories like node_modules (they'll be reinstalled during build)
   - Create a simplified package.json with Next.js dependency
   - Link to your Vercel project
   - Deploy to production

3. After deployment, your Auto AGI Builder frontend should be accessible at the Vercel URL.

## Troubleshooting

If you encounter issues:

1. **Check deployment logs in the Vercel dashboard** for specific error messages.

2. **For API connections:** Make sure your frontend components are configured to connect to the right backend URL.

3. **For persistent deployment issues:** Try deploying just the frontend portion first (as recommended) and then add backend services separately.

4. **For size limit issues:** The `frontend-only-deploy.bat` script should resolve these by excluding all unnecessary files.

## Key Settings in vercel.json

The key settings for successful deployment are:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "frontend/out",
  "framework": "nextjs"
}
```

## Deployment Size Limitations

Vercel has a 10MB upload size limit for deployments. The project directory contains many files that aren't needed for the frontend deployment, including:

- Python backend files
- Documentation
- Scripts
- Test files

The `frontend-only-deploy.bat` script creates a strict .vercelignore file that includes only the essential frontend files needed for deployment.
