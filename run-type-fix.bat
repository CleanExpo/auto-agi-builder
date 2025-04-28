@echo off
echo ===================================================
echo    Fixing TypeScript type export issues
echo ===================================================

node fix-type-exports.js

echo ===================================================
echo    Type exports fixed!
echo ===================================================
echo The index.ts file has been updated to properly export types
echo using 'export type' syntax which is required when 
echo TypeScript's isolatedModules flag is enabled.
echo.
pause
