// This is an MCP server that helps with Git to Vercel deployment processes
// Install with: npm install puppeteer axios fs-extra

const express = require('express');
const { MCPServer } = require('@modelcontextprotocol/server');
const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs-extra');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const app = express();
const port = process.env.PORT || 3100;

// Create MCP server
const mcp = new MCPServer({
  name: 'vercel-deployment-helper',
  description: 'MCP server for analyzing and improving Vercel deployments'
});

// Tool to analyze Next.js project and verify Vercel compatibility
mcp.addTool({
  name: 'analyze_nextjs_project',
  description: 'Analyzes a Next.js project structure and verifies its compatibility with Vercel deployment',
  inputSchema: {
    type: 'object',
    properties: {
      projectPath: {
        type: 'string',
        description: 'Path to the Next.js project root directory'
      }
    },
    required: ['projectPath']
  },
  async execute({ projectPath }) {
    try {
      // Check for package.json
      const packageJsonExists = await fs.pathExists(`${projectPath}/package.json`);
      if (!packageJsonExists) {
        return { 
          success: false, 
          message: 'No package.json found. This is required for Vercel deployment.' 
        };
      }

      // Read package.json
      const packageJson = await fs.readJson(`${projectPath}/package.json`);
      
      // Check for required Next.js dependency
      const hasNextDependency = packageJson.dependencies && packageJson.dependencies.next;
      
      // Check for build script
      const hasBuildScript = packageJson.scripts && packageJson.scripts.build;
      
      // Check for next.config.js
      const nextConfigExists = await fs.pathExists(`${projectPath}/next.config.js`);
      
      // Check for .env files
      const hasEnvFile = await fs.pathExists(`${projectPath}/.env`) || 
                           await fs.pathExists(`${projectPath}/.env.local`) ||
                           await fs.pathExists(`${projectPath}/.env.production`);
      
      // Check for vercel.json
      const vercelJsonExists = await fs.pathExists(`${projectPath}/vercel.json`);
      
      // Check for public directory
      const publicDirExists = await fs.pathExists(`${projectPath}/public`);
      
      // Check for pages directory or app directory (for App Router)
      const pagesDirExists = await fs.pathExists(`${projectPath}/pages`);
      const appDirExists = await fs.pathExists(`${projectPath}/app`);
      
      // Calculate project size
      const { stdout: duOutput } = await execPromise(`du -sh "${projectPath}" | cut -f1`);
      const projectSize = duOutput.trim();
      
      // Check for node_modules
      const nodeModulesExists = await fs.pathExists(`${projectPath}/node_modules`);
      
      const recommendations = [];
      
      if (!hasNextDependency) {
        recommendations.push('Add Next.js as a dependency in package.json');
      }
      
      if (!hasBuildScript) {
        recommendations.push('Add a build script in package.json');
      }
      
      if (!nextConfigExists) {
        recommendations.push('Consider adding next.config.js for custom configurations');
      }
      
      if (!hasEnvFile) {
        recommendations.push('Consider adding environment variables in .env.production for deployment');
      }
      
      if (!vercelJsonExists) {
        recommendations.push('Add vercel.json for deployment configuration');
      }
      
      if (!publicDirExists) {
        recommendations.push('Consider adding a public directory for static assets');
      }
      
      if (!pagesDirExists && !appDirExists) {
        recommendations.push('No pages or app directory found. At least one is required for Next.js routing');
      }
      
      if (nodeModulesExists) {
        recommendations.push('Add node_modules to .gitignore and .vercelignore to reduce deployment size');
      }
      
      return {
        success: true,
        projectStructure: {
          hasPackageJson: packageJsonExists,
          hasNextDependency,
          hasBuildScript,
          hasNextConfig: nextConfigExists,
          hasEnvFile,
          hasVercelJson: vercelJsonExists,
          hasPublicDir: publicDirExists,
          hasRoutingDir: pagesDirExists || appDirExists,
          projectSize,
          nodeModulesIncluded: nodeModulesExists
        },
        recommendations
      };
    } catch (error) {
      return {
        success: false,
        message: `Error analyzing project: ${error.message}`
      };
    }
  }
});

