#!/bin/bash

# Colors for better output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}Running Auto AGI Builder Test Suite${NC}"
echo -e "${BLUE}============================================${NC}"

# Install test dependencies
echo -e "${YELLOW}Installing test dependencies...${NC}"
pip install -r requirements.txt

# Run all tests with coverage
echo -e "${YELLOW}Running tests with coverage...${NC}"
python -m pytest tests/ -v --cov=app --cov-report=term --cov-report=html

# Check the test result
if [ $? -eq 0 ]; then
    echo -e "${GREEN}All tests passed successfully!${NC}"
    echo -e "${YELLOW}Coverage report generated in htmlcov/ directory${NC}"
else
    echo -e "${RED}Some tests failed. Please check the output above.${NC}"
fi

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}Test Suite Complete${NC}"
echo -e "${BLUE}============================================${NC}"
