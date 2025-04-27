# PowerShell script for setting up environment variables for Vercel deployment
Write-Host "Setting up environment variables for Vercel deployment..." -ForegroundColor Cyan
Write-Host ""

# Make sure we're in the right directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $scriptPath

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Run the environment setup script
Write-Host "Running environment setup script..." -ForegroundColor Cyan
node create-env-file.js

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Green
Write-Host "1. Copy these same values to your Vercel project environment variables" -ForegroundColor White
Write-Host "2. Set up GitHub repository secrets for automated deployments" -ForegroundColor White
Write-Host ""
Write-Host "See deployment/UPDATE-ENV-VARIABLES.md for detailed instructions." -ForegroundColor Cyan
Write-Host ""

Read-Host "Press Enter to exit"
