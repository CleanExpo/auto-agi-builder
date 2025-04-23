# Auto AGI Builder - Production Deployment Script (PowerShell)
# This script prepares the codebase, commits to Git, and deploys to Vercel

# Set error action preference to stop on error
$ErrorActionPreference = "Stop"

# Color definitions for better readability
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

# Function to display stage headers
function Write-Header($message) {
    Write-Output ""
    Write-ColorOutput Blue "=================================================="
    Write-ColorOutput Blue "    $message"
    Write-ColorOutput Blue "=================================================="
    Write-Output ""
}

# Function to display success messages
function Write-Success($message) {
    Write-Output ""
    Write-ColorOutput Green "✓ $message"
}

# Function to display error messages and exit
function Write-Error($message) {
    Write-Output ""
    Write-ColorOutput Red "✗ ERROR: $message"
    exit 1
}

# Function to display warning messages
function Write-Warning($message) {
    Write-Output ""
    Write-ColorOutput Yellow "⚠ WARNING: $message"
}

# Function to check command success
function Test-CommandSuccess($successMessage, $errorMessage) {
    if ($LASTEXITCODE -eq 0) {
        Write-Success $successMessage
    }
    else {
        Write-Error $errorMessage
    }
}

# Function to verify a URL is accessible
function Test-Url($url, $maxRetries, $waitTime) {
    $retries = 0
    
    Write-Output "Verifying URL is accessible: $url"
    
    while ($retries -lt $maxRetries) {
        try {
            $response = Invoke-WebRequest -Uri $url -Method HEAD -UseBasicParsing -ErrorAction SilentlyContinue
            $statusCode = $response.StatusCode
            
            if (($statusCode -eq 200) -or ($statusCode -eq 201) -or ($statusCode -eq 301) -or ($statusCode -eq 302)) {
                Write-Success "URL $url is accessible (Status code: $statusCode)"
                return $true
            }
        }
        catch {
            $statusCode = "failed"
        }
        
        Write-Output "Attempt $(($retries+1))/$maxRetries - Status code: $statusCode. Waiting ${waitTime}s before retry..."
        Start-Sleep -Seconds $waitTime
        $retries++
    }
    
    Write-Warning "Failed to access $url after $maxRetries attempts"
    return $false
}

# Check if git is available
try {
    git --version | Out-Null
}
catch {
    Write-Error "Git is not installed or not in the PATH"
}

# Check if Vercel CLI is available
try {
    vercel --version | Out-Null
}
catch {
    Write-Error "Vercel CLI is not installed. Please install with 'npm install -g vercel'"
}

# Store the starting directory
$scriptDir = Get-Location

# Confirmation before proceeding
Write-ColorOutput Yellow "This script will prepare your code for production, commit to Git, and deploy to Vercel."
Write-ColorOutput Yellow "Make sure you have:"
Write-Output "  1. Saved all your changes"
Write-Output "  2. Created a .env file with production variables"
Write-Output "  3. Updated your vercel.json file with production settings"
$confirmation = Read-Host "Continue? (y/n)"
if ($confirmation -ne 'y') {
    Write-Output "Deployment cancelled."
    exit 0
}

# =====================================================
Write-Header "1. Preparing Codebase for Production"
# =====================================================

# 1.1 Check that required files exist
Write-Output "Checking for required files..."

$requiredFiles = @(
    "frontend/next.config.js",
    "frontend/.env.example",
    "vercel.json",
    "frontend/package.json",
    "app/main.py",
    "requirements.txt"
)

foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        Write-Error "Required file not found: $file"
    }
}

Write-Success "All required files exist"

# 1.2 Create production environment files from examples
Write-Output "Setting up production environment files..."

if ((Test-Path "frontend/.env.example") -and (-not (Test-Path "frontend/.env.production"))) {
    Copy-Item "frontend/.env.example" "frontend/.env.production"
    Write-Output "Created frontend/.env.production from .env.example"
    Write-Output "⚠ Please edit frontend/.env.production with production values"
    Read-Host "Press Enter after editing the production environment file..."
}
elseif (-not (Test-Path "frontend/.env.production")) {
    Write-Error "frontend/.env.production not found and couldn't create from example"
}

