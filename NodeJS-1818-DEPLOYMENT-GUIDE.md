# Auto AGI Builder - Node.js 18.18.0 & npm 10.9.0 Deployment Guide

This guide provides comprehensive instructions for deploying the Auto AGI Builder platform using Node.js 18.18.0 and npm 10.9.0. These specific engine versions are guaranteed to work seamlessly together and provide the most stable deployment environment.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Architecture Overview](#architecture-overview)
3. [Deployment Scripts](#deployment-scripts)
4. [Deployment Process](#deployment-process)
5. [Troubleshooting](#troubleshooting)
6. [Advanced Configuration](#advanced-configuration)

## System Requirements

The Auto AGI Builder platform requires the following specific versions:

- **Node.js: 18.18.0** (LTS)
- **npm: 10.9.0**

Other versions may cause deployment issues, memory errors, or compatibility problems.

### Installing the Required Versions

#### Windows
```bash
# Using nvm for Windows
nvm install 18.18.0
nvm use 18.18.0
npm install -g npm@10.9.0
```

#### Mac/Linux
```bash
# Using nvm
nvm install 18.18.0
nvm use 18.18.0
npm install -g npm@10.9.0
```

## Architecture Overview

The Auto AGI Builder deployment architecture has been optimized specifically for Node.js 18.18.0 and npm 10.9.0. This includes:

1. **Frontend-First Deployment**: The system deploys the Next.js frontend separately from the backend to avoid memory issues
2. **Strict Engine Requirements**: Package configurations enforce the specific Node.js and npm versions
3. **Optimized Build Process**: Custom build configurations reduce memory usage and prevent Vercel errors
4. **Intelligent Error Detection**: Built-in diagnostics identify and resolve common deployment issues

### Project Structure

```
auto-agi-builder/
├── frontend/             # Next.js frontend (deployed to Vercel)
│   ├── components/       # React components
│   ├── pages/            # Next.js pages
│   ├── public/           # Static assets
│   ├── styles/           # CSS and styling
│   ├── contexts/         # React contexts
│   ├── lib/              # Utility libraries
│   └── package.json      # Frontend dependencies (with engine requirements)
├── app/                  # Backend API (deployed separately)
│   ├── api/              # API endpoints
│   ├── core/             # Core functionality
│   ├── models/           # Data models
│   ├── schemas/          # Data schemas
│   └── services/         # Business logic services
├── package.json          # Root dependencies (with engine requirements)
├── .nvmrc                # Node version specification
├── .npmrc                # npm configuration
└── vercel.json           # Vercel deployment configuration
```

## Deployment Scripts

We provide several deployment scripts optimized for Node.js 18.18.0 and npm 10.9.0:

### 1. `all-in-one-deploy.bat`

The recommended deployment script that:
- Verifies Node.js 18.18.0 and npm 10.9.0 are installed
- Updates all configuration files for compatibility
- Creates optimized Vercel deployment settings
- Deploys the application with minimal memory usage

### 2. `node-version-fix.bat`

Updates all configuration files to use Node.js 18.18.0 and npm 10.9.0:
- Adds/updates engines section in package.json files
- Creates .nvmrc files for Node.js version management
- Creates .npmrc with engine-strict setting
- Updates vercel.json to specify the Node.js version

### 3. `minimal-vercel-deploy.bat`

Creates a minimal deployment focused on frontend-only deployment:
- Uses a strict .vercelignore to reduce deployment size
- Creates a minimal package.json with engine specifications
- Configures Vercel to build only the frontend

### 4. `simplified-mcp.js`

A diagnostic tool to:
- Analyze project configuration for compatibility issues
- Generate optimal configuration files for deployment
- Diagnose common deployment errors

## Deployment Process

### Quick Start

For most deployments, the all-in-one script provides the simplest solution:

1. Install Node.js 18.18.0 and npm 10.9.0
2. Run `all-in-one-deploy.bat`
3. Follow the prompts to deploy to Vercel

### Step-by-Step Manual Deployment

If you prefer a manual approach:

1. **Prepare Your Environment**
   ```bash
   # Install required Node.js and npm versions
   nvm install 18.18.0
   nvm use 18.18.0
   npm install -g npm@10.9.0
   ```

2. **Update Configuration Files**
   ```bash
   # Run the Node.js version fix script
   ./node-version-fix.bat
   ```

3. **Deploy to Vercel**
   ```bash
   # Run the minimal Vercel deploy script
   ./minimal-vercel-deploy.bat
   ```

4. **Verify Deployment**
   - Check the Vercel dashboard for successful deployment
   - Verify all pages are loading correctly
   - Confirm no 404 errors on navigation

## Troubleshooting

### Common Issues

#### Memory Errors (Error 137)

If you encounter "Command exited with 137" errors:

1. Use the diagnostic tool:
   ```bash
   node simplified-mcp.js diagnose "Command npm run build exited with 137"
   ```

2. Ensure you're using the correct Node.js and npm versions

#### "The "--prebuilt" option was used, but no prebuilt output found"

This error occurs when trying to deploy pre-built files:

1. Remove the .vercel directory with `rm -rf .vercel`
2. Use the all-in-one deploy script which properly configures the build

#### Package.json Engine Version Conflicts

If deployment fails due to engine version conflicts:

1. Run `node-version-fix.bat` to update all configuration files
2. Check that all package.json files have been updated
3. Ensure .npmrc has `engine-strict=true`

### Using the Diagnostic Tool

The simplified-mcp.js tool provides detailed diagnostics:

```bash
# Analyze your project
node simplified-mcp.js analyze ./

# Generate optimal configuration
node simplified-mcp.js generate ./ static

# Diagnose a specific error
node simplified-mcp.js diagnose "your error message"
```

## Advanced Configuration

### GitHub Actions for CI/CD

The deployment scripts can be integrated with GitHub Actions:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js 18.18.0
        uses: actions/setup-node@v3
        with:
          node-version: 18.18.0
          
      - name: Install npm 10.9.0
        run: npm install -g npm@10.9.0
        
      - name: Update configuration
        run: ./node-version-fix.bat
        
      - name: Install Vercel CLI
        run: npm install -g vercel
        
      - name: Deploy to Vercel
        run: vercel --token ${VERCEL_TOKEN} --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

### Environment-Specific Configuration

For different environments, create environment-specific vercel.json files:

#### Development
```json
{
  "version": 2,
  "framework": "nextjs",
  "buildCommand": "cd frontend && npm ci && npm run build",
  "outputDirectory": "frontend/.next",
  "nodeVersion": "18.18.0",
  "env": {
    "NODE_ENV": "development"
  }
}
```

#### Production
```json
{
  "version": 2,
  "framework": "nextjs",
  "buildCommand": "cd frontend && npm ci && npm run build",
  "outputDirectory": "frontend/.next",
  "nodeVersion": "18.18.0",
  "env": {
    "NODE_ENV": "production"
  }
}
```

## Conclusion

By following this guide and using the provided scripts, you can successfully deploy the Auto AGI Builder platform using Node.js 18.18.0 and npm 10.9.0. This configuration ensures maximum compatibility, stability, and performance for your deployment.

For additional help, use the diagnostic tools included in this package, or refer to the Vercel documentation for more details on deploying Next.js applications.
