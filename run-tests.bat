@echo off
setlocal enabledelayedexpansion

REM Colors for better output
set GREEN=92m
set RED=91m
set YELLOW=93m
set BLUE=94m
set NC=0m

echo [%BLUE%============================================[%NC%
echo [%BLUE%Running Auto AGI Builder Test Suite[%NC%
echo [%BLUE%============================================[%NC%

REM Install test dependencies
echo [%YELLOW%Installing test dependencies...[%NC%
pip install -r requirements.txt

REM Run all tests with coverage
echo [%YELLOW%Running tests with coverage...[%NC%
python -m pytest tests/ -v --cov=app --cov-report=term --cov-report=html

REM Check the test result
if %ERRORLEVEL% == 0 (
    echo [%GREEN%All tests passed successfully![%NC%
    echo [%YELLOW%Coverage report generated in htmlcov/ directory[%NC%
) else (
    echo [%RED%Some tests failed. Please check the output above.[%NC%
)

echo [%BLUE%============================================[%NC%
echo [%BLUE%Test Suite Complete[%NC%
echo [%BLUE%============================================[%NC%

endlocal
