#!/bin/bash

# Script to commit and push UIContext fixes and Vercel deployment configurations to GitHub
# This will prepare the repository for Vercel deployment

echo "===== Preparing for Vercel Deployment ====="
echo "This script will commit and push all deployment-related changes to GitHub"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Git is not installed. Please install git first."
    exit 1
fi

# Ensure we're in the correct directory
if [ ! -d "frontend" ]; then
    echo "Error: This script should be run from the deployment directory."
    echo "Please navigate to the deployment directory and try again."
    exit 1
fi

echo "1. Adding all files to git..."
git add frontend/next.config.js
git add frontend/components/common/ErrorBoundary.js
git add frontend/pages/api/log-error.js
git add frontend/vercel.json
git add .github/workflows/vercel-deployment.yml
git add VERCEL-DEPLOYMENT-GUIDE.md
git add DEPLOYMENT-SOLUTION-SUMMARY.md

echo ""
echo "2. Committing changes..."
git commit -m "Fix UIContext provider issue and add Vercel deployment configuration"

echo ""
echo "3. Do you want to push these changes to GitHub now? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    # Ask for branch name
    echo "Enter the branch name you want to push to (e.g., main):"
    read -r branch
    
    echo "Pushing to $branch..."
    git push origin "$branch"
    
    echo ""
    echo "===== Next Steps ====="
    echo "1. Configure your Vercel project following the instructions in VERCEL-DEPLOYMENT-GUIDE.md"
    echo "2. Set up the GitHub secrets for automatic deployments"
    echo "3. Your site will automatically deploy when changes are pushed to GitHub"
else
    echo ""
    echo "Changes have been committed locally but not pushed to GitHub."
    echo "When you're ready to deploy, run: git push origin YOUR_BRANCH_NAME"
fi

echo ""
echo "===== Deployment Setup Complete ====="
