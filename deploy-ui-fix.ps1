# PowerShell script for deploying the UI Context Provider fix
# Works directly in PowerShell without special execution policy changes

# Show header
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Auto AGI Builder Deployment Script" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check if directory exists and navigate to it
$frontendMinimalDir = Join-Path -Path $PSScriptRoot -ChildPath "frontend-minimal"
Write-Host "Navigating to frontend-minimal directory..." -ForegroundColor Yellow
if (-not (Test-Path $frontendMinimalDir)) {
    Write-Host "Error: frontend-minimal directory not found at: $frontendMinimalDir" -ForegroundColor Red
    Write-Host "Current location: $PWD" -ForegroundColor Yellow
    exit 1
}

Set-Location -Path $frontendMinimalDir

# Check for package.json
if (-not (Test-Path "package.json")) {
    Write-Host "Error: package.json not found in frontend-minimal directory!" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
& npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: npm install failed!" -ForegroundColor Red
    exit 1
}

# Install development dependencies
Write-Host "Installing development dependencies..." -ForegroundColor Yellow
& npm install --save-dev @types/react @types/node

# Check for Vercel CLI
$vercelInstalled = $null
try {
    $vercelInstalled = & npm list -g vercel
} catch {}

if (-not ($vercelInstalled -match "vercel@")) {
    Write-Host "Installing Vercel CLI..." -ForegroundColor Yellow
    & npm install -g vercel
}

# Build the project
Write-Host "Building the project..." -ForegroundColor Yellow
& npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Build successful!" -ForegroundColor Green

# Deploy to Vercel
Write-Host ""
Write-Host "Running Vercel deployment..." -ForegroundColor Yellow
Write-Host ""

# Login to Vercel
Write-Host "Step 1: Logging in to Vercel..." -ForegroundColor Yellow
& vercel login

# Link project to Vercel
Write-Host ""
Write-Host "Step 2: Linking project to Vercel..." -ForegroundColor Yellow
& vercel link

# Deploy to production
Write-Host ""
Write-Host "Step 3: Deploying to production..." -ForegroundColor Yellow
& vercel --prod

Write-Host ""
Write-Host "Deployment process completed." -ForegroundColor Green
Write-Host ""

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
