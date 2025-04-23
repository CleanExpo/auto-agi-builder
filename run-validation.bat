@echo off
REM Auto AGI Builder - Comprehensive Validation Runner for Windows
REM This script runs the Sequential Thinking MCP validation tool and generates a report

echo 🚀 Auto AGI Builder - Comprehensive Validation
echo ==============================================

REM Check if node is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ Error: Node.js is not installed. Please install Node.js to run the validation tool.
    exit /b 1
)

REM Check if sequential-thinking-mcp.js exists
if not exist "sequential-thinking-mcp.js" (
    echo ❌ Error: sequential-thinking-mcp.js not found. Make sure you run this script from the directory containing the validation tool.
    exit /b 1
)

REM Create reports directory if it doesn't exist
if not exist "validation-reports" (
    echo 📁 Creating validation-reports directory...
    mkdir validation-reports
)

REM Generate timestamp for the report file
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /format:list') do set datetime=%%I
set TIMESTAMP=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%_%datetime:~8,2%-%datetime:~10,2%-%datetime:~12,2%
set REPORT_FILE=validation-reports\validation-report_%TIMESTAMP%.md

echo 🔍 Running validation...
echo.

REM Run the validation tool
node sequential-thinking-mcp.js --report > "%REPORT_FILE%"

REM Check if the report was generated successfully
if %ERRORLEVEL% equ 0 (
    echo.
    echo ✅ Validation completed successfully!
    echo 📄 Report generated: %REPORT_FILE%
    
    REM Count issues by severity - Windows version (simpler)
    echo.
    echo 📊 Issue Summary has been generated in the report.
    
    REM Open the report
    start "" "%REPORT_FILE%"
    
    echo.
    echo 📚 Next Steps:
    echo 1. Review the validation report
    echo 2. Address critical issues first
    echo 3. Update implementation based on recommendations
    echo 4. Re-run validation to track progress
    
    exit /b 0
) else (
    echo.
    echo ❌ Validation failed. Please check the error message above.
    exit /b 1
)
