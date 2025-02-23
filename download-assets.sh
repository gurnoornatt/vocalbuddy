#!/bin/bash

# Create directories if they don't exist
mkdir -p public/images
mkdir -p public/sounds

# Download images
curl -o public/images/jungle-background.jpg "https://raw.githubusercontent.com/shadcn/ui/main/apps/www/public/hero-bg.jpg"
curl -o public/images/tiger-curious.png "https://raw.githubusercontent.com/shadcn/ui/main/apps/www/public/avatars/01.png"
curl -o public/images/parrot.png "https://raw.githubusercontent.com/shadcn/ui/main/apps/www/public/avatars/02.png"

# Download sounds
curl -o public/sounds/ding.mp3 "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
curl -o public/sounds/birds.mp3 "https://assets.mixkit.co/active_storage/sfx/2425/2425-preview.mp3"
curl -o public/sounds/coin-jingle.mp3 "https://assets.mixkit.co/active_storage/sfx/1003/1003.mp3"
curl -o public/sounds/unlock.mp3 "https://assets.mixkit.co/active_storage/sfx/2315/2315.mp3"

echo "Assets downloaded successfully!" 