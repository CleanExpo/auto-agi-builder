# Step-by-Step Guide to Configure Public Access for Vercel Deployments

This guide provides detailed steps to resolve the 401 authentication issue with Vercel deployments by properly configuring team projects and public access settings.

## Prerequisites

- A Vercel account
- Access to the GitHub repository
- Admin permissions on the Vercel project

## 1. Generate a New Vercel Token with Proper Scopes

1. **Log into your Vercel account**: Go to [vercel.com](https://vercel.com/) and log in

2. **Navigate to your account settings**:
   - Click on your avatar/profile picture in the top-right corner
   - Select "Settings" from the dropdown menu

3. **Create a new token**:
   - In the left sidebar, click on "Tokens"
   - Click "Create" or "Create New Token"
   - Enter a descriptive name like "Auto AGI Builder Public Deployment"
   - Set the token scope to "Full Account" to ensure you have deployment permissions
   - Click "Create Token"
   - **IMPORTANT**: Copy the generated token immediately and save it securely; it won't be shown again

## 2. Create a Vercel Team Project

Teams in Vercel have different permission settings that make public deployments easier to configure:

1. **Create a new team**:
   - Go to the [Vercel Dashboard](https://vercel.com/dashboard)
   - Click on your current team/account name (top-left)
   - Select "Create Team"
   - Follow the prompts to create a new team (you can create a free team)

2. **Add your project to the team**:
   - From the team dashboard, click "Import Project"
   - Select "Import Git Repository"
   - Find and select your Auto AGI Builder repository
   - Follow the prompts for project configuration
   - In Project Settings, make sure to select "Public" for the Deployment Privacy setting before deploying

## 3. Update Local Configuration Files

1. **Create or update `.vercelignore` file** to prevent deployment of unnecessary files:

   ```
   node_modules
   .env
   .env.*
   .git
   ```

2. **Update vercel.json** to explicitly set public access:

   ```json
   {
     "version": 2,
     "public": true,
     "github": {
       "silent": true,
       "enabled": true
     },
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

3. **Create a `.env.production` file** in the frontend directory:

   ```
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   NEXT_PUBLIC_ENVIRONMENT=production
   ```

## 4. Configure Vercel CLI with New Token

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Log in with your new token**:
   ```bash
   vercel login
   # OR use the token directly
   vercel --token YOUR_NEW_TOKEN
   ```

3. **Link your project to the new team**:
   ```bash
   vercel link --scope team-name-here
   ```

## 5. Deploy with Team Project and Public Access Settings

1. **Create a dedicated deployment script** (team-deploy.bat):

```batch
@echo off
echo ===================================
echo DEPLOY TO VERCEL TEAM PROJECT
echo ===================================
echo.

REM Set environment variables
set VERCEL_TOKEN=your-token-here
set VERCEL_SCOPE=your-team-name

REM Update configuration
echo Updating vercel.json...
echo { > vercel.json
echo   "version": 2, >> vercel.json
echo   "public": true, >> vercel.json
echo   "github": { >> vercel.json
echo     "silent": true, >> vercel.json
echo     "enabled": true >> vercel.json
echo   }, >> vercel.json
echo   "rewrites": [ >> vercel.json
echo     { "source": "/(.*)", "destination": "/index.html" } >> vercel.json
echo   ] >> vercel.json
echo } >> vercel.json

REM Deploy to team project with public access
echo Deploying to Vercel team project...
vercel --prod --token %VERCEL_TOKEN% --scope %VERCEL_SCOPE% --public

echo.
echo ===================================
echo DEPLOYMENT COMPLETED
echo ===================================
echo.
echo Check the deployment URL to verify the application is publicly accessible.

pause
```

2. **Edit the script** to add your Vercel token and team name

3. **Run the team deployment script**:
   ```bash
   .\team-deploy.bat
   ```

## 6. Verify Public Access

1. **Check deployment status**: The script will output a deployment URL

2. **Test public access**: Visit the URL in an incognito/private window to ensure it loads without requiring authentication

3. **Verify routing**: Navigate to different pages to ensure the SPA routing works properly

## 7. Update Project Settings in Vercel Dashboard

For a permanent solution, update project settings in the Vercel Dashboard:

1. **Navigate to the project in your team**:
   - Go to the [Vercel Dashboard](https://vercel.com/dashboard)
   - Select your team
   - Click on your project

2. **Update project settings**:
   - Click "Settings" tab
   - Under "General" find "Privacy"
   - Select "Public" deployment privacy
   - Save changes

3. **Configure custom domains** if needed:
   - In the project settings, go to "Domains"
   - Add your custom domain
   - Follow the instructions for DNS configuration

## Troubleshooting

If you still encounter 401 errors after these steps, try the following:

1. **Check project scope**: Verify the project is under your team, not your personal account

2. **Inspect token permissions**: Make sure your token has sufficient privileges

3. **Force refresh configuration**:
   ```bash
   vercel env pull
   vercel --prod --force
   ```

4. **Contact Vercel support**: If issues persist, reach out to Vercel support with your project ID and error details
