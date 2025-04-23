#!/bin/bash
# Auto AGI Builder - Production Deployment Script
# This script prepares the codebase, commits to Git, and deploys to Vercel

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

# Function to check command success
function check_success() {
  if [ $? -eq 0 ]; then
    success "$1"
  else
    error "$2"
  fi
}

# Function to verify a URL is accessible
function verify_url() {
  local url=$1
  local max_retries=$2
  local wait_time=$3
  local retries=0
  
  echo "Verifying URL is accessible: $url"
  
  while [ $retries -lt $max_retries ]; do
    status_code=$(curl -s -o /dev/null -w "%{http_code}" $url || echo "failed")
    
    if [[ "$status_code" == "200" || "$status_code" == "201" || "$status_code" == "301" || "$status_code" == "302" ]]; then
      success "URL $url is accessible (Status code: $status_code)"
      return 0
    else
      echo "Attempt $((retries+1))/$max_retries - Status code: $status_code. Waiting ${wait_time}s before retry..."
      sleep $wait_time
      retries=$((retries+1))
    fi
  done
  
  error "Failed to access $url after $max_retries attempts"
  return 1
}

# Check if git is available
if ! command -v git &> /dev/null; then
    error "Git is not installed or not in the PATH"
fi

# Check if Vercel CLI is available
if ! command -v vercel &> /dev/null; then
    error "Vercel CLI is not installed. Please install with 'npm install -g vercel'"
fi

# Store the starting directory
SCRIPT_DIR="$(pwd)"

# Confirmation before proceeding
echo -e "${YELLOW}This script will prepare your code for production, commit to Git, and deploy to Vercel.${NC}"
echo -e "${YELLOW}Make sure you have:${NC}"
echo "  1. Saved all your changes"
echo "  2. Created a .env file with production variables"
echo "  3. Updated your vercel.json file with production settings"
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

# =====================================================
header "1. Preparing Codebase for Production"
# =====================================================

# 1.1 Check that required files exist
echo "Checking for required files..."

required_files=(
  "frontend/next.config.js"
  "frontend/.env.example"
  "vercel.json"
  "frontend/package.json"
  "app/main.py"
  "requirements.txt"
)

for file in "${required_files[@]}"; do
  if [ ! -f "$file" ]; then
    error "Required file not found: $file"
  fi
done

success "All required files exist"

# 1.2 Create production environment files from examples
echo "Setting up production environment files..."

if [ -f "frontend/.env.example" ] && [ ! -f "frontend/.env.production" ]; then
  cp frontend/.env.example frontend/.env.production
  echo "Created frontend/.env.production from .env.example"
  echo "⚠ Please edit frontend/.env.production with production values"
  read -p "Press Enter after editing the production environment file..." -r
elif [ ! -f "frontend/.env.production" ]; then
  error "frontend/.env.production not found and couldn't create from example"
fi

success "Production environment files are ready"

# 1.3 Install dependencies and check for any issues
echo "Installing dependencies and checking for issues..."

# Frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install || error "Failed to install frontend dependencies"
success "Frontend dependencies installed"

# Check for outdated packages with known vulnerabilities
echo "Checking for vulnerabilities..."
npm audit --production
if [ $? -ne 0 ]; then
  warning "Vulnerabilities found. Consider running 'npm audit fix' before deploying"
fi

# Build check (don't output the build files yet)
echo "Running build check..."
npm run build -- --no-lint || error "Frontend build check failed"
success "Frontend build check passed"
cd ..

# Backend dependencies (assuming Python/FastAPI)
echo "Checking backend dependencies..."
pip install -r requirements.txt || error "Failed to install backend dependencies"
success "Backend dependencies installed"

# 1.4 Remove development-only code and files
echo "Removing development files..."

dev_files=(
  ".vscode"
  "*.log"
  "frontend/node_modules/.cache"
  "**/npm-debug.log*"
  "**/yarn-debug.log*"
  "**/yarn-error.log*"
  "**/.DS_Store"
)

for pattern in "${dev_files[@]}"; do
  find . -name "$pattern" -type f -delete 2>/dev/null || true
  find . -name "$pattern" -type d -exec rm -rf {} + 2>/dev/null || true
done

success "Development files cleaned up"

# 1.5 Check frontend optimization settings
echo "Checking for optimization settings in next.config.js..."

if ! grep -q "swcMinify" frontend/next.config.js; then
  warning "swcMinify not found in next.config.js. Consider adding optimization settings"
else
  success "Next.js optimization settings found"
fi

# =====================================================
header "2. Performing Git Operations"
# =====================================================

# 2.1 Check Git status
echo "Checking Git status..."
git status

# 2.2 Verify Git repository
if [ ! -d ".git" ]; then
  echo "Initializing Git repository..."
  git init
  git remote add origin https://github.com/CleanExpo/auto-agi-builder.git
  success "Git repository initialized and remote added"
