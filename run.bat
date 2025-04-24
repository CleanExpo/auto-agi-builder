@echo off
echo ===================================================
echo        Auto AGI Builder - Startup Script
echo ===================================================

echo.
echo Step 1: Installing Python dependencies...
pip install -r requirements.txt

echo.
echo Step 2: Creating necessary directories if they don't exist...
if not exist "app" mkdir app
if not exist "app\services" mkdir app\services
if not exist "app\services\ai" mkdir app\services\ai
if not exist "frontend" mkdir frontend

echo.
echo Step 3: Installing Node.js dependencies...
if exist "frontend\package.json" (
    cd frontend
    call npm install
    cd ..
    echo Frontend dependencies installed successfully!
) else (
    echo No frontend package.json found. Skipping npm install.
)

echo.
echo Step 4: Checking core files...
set MISSING_FILES=0

if not exist "builder_core.py" (
    echo ERROR: builder_core.py is missing!
    set MISSING_FILES=1
)
if not exist "frontend_builder.py" (
    echo ERROR: frontend_builder.py is missing!
    set MISSING_FILES=1
)
if not exist "ai_builder.py" (
    echo ERROR: ai_builder.py is missing!
    set MISSING_FILES=1
)
if not exist "autonomous_builder_modular.py" (
    echo ERROR: autonomous_builder_modular.py is missing!
    set MISSING_FILES=1
)

if %MISSING_FILES%==1 (
    echo.
    echo Some core files are missing. Please ensure all required files are present.
    echo See README-builder.md for more information.
    pause
    exit /b 1
)

echo All core files present!

echo.
echo Step 5: Checking/creating .env file...
if not exist ".env" (
    echo Creating template .env file...
    echo # Auto AGI Builder Environment Variables > .env
    echo. >> .env
    echo # API Keys >> .env
    echo OPENAI_API_KEY=your-openai-api-key-here >> .env
    echo. >> .env
    echo # Database Configuration >> .env
    echo DATABASE_URL=sqlite:///./auto_agi_builder.db >> .env
    echo. >> .env
    echo # Frontend Configuration >> .env
    echo NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1 >> .env
    echo NEXT_PUBLIC_SITE_URL=http://localhost:3000 >> .env
    echo. >> .env
    echo # Authentication >> .env
    echo JWT_SECRET=generate-a-secure-random-secret-key >> .env
    echo JWT_ALGORITHM=HS256 >> .env
    echo ACCESS_TOKEN_EXPIRE_MINUTES=30 >> .env
    
    echo .env template created. Please edit with your actual values.
    echo.
) else (
    echo .env file already exists.
)

echo.
echo Step 6: Starting the application...
echo Creating demo project...
python autonomous_builder_modular.py setup --name demo_project

echo.
echo ===================================================
echo Auto AGI Builder is ready!
echo.
echo To run common commands:
echo.
echo   * Generate prototype:
echo     python autonomous_builder_modular.py generate --requirements requirements.txt --output prototype
echo.
echo   * Analyze document:
echo     python autonomous_builder_modular.py analyze --document path/to/document.txt
echo.
echo   * Improve code:
echo     python autonomous_builder_modular.py improve --code path/to/code.py
echo.
echo   * Deploy project:
echo     python autonomous_builder_modular.py deploy --target vercel
echo ===================================================
echo.

pause
