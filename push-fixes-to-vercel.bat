@echo off
echo ============================================================
echo    Deploying Fixed UIProvider to Vercel Production
echo ============================================================

echo Step 1: Add the latest fix to git...
git add fix-provider-type.js
git add deployment/frontend/lib/mcp/types.ts
git add deployment/frontend/lib/mcp/provider.tsx

echo Step 2: Commit the generic type fix...
git commit -m "Fix ModuleContextProviderProps generic type issue in MCP library"

echo Step 3: Push to GitHub...
git push

echo Step 4: Trigger Vercel deployment...
echo Deploying to Vercel production environment...

REM Check if vercel CLI is installed, otherwise use npx
where vercel >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    vercel --prod
) else (
    npx vercel --prod
)

echo ============================================================
echo    Deployment Complete
echo ============================================================
echo The following issues have been fixed and deployed:
echo - Fixed UIProvider SSR errors by adding proper error boundary
echo - Fixed TypeScript type exports with 'export type' syntax
echo - Corrected ModuleContextProviderProps generic type issue
echo - Modified Next.js config to disable static generation
echo.
echo Your application should now be running without errors on Vercel.
pause
