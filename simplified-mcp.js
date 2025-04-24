// A simplified version of the Vercel deployment helper
// This version uses only standard Node.js libraries and minimal dependencies

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Common deployment issues and solutions
const KNOWN_ISSUES = [
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

// Function to diagnose deployment issues
async function diagnoseDeploymentIssue(errorMessage, buildLogs = '') {
  // Check for known issues
  const matchedIssues = KNOWN_ISSUES.filter(issue => 
    issue.pattern.test(errorMessage) || (buildLogs && issue.pattern.test(buildLogs))
  );
  
  if (matchedIssues.length > 0) {
    console.log('Identified Issues:');
    matchedIssues.forEach(issue => {
      console.log(`\n[${issue.issue}]`);
      console.log('Solutions:');
      issue.solutions.forEach((solution, index) => {
        console.log(`  ${index + 1}. ${solution}`);
      });
    });
    return;
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
  
  console.log('\nGeneral Recommendations:');
  if (recommendations.length > 0) {
    recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });
  } else {
    console.log('  1. Review complete build logs in Vercel dashboard');
    console.log('  2. Test deploying a minimal version of your application');
    console.log('  3. Ensure your project structure is compatible with Vercel');
    console.log('  4. Consider using a static export approach for simpler deployments');
    console.log('  5. Contact Vercel support with the complete error details');
  }
}

// Function to analyze a Next.js project
async function analyzeNextJsProject(projectPath) {
  try {
    // Check for package.json
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      console.log('No package.json found. This is required for Vercel deployment.');
      return;
    }

    // Read package.json
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Check for required Next.js dependency
    const hasNextDependency = packageJson.dependencies && packageJson.dependencies.next;
    
    // Check for build script
    const hasBuildScript = packageJson.scripts && packageJson.scripts.build;
    
    // Check for next.config.js
    const nextConfigExists = fs.existsSync(path.join(projectPath, 'next.config.js'));
    
    // Check for .env files
    const hasEnvFile = fs.existsSync(path.join(projectPath, '.env')) || 
                      fs.existsSync(path.join(projectPath, '.env.local')) ||
                      fs.existsSync(path.join(projectPath, '.env.production'));
    
    // Check for vercel.json
    const vercelJsonExists = fs.existsSync(path.join(projectPath, 'vercel.json'));
    
    // Check for public directory
    const publicDirExists = fs.existsSync(path.join(projectPath, 'public'));
    
    // Check for pages directory or app directory (for App Router)
    const pagesDirExists = fs.existsSync(path.join(projectPath, 'pages'));
    const appDirExists = fs.existsSync(path.join(projectPath, 'app'));
    
    // Check for node_modules
    const nodeModulesExists = fs.existsSync(path.join(projectPath, 'node_modules'));
    
    // Project analysis results
    console.log('PROJECT ANALYSIS:');
    console.log('------------------');
    console.log(`Package.json: ${packageJsonPath ? 'Found ✓' : 'Not found ✗'}`);
    console.log(`Next.js dependency: ${hasNextDependency ? 'Found ✓' : 'Not found ✗'}`);
    console.log(`Build script: ${hasBuildScript ? 'Found ✓' : 'Not found ✗'}`);
    console.log(`next.config.js: ${nextConfigExists ? 'Found ✓' : 'Not found ✗'}`);
    console.log(`Environment files: ${hasEnvFile ? 'Found ✓' : 'Not found ✗'}`);
    console.log(`vercel.json: ${vercelJsonExists ? 'Found ✓' : 'Not found ✗'}`);
    console.log(`Public directory: ${publicDirExists ? 'Found ✓' : 'Not found ✗'}`);
    console.log(`Routing directories: ${(pagesDirExists || appDirExists) ? 'Found ✓' : 'Not found ✗'}`);
    
    // Recommendations
    console.log('\nRECOMMENDATIONS:');
    console.log('------------------');
    
    if (!hasNextDependency) {
      console.log('- Add Next.js as a dependency in package.json');
    }
    
    if (!hasBuildScript) {
      console.log('- Add a build script in package.json');
    }
    
    if (!nextConfigExists) {
      console.log('- Consider adding next.config.js for custom configurations');
    }
    
    if (!hasEnvFile) {
      console.log('- Consider adding environment variables in .env.production for deployment');
    }
    
    if (!vercelJsonExists) {
      console.log('- Add vercel.json for deployment configuration');
    }
    
    if (!publicDirExists) {
      console.log('- Consider adding a public directory for static assets');
    }
    
    if (!pagesDirExists && !appDirExists) {
      console.log('- No pages or app directory found. At least one is required for Next.js routing');
    }
    
    if (nodeModulesExists) {
      console.log('- Add node_modules to .gitignore and .vercelignore to reduce deployment size');
    }
  } catch (error) {
    console.error(`Error analyzing project: ${error.message}`);
  }
}