Write-Success "Production environment files are ready"

# 1.3 Install dependencies and check for any issues
Write-Output "Installing dependencies and checking for issues..."

# Frontend dependencies
Write-Output "Installing frontend dependencies..."
Push-Location frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install frontend dependencies"
}
Write-Success "Frontend dependencies installed"

# Check for outdated packages with known vulnerabilities
Write-Output "Checking for vulnerabilities..."
npm audit --production
if ($LASTEXITCODE -ne 0) {
    Write-Warning "Vulnerabilities found. Consider running 'npm audit fix' before deploying"
}

# Build check (don't output the build files yet)
Write-Output "Running build check..."
npm run build -- --no-lint
if ($LASTEXITCODE -ne 0) {
    Write-Error "Frontend build check failed"
}
Write-Success "Frontend build check passed"
Pop-Location

# Backend dependencies (assuming Python/FastAPI)
Write-Output "Checking backend dependencies..."
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install backend dependencies"
}
Write-Success "Backend dependencies installed"

# 1.4 Remove development-only code and files
Write-Output "Removing development files..."

$devFiles = @(
    ".vscode",
    "*.log",
    "frontend/node_modules/.cache",
    "**/npm-debug.log*",
    "**/yarn-debug.log*",
    "**/yarn-error.log*",
    "**/.DS_Store"
)

foreach ($pattern in $devFiles) {
    Get-ChildItem -Path . -Recurse -Include $pattern -ErrorAction SilentlyContinue | Remove-Item -Force -Recurse -ErrorAction SilentlyContinue
}

Write-Success "Development files cleaned up"

# 1.5 Check frontend optimization settings
Write-Output "Checking for optimization settings in next.config.js..."

$nextConfigContent = Get-Content -Path "frontend/next.config.js" -Raw
if (-not ($nextConfigContent -match "swcMinify")) {
    Write-Warning "swcMinify not found in next.config.js. Consider adding optimization settings"
}
else {
    Write-Success "Next.js optimization settings found"
}

# =====================================================
Write-Header "2. Performing Git Operations"
# =====================================================

# 2.1 Check Git status
Write-Output "Checking Git status..."
git status

# 2.2 Verify Git repository
if (-not (Test-Path ".git")) {
    Write-Output "Initializing Git repository..."
    git init
    git remote add origin https://github.com/CleanExpo/auto-agi-builder.git
    Write-Success "Git repository initialized and remote added"
}
else {
    # Verify the remote is correctly set
    $remotes = git remote -v
    if (-not ($remotes -match "CleanExpo/auto-agi-builder")) {
        git remote add origin https://github.com/CleanExpo/auto-agi-builder.git
        Write-Success "Remote added: origin -> https://github.com/CleanExpo/auto-agi-builder.git"
    }
    else {
        Write-Success "Git repository already configured"
    }
}

# 2.3 Stage files for commit
Write-Output "Staging files for commit..."
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to stage files"
}
Write-Success "Files staged for commit"

# 2.4 Create a detailed commit message
$commitDate = Get-Date -Format "yyyy-MM-dd"
$commitMessage = @"
Production Deployment $commitDate

This commit prepares the application for production deployment with:

- Security implementation with authentication middleware
- Performance optimization scripts
- Form validation utilities
- Comprehensive project documentation
- Production environment configuration
- Vercel deployment settings
"@

Write-Output "Creating commit with message:"
Write-Output $commitMessage

git commit -m $commitMessage
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to commit changes"
}
Write-Success "Changes committed to Git"

# 2.5 Push changes to GitHub
Write-Output "Pushing changes to GitHub..."
git push -u origin main
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to push changes to GitHub. You may need to 'git pull' first or use '--force'"
}
Write-Success "Changes pushed to GitHub"

# =====================================================
Write-Header "3. Deploying to Vercel"
# =====================================================

# 3.1 Verify Vercel CLI is logged in
Write-Output "Verifying Vercel CLI login status..."
$vercelLoginStatus = $null
try {
    $vercelLoginStatus = vercel whoami 2>&1
}
catch {
    $vercelLoginStatus = $null
}

