@echo off
echo ===================================
echo DEPLOY DASHBOARD WITH UI ANIMATIONS
echo ===================================
echo.
echo This script will commit the enhanced dashboard UI with animations and deploy to Vercel.
echo.

REM Add the modified files to git
echo Adding changes to git...
git add frontend/components/common/LoadingSpinner.js
git add frontend/components/common/ResponsiveContainer.js
git add frontend/components/layout/PageWrapper.js
git add frontend/hooks/usePageTransition.js
git add frontend/styles/animation.css
git add frontend/pages/_app.js
git add frontend/pages/dashboard.js
git add frontend/docs/ui-animation-system.md
git add frontend/contexts/AnimationContext.js
git add frontend/components/settings/AnimationSettings.js
git add frontend/pages/settings/animations.js
git add frontend/components/effects/ParallaxSection.js
git add frontend/hooks/useIntersectionObserver.js
git add frontend/components/common/AnimatedModal.js
git add frontend/components/common/AnimatedButton.js

REM Commit the changes
echo Committing changes...
git commit -m "Enhancement: Add animation system and animated dashboard"

REM Push to remote repository
echo Pushing to remote repository...
git push origin main

REM Deploy to Vercel production
echo Deploying to Vercel...
vercel --prod

echo.
echo ===================================
echo DEPLOYMENT COMPLETED
echo ===================================
echo.
echo Please check the deployment URL to verify the dashboard and animation improvements.

pause
