#!/bin/bash

# Simple script to deploy the waitlist branch to Vercel

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Preparing to deploy waitlist branch to Vercel...${NC}"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo -e "${RED}Vercel CLI is not installed.${NC}"
  echo -e "Installing Vercel CLI globally..."
  npm install -g vercel
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "waitlist" ]; then
  echo -e "${RED}Error: You are not on the waitlist branch.${NC}"
  echo -e "Current branch: ${CURRENT_BRANCH}"
  echo -e "Please switch to the waitlist branch with: ${GREEN}git checkout waitlist${NC}"
  exit 1
fi

echo -e "${YELLOW}Current branch: ${GREEN}${CURRENT_BRANCH}${NC}"

# Make sure all changes are committed
if [ -n "$(git status --porcelain)" ]; then
  echo -e "${RED}You have uncommitted changes.${NC}"
  echo -e "Please commit your changes before deploying:"
  echo -e "${GREEN}git add .${NC}"
  echo -e "${GREEN}git commit -m \"Your commit message\"${NC}"
  exit 1
fi

# Create a temporary .env.local file for the build process
echo -e "${YELLOW}Creating temporary .env.local file for build...${NC}"
cat > .env.local << EOL
NEXT_PUBLIC_SUPABASE_URL=https://mauqfgieggfrpyossbvn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hdXFmZ2llZ2dmcnB5b3NzYnZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwNDg1OTYsImV4cCI6MjA1NjYyNDU5Nn0.6dV0DMuw9lVISchfxVuuHL1Uds0-hud65TCvb1wqbRY
NEXT_PUBLIC_APP_URL=https://testvocal.vercel.app
RESEND_API_KEY=re_HUVAygwV_6TBLj9kkmJ54Zk2DNEby1Quk
EOL

echo -e "${YELLOW}Deploying to Vercel...${NC}"
echo -e "This will deploy the ${GREEN}${CURRENT_BRANCH}${NC} branch to Vercel."

# Deploy using Vercel CLI
vercel --prod

DEPLOY_STATUS=$?

# Clean up
rm .env.local

if [ $DEPLOY_STATUS -eq 0 ]; then
  echo -e "${GREEN}Deployment initiated!${NC}"
  echo -e "Your waitlist application is now being deployed to Vercel."
  echo -e "${YELLOW}IMPORTANT:${NC} Verify that your environment variables are correctly set in the Vercel dashboard."
  echo -e "If you encounter any issues, check the build logs in the Vercel dashboard."
else
  echo -e "${RED}Deployment failed.${NC}"
  echo -e "Please check the error messages above and try again."
fi 