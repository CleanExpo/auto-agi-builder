# Vercel Deployment Guide for Auto AGI Builder

This guide provides step-by-step instructions for deploying the Auto AGI Builder application to Vercel. Follow these instructions carefully to ensure a successful deployment with the proper configuration to avoid context provider errors.

## Prerequisites

- GitHub account
- Vercel account (https://vercel.com)
- Node.js installed locally

## Step 1: Project Preparation

The deployment process has been simplified with automation scripts. Before proceeding, make sure you have:

1. Fixed the UIContext provider error using the disableStaticGeneration option
2. Set up all required environment variables
3. Prepared your project for deployment

Run the automated setup script to perform all these tasks:

```bash
cd deployment
run-deployment.bat  # For Windows
# OR
node finalize-vercel-deployment.js  # For any OS
```

## Step 2: Connect Vercel to GitHub

1. Log in to your Vercel account at https://vercel.com
2. Click on "Add New..." → "Project"
3. Select the GitHub option
4. Authenticate with GitHub if not already connected
5. Find and select your Auto AGI Builder repository

## Step 3: Configure Project Settings

Use the following settings when configuring your project:

### Basic Settings

- **Project Name:** auto-agi-builder (or your preferred name)
- **Framework Preset:** Next.js (Automatically detected)
- **Root Directory:** `deployment/frontend` (IMPORTANT)

### Build Settings

- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Development Command:** `npm run dev`

### Environment Variables

Add the following environment variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VERCEL_PROJECT_ID` | `prj_7uKXTp60gosR1DMXBpOaI0hTyPEO` | Production |
| `NEXT_PUBLIC_ENVIRONMENT` | `production` | Production |
| `NEXT_PUBLIC_API_URL` | Your API URL (e.g., `https://api.yourdomain.com`) | Production |
| `DISABLE_STATIC_GENERATION` | `true` | Production |

*Note: The deployment script automatically adds these to your .env.production file locally.*

## Step 4: Deploy

1. Click the "Deploy" button
2. Wait for the build and deployment to complete
3. Once completed, you will receive a URL where your application is deployed (e.g., `https://auto-agi-builder.vercel.app`)

## Step 5: Custom Domain Setup

To use a custom domain with your deployment:

1. In the Vercel dashboard, navigate to your project
2. Go to "Settings" → "Domains"
3. Click "Add" and enter your domain name
4. Follow the instructions in [Custom Domain Setup](./CUSTOM-DOMAIN-SETUP.md) to configure your DNS settings:
   - **CNAME record:** `www` → `cname.vercel-dns.com.`
   - **A record:** `@` → `76.76.21.21`

## Step 6: GitHub Actions Integration (Optional)

For automatic deployments when changes are pushed to your GitHub repository:

1. Set up GitHub repository secrets as described in [GitHub Secrets Setup](./github-secrets-setup.md):
   - `VERCEL_TOKEN`: Your Vercel API token
   - `VERCEL_ORG_ID`: Your Vercel organization ID
   - `VERCEL_PROJECT_ID`: `prj_7uKXTp60gosR1DMXBpOaI0hTyPEO`

2. The GitHub Actions workflow is already configured in `.github/workflows/vercel-deployment.yml`

## Troubleshooting Common Issues

### Context Provider Errors

If you encounter "useUI must be used within a UIProvider" or similar errors:

1. Verify `disableStaticGeneration: true` is in your next.config.js
2. Ensure the `DISABLE_STATIC_GENERATION=true` environment variable is set
3. Check that proper error boundaries are implemented

### Build Failures

If your build fails:

1. Review the build logs in the Vercel dashboard
2. Check that all dependencies are correctly listed in package.json
3. Verify Node.js version compatibility (we recommend Node.js 16+)

### Domain Configuration Issues

If your custom domain isn't working:

1. Verify DNS records are correctly set up as specified in [Custom Domain Setup](./CUSTOM-DOMAIN-SETUP.md)
2. Check if DNS propagation is complete (can take up to 48 hours)
3. Ensure SSL certificate has been properly provisioned by Vercel

For more detailed troubleshooting, please refer to [Troubleshooting](./TROUBLESHOOTING.md).

## Monitoring and Logs

After deployment, you can monitor your application:

1. In the Vercel dashboard, go to your project
2. Click on "Analytics" to view performance metrics
3. Click on "Logs" to view runtime logs

## Additional Resources

- [Update Environment Variables](./UPDATE-ENV-VARIABLES.md)
- [Deployment Solution Summary](./DEPLOYMENT-SOLUTION-SUMMARY.md)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
