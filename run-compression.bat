@echo off
echo ===================================================
echo    Auto AGI Builder - Context Length Solution
echo ===================================================
echo.

rem Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:menu
cls
echo What would you like to do?
echo.
echo 1. Check token usage of project files
echo 2. Compress a specific file
echo 3. Compress a specific directory
echo 4. Compress all large files in the Auto AGI Builder project
echo 5. Compress the file causing the context length error
echo 6. Help (How to use compressed files)
echo 7. Exit
echo.
set /p choice="Enter your choice (1-7): "

if "%choice%"=="1" goto check_tokens
if "%choice%"=="2" goto compress_file
if "%choice%"=="3" goto compress_directory
if "%choice%"=="4" goto compress_all
if "%choice%"=="5" goto compress_error_file
if "%choice%"=="6" goto show_help
if "%choice%"=="7" exit /b 0
echo Invalid choice. Please try again.
pause
goto menu

:check_tokens
cls
echo ===================================================
echo    Checking Token Usage in Auto AGI Builder
echo ===================================================
echo.
node compress-auto-agi.js --check
echo.
pause
goto menu

:compress_file
cls
echo ===================================================
echo    Compress a Specific File
echo ===================================================
echo.
set /p filepath="Enter the path to the file you want to compress: "
echo.
echo Compressing file: %filepath%
node compress-auto-agi.js "%filepath%"
echo.
pause
goto menu

:compress_directory
cls
echo ===================================================
echo    Compress a Specific Directory
echo ===================================================
echo.
set /p dirpath="Enter the path to the directory you want to process: "
echo.
echo Compressing files in directory: %dirpath%
node compress-auto-agi.js "%dirpath%"
echo.
pause
goto menu

:compress_all
cls
echo ===================================================
echo    Compress All Large Files in Auto AGI Builder
echo ===================================================
echo.
echo This will scan and compress all large files in the Auto AGI Builder project.
echo Compressed files will be saved to the ./compressed-agi-files directory.
echo.
echo Processing...
node compress-auto-agi.js
echo.
pause
goto menu

:compress_error_file
cls
echo ===================================================
echo    Compress File Causing Context Length Error
echo ===================================================
echo.
echo If you received a specific error message about a file causing the context length issue,
echo enter its path below to compress it.
echo.
set /p errorfile="Enter the path to the file causing the error: "
echo.
echo Compressing file: %errorfile%
node compress-auto-agi.js "%errorfile%"
echo.
pause
goto menu

:show_help
cls
echo ===================================================
echo    How to Use Compressed Files
echo ===================================================
echo.
echo After compressing files, you'll find them in the ./compressed-agi-files directory.
echo.
echo To use these compressed files with LLMs:
echo.
echo 1. When uploading files to the LLM (e.g., ChatGPT, Claude, etc.), use the 
echo    compressed versions instead of the originals.
echo.
echo 2. For example, if you were going to upload:
echo    "../OneDrive - Disaster Recovery/1111/Auto AGI Builder/unified-deploy.js"
echo.
echo    Use the compressed version instead:
echo    "./compressed-agi-files/unified-deploy.js"
echo.
echo 3. The compressed files preserve the most important parts of the code while
echo    removing some content from the middle to fit within token limits.
echo.
echo 4. If you need to compress a different file later, just return to this tool
echo    and select the appropriate option.
echo.
pause
goto menu