if (-not $vercelLoginStatus) {
    Write-Output "Logging in to Vercel..."
    vercel login
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to log in to Vercel"
    }
    Write-Success "Logged in to Vercel"
}
else {
    Write-Success "Already logged in to Vercel"
}

# 3.2 Check for vercel.json configuration
if (-not (Test-Path "vercel.json")) {
    Write-Warning "vercel.json not found, creating default configuration..."
    
    $vercelJson = @"
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
      "dest": "frontend/\$1" 
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
"@
    
    Set-Content -Path "vercel.json" -Value $vercelJson
    Write-Success "Created default vercel.json configuration"
}
else {
    Write-Success "vercel.json configuration found"
}

# 3.3 Check environment variables
Write-Output "Checking Vercel environment variables..."
try {
    vercel env ls | Out-Null
}
catch {
    Write-Warning "Could not list environment variables. You may need to set them manually in the Vercel dashboard."
}

# 3.4 Run pre-deployment checks
Write-Output "Running pre-deployment checks..."

# Check for critical environment variables in frontend/.env.production
$requiredEnvVars = @(
    "NEXT_PUBLIC_API_URL",
    "NEXT_PUBLIC_AUTH_DOMAIN"
)

if (Test-Path "frontend/.env.production") {
    $envContent = Get-Content -Path "frontend/.env.production" -Raw
    foreach ($var in $requiredEnvVars) {
        if (-not ($envContent -match "$var=")) {
            Write-Warning "Environment variable $var not found in frontend/.env.production"
        }
    }
}

# 3.5 Deploy to Vercel
Write-Output "Deploying to Vercel..."
vercel --prod
if ($LASTEXITCODE -ne 0) {
    Write-Error "Deployment to Vercel failed"
}
Write-Success "Deployed to Vercel"

# Get the deployment URL
$deployUrl = vercel --prod --confirm
Write-Output "Deployment URL: $deployUrl"

# =====================================================
Write-Header "4. Post-Deployment Verification"
# =====================================================

# 4.1 Check that the site is accessible
Write-Output "Verifying site is accessible..."
Test-Url -url $deployUrl -maxRetries 5 -waitTime 10

# 4.2 Check critical pages
$criticalPaths = @(
    "/",
    "/dashboard",
    "/auth/login",
    "/requirements",
    "/prototype",
    "/device-preview",
    "/roi",
    "/roadmap"
)

Write-Output "Checking critical pages..."
foreach ($path in $criticalPaths) {
    $pathUrl = "${deployUrl}${path}"
    $result = Test-Url -url $pathUrl -maxRetries 3 -waitTime 5
    if (-not $result) {
        Write-Warning "Could not verify ${path} page"
    }
}

# 4.3 Check API endpoints
Write-Output "Checking API endpoints..."
$envContent = Get-Content -Path "frontend/.env.production" -Raw
$apiUrl = if ($envContent -match "NEXT_PUBLIC_API_URL=(.*)") { $matches[1] } else { $null }

if ($apiUrl) {
    Test-Url -url "${apiUrl}/api/v1/health" -maxRetries 3 -waitTime 5
    if (-not $?) {
        Write-Warning "API health check failed"
    }
}
else {
    Write-Warning "Could not determine API URL for verification"
}

# 4.4 Summary
Write-Header "Deployment Summary"

Write-ColorOutput Green "Auto AGI Builder has been successfully deployed!"
Write-Output ""
Write-Output "Deployment URL: $deployUrl"
Write-Output ""
Write-Output "Next Steps:"
Write-Output "  1. Verify the application in your browser"
Write-Output "  2. Test the authentication flow by logging in"
Write-Output "  3. Check all major features are working correctly"
Write-Output "  4. Monitor error logs in the Vercel dashboard"
Write-Output ""
Write-ColorOutput Yellow "Don't forget to:"
Write-Output "  • Set up monitoring and alerts"
Write-Output "  • Configure proper DNS if using a custom domain"
Write-Output "  • Run the security audit script (security-audit.js) against production"
Write-Output "  • Run the performance script (performance-optimization.js) against production"
Write-Output ""
Write-ColorOutput Blue "Documentation is available at:" "$deployUrl/docs"

# End of script
exit 0
