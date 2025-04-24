# Auto AGI Builder - Vercel Deployment Toolkit

A comprehensive toolkit for deploying Auto AGI Builder to Vercel, optimized specifically for Node.js 18.18.0 and npm 10.9.0.

## Overview

This toolkit provides a set of scripts and tools to simplify the deployment process of Auto AGI Builder to Vercel. It includes configuration fixes, memory optimization, and diagnostic tools designed to work with Node.js 18.18.0 and npm 10.9.0.

## Requirements

- Node.js 18.18.0
- npm 10.9.0

## Quick Start

1. **Run the all-in-one deployment script:**
   ```
   ./all-in-one-deploy.bat
   ```

2. **Follow the prompts** to deploy to Vercel.

3. **Deploy to production** after successful preview:
   ```
   vercel --prod
   ```

## Included Tools

### Deployment Scripts

- **`all-in-one-deploy.bat`**: Complete deployment process with Node.js version verification
- **`minimal-vercel-deploy.bat`**: Simplified deployment focusing on frontend only
- **`node-version-fix.bat`**: Update all configuration files to use Node.js 18.18.0 and npm 10.9.0
- **`vercel-static-deploy.bat`**: Deploy using static export to avoid memory issues

### Diagnostic Tools

- **`simplified-mcp.js`**: JavaScript tool for analyzing projects and diagnosing deployment issues

## Documentation

- **`NodeJS-1818-DEPLOYMENT-GUIDE.md`**: Comprehensive guide for deploying with Node.js 18.18.0 and npm 10.9.0
- **`README-VERCEL-MCP.md`**: Documentation for the MCP diagnostic server

## Common Issues & Solutions

### Memory Error (137)

If you encounter "Command exited with 137" errors:

1. Use the `node-version-fix.bat` script to ensure proper Node.js version configuration
2. Try deploying with `minimal-vercel-deploy.bat` for reduced memory usage

### Missing Prebuilt Output

If you see "The '--prebuilt' option was used, but no prebuilt output found":

1. Remove any existing `.vercel` directory
2. Use the `all-in-one-deploy.bat` script that properly configures the build

### Package Size Too Large

If your deployment fails due to size limits:

1. Use the `minimal-vercel-deploy.bat` script which creates a strict `.vercelignore`
2. Ensure your `.vercelignore` file properly excludes large directories

## Using the Diagnostic Tool

```
# Analyze your project
node simplified-mcp.js analyze ./

# Generate optimal configuration
node simplified-mcp.js generate ./ static

# Diagnose a specific error
node simplified-mcp.js diagnose "your error message"
```

## Configuration Files

The toolkit manages several configuration files:

- `package.json`: Updated with correct engine requirements
- `vercel.json`: Configured for optimal deployment settings
- `.vercelignore`: Strict rules to reduce deployment size
- `.nvmrc`: Node version specification
- `.npmrc`: npm configuration

## Advanced Usage

For advanced deployment scenarios, see the comprehensive guide in `NodeJS-1818-DEPLOYMENT-GUIDE.md`.

## Troubleshooting

If you encounter any issues:

1. Run `node simplified-mcp.js diagnose "your error message"` for analysis
2. Check that you're using Node.js 18.18.0 and npm 10.9.0
3. Review the deployment logs for specific errors
4. Try the minimal deployment approach with `minimal-vercel-deploy.bat`

## License

This toolkit is part of the Auto AGI Builder platform.
