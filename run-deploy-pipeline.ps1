# Auto AGI Builder Deployment Pipeline (PowerShell Version)
# This script provides the same functionality as run-deploy-pipeline.bat but is optimized for PowerShell

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "AUTO AGI BUILDER DEPLOYMENT PIPELINE" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This script will run the full deployment pipeline:"
Write-Host "1. Configure environment (DB, Storage, Auth)"
Write-Host "2. Build and prepare deployment"
Write-Host "3. Deploy to Vercel"
Write-Host "4. Verify deployment"
Write-Host "5. Commit and push changes to Git"
Write-Host ""

# Check if the required scripts exist
$missingScripts = 0
$requiredScripts = @(
    "database-setup.bat",
    "storage-setup.bat", 
    "auth-setup.bat", 
    "full-deploy.bat", 
    "verify-deployment.bat", 
    "git-commit-and-push.bat"
)

foreach ($script in $requiredScripts) {
    if (-not (Test-Path $script)) {
        Write-Host "ERROR: $script not found" -ForegroundColor Red
        $missingScripts = 1
    }
}

if ($missingScripts -ne 0) {
    Write-Host ""
    Write-Host "One or more required scripts are missing." -ForegroundColor Red
    Write-Host "Please ensure all deployment toolkit scripts are in the current directory." -ForegroundColor Red
    exit 1
}

Write-Host "Choose deployment environment:"
Write-Host "1. Production"
Write-Host "2. Staging"
Write-Host "3. Development"
Write-Host ""

$envChoice = Read-Host "Enter your choice (1-3)"

switch ($envChoice) {
    "1" {
        $environment = "production"
        $envDisplay = "Production"
    }
    "2" {
        $environment = "staging"
        $envDisplay = "Staging" 
    }
    "3" {
        $environment = "development"
        $envDisplay = "Development"
    }
    default {
        Write-Host "Invalid choice. Defaulting to development." -ForegroundColor Yellow
        $environment = "development"
        $envDisplay = "Development"
    }
}

Write-Host ""
Write-Host "Selected environment: $envDisplay" -ForegroundColor Green
Write-Host ""

# Choose which configurations to run
Write-Host "Select which configurations to run:"
Write-Host "1. Database setup"
Write-Host "2. Storage setup"
Write-Host "3. Authentication setup"
Write-Host "4. All of the above"
Write-Host "5. Skip configuration (use existing)"
Write-Host ""

$configChoice = Read-Host "Enter your choice (1-5)"

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Step 1: Environment Configuration" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

switch ($configChoice) {
    "1" {
        Write-Host "Running database setup..." -ForegroundColor Yellow
        & .\database-setup.bat
    }
    "2" {
        Write-Host "Running storage setup..." -ForegroundColor Yellow
        & .\storage-setup.bat
    }
    "3" {
        Write-Host "Running authentication setup..." -ForegroundColor Yellow
        & .\auth-setup.bat
    }
    "4" {
        Write-Host "Running all configuration scripts..." -ForegroundColor Yellow
        
        Write-Host ""
        Write-Host "--- Database Configuration ---" -ForegroundColor Yellow
        Write-Host ""
        & .\database-setup.bat
        
        Write-Host ""
        Write-Host "--- Storage Configuration ---" -ForegroundColor Yellow
        Write-Host ""
        & .\storage-setup.bat
        
        Write-Host ""
        Write-Host "--- Authentication Configuration ---" -ForegroundColor Yellow
        Write-Host ""
        & .\auth-setup.bat
    }
    "5" {
        Write-Host "Skipping configuration. Using existing settings." -ForegroundColor Yellow
    }
    default {
        Write-Host "Invalid choice. Skipping configuration." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Step 2: Build and Prepare Deployment" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Run the full deployment preparation
Write-Host "Running full deployment preparation..." -ForegroundColor Yellow
& .\full-deploy.bat

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Deployment preparation failed. Pipeline aborted." -ForegroundColor Red
    Write-Host "Review errors above and try again." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Step 3: Deploy to Vercel" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Check if we need to deploy frontend and backend separately
$deployBoth = Read-Host "Do you want to deploy both frontend and backend components? (Y for both, F for frontend only, B for backend only, N to skip deployment)"

if ($deployBoth -eq "Y" -or $deployBoth -eq "y") {
    # Deploy backend
    Write-Host ""
    Write-Host "Deploying backend API..." -ForegroundColor Yellow
    Push-Location deployment\backend
    vercel --prod --name auto-agi-api-$environment
    Pop-Location
    
    # Deploy frontend
    Write-Host ""
    Write-Host "Deploying frontend application..." -ForegroundColor Yellow
    Push-Location deployment\frontend
    vercel --prod --name auto-agi-builder-$environment
    Pop-Location
}
elseif ($deployBoth -eq "F" -or $deployBoth -eq "f") {
    # Deploy frontend only
    Write-Host ""
    Write-Host "Deploying frontend application only..." -ForegroundColor Yellow
    Push-Location deployment\frontend
    vercel --prod --name auto-agi-builder-$environment
    Pop-Location
}
elseif ($deployBoth -eq "B" -or $deployBoth -eq "b") {
    # Deploy backend only
    Write-Host ""
    Write-Host "Deploying backend API only..." -ForegroundColor Yellow
    Push-Location deployment\backend
    vercel --prod --name auto-agi-api-$environment
    Pop-Location
}
else {
    Write-Host "Skipping deployment step." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Step 4: Verify Deployment" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

$verifyDeploy = Read-Host "Do you want to verify the deployment? (Y for yes, any other key to skip)"

if ($verifyDeploy -eq "Y" -or $verifyDeploy -eq "y") {
    Write-Host "Running deployment verification..." -ForegroundColor Yellow
    & .\verify-deployment.bat
}

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Step 5: Commit and Push Changes" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

$gitCommit = Read-Host "Do you want to commit and push changes to Git? (Y for yes, any other key to skip)"

if ($gitCommit -eq "Y" -or $gitCommit -eq "y") {
    Write-Host "Running Git operations..." -ForegroundColor Yellow
    & .\git-commit-and-push.bat
}

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Deployment Pipeline Complete" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Summary:"
Write-Host "- Environment: $envDisplay"
Write-Host "- Configuration: Option $configChoice selected"
Write-Host "- Deployment: $deployBoth"
Write-Host "- Verification: $verifyDeploy"
Write-Host "- Git Operations: $gitCommit"
Write-Host ""

Write-Host "Deployment pipeline completed successfully!" -ForegroundColor Green
Write-Host ""

Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
