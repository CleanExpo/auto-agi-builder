# Vercel Deployment MCP Server

This Model Context Protocol (MCP) server provides specialized tools for analyzing, optimizing, and automating deployments to Vercel. The server analyzes project structures, creates optimal configuration files, diagnoses deployment issues, and sets up automated GitHub Actions workflows.

## Installation and Setup

### Prerequisites
- Node.js 16+ installed
- NPM or Yarn package manager
- Basic knowledge of Next.js and Vercel deployments

### Installation Steps

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install puppeteer axios fs-extra @modelcontextprotocol/server express
   ```
3. Start the MCP server:
   ```bash
   node gitToVercelMCP.js
   ```
4. The server will start on port 3100 by default (configurable via the PORT environment variable)

Once running, the MCP server will be available at `http://localhost:3100/mcp`.

## Connecting to the MCP Server

To connect to this MCP server from Claude or another AI assistant:

1. Add the MCP server to your configuration by providing the URL `http://localhost:3100/mcp`
2. The server name will be `github.com/vercel-deployment-helper`
3. You can now use its tools through the standard MCP interface

## Available Tools

This MCP server provides four powerful tools:

### 1. analyze_nextjs_project

Analyzes a Next.js project for Vercel compatibility and provides recommendations.

**Example Usage:**
```json
{
  "projectPath": "path/to/your/project"
}
```

**Returns:**
- Project structure analysis
- Missing configuration detection
- Size analysis
- Recommendations for optimization

### 2. generate_vercel_config

Generates optimized configuration files for Vercel deployment.

**Example Usage:**
```json
{
  "projectPath": "path/to/your/project",
  "outputType": "static",  // Options: "static", "serverless", "edge"
  "isMonorepo": false,
  "projectDirectory": "frontend" // Only needed for monorepos
}
```

**Returns:**
- Optimized vercel.json
- Updated package.json scripts
- Optimized next.config.js
- .vercelignore file

### 3. diagnose_vercel_deployment

Diagnoses common Vercel deployment issues and provides targeted solutions.

**Example Usage:**
```json
{
  "errorMessage": "Command \"npm run build\" exited with 137",
  "buildLogs": "Optional build logs from the failed deployment"
}
```

**Returns:**
- Identification of the issue
- Specific solutions for the problem
- General recommendations

### 4. create_deployment_workflow

Creates a GitHub Actions workflow for automated deployment to Vercel.

**Example Usage:**
```json
{
  "projectPath": "path/to/your/project",
  "deploymentType": "both", // Options: "preview", "production", "both"
  "framework": "nextjs",    // Options: "nextjs", "react", "vue", "nuxt", "svelte", "angular"
  "isMonorepo": false,
  "projectDirectory": "frontend" // Only needed for monorepos
}
```

**Returns:**
- GitHub Actions workflow YAML file
- CI/CD pipeline for your project

## Common Use Cases

### 1. Diagnosing Memory Errors (Error 137)

If your deployment fails with a memory error (exit code 137), you can:

```javascript
// Use the diagnose_vercel_deployment tool
{
  "errorMessage": "Command \"npm run build\" exited with 137"
}
```

The tool will recommend:
- Using a static export approach
- Optimizing your build process
- Setting up GitHub Actions for better build control

### 2. Resolving "Request Body Too Large" Errors

If your deployment fails due to size limits:

```javascript
// Use the diagnose_vercel_deployment tool
{
  "errorMessage": "Request body too large. Limit: 10mb"
}
```

Then use the generate_vercel_config tool to create an optimized configuration:

```javascript
{
  "projectPath": "path/to/your/project",
  "outputType": "static"
}
```

### 3. Setting Up CI/CD for Full-Stack Applications

For a full-stack application with both preview and production deployments:

```javascript
{
  "projectPath": "path/to/your/project",
  "deploymentType": "both",
  "framework": "nextjs"
}
```

This will create a GitHub Actions workflow that:
- Runs tests on all PRs and pushes to main
- Deploys PR branches to preview environments
- Deploys main branch to production

## Automation Scripts

The MCP server can be used together with the provided batch scripts:

- `vercel-static-deploy.bat` - For local static builds and deployment
- `frontend-only-deploy.bat` - For deploying only frontend components
- `simple-vercel-deploy.bat` - For simplified deployments with minimal configuration

## Implementation Details

This MCP server uses a combination of techniques to optimize Vercel deployments:

1. **Static analysis** of your project structure
2. **Configuration generation** based on best practices
3. **Pattern matching** to diagnose deployment errors
4. **GitHub Actions integration** for CI/CD

For more information on deploying Next.js applications to Vercel, see the [Vercel Next.js documentation](https://nextjs.org/docs/deployment).
