#!/bin/bash
echo "==================================="
echo "Auto AGI Builder DNS Configurator"
echo "==================================="
echo

echo "Installing dependencies..."
npm install axios dotenv

echo
echo "Running DNS configuration tool..."
node dns-record-configurator.js

echo
echo "Press Enter to exit..."
read
