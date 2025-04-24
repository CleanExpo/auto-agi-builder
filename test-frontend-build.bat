@echo off
echo "Testing frontend build process..."
cd frontend
echo "Installing dependencies..."
npm install
echo "Building the project..."
npm run build
echo "Build process completed."
