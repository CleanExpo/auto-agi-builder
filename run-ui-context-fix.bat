@echo off
echo ============================================================
echo    UI Context Provider Fix with MCP Integration
echo    Implements SSR-safe context providers for Next.js
echo ============================================================
echo.

echo Running fix-ui-context-integrated.js script...
node fix-ui-context-integrated.js

echo.
echo If successful, you can test the changes with:
echo cd frontend
echo npm run dev
echo.
echo Then deploy to Vercel with:
echo cd frontend
echo vercel --prod
echo.
pause
