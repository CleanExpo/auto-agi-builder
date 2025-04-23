#!/bin/bash
# Auto AGI Builder - Deployment Suite Setup Script
# This script installs required dependencies and makes deployment scripts executable

set -e # Exit immediately if a command exits with a non-zero status

# Color definitions for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to display stage headers
function header() {
  echo -e "\n${BLUE}==================================================${NC}"
  echo -e "${BLUE}    $1${NC}"
  echo -e "${BLUE}==================================================${NC}\n"
}

# Function to display success messages
function success() {
  echo -e "\n${GREEN}✓ $1${NC}"
}

# Function to display error messages and exit
function error() {
  echo -e "\n${RED}✗ ERROR: $1${NC}"
  exit 1
}

# Function to display warning messages
function warning() {
  echo -e "\n${YELLOW}⚠ WARNING: $1${NC}"
}

# Function to check if command exists
function command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Function to make scripts executable
function make_executable() {
  local script=$1
  if [[ -f "$script" ]]; then
    chmod +x "$script"
    success "Made $script executable"
  else
    warning "Script $script not found"
  fi
}

# Welcome message
header "Auto AGI Builder - Deployment Suite Setup"
echo "This script will install required dependencies and set up the deployment suite."

# Check for required tools
echo "Checking for required tools..."

# Check for Node.js
if ! command_exists node; then
  error "Node.js is not installed. Please install Node.js (v14 or later) and try again."
fi

node_version=$(node -v)
echo "Found Node.js version: $node_version"

# Check for npm
if ! command_exists npm; then
  error "npm is not installed. Please install npm and try again."
fi

npm_version=$(npm -v)
echo "Found npm version: $npm_version"

# Check for git
if ! command_exists git; then
  error "git is not installed. Please install git and try again."
fi

git_version=$(git --version)
echo "Found git version: $git_version"

# Check for Vercel CLI
if ! command_exists vercel; then
  warning "Vercel CLI is not installed. Installing..."
  npm install -g vercel
  if [ $? -ne 0 ]; then
    error "Failed to install Vercel CLI"
  fi
  success "Vercel CLI installed"
else
  vercel_version=$(vercel --version)
  echo "Found Vercel CLI version: $vercel_version"
fi

# Install dependencies for verification script
header "Installing dependencies for deployment verification"
npm install --save node-fetch

# Make deployment scripts executable
header "Making deployment scripts executable"
make_executable "deploy-production.sh"
make_executable "deployment-verification.js"

# Detect PowerShell and make note of it
if command_exists pwsh || command_exists powershell; then
  echo "PowerShell detected. PowerShell deployment script (deploy-production.ps1) is ready to use."
else
  warning "PowerShell not detected. If you're on Windows, you may need to use the PowerShell deployment script."
fi

# Verify all files exist
header "Verifying deployment files"

deployment_files=(
  "deploy-production.sh"
  "deploy-production.ps1"
  "deployment-verification.js"
  "vercel.json"
  "frontend/utils/validation.js"
  "frontend/middleware/auth.js"
  "auto-agi-builder-cookbook.md"
)

missing_files=0
for file in "${deployment_files[@]}"; do
  if [[ -f "$file" ]]; then
    echo "✓ $file exists"
  else
    warning "$file not found"
    missing_files=$((missing_files+1))
  fi
done

if [ $missing_files -gt 0 ]; then
  warning "$missing_files deployment files are missing. The deployment suite may not work correctly."
else
  success "All deployment files are present"
fi

# Final instructions
header "Deployment Suite Setup Complete"

echo -e "${GREEN}The Auto AGI Builder deployment suite is now set up and ready to use.${NC}"
echo ""
echo "Available scripts:"
echo ""
echo "1. ${YELLOW}deploy-production.sh${NC} (Linux/macOS users)"
echo "   Usage: ./deploy-production.sh"
echo "   Purpose: Prepares the codebase for production, commits to Git, and deploys to Vercel"
echo ""
echo "2. ${YELLOW}deploy-production.ps1${NC} (Windows users)"
echo "   Usage: ./deploy-production.ps1 or pwsh -File deploy-production.ps1"
echo "   Purpose: Same as above, but for Windows environments"
echo ""
echo "3. ${YELLOW}deployment-verification.js${NC} (All platforms)"
echo "   Usage: node deployment-verification.js [deployment-url]"
echo "   Purpose: Verifies that your deployment is working correctly"
echo ""
echo -e "${BLUE}Additional resources:${NC}"
echo "- auto-agi-builder-cookbook.md - Comprehensive documentation of the application"
echo "- vercel.json - Configuration for Vercel deployment"
echo ""
echo -e "${YELLOW}To deploy your application:${NC}"
echo "1. Review and update environment variables in 'frontend/.env.production'"
echo "2. Run the appropriate deployment script for your platform"
echo "3. Verify the deployment using the verification script"
echo ""
echo -e "${GREEN}Good luck with your deployment!${NC}"

exit 0
