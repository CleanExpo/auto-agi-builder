# Auto AGI Builder - Vercel Deployment Guide

This guide provides everything you need to fix Vercel deployment issues and ensure successful redeployments for the Auto AGI Builder platform.

## Summary of Deployment Fixes

We've implemented several fixes to address common Vercel deployment issues, focusing on:

1. **Next.js Configuration Optimization** - `frontend/next.config.js`
   - API route proxy to avoid CORS issues
   - Optimized image handling
   - Environment variable fallbacks
   - Webpack configuration fixes for client-side modules

2. **API Client Enhancement** - `frontend/lib/api.js`
   - Robust error handling with detailed logging
   - Authentication token management
   - Automatic retry for transient errors
   - Consistent error response formatting

3. **Backend CORS Configuration** - `app/main.py`
   - Expanded allowed origins including all Vercel domains
   - Support for environment variable configuration
   - Request ID middleware for tracking
   - Health check endpoint for monitoring

4. **Environment Variable Management** - `frontend/.env.example`
   - Template for required environment variables
   - Documentation for variable usage
   - Local and production configuration examples

## Deployment Checklist

We've created a comprehensive deployment checklist script (`scripts/deployment_checklist.js`) that verifies:

- System requirements (Node.js, npm/yarn, git)
- Frontend dependencies
- Environment variables
- API connectivity
- Static assets
- Route configuration

### Running the Deployment Checklist

```bash
# Install dependencies (first time only)
cd frontend
npm install

# Run the deployment checklist
node scripts/deployment_checklist.js
```

The script will output:
- ✓ PASS - Requirements that are met
- ⚠ WARN - Potential issues that might need attention
- ✗ FAIL - Critical issues that must be resolved before deployment

## Redeployment Process

### Windows

Use the Windows batch script for redeployment:

```bat
# Basic usage
scripts\redeploy.bat

# Skip pre-deployment checks
scripts\redeploy.bat --skip-checks

# Clear Next.js build cache
scripts\redeploy.bat --clear-cache

# Deploy from a specific branch
scripts\redeploy.bat --branch feature/new-feature
```

### macOS/Linux

Use the shell script for redeployment:

```bash
# Make the script executable (first time only)
chmod +x scripts/redeploy.sh

# Basic usage
./scripts/redeploy.sh

# Skip pre-deployment checks
./scripts/redeploy.sh --skip-checks

# Clear Next.js build cache
./scripts/redeploy.sh --clear-cache

# Deploy from a specific branch
./scripts/redeploy.sh --branch feature/new-feature
```

## Environment Configuration

### Local Development

1. Copy the environment template:
   ```bash
   cp frontend/.env.example frontend/.env.local
   ```

2. Update the variables for local development:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### Vercel Configuration

In your Vercel project settings:

1. Go to **Settings** > **Environment Variables**
2. Add the following variables:
   - `NEXT_PUBLIC_API_URL` - URL of your API backend
   - `NEXT_PUBLIC_APP_URL` - URL of your Vercel deployment
   - `NEXTAUTH_URL` - Same as your `NEXT_PUBLIC_APP_URL`
   - `NEXTAUTH_SECRET` - Random string for auth security

## Troubleshooting

For detailed troubleshooting steps, refer to `docs/vercel_troubleshooting.md`.

Common issues:

1. **API Connection Errors**
   - Verify your `NEXT_PUBLIC_API_URL` is correct and accessible
   - Check CORS configuration in `app/main.py`
   - Ensure your API is running and accessible from Vercel's servers

2. **Build Failures**
   - Check your Next.js configuration
   - Verify all dependencies are properly listed in package.json
   - Check for any ESM/CommonJS module compatibility issues

3. **Runtime Errors**
   - Review browser console for JavaScript errors
   - Check network requests for API failures
   - Verify environment variables are properly set

## Best Practices

1. **Always run the deployment checklist before deploying**
   ```bash
   node scripts/deployment_checklist.js
   ```

2. **Test your build locally before deploying**
   ```bash
   cd frontend
   npm run build
   npm start
   ```

3. **Use the redeployment script for consistent deployments**
   ```bash
   ./scripts/redeploy.sh
   # or
   scripts\redeploy.bat
   ```

4. **Keep your environment variables in sync**
   - Update both your local `.env.local` and Vercel project settings
   - Document all environment variables in `.env.example`

By following this guide, you should be able to successfully deploy your Auto AGI Builder platform to Vercel and avoid common deployment issues.
