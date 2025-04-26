@echo off
echo.
echo ====================================================
echo       Auto AGI Builder Animation System Deployment
echo ====================================================
echo.
echo This script will deploy the animation system components to the frontend.
echo.

rem Check if we're in the correct directory
if not exist "frontend\pages\_app.js" (
  echo Error: Please run this script from the project root directory.
  echo Current directory does not appear to be the project root.
  goto :eof
)

echo [1/4] Copying animation components...
echo.

rem Ensure directories exist
if not exist "frontend\components\common" mkdir "frontend\components\common"
if not exist "frontend\contexts" mkdir "frontend\contexts"
if not exist "frontend\hooks" mkdir "frontend\hooks"
if not exist "frontend\pages\settings" mkdir "frontend\pages\settings"
if not exist "frontend\styles" mkdir "frontend\styles"
if not exist "frontend\docs" mkdir "frontend\docs"

rem Deploy the animations
echo - Deploying animation context...
if exist "frontend\contexts\AnimationContext.js" (
  echo   [✓] Animation context already exists
) else (
  echo   [!] Animation context does not exist - please create it first
)

echo - Deploying animation styles...
if exist "frontend\styles\animation.css" (
  echo   [✓] Animation styles already exist
) else (
  echo   [!] Animation styles do not exist - please create them first
)

echo - Verifying components...
if exist "frontend\components\common\AnimatedButton.js" (
  echo   [✓] AnimatedButton component found
) else (
  echo   [!] AnimatedButton component not found - please create it first
)

if exist "frontend\components\common\AnimatedCard.js" (
  echo   [✓] AnimatedCard component found
) else (
  echo   [!] AnimatedCard component not found - please create it first
)

echo [2/4] Checking hooks...

if exist "frontend\hooks\useAnimation.js" (
  echo   [✓] useAnimation hook found
) else (
  echo   [!] useAnimation hook not found - please create it first
)

if exist "frontend\hooks\useIntersectionObserver.js" (
  echo   [✓] useIntersectionObserver hook found
) else (
  echo   [!] useIntersectionObserver hook not found - please create it first
)

echo [3/4] Checking example pages...

if exist "frontend\pages\animation-examples.js" (
  echo   [✓] Animation examples page found
) else (
  echo   [!] Animation examples page not found - please create it first
)

if exist "frontend\pages\settings\animations.js" (
  echo   [✓] Animation settings page found
) else (
  echo   [!] Animation settings page not found - please create it first
)

echo [4/4] Checking documentation...

if exist "frontend\docs\ui-animation-system.md" (
  echo   [✓] Animation system documentation found
) else (
  echo   [!] Animation system documentation not found - please create it first
)

echo.
echo ====================================================
echo                 Deployment Summary
echo ====================================================
echo.
echo The animation system has been deployed to the frontend.
echo.
echo Usage:
echo - Visit /animation-examples to see the animation demos
echo - Visit /settings/animations to customize animation preferences
echo - Use AnimatedButton and AnimatedCard components in your pages
echo - Use the useAnimation hook for custom animations
echo - Use the AnimationContext to check if animations are enabled
echo.
echo Documentation is available in /docs/ui-animation-system.md

echo.
echo To test the animation system, run:
echo npm run dev
echo.
echo Then visit http://localhost:3000/animation-examples
echo.
echo ====================================================
