#!/bin/bash

# Define default bot entry file if not set
BOT_JS_FILE=${BOT_JS_FILE:-bot.js}
BOT_NAME="techactivitybot"

# Change directory to container root if applicable
cd /home/container 2>/dev/null || cd "$(dirname "$0")"

echo "[RESTART] Restarting the bot..."

# Use local PM2 if available
PM2="./node_modules/.bin/pm2"

# Ensure PM2 is available
if [ ! -f "$PM2" ]; then
  echo "[RESTART] PM2 not found locally. Installing..."
  npm install pm2 --save
fi

# Stop old process if it exists
$PM2 stop "$BOT_NAME" || echo "[RESTART] No running process named $BOT_NAME found."

# Start the bot
echo "[RESTART] Starting the new bot process..."
$PM2 start "$BOT_JS_FILE" --name "$BOT_NAME" --update-env

# Save process list
$PM2 save

# Show PM2 process list
$PM2 list

# Show real-time logs to keep output active
$PM2 logs "$BOT_NAME" --lines 100
