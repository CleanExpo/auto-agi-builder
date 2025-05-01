# PowerShell deployment script for SSR UI Provider fix
# This script can be run from any location

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Auto AGI Builder Deployment Script" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check if frontend-minimal directory exists
$frontendMinimalPath = Join-Path -Path $PSScriptRoot -ChildPath "frontend-minimal"
if (-not (Test-Path $frontendMinimalPath)) {
    Write-Host "Error: frontend-minimal directory not found!" -ForegroundColor Red
    Write-Host "Please make sure you're running this script from the correct location." -ForegroundColor Red
    exit 1
}

# Navigate to frontend-minimal
Write-Host "Navigating to frontend-minimal directory..." -ForegroundColor Yellow
Set-Location -Path $frontendMinimalPath

# Check for package.json
if (-not (Test-Path "package.json")) {
    Write-Host "Error: package.json not found in frontend-minimal directory!" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: npm install failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Dependencies installed successfully." -ForegroundColor Green

# Check for Vercel CLI
try {
    $vercelVersion = Invoke-Expression "vercel --version"
    Write-Host "Vercel CLI is installed: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to install Vercel CLI!" -ForegroundColor Red
        exit 1
    }
    Write-Host "Vercel CLI installed successfully." -ForegroundColor Green
}

# Build the project
Write-Host "Building the project..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Build successful!" -ForegroundColor Green

# Deploy to Vercel
Write-Host "Running Vercel deployment..." -ForegroundColor Yellow
Write-Host ""

# Login to Vercel
Write-Host "Step 1: Logging in to Vercel..." -ForegroundColor Yellow
vercel login

# Link project to Vercel
Write-Host ""
Write-Host "Step 2: Linking project to Vercel..." -ForegroundColor Yellow
vercel link

# Deploy to production
Write-Host ""
Write-Host "Step 3: Deploying to production..." -ForegroundColor Yellow
vercel --prod

Write-Host ""
Write-Host "Deployment process completed." -ForegroundColor Green
Write-Host ""

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
