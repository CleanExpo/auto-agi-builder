# Vercel Deployment Guide

This guide explains how to configure automatic deployments for the Auto AGI Builder frontend to Vercel using GitHub Actions.

## Prerequisites

- A GitHub repository containing the Auto AGI Builder code
- A Vercel account (https://vercel.com)
- Repository write access to set up secrets

## Setting Up Vercel Project

1. Log in to your Vercel account
2. Click "Import Project" to create a new project
3. Select "Import Git Repository" and choose your GitHub repository
4. Configure the project:
   - Framework preset: Next.js
   - Root directory: `deployment/frontend`
   - Build command: `npm run build`
   - Output directory: `.next`
5. Click "Deploy" to create the initial deployment

## Gathering Vercel Credentials

After creating the Vercel project, you need to gather the necessary credentials to automate future deployments:

1. Generate a Vercel API token:
   - Go to your Vercel account settings
   - Navigate to "Tokens" section
   - Click "Create" to generate a new token
   - Give it a name like "GitHub Actions Deployment"
   - Set the scope as "Full Account" for complete access
   - Copy the generated token

2. Get your Vercel Organization ID:
   - Go to your Vercel dashboard
   - Click on your organization name (or personal account)
   - Copy the ID from the URL: `https://vercel.com/[YOUR_ORG_ID]`

3. Get your Vercel Project ID:
   - Go to your project's settings
   - Find the Project ID in the "General" section
   - Copy the project ID value

## Setting Up GitHub Repository Secrets

Add the following secrets to your GitHub repository:

1. Go to your GitHub repository
2. Navigate to "Settings" > "Secrets and variables" > "Actions"
3. Click "New repository secret"
4. Add the following secrets:
   - `VERCEL_TOKEN`: Your Vercel API token
   - `VERCEL_ORG_ID`: Your Vercel Organization ID
   - `VERCEL_PROJECT_ID`: Your Vercel Project ID

## Understanding Automatic Deployments

Once set up, the GitHub Action workflow will:

1. Deploy to production whenever code is pushed to the `main` branch
2. Create preview deployments for pull requests
3. Post preview URLs as comments on the pull request

## Custom Domain Configuration (Optional)

To use a custom domain for your Vercel deployment:

1. Go to your Vercel project dashboard
2. Navigate to "Settings" > "Domains"
3. Click "Add" and enter your domain name
4. Follow Vercel's DNS configuration instructions

## Troubleshooting

If you encounter issues with automatic deployments:

1. Check GitHub Actions logs for specific error messages
2. Verify that all GitHub secrets are correctly set
3. Ensure the workflow file is in the correct location (`.github/workflows/vercel-deployment.yml`)
4. Confirm the Vercel token has proper permissions

For persistent issues, try manually deploying to Vercel to test your configuration.
