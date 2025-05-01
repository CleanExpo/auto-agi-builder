# Auto AGI Builder - UI Context Provider Fix

This project includes a solution for fixing the "useUI must be used within a UIProvider" error during Next.js server-side rendering.

## Key Components of the Fix

1. **Server-Side Rendering**: Using `getServerSideProps` in the index page to force dynamic rendering at request time
2. **Next.js Configuration**: Optimized configuration for better SSR handling with context providers

## How to Deploy the Project

### Using PowerShell (Recommended)

Run the PowerShell script from within this directory:

```powershell
./deploy-ssr-fix.ps1
```

This script will:
1. Install all dependencies
2. Check and install Vercel CLI if needed
3. Build the project
4. Deploy to Vercel

### Manual Deployment Steps

If you prefer to run commands manually:

1. Install dependencies:
   ```
   npm install
   ```

2. Install Vercel CLI (if not already installed):
   ```
   npm install -g vercel
   ```

3. Build the project:
   ```
   npm run build
   ```

4. Deploy to Vercel:
   ```
   vercel login
   vercel link
   vercel --prod
   ```

## Technical Notes

The solution works by ensuring components with UI context hooks are only rendered on the client side or via server-side rendering at request time, not during static site generation.

Key files:
- `pages/index.js`: Contains `getServerSideProps` to force server-side rendering
- `next.config.js`: Configuration optimized for SSR with UI contexts
- `contexts/UIContext.js`: The UI context provider implementation
- `pages/_app.js`: Main application wrapper with context providers

## Troubleshooting

If you encounter any issues during deployment:

1. Make sure you're running the commands from the frontend-minimal directory
2. Check if Vercel CLI is properly installed (`vercel --version`)
3. Verify that you're logged in to Vercel (`vercel whoami`)
4. Ensure all dependencies are installed correctly (`npm list`)

For detailed information about the solution approach, refer to the `UI-PROVIDER-SSR-SOLUTION-FINAL.md` file in the parent directory.
