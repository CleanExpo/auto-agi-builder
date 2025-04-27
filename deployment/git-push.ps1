# PowerShell script to push changes to GitHub
# Avoids the batch file input issues with PowerShell

Write-Host "===== GitHub Push Utility =====" -ForegroundColor Cyan
Write-Host "This script will push committed changes to your GitHub repository" -ForegroundColor Cyan
Write-Host ""

# Prompt for branch name
$branch = Read-Host "Enter the branch name you want to push to (e.g., main)"

Write-Host ""
Write-Host "Pushing to $branch..." -ForegroundColor Yellow
git push origin $branch

Write-Host ""
Write-Host "===== Next Steps =====" -ForegroundColor Green
Write-Host "1. Configure your Vercel project following the instructions in the deployment guide"
Write-Host "2. Set up the GitHub secrets for automatic deployments"
Write-Host "3. Your site will automatically deploy when changes are pushed to GitHub"
Write-Host ""

Write-Host "Press any key to exit..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
