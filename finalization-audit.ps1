# Auto AGI Builder - Finalization Audit Script
# This script performs a comprehensive audit of the codebase

Write-Host "===== Auto AGI Builder - Finalization Audit =====" -ForegroundColor Green
Write-Host "Scanning codebase for issues..." -ForegroundColor Cyan

$projectPath = "$env:USERPROFILE\OneDrive - Disaster Recovery\1111\Auto AGI Builder"
$outputFile = "audit-report.md"

# Initialize the audit report
$auditReport = @"
# Auto AGI Builder - Finalization Audit Report
Generated on $(Get-Date)

## 1. TODO and Placeholder Items
"@

# Define file types to search
$fileExtensions = @("*.js", "*.py", "*.json", "*.md", "*.html", "*.css", "*.jsx", "*.ts", "*.tsx")
$searchPatterns = @("TODO", "FIXME", "placeholder", "PLACEHOLDER", "XXX", "PENDING", "Not implemented")

Write-Host "Searching for TODOs and placeholders..." -ForegroundColor Yellow
$todoItems = @()

foreach ($ext in $fileExtensions) {
    $files = Get-ChildItem -Path $projectPath -Recurse -Filter $ext -File
    foreach ($file in $files) {
        $lineNumber = 0
        $content = Get-Content -Path $file.FullName
        foreach ($line in $content) {
            $lineNumber++
            foreach ($pattern in $searchPatterns) {
                if ($line -match $pattern) {
                    $relPath = $file.FullName.Replace("$projectPath\", "")
                    $todoItems += [PSCustomObject]@{
                        FilePath = $relPath
                        LineNumber = $lineNumber
                        Content = $line.Trim()
                        Pattern = $pattern
                    }
                }
            }
        }
    }
}

# Add TODO items to the report
if ($todoItems.Count -gt 0) {
    $auditReport += "`n`nFound $($todoItems.Count) TODO/placeholder items:`n"
    foreach ($item in $todoItems) {
        $auditReport += "`n- **$($item.FilePath):$($item.LineNumber)**`n  `"$($item.Content)`"`n"
    }
} else {
    $auditReport += "`n`nNo TODO or placeholder items found.`n"
}

# Check for hardcoded values that should be environment variables
$auditReport += "`n## 2. Potential Hardcoded Values`n"
Write-Host "Checking for hardcoded values..." -ForegroundColor Yellow

$hardcodedPatterns = @(
    "api.openai.com",
    "sk-[a-zA-Z0-9]{32,}",
    "https://api\.",
    "amazonaws\.com",
    "GOOGLE_APPLICATION_CREDENTIALS",
    "AIza[a-zA-Z0-9_-]{35}",
    "gmail\.com",
    "smtp\.",
    "password",
    "apiKey",
    "token",
    "secret"
)

$hardcodedValues = @()

foreach ($ext in $fileExtensions) {
    $files = Get-ChildItem -Path $projectPath -Recurse -Filter $ext -File
    foreach ($file in $files) {
        # Skip .env files
        if ($file.Name -match "\.env") { continue }
        
        $lineNumber = 0
        $content = Get-Content -Path $file.FullName
        foreach ($line in $content) {
            $lineNumber++
            foreach ($pattern in $hardcodedPatterns) {
                if ($line -match $pattern) {
                    $relPath = $file.FullName.Replace("$projectPath\", "")
                    $hardcodedValues += [PSCustomObject]@{
                        FilePath = $relPath
                        LineNumber = $lineNumber
                        Content = $line.Trim()
                        Pattern = $pattern
                    }
                }
            }
        }
    }
}

if ($hardcodedValues.Count -gt 0) {
    $auditReport += "`nFound $($hardcodedValues.Count) potential hardcoded values:`n"
    foreach ($item in $hardcodedValues) {
        $auditReport += "`n- **$($item.FilePath):$($item.LineNumber)**`n  `"$($item.Content)`"`n"
    }
} else {
    $auditReport += "`nNo hardcoded values found.`n"
}

# Check API endpoints
$auditReport += "`n## 3. API Endpoint Verification`n"
Write-Host "Verifying API endpoints..." -ForegroundColor Yellow

$apiPath = "$projectPath\app\api\v1\endpoints"
$apiFiles = Get-ChildItem -Path $apiPath -Filter "*.py"
$apiEndpoints = @()

foreach ($file in $apiFiles) {
    $content = Get-Content -Path $file.FullName
    $lineNumber = 0
    foreach ($line in $content) {
        $lineNumber++
        if ($line -match "@router\.") {
            $relPath = $file.Name
            $apiEndpoints += [PSCustomObject]@{
                FilePath = $relPath
                LineNumber = $lineNumber
                Endpoint = $line.Trim()
            }
        }
    }
}

$auditReport += "`nFound $($apiEndpoints.Count) API endpoints:`n"
foreach ($endpoint in $apiEndpoints) {
    $auditReport += "`n- **$($endpoint.FilePath):$($endpoint.LineNumber)**`n  `"$($endpoint.Endpoint)`"`n"
}

# Check for missing components referenced in navigation
$auditReport += "`n## 4. Navigation and Component Verification`n"
Write-Host "Checking for missing components..." -ForegroundColor Yellow

$layoutPath = "$projectPath\frontend\components\layout"
$sidebarPath = "$layoutPath\Sidebar.js"
$navbarPath = "$layoutPath\Navbar.js"

$navItems = @()

if (Test-Path $sidebarPath) {
    $content = Get-Content -Path $sidebarPath
    $lineNumber = 0
    foreach ($line in $content) {
        $lineNumber++
        if ($line -match "href=" -or $line -match "to=") {
            $navItems += [PSCustomObject]@{
                FilePath = "frontend\components\layout\Sidebar.js"
                LineNumber = $lineNumber
                Content = $line.Trim()
            }
        }
    }
}

if (Test-Path $navbarPath) {
    $content = Get-Content -Path $navbarPath
    $lineNumber = 0
    foreach ($line in $content) {
        $lineNumber++
        if ($line -match "href=" -or $line -match "to=") {
            $navItems += [PSCustomObject]@{
                FilePath = "frontend\components\layout\Navbar.js"
                LineNumber = $lineNumber
                Content = $line.Trim()
            }
        }
    }
}

$auditReport += "`nFound $($navItems.Count) navigation items:`n"
foreach ($item in $navItems) {
    $auditReport += "`n- **$($item.FilePath):$($item.LineNumber)**`n  `"$($item.Content)`"`n"
}

# Save the audit report
$auditReport | Out-File -FilePath $outputFile
Write-Host "`nAudit complete. Report saved to $outputFile" -ForegroundColor Green
Write-Host "===== End of Audit =====" -ForegroundColor Green
