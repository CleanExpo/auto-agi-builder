@echo off
echo ===================================
echo PUBLIC VERCEL DEPLOYMENT WITH ENHANCED LANDING PAGE
echo ===================================
echo.

REM Clean up previous Vercel configuration if it exists
if exist .vercel (
  echo Removing existing Vercel configuration...
  rd /s /q .vercel
)

echo Deploying enhanced landing page with:
echo - 3D shadow effects
echo - Modern animations
echo - SEO optimization
echo - Public access (authorization disabled)
echo - Custom domain configuration preparation
echo.

REM Deploy with accessibility settings
echo Deploying to Vercel with public accessibility...
vercel --public --prod

echo.
echo ===================================
echo Deployment process completed
echo ===================================
echo.
echo To test public access (no authentication required):
echo 1. Open the deployment URL in an incognito/private window
echo 2. Verify that the page loads without login prompts
echo.
echo To configure your custom domain:
echo 1. Visit the Vercel dashboard for this project
echo 2. Go to Project Settings → Domains
echo 3. Add your custom domain and follow the DNS configuration steps
echo.
echo For any authentication issues:
echo 1. Check project settings in Vercel dashboard
echo 2. Ensure "Authentication" is set to "disabled" or "not required"
echo 3. Verify the vercel.json contains "authentication: { required: false }"
echo.

pause
