#!/bin/bash

# Minimal script to prepare for Vercel deployment

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Preparing for minimal Vercel deployment...${NC}"

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "Current branch: ${GREEN}${CURRENT_BRANCH}${NC}"

# Create a simple .env.local file for local development
echo -e "${YELLOW}Creating .env.local file...${NC}"
cat > .env.local << EOL
NEXT_PUBLIC_SUPABASE_URL=https://mauqfgieggfrpyossbvn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hdXFmZ2llZ2dmcnB5b3NzYnZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwNDg1OTYsImV4cCI6MjA1NjYyNDU5Nn0.6dV0DMuw9lVISchfxVuuHL1Uds0-hud65TCvb1wqbRY
NEXT_PUBLIC_APP_URL=https://testvocal.vercel.app
RESEND_API_KEY=re_HUVAygwV_6TBLj9kkmJ54Zk2DNEby1Quk
EOL

echo -e "${GREEN}Deployment preparation complete!${NC}"
echo -e "Now go to the Vercel dashboard and deploy your project from there:"
echo -e "1. Go to https://vercel.com/dashboard"
echo -e "2. Select your project"
echo -e "3. Click 'Deploy' and select the waitlist branch"
echo -e "4. Make sure to set the following environment variables in your Vercel project settings:"
echo -e "   - NEXT_PUBLIC_SUPABASE_URL"
echo -e "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo -e "   - NEXT_PUBLIC_APP_URL"
echo -e "   - RESEND_API_KEY" 