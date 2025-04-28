# PowerShell script to fix UI Provider issues for server-side rendering

Write-Host "Starting UI Provider SSR fix process..." -ForegroundColor Green

# Navigate to project directory
Set-Location -Path "deployment\frontend"

# Check if the directories exist, create if needed
if (-not (Test-Path -Path "components\common")) {
    New-Item -Path "components\common" -ItemType Directory -Force
    Write-Host "Created components\common directory" -ForegroundColor Yellow
}

if (-not (Test-Path -Path "contexts")) {
    New-Item -Path "contexts" -ItemType Directory -Force
    Write-Host "Created contexts directory" -ForegroundColor Yellow
}

# Apply the fixes
Write-Host "Applying UIContext fix..." -ForegroundColor Cyan
Copy-Item -Path "..\..\deployment\frontend\contexts\UIContext.js" -Destination "contexts\UIContext.js" -Force

Write-Host "Applying ErrorBoundary component fix..." -ForegroundColor Cyan
Copy-Item -Path "..\..\deployment\frontend\components\common\ErrorBoundary.js" -Destination "components\common\ErrorBoundary.js" -Force

Write-Host "Applying _app.js fix..." -ForegroundColor Cyan
Copy-Item -Path "..\..\deployment\frontend\pages\_app.js" -Destination "pages\_app.js" -Force

Write-Host "Applying next.config.js fix..." -ForegroundColor Cyan
Copy-Item -Path "..\..\deployment\frontend\next.config.js" -Destination "next.config.js" -Force

# Return to the original directory
Set-Location -Path "..\..\"

Write-Host "All UI Provider fixes have been applied!" -ForegroundColor Green
Write-Host "You can now run 'build-project.bat' to build the project." -ForegroundColor Green

# Wait for user to press a key before closing
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
