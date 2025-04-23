#!/bin/bash
# Auto AGI Builder - Vercel Deployment Script
# This script finalizes the Vercel deployment for the Auto AGI Builder SaaS application

echo "===== Auto AGI Builder - Vercel Deployment ====="
echo "This script will deploy your application to Vercel."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI is not installed. Installing..."
    npm install -g vercel
    if [ $? -ne 0 ]; then
        echo "Failed to install Vercel CLI. Please install it manually."
        exit 1
    fi
    echo "Vercel CLI installed successfully."
fi

# Check if logged in to Vercel
echo "Checking Vercel login status..."
VERCEL_TOKEN=$(vercel whoami 2>&1)
if [[ $VERCEL_TOKEN == *"Error"* ]]; then
    echo "Not logged in to Vercel. Please login:"
    vercel login
    if [ $? -ne 0 ]; then
        echo "Failed to login to Vercel. Please try again."
        exit 1
    fi
fi
echo "Successfully logged in to Vercel."

# Link project to Vercel
echo "Linking project to Vercel..."
vercel link
if [ $? -ne 0 ]; then
    echo "Failed to link project to Vercel. Please try again."
    exit 1
fi

# Set up environment variables
echo "Setting up environment variables..."
echo "Would you like to set up environment variables now? (y/n)"
read -r SET_ENV

if [[ $SET_ENV == "y" || $SET_ENV == "Y" ]]; then
    # Check if .env.example exists
    if [ -f "frontend/.env.example" ]; then
        echo "Using frontend/.env.example as a template..."
        while IFS= read -r line || [[ -n "$line" ]]; do
            # Skip comments and empty lines
            if [[ $line == \#* || -z $line ]]; then
                continue
            fi
            
            # Extract variable name and default value
            VAR_NAME=$(echo "$line" | cut -d'=' -f1)
            DEFAULT_VALUE=$(echo "$line" | cut -d'=' -f2-)
            
            echo "Setting $VAR_NAME (default: $DEFAULT_VALUE)"
            echo "Enter value for $VAR_NAME (press Enter to use default):"
            read -r VALUE
            
            if [ -z "$VALUE" ]; then
                VALUE="$DEFAULT_VALUE"
            fi
            
            # Set environment variable in Vercel
            vercel env add $VAR_NAME production
            echo "$VALUE" | vercel env add $VAR_NAME production
        done < "frontend/.env.example"
    else
        echo "No .env.example file found. Please set up environment variables manually in the Vercel dashboard."
    fi
fi

# Run pre-deployment checks
echo "Running pre-deployment checks..."
node scripts/deployment_checklist.js
if [ $? -ne 0 ]; then
    echo "Warning: Pre-deployment checks failed. Do you want to continue anyway? (y/n)"
    read -r CONTINUE
    if [[ $CONTINUE != "y" && $CONTINUE != "Y" ]]; then
        echo "Deployment aborted."
        exit 1
    fi
fi

# Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod
if [ $? -ne 0 ]; then
    echo "Failed to deploy to Vercel. Please check the error message and try again."
    exit 1
fi

echo "===== Deployment Complete ====="
echo "Your Auto AGI Builder application has been successfully deployed to Vercel."
echo "Please check the Vercel dashboard for deployment status and URL."