else
  # Verify the remote is correctly set
  if ! git remote -v | grep -q "CleanExpo/auto-agi-builder"; then
    git remote add origin https://github.com/CleanExpo/auto-agi-builder.git
    success "Remote added: origin -> https://github.com/CleanExpo/auto-agi-builder.git"
  else
    success "Git repository already configured"
  fi
fi

# 2.3 Stage files for commit
echo "Staging files for commit..."
git add .
check_success "Files staged for commit" "Failed to stage files"

# 2.4 Create a detailed commit message
COMMIT_MESSAGE="Production Deployment $(date '+%Y-%m-%d')

This commit prepares the application for production deployment with:

- Security implementation with authentication middleware
- Performance optimization scripts
- Form validation utilities
- Comprehensive project documentation
- Production environment configuration
- Vercel deployment settings"

echo "Creating commit with message:"
echo "$COMMIT_MESSAGE"

git commit -m "$COMMIT_MESSAGE"
check_success "Changes committed to Git" "Failed to commit changes"

# 2.5 Push changes to GitHub
echo "Pushing changes to GitHub..."
git push -u origin main
check_success "Changes pushed to GitHub" "Failed to push changes to GitHub. You may need to 'git pull' first or use '--force'"

# =====================================================
header "3. Deploying to Vercel"
# =====================================================

# 3.1 Verify Vercel CLI is logged in
echo "Verifying Vercel CLI login status..."
vercel whoami &>/dev/null
if [ $? -ne 0 ]; then
  echo "Logging in to Vercel..."
  vercel login
  check_success "Logged in to Vercel" "Failed to log in to Vercel"
else
  success "Already logged in to Vercel"
fi

# 3.2 Check for vercel.json configuration
if [ ! -f "vercel.json" ]; then
  warning "vercel.json not found, creating default configuration..."
  cat > vercel.json << EOF
{
  "version": 2,
  "builds": [
    { 
      "src": "frontend/package.json", 
      "use": "@vercel/next"
    }
  ],
  "routes": [
    { 
      "src": "/(.*)", 
      "dest": "frontend/$1" 
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
EOF
  success "Created default vercel.json configuration"
else
  success "vercel.json configuration found"
fi

# 3.3 Check environment variables
echo "Checking Vercel environment variables..."
vercel env ls || warning "Could not list environment variables. You may need to set them manually in the Vercel dashboard."

# 3.4 Run pre-deployment checks
echo "Running pre-deployment checks..."

# Check for critical environment variables in frontend/.env.production
required_env_vars=(
  "NEXT_PUBLIC_API_URL"
  "NEXT_PUBLIC_AUTH_DOMAIN"
)

if [ -f "frontend/.env.production" ]; then
  for var in "${required_env_vars[@]}"; do
    if ! grep -q "$var=" frontend/.env.production; then
      warning "Environment variable $var not found in frontend/.env.production"
    fi
  done
fi

# 3.5 Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod
check_success "Deployed to Vercel" "Deployment to Vercel failed"

# Get the deployment URL
DEPLOY_URL=$(vercel --prod --confirm)
echo "Deployment URL: $DEPLOY_URL"

# =====================================================
header "4. Post-Deployment Verification"
# =====================================================

# 4.1 Check that the site is accessible
echo "Verifying site is accessible..."
verify_url "$DEPLOY_URL" 5 10

# 4.2 Check critical pages
critical_paths=(
  "/"
  "/dashboard"
  "/auth/login"
  "/requirements"
  "/prototype"
  "/device-preview"
  "/roi"
  "/roadmap"
)

echo "Checking critical pages..."
for path in "${critical_paths[@]}"; do
  verify_url "${DEPLOY_URL}${path}" 3 5 || warning "Could not verify ${path} page"
done

# 4.3 Check API endpoints
echo "Checking API endpoints..."
API_URL=$(grep "NEXT_PUBLIC_API_URL" frontend/.env.production | cut -d '=' -f2)

if [ -n "$API_URL" ]; then
  verify_url "${API_URL}/api/v1/health" 3 5 || warning "API health check failed"
else
  warning "Could not determine API URL for verification"
fi

# 4.4 Summary
header "Deployment Summary"

echo -e "${GREEN}Auto AGI Builder has been successfully deployed!${NC}"
echo ""
echo "Deployment URL: $DEPLOY_URL"
echo ""
echo "Next Steps:"
echo "  1. Verify the application in your browser"
echo "  2. Test the authentication flow by logging in"
echo "  3. Check all major features are working correctly"
echo "  4. Monitor error logs in the Vercel dashboard"
echo ""
echo -e "${YELLOW}Don't forget to:${NC}"
echo "  • Set up monitoring and alerts"
echo "  • Configure proper DNS if using a custom domain"
echo "  • Run the security audit script (security-audit.js) against production"
echo "  • Run the performance script (performance-optimization.js) against production"
echo ""
echo -e "${BLUE}Documentation is available at:${NC} $DEPLOY_URL/docs"

# End of script
exit 0
