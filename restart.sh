#!/bin/bash

LOCKFILE="/tmp/tactbot_restart.lock"
if [ -e "$LOCKFILE" ]; then
    echo "[RESTART] Another restart is already running."
    exit 0
fi
touch "$LOCKFILE"
trap 'rm -f "$LOCKFILE"' EXIT

UNAME_OUT="$(uname -s 2>/dev/null || echo Unknown)"
IS_WINDOWS=false
IS_WSL=false
IS_LINUX=false

if [[ "$UNAME_OUT" == "Linux" ]]; then
    if grep -qi microsoft /proc/version 2>/dev/null; then
        IS_WSL=true
        IS_WINDOWS=true
    else
        IS_LINUX=true
    fi
elif [[ "$UNAME_OUT" == MINGW* || "$UNAME_OUT" == MSYS* || "$UNAME_OUT" == CYGWIN* ]]; then
    IS_WINDOWS=true
fi

echo "[INFO] Detected OS: $UNAME_OUT"
echo "[INFO] IS_WINDOWS=$IS_WINDOWS"
echo "[INFO] IS_WSL=$IS_WSL"
echo "[INFO] IS_LINUX=$IS_LINUX"

# Disable sudo on Windows to avoid errors
if [ "$IS_WINDOWS" = true ]; then
    sudo() { "$@"; }
fi

# Change directory depending on environment
if [ "$IS_LINUX" = true ]; then
    echo "[INFO] Linux environment detected."
    cd /home/container 2>/dev/null || cd "$(dirname "$0")"
elif [ "$IS_WSL" = true ]; then
    echo "[INFO] WSL environment detected."
    cd "/mnt/c/Users/rapid/Documents/TACT-BOT" || {
        echo "[ERROR] Failed to change directory to WSL path."
        exit 1
    }
elif [ "$IS_WINDOWS" = true ]; then
    echo "[INFO] Native Windows Git Bash environment detected."
    cd "/c/Users/rapid/Documents/TACT-BOT" || {
        echo "[ERROR] Failed to change directory to Windows path."
        exit 1
    }
else
    echo "[ERROR] Unknown environment, exiting."
    exit 1
fi

BOT_JS_FILE=${BOT_JS_FILE:-bot.js}
BOT_NAME="techactivitybot"

echo "[RESTART] Restarting the bot..."
echo -ne "\033]0;TACT-BOT | Instance\007"

# Select pm2 command depending on OS
if [ "$IS_WINDOWS" = true ]; then
    if [ -f "./node_modules/.bin/pm2" ]; then
        PM2="./node_modules/.bin/pm2"
    else
        PM2="pm2"
    fi
else
    PM2="./node_modules/.bin/pm2"
fi

# Check if pm2 exists locally or globally, else install locally
if ! command -v pm2 &> /dev/null && [ ! -f node_modules/.bin/pm2 ]; then
    echo "[RESTART] PM2 not found. Installing pm2 locally..."
    npm install pm2 --save || { echo "[ERROR] Failed to install pm2."; exit 1; }
fi

# Reload if running, else start
echo -ne "\033]0;TACT-BOT | Instance\007"
$PM2 reload "$BOT_NAME" || $PM2 start "$BOT_JS_FILE" --name "$BOT_NAME" --update-env

# Save process list and show status
$PM2 save
$PM2 list

# NOTE: Removed `pm2 logs` command to avoid multiple terminal windows spawning
# Tail logs manually with: ./node_modules/.bin/pm2 logs techactivitybot
