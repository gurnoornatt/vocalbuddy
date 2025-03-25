#!/bin/bash

# Ultra simple script to deploy to Vercel
# No fancy features, just the bare minimum

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Preparing for Vercel deployment...${NC}"

# Create a simple .env.local file for the build
echo -e "${YELLOW}Creating .env.local file...${NC}"
cat > .env.local << EOL
NEXT_PUBLIC_SUPABASE_URL=https://mauqfgieggfrpyossbvn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hdXFmZ2llZ2dmcnB5b3NzYnZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwNDg1OTYsImV4cCI6MjA1NjYyNDU5Nn0.6dV0DMuw9lVISchfxVuuHL1Uds0-hud65TCvb1wqbRY
NEXT_PUBLIC_APP_URL=https://testvocal.vercel.app
RESEND_API_KEY=re_HUVAygwV_6TBLj9kkmJ54Zk2DNEby1Quk
EOL

echo -e "${YELLOW}Committing all changes...${NC}"
git add .
git commit -m "Prepare for deployment: Removed waitlist feature"
git push

echo -e "${YELLOW}Deploying to Vercel...${NC}"
npx vercel --prod

echo -e "${GREEN}Deployment process completed!${NC}" 