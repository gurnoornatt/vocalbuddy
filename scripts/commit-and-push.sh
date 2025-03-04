#!/bin/bash

# Script to commit and push enhanced logging changes to the waitlist branch

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Checking current branch...${NC}"
CURRENT_BRANCH=$(git branch --show-current)

if [ "$CURRENT_BRANCH" != "waitlist" ]; then
  echo -e "${RED}Error: You are not on the waitlist branch.${NC}"
  echo -e "Current branch: ${CURRENT_BRANCH}"
  echo -e "Please switch to the waitlist branch with: ${GREEN}git checkout waitlist${NC}"
  exit 1
fi

echo -e "${YELLOW}Checking for changes...${NC}"
git status

echo -e "${YELLOW}Adding all changes...${NC}"
git add .

echo -e "${YELLOW}Committing changes...${NC}"
git commit -m "Add enhanced logging for better debugging and monitoring

- Add detailed structured logging to Supabase client
- Enhance waitlist API route with request IDs and timing
- Improve email service with better error handling
- Expand debug endpoint with system and database information
- Add TypeScript types for better type safety"

echo -e "${YELLOW}Pushing to remote repository...${NC}"
git push origin waitlist

echo -e "${GREEN}Changes committed and pushed to the waitlist branch!${NC}"
echo -e "You can now deploy this branch to Vercel." 