# How to Import Environment Variables to Vercel

This guide explains how to use the `Import.env` file to easily add all required environment variables to your Vercel project.

## Using Vercel's Import Functionality

Vercel provides a convenient way to import multiple environment variables at once from a text file. Here's how to use the `Import.env` file I've prepared:

### Step 1: Access Environment Variables in Vercel Dashboard

1. Go to the [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your Auto AGI Builder project
3. Go to "Settings" tab
4. Select "Environment Variables" from the left sidebar

### Step 2: Copy the Environment Variables

1. Open the `deployment/Import.env` file in your code editor
2. Select all content (Ctrl+A or Cmd+A)
3. Copy to clipboard (Ctrl+C or Cmd+C)

### Step 3: Import Variables Using Vercel's Import Feature

1. In the Vercel Environment Variables section, look for the "Import" button (it's usually near the "Add New" button)
2. Click "Import"
3. You'll see a text area where you can paste multiple environment variables
4. Paste the content from `Import.env` into this text area
5. Make sure the correct environment(s) are selected (Production, likely)
6. Click "Import" or "Save" to add all variables at once

### Step 4: Verify and Redeploy

1. After importing, review all variables to ensure they've been added correctly
2. Look for any error messages or warnings
3. Go to the "Deployments" tab
4. Find your most recent deployment and click the three dots menu (⋮)
5. Select "Redeploy" to apply the new environment variables

## Understanding the Environment Variables

The `Import.env` file contains several key variables:

- `DISABLE_STATIC_GENERATION=true`: Critical for fixing the UIProvider errors
- `VERCEL_PROJECT_ID`: Your Vercel project identifier
- `NEXT_PUBLIC_ENVIRONMENT`: Sets the environment to production
- `NEXT_PUBLIC_API_URL`: Configures your API endpoint
- Custom domain variables: For your domain configuration
- Feature flags: Enables various application features
- Performance settings: Optimizes your application

## Troubleshooting

If you encounter issues during the import process:

1. **Format Problems**: Make sure the format is exactly `NAME=VALUE` (one per line). Remove any extra spaces or quotes.
2. **Variable Conflicts**: If you see warnings about existing variables, decide whether to overwrite or keep them.
3. **Import Button Not Visible**: Vercel occasionally updates their UI. Look for alternative ways to add multiple variables, or add them individually if necessary.
4. **Invalid Values**: Check for any error messages about invalid variable values and adjust as needed.

## After Importing

Once you've successfully imported the environment variables and redeployed:

1. Watch the deployment logs for any errors
2. Test your application at your custom domain and/or Vercel preview URL
3. Verify that the UIProvider errors are resolved
4. Test key functionality to ensure everything works correctly with the new variables

Remember that the most critical variable is `DISABLE_STATIC_GENERATION=true`, which will fix the context provider errors you were encountering.