// Function to generate optimized configuration files
async function generateVercelConfig(projectPath, outputType = 'static', isMonorepo = false, projectDirectory = 'frontend') {
  try {
    console.log(`Generating Vercel configuration files for ${outputType} deployment...`);
    
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
    const vercelJsonPath = path.join(projectPath, 'vercel.json');
    fs.writeFileSync(vercelJsonPath, JSON.stringify(config.vercelJson, null, 2));
    console.log(`Created vercel.json at ${vercelJsonPath}`);
    
    // Update package.json scripts
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      if (!packageJson.scripts) {
        packageJson.scripts = {};
      }
      
      Object.assign(packageJson.scripts, config.packageJsonScripts);
      
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log(`Updated package.json scripts at ${packageJsonPath}`);
    } else {
      console.log(`Warning: package.json not found at ${packageJsonPath}`);
    }
    
    // Create/update next.config.js
    const nextConfigPath = path.join(projectPath, 'next.config.js');
    if (fs.existsSync(nextConfigPath)) {
      // Backup original config
      fs.copyFileSync(nextConfigPath, nextConfigPath + '.backup');
      console.log(`Backed up existing next.config.js to ${nextConfigPath}.backup`);
    }
    
    fs.writeFileSync(nextConfigPath, config.nextConfig);
    console.log(`Created/updated next.config.js at ${nextConfigPath}`);
    
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

    const vercelIgnorePath = path.join(projectPath, '.vercelignore');
    fs.writeFileSync(vercelIgnorePath, vercelIgnoreContent.trim());
    console.log(`Created .vercelignore at ${vercelIgnorePath}`);
    
    console.log(`Successfully generated Vercel deployment configuration for ${outputType} deployment.`);
  } catch (error) {
    console.error(`Error generating Vercel configuration: ${error.message}`);
  }
}

// Command line arguments handling
const [,, command, ...args] = process.argv;

switch (command) {
  case 'diagnose':
    if (args.length === 0) {
      console.log('Usage: node simplified-mcp.js diagnose "your error message here"');
    } else {
      diagnoseDeploymentIssue(args.join(' '));
    }
    break;
    
  case 'analyze':
    if (args.length === 0) {
      console.log('Usage: node simplified-mcp.js analyze path/to/project');
    } else {
      analyzeNextJsProject(args[0]);
    }
    break;
    
  case 'generate':
    if (args.length === 0) {
      console.log('Usage: node simplified-mcp.js generate path/to/project [static|serverless|edge] [isMonorepo] [projectDirectory]');
    } else {
      const [projectPath, outputType = 'static', isMonorepo = 'false', projectDirectory = 'frontend'] = args;
      generateVercelConfig(projectPath, outputType, isMonorepo === 'true', projectDirectory);
    }
    break;
    
  default:
    console.log(`
Vercel Deployment Helper - Simplified Version

USAGE:
  node simplified-mcp.js <command> [args]

COMMANDS:
  diagnose <error-message>       Analyze a deployment error and provide solutions
  analyze <project-path>         Analyze a Next.js project for Vercel compatibility
  generate <project-path> [type] Generate optimal Vercel configuration files

EXAMPLES:
  node simplified-mcp.js diagnose "Command npm run build exited with 137"
  node simplified-mcp.js analyze ./my-project
  node simplified-mcp.js generate ./my-project static
  node simplified-mcp.js generate ./my-project serverless true apps/web
    `);
}
