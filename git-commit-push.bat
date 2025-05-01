@echo off
echo ============================================================
echo    Committing and Pushing UI Provider Fixes to GitHub
echo ============================================================

echo Adding fix script files to git...
git add fix-error-boundary.js
git add fix-type-exports.js
git add fix-mcp-provider.js
git add fix-mcp-registry-export.js
git add run-type-fix.bat
git add complete-fix.bat
git add master-fix-script.bat
git add deployment/frontend/lib/mcp/error-boundary.tsx
git add deployment/frontend/lib/mcp/index.ts
git add deployment/frontend/next.config.js

echo Creating commit with UI Provider fixes...
git commit -m "Fix UIProvider SSR error by adding proper error boundary, fixing type exports, and disabling static generation"

echo Pushing changes to GitHub repository...
git push

echo ============================================================
echo    Changes Committed and Pushed to GitHub
echo ============================================================
echo The following files have been committed:
echo - JavaScript fix scripts for error-boundary, type exports, providers
echo - Batch files for running the fixes
echo - Updated MCP library files with fixed implementations
echo - Modified Next.js configuration
echo.
echo Commit message: "Fix UIProvider SSR error by adding proper error boundary, fixing type exports, and disabling static generation"
echo.
pause
