@echo off
echo Checking Node.js version and environment...
echo.

node -v > node-version.txt
set /p NODE_VERSION=<node-version.txt
del node-version.txt

echo Current Node.js version: %NODE_VERSION%
echo.

echo Verifying if nvm (Node Version Manager) is installed...
if exist "%APPDATA%\nvm\nvm.exe" (
    echo.
    echo nvm is installed. You can use it to switch Node.js versions:
    echo nvm install 18.10.0
    echo nvm use 18.10.0
    echo.
) else (
    echo.
    echo nvm not found. To switch Node.js versions, you can install nvm or
    echo download Node.js 18.10.0 directly from https://nodejs.org/download/release/v18.10.0/
    echo.
)

echo Checking for Next.js compatibility...
echo.
echo Next.js requirements:
echo - Node.js 14.6.0 or later

if "%NODE_VERSION:~1,2%" LSS "14" (
    echo WARNING: Your Node.js version may be too old for Next.js!
    echo Consider upgrading to Node.js 18.10.0 or newer for optimal compatibility.
) else (
    echo Your Node.js version appears to be compatible with Next.js requirements.
)

echo.
echo Installing dependencies and building the project...
echo.
echo 1. To install dependencies:
echo    cd deployment\frontend ^&^& npm install
echo.
echo 2. To build the application with the mock context providers:
echo    cd deployment\frontend ^&^& npm run build
echo.
echo 3. To start the application:
echo    cd deployment\frontend ^&^& npm start
echo.

pause
