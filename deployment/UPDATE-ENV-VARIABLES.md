# Updating Environment Variables for Vercel Deployment

This guide explains how to update the environment variables for your new Vercel deployment.

## Step 1: Create Your New Vercel Project

1. Go to [https://vercel.com](https://vercel.com) and log in
2. Create a new project by importing your GitHub repository
3. Configure the project with these settings:
   - Framework preset: **Next.js**
   - Root directory: **deployment/frontend**
   - Build command: **npm run build**
   - Output directory: **.next**

## Step 2: Gather Credentials from Vercel

After creating your Vercel project, you need to gather several credential values:

1. **Vercel API Token**:
   - Go to your Vercel account settings
   - Navigate to "Tokens" section
   - Click "Create" and name it "GitHub Actions Deployment"
   - Set scope to "Full Account"
   - Copy the generated token

2. **Organization ID**:
   - In your Vercel dashboard, click on your account/organization name
   - The ID will be in the URL: `https://vercel.com/[YOUR_ORG_ID]`

3. **Project ID**:
   - Go to your project's settings
   - Find the Project ID in the "General" tab
   - Copy this value

## Step 3: Update Environment Variables

### For Local Development

1. Navigate to `deployment/frontend`
2. Copy `.env.template` to `.env.local`:
   ```
   cp .env.template .env.local
   ```
3. Open `.env.local` and replace all placeholder values with your actual values

### For Vercel Environment

1. In your Vercel project dashboard, navigate to "Settings" > "Environment Variables"
2. Add each environment variable from your `.env.local` file:
   - VERCEL_TOKEN
   - VERCEL_ORG_ID
   - VERCEL_PROJECT_ID
   - NEXT_PUBLIC_API_URL
   - ... and any other variables needed by your application

## Step 4: Configure GitHub Repository Secrets

For automated deployments via GitHub Actions:

1. Go to your GitHub repository
2. Navigate to "Settings" > "Secrets and variables" > "Actions"
3. Add these secrets:
   - `VERCEL_TOKEN`: Your Vercel API token
   - `VERCEL_ORG_ID`: Your Vercel Organization ID
   - `VERCEL_PROJECT_ID`: Your Vercel Project ID

## Step 5: Test Your Deployment

1. Make a small change to your code
2. Commit and push to your main branch
3. Watch the GitHub Actions workflow run in the "Actions" tab of your repository
4. Verify the deployment completes successfully on Vercel

## Troubleshooting

If your deployment fails:

1. Check that all environment variables are correctly set in both Vercel and GitHub
2. Verify the GitHub workflow file (.github/workflows/vercel-deployment.yml) is present
3. Ensure your Vercel token has sufficient permissions
4. Review build logs in both GitHub Actions and Vercel for specific errors
