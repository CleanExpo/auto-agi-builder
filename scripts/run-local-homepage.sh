#!/bin/bash

# Run Local Homepage Development Server
# This script starts the Next.js development server for testing the homepage

echo "Starting Auto AGI Builder development server..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js to run this script."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install npm to run this script."
    exit 1
fi

# Run validation first
echo "Validating homepage implementation..."
node frontend/tests/homepage-validation.js

# Check if validation was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "Validation successful! Starting development server..."
    echo ""
    
    # Start the Next.js development server
    npm run dev
else
    echo ""
    echo "Validation failed. Please fix the issues before starting the server."
    exit 1
fi
