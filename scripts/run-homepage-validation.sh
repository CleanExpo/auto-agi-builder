#!/bin/bash

# Homepage Validation Script
# This script runs the homepage validation utility to verify the implementation

echo "Running Auto AGI Builder Homepage Validation..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js to run this validation script."
    exit 1
fi

# Check if chalk is installed (required for formatting)
if ! npm list chalk &> /dev/null; then
    echo "Installing chalk package (required for validation)..."
    npm install chalk --save-dev
fi

# Run the validation script
node frontend/tests/homepage-validation.js

# Check the exit code
if [ $? -eq 0 ]; then
    echo ""
    echo "Validation completed successfully! Your homepage implementation meets all requirements."
    echo ""
    echo "Next step: Run 'npm run dev' to start the development server and test the homepage in your browser."
else
    echo ""
    echo "Validation failed. Please fix the issues reported above and run this validation script again."
fi
