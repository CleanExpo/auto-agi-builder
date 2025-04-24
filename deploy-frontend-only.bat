@echo off
echo "===== Starting frontend-only deployment process ====="

echo "1. Adding frontend environment files to git..."
git add frontend/.env.local
git commit -m "Add frontend environment configuration for deployment"

echo "2. Deploying frontend directly to Vercel..."
cd frontend
echo "   Now in frontend directory"
vercel --prod

echo "===== Frontend deployment completed ====="
cd ..
