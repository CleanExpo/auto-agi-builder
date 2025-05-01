# Auto AGI Builder Deployment with SSR-Safe UI Context

This package contains a complete solution for deploying the Auto AGI Builder application with SSR-safe UI Context providers. The solution addresses the common "useUI must be used within a UIProvider" error that occurs during server-side rendering.

## Files Included

1. **UI-PROVIDER-SSR-SOLUTION-FINAL.md**
   - Comprehensive documentation of the technical solution
   - Implementation details and approaches used

2. **deploy-anywhere.cmd**
   - **➡️ RECOMMENDED SOLUTION ⬅️** - Works from any directory
   - Absolute paths ensure it works regardless of current directory
   - Just type `deploy-anywhere.cmd` in PowerShell or Command Prompt

3. **frontend-minimal/README.md**
   - Quick-start guide for deploying from within the frontend-minimal directory

## Core Solution

The core of our solution uses several techniques to ensure UI Context works properly with Next.js SSR:

1. **Server-side rendering** via `getServerSideProps` for pages that use context
2. **Next.js configuration** optimized for SSR with contexts
3. **SSR-detection** in the context providers for proper client/server handling

## Quick Start

### Recommended Method - Using the CMD script

The simplest way to deploy is to use the CMD script from any location, even in PowerShell:

```
deploy-anywhere.cmd
```

This script:
1. Uses absolute paths to locate the frontend-minimal directory
2. Creates the directory if it doesn't exist
3. Installs all required dependencies
4. Installs Vercel CLI
5. Builds the application
6. Deploys to Vercel

Works from PowerShell, Command Prompt, or by double-clicking in Explorer.

### Manual Deployment Approach

If you prefer to run commands manually:

1. Navigate to the frontend-minimal directory:
   ```
   cd frontend-minimal
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Install Vercel CLI (if not already installed):
   ```
   npm install -g vercel
   ```

4. Build the project:
   ```
   npm run build
   ```

5. Deploy to Vercel:
   ```
   vercel login
   vercel link
   vercel --prod
   ```

## Requirements

- Node.js 14+ installed
- NPM or Yarn installed
- A Vercel account for deployment
- PowerShell for running the recommended deployment script

## Troubleshooting

### Common Issues

1. **Vercel CLI not found**
   - The deploy-ssr-fix.ps1 script should install it automatically
   - If not, run `npm install -g vercel` manually

2. **Build errors**
   - Check if all dependencies are installed correctly
   - Verify that the Next.js configuration is correct

3. **Deployment issues**
   - Ensure you're logged into Vercel (`vercel whoami`)
   - Check that you have proper permissions for the project
   - Make sure you're running commands from the frontend-minimal directory

For more details on the technical solution, refer to the UI-PROVIDER-SSR-SOLUTION-FINAL.md file.

## Custom Domains

After deploying to Vercel, you can set up a custom domain through the Vercel dashboard:

1. Go to your project on Vercel
2. Navigate to "Settings" > "Domains"
3. Add your custom domain and follow the verification steps

## Need More Help?

For more detailed information about the solution, refer to the comprehensive UI-PROVIDER-SSR-SOLUTION-FINAL.md documentation file.
