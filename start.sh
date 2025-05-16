#!/bin/bash

# Detect OS
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

# Stub out sudo for Windows environments
if [ "$IS_WINDOWS" = true ]; then
    sudo() { "$@"; }
fi

# Navigate to bot project directory
if [ "$IS_LINUX" = true ]; then
    echo "[INFO] Linux environment detected."
    cd /home/container 2>/dev/null || cd "$(dirname "$0")"
elif [ "$IS_WSL" = true ]; then
    echo "[INFO] WSL environment detected."
    cd "/mnt/c/Users/rapid/Documents/TACT-BOT" || { echo "[ERROR] Failed to change to WSL path."; exit 1; }
elif [ "$IS_WINDOWS" = true ]; then
    echo "[INFO] Native Windows Git Bash environment detected."
    cd "/c/Users/rapid/Documents/TACT-BOT" || { echo "[ERROR] Failed to change to Windows path."; exit 1; }
else
    echo "[ERROR] Unknown OS environment."
    exit 1
fi

BOT_JS_FILE=${BOT_JS_FILE:-bot.js}
BOT_NAME="techactivitybot"

echo "[START] Starting $BOT_NAME using pm2..."
# Set terminal title (for Bash-compatible terminals)
echo -ne "\033]0;TACT-BOT | Instance\007"


# Choose pm2 binary depending on OS
if [ "$IS_LINUX" = true ]; then
    PM2_CMD="./node_modules/.bin/pm2"
else
    PM2_CMD="pm2"
fi

# Ensure dependencies are installed
if [ -f package.json ]; then
    echo "[START] Installing npm dependencies..."
    npm install || { echo "[ERROR] npm install failed."; exit 1; }
fi

# Ensure pm2 is installed (local or global)
if ! command -v pm2 &>/dev/null && [ ! -f node_modules/.bin/pm2 ]; then
    echo "[INFO] pm2 not found. Installing locally..."
    npm install pm2 --save || { echo "[ERROR] Failed to install pm2."; exit 1; }
else
    echo "[INFO] pm2 is already installed."
fi

# Start the bot using pm2
echo -ne "\033]0;TACT-BOT | Instance\007"
$PM2_CMD start "$BOT_JS_FILE" --name "$BOT_NAME" --update-env

# Save pm2 state
$PM2_CMD save
$PM2_CMD list

# Tail logs (keep window open only if not inside a GUI terminal)
$PM2_CMD logs "$BOT_NAME"