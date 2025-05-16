#!/bin/bash

UNAME_OUT="$(uname -s 2>/dev/null || echo Unknown)"
IS_WINDOWS=false
IS_WSL=false
IS_LINUX=false

# Detect Windows (Git Bash, MSYS, Cygwin)
if [[ "$UNAME_OUT" == MINGW* || "$UNAME_OUT" == MSYS* || "$UNAME_OUT" == CYGWIN* ]]; then
    IS_WINDOWS=true
fi

# Detect WSL
if grep -qi microsoft /proc/version 2>/dev/null; then
    IS_WSL=true
fi

# Detect Linux (non-WSL)
if [[ "$UNAME_OUT" == "Linux" ]] && [ "$IS_WSL" = false ]; then
    IS_LINUX=true
fi

echo "[INFO] Detected OS: $UNAME_OUT"
echo "[INFO] IS_WINDOWS=$IS_WINDOWS"
echo "[INFO] IS_WSL=$IS_WSL"
echo "[INFO] IS_LINUX=$IS_LINUX"

if [ "$IS_WINDOWS" = true ]; then
    echo "[INFO] Running Windows start script"
    bash start.sh
elif [ "$IS_LINUX" = true ]; then
    # Check if running as root
    if [ "$EUID" -ne 0 ]; then
        echo "[INFO] Running Linux start script with sudo"
        sudo bash ./start.sh
    else
        echo "[INFO] Running Linux start script as root"
        bash ./start.sh
    fi
else
    echo "[INFO] Running start script (WSL or other)"
    bash ./start.sh
fi
echo
read -p "Press [Enter] to exit..."