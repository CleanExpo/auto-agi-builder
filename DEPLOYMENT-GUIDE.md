# Auto AGI Builder Deployment Guide

This guide provides instructions for deploying the Auto AGI Builder landing page to Vercel. This deployment focuses on the static landing page that connects to the API backend.

## Prerequisites

- Vercel CLI installed (`npm i -g vercel` if needed)
- The Auto AGI Builder project files
- An internet connection

## Deployment Options

### 1. Simple Deployment (Recommended)

The `simple-deploy.bat` script handles all the necessary steps for deploying the static landing page:

1. Run the simple deployment script:
   ```
   .\simple-deploy.bat
   ```

2. If prompted, complete the Vercel login process in your browser.

3. Once deployed, you'll receive a URL to access your site.

### 2. Manual Deployment Steps

If you prefer to deploy manually:

1. Clean up any previous Vercel configuration:
   ```
   rd /s /q .vercel
   ```

2. Configure what gets deployed by creating a `.vercelignore` file:
   ```
   node_modules
   .env
   .env.*
   !frontend/.env.production
   .git
   app/
   frontend/
   !frontend/pages
   !frontend/components
   !frontend/styles
   !frontend/public
   quadrants/
   *.py
   !public/
   ```

3. Create a `vercel.json` configuration file:
   ```json
   {
     "version": 2,
     "public": true,
     "buildCommand": null,
     "outputDirectory": "public",
     "rewrites": [
       { "source": "/api/(.*)", "destination": "https://api-auto-agi-builder.vercel.app/api/$1" },
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

4. Deploy with Vercel CLI:
   ```
   vercel --public --yes
   ```

## Project Structure

The deployment focuses on the following key files:

- `public/index.html`: The main landing page
- `vercel.json`: Configuration for routing and deployment settings
- `.vercelignore`: Controls which files are deployed

## API Integration

The landing page connects to the API backend at `https://api-auto-agi-builder.vercel.app`. API requests are automatically routed through the configured rewrites in `vercel.json`.

## Troubleshooting

### Common Issues

1. **Deployment Fails with Authentication Errors**:
   - Run `vercel logout` followed by `vercel login` to refresh authentication

2. **File Not Found Errors**:
   - Check that `public/index.html` exists and is properly formatted
   - Verify the `.vercelignore` file is not excluding needed files

3. **Routing Issues**:
   - Ensure `vercel.json` is properly configured with the correct rewrites
   - Verify the API endpoint is correct and accessible

### Getting Help

If you encounter issues, you can:

1. Check the Vercel deployment logs
2. Review the deployment documentation at [vercel.com/docs](https://vercel.com/docs)
3. Modify the deployment scripts as needed for your environment
