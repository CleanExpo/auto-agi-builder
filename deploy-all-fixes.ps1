# Auto AGI Builder - Deploy All Fixes Script (PowerShell Version)

Write-Host "======================================================" -ForegroundColor Blue
Write-Host "   Auto AGI Builder - Deploy All Fixes Script" -ForegroundColor Blue
Write-Host "======================================================" -ForegroundColor Blue
Write-Host ""

# Step 1: Running UI Provider Fix
Write-Host "Step 1: Running UI Provider Fix..." -ForegroundColor Yellow
Write-Host "-------------------------"
node fix-ui-provider.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error fixing UI Provider!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Step 2: Running Vercel JSON Configuration Fix
Write-Host "`nStep 2: Running Vercel JSON Configuration Fix..." -ForegroundColor Yellow
Write-Host "-------------------------"
node fix-vercel-json.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error fixing vercel.json!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Step 3: Running Domain Verification
Write-Host "`nStep 3: Running Domain Verification..." -ForegroundColor Yellow
Write-Host "-------------------------"
node fix-domain-issues.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error in domain verification!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Step 4: Setting deployment variables
Write-Host "`nStep 4: Setting deployment variables..." -ForegroundColor Yellow
Write-Host "------------------------"
$env:DEPLOYMENT_TARGET = "production"
$env:DISABLE_STATIC_GENERATION = "true"

# Step 5: Building project
Write-Host "`nStep 5: Building project..." -ForegroundColor Yellow
Write-Host "------------------------"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error building project!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Step 6: Deploying to Vercel
Write-Host "`nStep 6: Deploying to Vercel..." -ForegroundColor Yellow
Write-Host "------------------------"
Write-Host "This step will deploy the project to Vercel."
Write-Host "Please make sure you have the Vercel CLI installed and are logged in."
Write-Host ""
Write-Host "To install Vercel CLI: npm install -g vercel"
Write-Host "To login: vercel login"
Write-Host ""

$deployChoice = Read-Host "Do you want to proceed with deployment? (Y/N)"
if ($deployChoice -ne "Y" -and $deployChoice -ne "y") {
    Write-Host "Skipping deployment." -ForegroundColor Yellow
}
else {
    vercel --prod
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error deploying to Vercel!" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Step 7: Verifying domain configuration
Write-Host "`nStep 7: Verifying domain configuration..." -ForegroundColor Yellow
Write-Host "------------------------"
Write-Host ""
Write-Host "Please check the following:" -ForegroundColor Cyan
Write-Host "1. Go to the Vercel dashboard and check domain configurations"
Write-Host "2. Verify DNS records are correctly set up"
Write-Host "3. A record for autoagibuilder.app should point to 76.76.21.21"
Write-Host "4. CNAME record for www.autoagibuilder.app should point to cname.vercel-dns.com"
Write-Host ""
Write-Host "For detailed instructions, check DOMAIN-TROUBLESHOOTING-GUIDE.md"

# Final message
Write-Host "`n======================================================" -ForegroundColor Blue
Write-Host "   Deployment process completed!" -ForegroundColor Blue
Write-Host "======================================================" -ForegroundColor Blue
Write-Host ""
Write-Host "If you encounter any issues, please refer to the following guides:" -ForegroundColor Yellow
Write-Host "- DOMAIN-TROUBLESHOOTING-GUIDE.md - For DNS and domain configuration issues"
Write-Host "- UI-PROVIDER-SSR-SOLUTION.md - For UI Provider and SSR issues"
Write-Host ""
Write-Host "Remember that DNS changes may take up to 48 hours to fully propagate." -ForegroundColor Yellow
Write-Host ""

Read-Host "Press Enter to continue"
