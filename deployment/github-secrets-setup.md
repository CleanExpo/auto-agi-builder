# GitHub Secrets Setup for Vercel Deployment

This guide walks you through setting up GitHub repository secrets for automated Vercel deployments.

## Required Secrets

For the GitHub Actions workflow to deploy your project to Vercel automatically, you need to add the following secrets to your repository:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `VERCEL_TOKEN` | Your Vercel API token | API token with deployment permissions |
| `VERCEL_ORG_ID` | Your Vercel organization ID | Organization (team/personal account) ID |
| `VERCEL_PROJECT_ID` | `prj_7uKXTp60gosR1DMXBpOaI0hTyPEO` | Project-specific identifier |

## Step-by-Step Instructions

1. **Navigate to your GitHub repository**
   - Go to the main page of your repository

2. **Access repository settings**
   - Click on "Settings" in the top navigation bar

3. **Open secrets settings**
   - On the left sidebar, click on "Secrets and variables"
   - Select "Actions" from the dropdown

4. **Add each secret**
   - Click "New repository secret"
   - Enter the name (e.g., `VERCEL_PROJECT_ID`)
   - Enter the value (e.g., `prj_7uKXTp60gosR1DMXBpOaI0hTyPEO`)
   - Click "Add secret"
   - Repeat for each required secret

5. **Verify secrets**
   - After adding all secrets, you should see them listed in the "Repository secrets" section
   - Note that you cannot view the secret values after creation, only update or delete them

## Getting Secret Values

### VERCEL_TOKEN

1. Go to your [Vercel account settings](https://vercel.com/account/tokens)
2. Click "Create" to generate a new token
3. Name it "GitHub Actions Deployment" or similar
4. Set appropriate scope (usually "Full Account" for deployment permissions)
5. Copy the generated token

### VERCEL_ORG_ID

1. Go to your [Vercel dashboard](https://vercel.com/dashboard)
2. Your organization ID is in the URL: `https://vercel.com/[YOUR_ORG_ID]/[PROJECT_NAME]`
   - For personal accounts, this is usually your username or a specific identifier

### VERCEL_PROJECT_ID

Your Vercel Project ID has been provided: `prj_7uKXTp60gosR1DMXBpOaI0hTyPEO`

## Testing the Workflow

After setting up the secrets:

1. Make a small change to your code
2. Commit and push to the branch configured in the GitHub Actions workflow
3. Go to the "Actions" tab in your repository
4. You should see the workflow running
5. If successful, your changes will be deployed to Vercel automatically

## Troubleshooting

If the workflow fails:

- Verify all secrets are correctly set
- Check if the Vercel token has the necessary permissions
- Ensure the organization ID matches your Vercel account
- Confirm the project ID is correct
- Review the workflow execution logs for specific error messages

## Security Notes

- Never commit these values directly to your repository
- Rotate your Vercel token regularly for better security
- Limit the scope of your token to only what's necessary
