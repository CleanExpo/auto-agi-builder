# Auto AGI Builder - Context Compression PowerShell Script
# This script compresses large files for deployment or LLM context windows

# Display header
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "AUTO AGI BUILDER CONTEXT COMPRESSION" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This script will:" -ForegroundColor White
Write-Host "1. Compress large files for deployment or LLM context" -ForegroundColor White
Write-Host "2. Integrate with deployment process" -ForegroundColor White
Write-Host "3. Create compressed versions preserving original files" -ForegroundColor White
Write-Host ""

# Start timing
$startTime = Get-Date
Write-Host "Start time: $startTime" -ForegroundColor White
Write-Host ""

# Determine environment
Write-Host "Select environment:" -ForegroundColor Yellow
Write-Host "1. Development" -ForegroundColor White
Write-Host "2. Staging" -ForegroundColor White
Write-Host "3. Production" -ForegroundColor White
Write-Host "4. LLM (context optimization)" -ForegroundColor White

$envChoice = Read-Host "Enter choice (1-4)"

switch ($envChoice) {
    "1" { 
        $env:NODE_ENV = "development" 
        Write-Host "Setting environment to DEVELOPMENT" -ForegroundColor Green
    }
    "2" { 
        $env:NODE_ENV = "staging" 
        Write-Host "Setting environment to STAGING" -ForegroundColor Green
    }
    "3" { 
        $env:NODE_ENV = "production" 
        Write-Host "Setting environment to PRODUCTION" -ForegroundColor Green
    }
    "4" { 
        $env:NODE_ENV = "llm" 
        Write-Host "Setting environment to LLM (context optimization)" -ForegroundColor Green
    }
    default { 
        Write-Host "Invalid choice. Using production as default." -ForegroundColor Yellow
        $env:NODE_ENV = "production" 
    }
}

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "RUNNING COMPRESSION" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js installation
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
}
catch {
    Write-Host "ERROR: Node.js is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if required files exist
$requiredFiles = @(
    "deployment-compress.js",
    "middle-out-compress.js",
    "compression-config.js"
)

foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        Write-Host "ERROR: File $file not found." -ForegroundColor Red
        Write-Host "Please make sure you are running this script from the project root." -ForegroundColor Red
        exit 1
    }
}