// Tool to generate optimized Vercel deployment files
mcp.addTool({
  name: 'generate_vercel_config',
  description: 'Generates optimized vercel.json and configuration files for deployment',
  inputSchema: {
    type: 'object',
    properties: {
      projectPath: {
        type: 'string',
        description: 'Path to the Next.js project root directory'
      },
      outputType: {
        type: 'string',
        enum: ['static', 'serverless', 'edge'],
        description: 'The type of deployment configuration to generate',
        default: 'static'
      },
      isMonorepo: {
        type: 'boolean',
        description: 'Whether the project is part of a monorepo structure',
        default: false
      },
      projectDirectory: {
        type: 'string',
        description: 'The directory containing the Next.js project if in a monorepo',
        default: 'frontend'
      }
    },
    required: ['projectPath']
  },
  async execute({ projectPath, outputType = 'static', isMonorepo = false, projectDirectory = 'frontend' }) {
    try {
      const configs = {
        static: {
          vercelJson: {
            version: 2,
            framework: "nextjs",
            buildCommand: isMonorepo ? 
              `cd ${projectDirectory} && npm install && npm run build && npm run export` : 
              "npm run build && npm run export",
            outputDirectory: isMonorepo ? 
              `${projectDirectory}/out` : 
              "out"
          },
          packageJsonScripts: {
            build: "next build",
            export: "next export"
          },
          nextConfig: `
module.exports = {
  images: {
    unoptimized: true
  },
  trailingSlash: true
};`
        },
        serverless: {
          vercelJson: {
            version: 2,
            framework: "nextjs",
            buildCommand: isMonorepo ? 
              `cd ${projectDirectory} && npm install && npm run build` : 
              "npm run build",
            outputDirectory: isMonorepo ? 
              `${projectDirectory}/.next` : 
              ".next"
          },
          packageJsonScripts: {
            build: "next build"
          },
          nextConfig: `
module.exports = {
  swcMinify: true
};`
        },
        edge: {
          vercelJson: {
            version: 2,
            framework: "nextjs",
            buildCommand: isMonorepo ? 
              `cd ${projectDirectory} && npm install && npm run build` : 
              "npm run build",
            outputDirectory: isMonorepo ? 
              `${projectDirectory}/.next` : 
              ".next"
          },
          packageJsonScripts: {
            build: "next build"
          },
          nextConfig: `
module.exports = {
  experimental: {
    runtime: 'edge'
  }
};`
        }
      };
      
      const config = configs[outputType];
      
      // Generate vercel.json
      await fs.writeJson(`${projectPath}/vercel.json`, config.vercelJson, { spaces: 2 });
      
      // Update package.json scripts
      let packageJson;
      try {
        packageJson = await fs.readJson(`${projectPath}/package.json`);
        
        if (!packageJson.scripts) {
          packageJson.scripts = {};
        }
        
        Object.assign(packageJson.scripts, config.packageJsonScripts);
        
        await fs.writeJson(`${projectPath}/package.json`, packageJson, { spaces: 2 });
      } catch (error) {
        return {
          success: false,
          message: `Error updating package.json: ${error.message}`
        };
      }
      
      // Create/update next.config.js
      try {
        if (await fs.pathExists(`${projectPath}/next.config.js`)) {
          // Backup original config
          await fs.copy(`${projectPath}/next.config.js`, `${projectPath}/next.config.js.backup`);
        }
        
        await fs.writeFile(`${projectPath}/next.config.js`, config.nextConfig);
      } catch (error) {
        return {
          success: false,
          message: `Error updating next.config.js: ${error.message}`
        };
      }
      
      // Create .vercelignore
      const vercelIgnoreContent = `
# Dependencies
node_modules
.pnp
.pnp.js

# Testing
coverage
.nyc_output

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env.local
.env.development.local
.env.test.local

# Turbo
.turbo

# Vercel
.vercel

# Build artifacts
*.tsbuildinfo

# Version control
.git
.gitignore
`;

      await fs.writeFile(`${projectPath}/.vercelignore`, vercelIgnoreContent.trim());
      
      return {
        success: true,
        message: `Successfully generated Vercel deployment configuration for ${outputType} deployment`,
        files: {
          vercelJson: config.vercelJson,
          packageJsonScripts: config.packageJsonScripts,
          nextConfig: config.nextConfig,
          vercelIgnore: vercelIgnoreContent.trim()
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Error generating Vercel configuration: ${error.message}`
      };
    }
  }
});

// Tool to check Vercel deployment status and debug issues
mcp.addTool({
  name: 'diagnose_vercel_deployment',
  description: 'Diagnoses common Vercel deployment issues and provides solutions',
  inputSchema: {
    type: 'object',
    properties: {
      errorMessage: {
        type: 'string',
        description: 'The error message received during deployment'
      },
      buildLogs: {
        type: 'string',
        description: 'Build logs from the failed deployment (optional)'
      }
    },
    required: ['errorMessage']
  },
  async execute({ errorMessage, buildLogs = '' }) {
    // Common Vercel deployment errors and solutions
    const knownIssues = [
      {
        pattern: /Command "npm run build" exited with 137/i,
        issue: 'Out of memory error during build',
        solutions: [
          'Use the static export deployment approach with a local build',
          'Optimize your code to use less memory during build',
          'Consider using the .vercelignore file to exclude unnecessary files',
          'Split your project into smaller deployments',
          'Upgrade to a Vercel plan with more memory'
        ]
      },
      {
        pattern: /Error: No Next\.js version detected/i,
        issue: 'Next.js not properly detected or configured',
        solutions: [
          'Ensure Next.js is in your package.json dependencies',
          'Make sure your project structure follows Next.js conventions',
          'Check that your root directory contains the Next.js application',
          'Update the buildCommand in vercel.json to include proper directory'
        ]
      },
      {
        pattern: /Request body too large. Limit: 10mb/i,
        issue: 'Deployment package exceeds size limits',
        solutions: [
          'Use .vercelignore to exclude large files',
          'Remove node_modules from the deployment',
          'Use a more restrictive .vercelignore file that includes only necessary files',
          'Split your project into smaller deployments',
          'Consider using Git integration instead of CLI deployment'
        ]
      },
      {
        pattern: /Could not retrieve Project Settings/i,
        issue: 'Project linking issues',
        solutions: [
          'Remove the .vercel directory and re-link the project',
          'Ensure you have the correct permissions for the Vercel project',
          'Check that your Vercel CLI is authenticated properly',
          'Verify the project exists in your Vercel account'
        ]
      },
      {
        pattern: /Error: The "--prebuilt" option was used, but no prebuilt output found/i,
        issue: 'Missing prebuilt output for deployment',
        solutions: [
          'Run "vercel build" locally before using "vercel deploy --prebuilt"',
          'Make sure the .vercel/output directory exists and contains build artifacts',
          'Follow the exact Vercel build output format for prebuilt deployments',
          'Check if your build command is correctly generating the output in .vercel/output'
        ]
      }
    ];
    
    // Check for known issues
    const matchedIssues = knownIssues.filter(issue => 
      issue.pattern.test(errorMessage) || (buildLogs && issue.pattern.test(buildLogs))
    );
    
    if (matchedIssues.length > 0) {
      return {
        identified: true,
        issues: matchedIssues.map(issue => ({
          issue: issue.issue,
          solutions: issue.solutions
        }))
      };
    }
    
    // Additional analysis for unknown errors
    let recommendations = [];
    
    if (errorMessage.includes('build') || buildLogs.includes('build failed')) {
      recommendations.push(
        'Check for syntax errors in your code',
        'Ensure all dependencies are installed correctly',
        'Try running the build locally to debug the issue',
        'Check for environment variables that might be missing in Vercel'
      );
    }
    
    if (errorMessage.includes('timeout') || buildLogs.includes('timeout')) {
      recommendations.push(
        'Your build process may be taking too long',
        'Optimize build steps to complete within Vercel\'s time limits',
        'Consider using build caching strategies',
        'Split complex builds into separate deployment steps'
      );
    }
    
    return {
      identified: recommendations.length > 0,
      issue: 'Unrecognized deployment error',
      solutions: recommendations.length > 0 ? recommendations : [
        'Review complete build logs in Vercel dashboard',
        'Test deploying a minimal version of your application',
        'Ensure your project structure is compatible with Vercel',
        'Consider using a static export approach for simpler deployments',
        'Contact Vercel support with the complete error details'
      ]
    };
  }
});

// Tool to benchmark Vercel deployment
mcp.addTool({
  name: 'create_deployment_workflow',
  description: 'Creates a GitHub Actions workflow for automated deployment to Vercel',
  inputSchema: {
    type: 'object',
    properties: {
      projectPath: {
        type: 'string',
        description: 'Path to the project root directory'
      },
      deploymentType: {
        type: 'string',
        enum: ['preview', 'production', 'both'],
        description: 'The type of deployment workflow to create',
        default: 'both'
      },
      framework: {
        type: 'string',
        enum: ['nextjs', 'react', 'vue', 'nuxt', 'svelte', 'angular'],
        description: 'The frontend framework used in the project',
        default: 'nextjs'
      },
      isMonorepo: {
        type: 'boolean',
        description: 'Whether the project is part of a monorepo structure',
        default: false
      },
      projectDirectory: {
        type: 'string',
        description: 'The directory containing the project if in a monorepo',
        default: 'frontend'
      }
    },
    required: ['projectPath']
  },
  async execute({ 
    projectPath, 
    deploymentType = 'both', 
    framework = 'nextjs', 
    isMonorepo = false, 
    projectDirectory = 'frontend' 
  }) {
    try {
      // Create GitHub Actions directory if it doesn't exist
      const workflowDir = `${projectPath}/.github/workflows`;
      await fs.ensureDir(workflowDir);
      
      // Generate workflow file content based on deployment type
      const workflowContent = generateWorkflowYaml(
        deploymentType, 
        framework, 
        isMonorepo, 
        projectDirectory
      );
      
      // Write workflow file
      await fs.writeFile(`${workflowDir}/vercel-deploy.yml`, workflowContent);
      
      return {
        success: true,
        message: `Successfully created GitHub Actions workflow for ${deploymentType} deployment`,
        workflowPath: `${workflowDir}/vercel-deploy.yml`,
        workflowContent
      };
    } catch (error) {
      return {
        success: false,
        message: `Error creating workflow: ${error.message}`
      };
    }
  }
});

// Helper function to generate GitHub Actions workflow YAML
function generateWorkflowYaml(deploymentType, framework, isMonorepo, projectDirectory) {
  // Base workflow structure
  let yaml = `name: Vercel Deployment

on:
  push:
    branches:
`;

  // Add different triggers based on deployment type
  if (deploymentType === 'production' || deploymentType === 'both') {
    yaml += `      - main
      - master
`;
  }
  
  if (deploymentType === 'preview' || deploymentType === 'both') {
    yaml += `  pull_request:
    branches:
      - main
      - master
`;
  }

  // Add workflow jobs
  yaml += `
jobs:
`;

  // Add linting and testing jobs if applicable
  if (framework === 'nextjs' || framework === 'react') {
    yaml += `  lint-and-test:
    name: 🧪 Lint and Test
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
${isMonorepo ? `          cache-dependency-path: ${projectDirectory}/package-lock.json\n` : ''}
          
      - name: Install dependencies
${isMonorepo ? `        run: cd ${projectDirectory} && npm ci\n` : '        run: npm ci\n'}
        
      - name: Run linting
${isMonorepo ? `        run: cd ${projectDirectory} && npm run lint\n` : '        run: npm run lint\n'}
        
      - name: Run tests
${isMonorepo ? `        run: cd ${projectDirectory} && npm test\n` : '        run: npm test\n'}
        
`;
  }

  // Add deployment jobs
  if (deploymentType === 'preview' || deploymentType === 'both') {
    yaml += `  deploy-preview:
    name: 🔍 Deploy Preview
${(framework === 'nextjs' || framework === 'react') ? '    needs: lint-and-test\n' : ''}
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
${isMonorepo ? `          cache-dependency-path: ${projectDirectory}/package-lock.json\n` : ''}
          
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
        
      - name: Pull Vercel Environment Information
${isMonorepo ? `        run: cd ${projectDirectory} && vercel pull --yes --environment=preview --token=\${{ secrets.VERCEL_TOKEN }}\n` : '        run: vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}\n'}
        
      - name: Build Project Artifacts
${isMonorepo ? `        run: cd ${projectDirectory} && vercel build --token=\${{ secrets.VERCEL_TOKEN }}\n` : '        run: vercel build --token=${{ secrets.VERCEL_TOKEN }}\n'}
        
      - name: Deploy Project Artifacts to Vercel
${isMonorepo ? `        run: cd ${projectDirectory} && vercel deploy --prebuilt --token=\${{ secrets.VERCEL_TOKEN }}\n` : '        run: vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }}\n'}
        
`;
  }

  if (deploymentType === 'production' || deploymentType === 'both') {
    yaml += `  deploy-production:
    name: 🚀 Deploy Production
${(framework === 'nextjs' || framework === 'react') ? '    needs: lint-and-test\n' : ''}
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && (github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master')
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
${isMonorepo ? `          cache-dependency-path: ${projectDirectory}/package-lock.json\n` : ''}
          
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
        
      - name: Pull Vercel Environment Information
${isMonorepo ? `        run: cd ${projectDirectory} && vercel pull --yes --environment=production --token=\${{ secrets.VERCEL_TOKEN }}\n` : '        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}\n'}
        
      - name: Build Project Artifacts
${isMonorepo ? `        run: cd ${projectDirectory} && vercel build --prod --token=\${{ secrets.VERCEL_TOKEN }}\n` : '        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}\n'}
        
      - name: Deploy Project Artifacts to Vercel
${isMonorepo ? `        run: cd ${projectDirectory} && vercel deploy --prebuilt --prod --token=\${{ secrets.VERCEL_TOKEN }}\n` : '        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}\n'}
`;
  }

  return yaml;
}

// Start MCP server
mcp.listen(app);

// Start Express server
app.listen(port, () => {
  console.log(`Vercel Deployment MCP Server running on port ${port}`);
  console.log(`MCP endpoint: http://localhost:${port}/mcp`);
});
