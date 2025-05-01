@echo off
echo ============================================================
echo    DNS and Domain Configuration Verification Tool
echo ============================================================

echo Installing required npm packages...
npm install chalk --no-fund --no-audit

echo.
echo Running fix-domain-issues.js to check your domain configuration...
node fix-domain-issues.js

echo.
echo ============================================================
echo    Vercel Domain Configuration Checklist
echo ============================================================
echo.
echo Please ensure:
echo 1. Your domain is correctly added in your Vercel project settings
echo 2. The DNS records are correctly configured with your domain provider
echo    - A record for apex domain (example.com) pointing to 76.76.21.21
echo    - CNAME record for www subdomain (www.example.com) pointing to cname.vercel-dns.com
echo 3. Your vercel.json has the correct outputDirectory that matches your build output
echo 4. Check the deployment logs for any build errors
echo.
echo Remember that DNS propagation can take up to 48 hours in some cases.
echo If needed, clear your browser cache and local DNS cache.
echo.
echo ============================================================
echo    Finishing Checks
echo ============================================================
echo.
echo To verify DNS configuration, try these commands:
echo   nslookup autoagibuilder.app
echo   nslookup www.autoagibuilder.app
echo.
echo Manual verification:
echo 1. Visit https://vercel.com/dashboard
echo 2. Select your project
echo 3. Go to Settings > Domains
echo 4. Check that your domain shows as "Valid Configuration"
echo.
echo To force a redeployment:
echo   vercel --prod
echo.
pause