# Run deployment compression
Write-Host "Running deployment compression for $env:NODE_ENV environment..." -ForegroundColor White
try {
    node deployment-compress.js
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Compression failed with error code $LASTEXITCODE." -ForegroundColor Red
        exit $LASTEXITCODE
    }
}
catch {
    Write-Host "ERROR: Compression failed with exception: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "FINISHING UP" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Calculate elapsed time
$endTime = Get-Date
$elapsedTime = $endTime - $startTime

Write-Host "Start time: $startTime" -ForegroundColor White
Write-Host "End time: $endTime" -ForegroundColor White
Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "COMPRESSION SUMMARY" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Compression process completed." -ForegroundColor Green
Write-Host ""
Write-Host "Total compression time: $($elapsedTime.Hours) hours, $($elapsedTime.Minutes) minutes, $($elapsedTime.Seconds).$($elapsedTime.Milliseconds) seconds" -ForegroundColor White
Write-Host ""

# Ask if user wants to integrate with deployment
Write-Host "Would you like to proceed with deployment?" -ForegroundColor Yellow
$deployChoice = Read-Host "Enter Y to deploy, any other key to skip"

if ($deployChoice -eq "Y" -or $deployChoice -eq "y") {
    Write-Host ""
    Write-Host "===================================" -ForegroundColor Cyan
    Write-Host "STARTING DEPLOYMENT PROCESS" -ForegroundColor Cyan
    Write-Host "===================================" -ForegroundColor Cyan
    Write-Host ""
    
    if (Test-Path "unified-deploy.ps1") {
        Write-Host "Running unified deployment process..." -ForegroundColor White
        & .\unified-deploy.ps1
    }
    else {
        Write-Host "Running Vercel deployment..." -ForegroundColor White
        vercel --prod
    }
    
    Write-Host ""
    Write-Host "Deployment completed." -ForegroundColor Green
}

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "COMPRESSION PROCESS FINISHED" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

# Verify compressed resources
function Verify-CompressedResources {
    param (
        [string]$outputDir = "./compressed-output"
    )

    Write-Host ""
    Write-Host "===================================" -ForegroundColor Cyan
    Write-Host "VERIFYING COMPRESSED RESOURCES" -ForegroundColor Cyan
    Write-Host "===================================" -ForegroundColor Cyan
    Write-Host ""

    if (-not (Test-Path $outputDir)) {
        Write-Host "ERROR: Compressed output directory not found at: $outputDir" -ForegroundColor Red
        return $false
    }

    $compressedFiles = Get-ChildItem -Path $outputDir -Recurse -File

    if ($compressedFiles.Count -eq 0) {
        Write-Host "ERROR: No compressed files found in output directory" -ForegroundColor Red
        return $false
    }

    Write-Host "Found $($compressedFiles.Count) compressed files" -ForegroundColor Green

    # Verify file integrity
    $failedFiles = 0
    foreach ($file in $compressedFiles) {
        try {
            $content = Get-Content -Path $file.FullName -Raw -ErrorAction Stop
            if ([string]::IsNullOrEmpty($content)) {
                Write-Host "WARNING: Empty file detected: $($file.Name)" -ForegroundColor Yellow
                $failedFiles++
            }
        } catch {
            Write-Host "ERROR: Failed to read file: $($file.Name)" -ForegroundColor Red
            $failedFiles++
        }
    }

    if ($failedFiles -gt 0) {
        Write-Host "$failedFiles files failed verification" -ForegroundColor Red
        return $false
    }

    Write-Host "All compressed files verified successfully" -ForegroundColor Green
    return $true
}

# Ask if user wants to proceed to resource verification
Write-Host "Would you like to verify the compressed resources?" -ForegroundColor Yellow
$verifyChoice = Read-Host "Enter Y to verify, any other key to skip"

if ($verifyChoice -eq "Y" -or $verifyChoice -eq "y") {
    $verificationResult = Verify-CompressedResources
    if (-not $verificationResult) {
        Write-Host "Resource verification failed. Proceed with caution." -ForegroundColor Red
    } else {
        Write-Host "Resource verification completed successfully." -ForegroundColor Green
    }
}

# Ask if user wants to integrate with deployment
Write-Host "Would you like to proceed with deployment?" -ForegroundColor Yellow
$deployChoice = Read-Host "Enter Y to deploy, any other key to skip"

if ($deployChoice -eq "Y" -or $deployChoice -eq "y") {
    Write-Host ""
    Write-Host "===================================" -ForegroundColor Cyan
    Write-Host "STARTING DEPLOYMENT PROCESS" -ForegroundColor Cyan
    Write-Host "===================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Determine preferred deployment script path
    $unifiedDeployPsPath = "./unified-deploy.ps1"
    $unifiedDeployJsPath = "./unified-deploy.js"
    
    if (Test-Path $unifiedDeployPsPath) {
        Write-Host "Running unified deployment process (PowerShell)..." -ForegroundColor White
        & $unifiedDeployPsPath -CompressedResources $true
    }
    elseif (Test-Path $unifiedDeployJsPath) {
        Write-Host "Running unified deployment process (Node.js)..." -ForegroundColor White
        node $unifiedDeployJsPath --compressed-resources
    }
    else {
        Write-Host "Running Vercel deployment..." -ForegroundColor White
        vercel --prod
    }
    
    Write-Host ""
    Write-Host "Deployment completed." -ForegroundColor Green
}

# Ask if user wants to verify the deployment
Write-Host "Would you like to verify the deployment?" -ForegroundColor Yellow
$verifyDeployChoice = Read-Host "Enter Y to verify, any other key to skip"

if ($verifyDeployChoice -eq "Y" -or $verifyDeployChoice -eq "y") {
    Write-Host ""
    Write-Host "===================================" -ForegroundColor Cyan
    Write-Host "VERIFYING DEPLOYMENT" -ForegroundColor Cyan
    Write-Host "===================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Determine verification script path
    $verifyPsPath = "./verify-deployment.ps1"
    $verifyJsPath = "./scripts/verify-deployment.js"
    
    if (Test-Path $verifyPsPath) {
        Write-Host "Running deployment verification (PowerShell)..." -ForegroundColor White
        & $verifyPsPath -VerifyCompressedResources $true
    }
    elseif (Test-Path $verifyJsPath) {
        Write-Host "Running deployment verification (Node.js)..." -ForegroundColor White
        node $verifyJsPath --verify-compressed-resources
    }
    else {
        Write-Host "Verification script not found. Please check deployment manually." -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Verification completed." -ForegroundColor Green
}

# Wait for user acknowledgment
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
