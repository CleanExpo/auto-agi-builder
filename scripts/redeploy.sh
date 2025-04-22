#!/bin/bash
# Auto AGI Builder Redeployment Script
# This script automates the process of redeploying the application to Vercel
# Usage: ./scripts/redeploy.sh [--skip-checks] [--clear-cache] [--branch branch_name]

# Terminal colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default values
SKIP_CHECKS=false
CLEAR_CACHE=false
BRANCH="main"
VERCEL_PROJECT_NAME="auto-agi-builder"  # Change this to your Vercel project name

# Parse command line arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --skip-checks) SKIP_CHECKS=true ;;
        --clear-cache) CLEAR_CACHE=true ;;
        --branch) BRANCH="$2"; shift ;;
        *) echo -e "${RED}Unknown parameter: $1${NC}"; exit 1 ;;
    esac
    shift
done

# Print header
echo -e "${PURPLE}======================================================================${NC}"
echo -e "${PURPLE}                Auto AGI Builder Redeployment Script                  ${NC}"
echo -e "${PURPLE}======================================================================${NC}"
echo -e "${BLUE}Branch:${NC} $BRANCH"
echo -e "${BLUE}Skip checks:${NC} $SKIP_CHECKS"
echo -e "${BLUE}Clear cache:${NC} $CLEAR_CACHE"
echo ""

# Check if we're in the project root directory
if [ ! -d "frontend" ] || [ ! -d "app" ]; then
    echo -e "${RED}Error: This script must be run from the project root directory${NC}"
    exit 1
fi

# Check if required tools are installed
echo -e "${CYAN}Checking required tools...${NC}"
command -v git >/dev/null 2>&1 || { echo -e "${RED}Error: git is not installed${NC}"; exit 1; }
command -v node >/dev/null 2>&1 || { echo -e "${RED}Error: node is not installed${NC}"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}Error: npm is not installed${NC}"; exit 1; }
command -v vercel >/dev/null 2>&1 || {
    echo -e "${YELLOW}Warning: vercel CLI is not installed. Installing...${NC}"
    npm install -g vercel
}
echo -e "${GREEN}✓ All required tools are installed${NC}"

# Check if node_modules exists and install dependencies if needed
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}Warning: node_modules not found, installing dependencies...${NC}"
    cd frontend && npm install && cd ..
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error: Failed to install dependencies${NC}"
        exit 1
    fi
fi

# Run deployment checks
if [ "$SKIP_CHECKS" = false ]; then
    echo -e "${CYAN}Running deployment checks...${NC}"
    node scripts/deployment_checklist.js
    if [ $? -ne 0 ]; then
        echo -e "${RED}Deployment checks failed. Fix the issues or run with --skip-checks to bypass.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Deployment checks passed${NC}"
fi

# Check git status
echo -e "${CYAN}Checking git status...${NC}"
CHANGED_FILES=$(git status --porcelain | wc -l)
if [ "$CHANGED_FILES" -ne 0 ]; then
    echo -e "${YELLOW}You have uncommitted changes:${NC}"
    git status --short
    
    read -p "Do you want to stage, commit, and push these changes? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Prompt for commit message
        echo -n "Enter commit message: "
        read COMMIT_MESSAGE
        
        # Stage and commit changes
        echo -e "${CYAN}Staging and committing changes...${NC}"
        git add .
        git commit -m "$COMMIT_MESSAGE"
        if [ $? -ne 0 ]; then
            echo -e "${RED}Error: Failed to commit changes${NC}"
            exit 1
        fi
        echo -e "${GREEN}✓ Changes committed${NC}"
    else
        echo -e "${YELLOW}Warning: You have uncommitted changes that won't be deployed${NC}"
    fi
fi

# Pull latest changes to avoid conflicts
echo -e "${CYAN}Pulling latest changes from $BRANCH...${NC}"
git pull origin $BRANCH
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to pull latest changes. Resolve conflicts and try again.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Latest changes pulled${NC}"

# Validate local build
echo -e "${CYAN}Validating local build...${NC}"
cd frontend

# Clear build cache if requested
if [ "$CLEAR_CACHE" = true ]; then
    echo -e "${CYAN}Clearing Next.js build cache...${NC}"
    rm -rf .next
    echo -e "${GREEN}✓ Build cache cleared${NC}"
fi

# Run build
echo -e "${CYAN}Building frontend...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Build failed. Fix the build errors and try again.${NC}"
    cd ..
    exit 1
fi
echo -e "${GREEN}✓ Build successful${NC}"
cd ..

# Push changes to GitHub
echo -e "${CYAN}Pushing changes to GitHub...${NC}"
git push origin $BRANCH
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to push changes to GitHub. Resolve issues and try again.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Changes pushed to GitHub${NC}"

# Deploy to Vercel
echo -e "${CYAN}Deploying to Vercel...${NC}"
cd frontend

# Check if logged in to Vercel
echo -e "${CYAN}Checking Vercel login status...${NC}"
vercel whoami >/dev/null 2>&1
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Not logged in to Vercel. Logging in...${NC}"
    vercel login
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error: Failed to login to Vercel${NC}"
        cd ..
        exit 1
    fi
fi

# Check if GitHub integration is set up
echo -e "${CYAN}Checking GitHub integration...${NC}"
if ! vercel project ls | grep -q "$VERCEL_PROJECT_NAME"; then
    echo -e "${YELLOW}Project not found. Make sure Vercel GitHub integration is set up.${NC}"
    echo -e "${YELLOW}Alternatively, you can manually deploy from the Vercel dashboard.${NC}"
    cd ..
    exit 1
fi

# Trigger production deployment
echo -e "${CYAN}Triggering production deployment...${NC}"
vercel --prod
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Vercel deployment failed${NC}"
    cd ..
    exit 1
fi
echo -e "${GREEN}✓ Deployment triggered${NC}"
cd ..

# Verify deployment
echo -e "${PURPLE}======================================================================${NC}"
echo -e "${GREEN}Deployment process complete!${NC}"
echo -e "${YELLOW}Important post-deployment steps:${NC}"
echo -e "1. Verify the deployment on Vercel dashboard"
echo -e "2. Check the application at your production URL"
echo -e "3. Verify API connectivity"
echo -e "4. Test critical user journeys"
echo -e "${PURPLE}======================================================================${NC}"

# Open browser to deployment URL
echo -e "${CYAN}Would you like to open your deployment in a browser? (y/n)${NC}"
read -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    DEPLOY_URL="https://$VERCEL_PROJECT_NAME.vercel.app"
    echo -e "${BLUE}Opening $DEPLOY_URL${NC}"
    case "$(uname -s)" in
        Darwin*)    open "$DEPLOY_URL" ;;
        Linux*)     xdg-open "$DEPLOY_URL" ;;
        CYGWIN*|MINGW32*|MSYS*|MINGW*) start "$DEPLOY_URL" ;;
        *)          echo "Please open $DEPLOY_URL in your browser" ;;
    esac
fi

echo -e "${GREEN}Done!${NC}"
exit 0
