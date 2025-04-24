#!/bin/bash
echo "==================================="
echo "Auto AGI Builder Domain Configurator"
echo "==================================="
echo

echo "Installing dependencies..."
npm install

echo
echo "Running domain configuration..."
npm run configure-domain

echo
echo "Domain configuration completed!"
echo "Please check the output above for required DNS records."
echo
echo "Press Enter to exit..."
read
