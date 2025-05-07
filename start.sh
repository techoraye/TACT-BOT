#!/bin/bash

# Fallback to bot.js if BOT_JS_FILE not set
BOT_JS_FILE=${BOT_JS_FILE:-bot.js}

# Ensure we're in the container's root directory
cd /home/container 2>/dev/null || cd "$(dirname "$0")"

# Check if pm2 is installed
if ! command -v pm2 &> /dev/null && [ ! -f node_modules/.bin/pm2 ]; then
    echo "[START] pm2 not found. Installing pm2 locally..."

    # Install pm2 locally without requiring global access
    npm install pm2 --save

    # Check if installation succeeded
    if [ $? -eq 0 ]; then
        echo "[START] pm2 installed successfully."
    else
        echo "[START] Failed to install pm2."
        exit 1
    fi
else
    echo "[START] pm2 is already installed."
fi

# Install dependencies
if [ -f package.json ]; then
    echo "[START] Installing npm dependencies..."
    npm install
fi

# Start the bot with pm2 using local path
echo "[START] Starting bot using pm2..."
./node_modules/.bin/pm2 start "$BOT_JS_FILE" --name "techactivitybot" --update-env

# Save pm2 process list
./node_modules/.bin/pm2 save

# Display pm2 process list
./node_modules/.bin/pm2 list

# Tail logs to keep Pterodactyl console active
./node_modules/.bin/pm2 logs techactivitybot
