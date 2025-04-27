@echo off
REM Script to view markdown files in the default application or browser
REM Run as: view-markdown.bat FILENAME.md

if "%~1"=="" (
    echo Usage: view-markdown.bat FILENAME.md
    echo.
    echo Available markdown files:
    dir /b *.md
    exit /b 1
)

if not exist "%~1" (
    echo Error: File %~1 does not exist.
    echo.
    echo Available markdown files:
    dir /b *.md
    exit /b 1
)

echo Opening %~1 in default application...
start "" "%~1"
exit /b 0
