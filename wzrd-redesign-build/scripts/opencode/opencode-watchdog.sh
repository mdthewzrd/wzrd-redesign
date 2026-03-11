#!/bin/bash
# Watchdog script to monitor opencode instances

MAX_INSTANCES=3
LOG_FILE="/tmp/opencode-watchdog.log"

count=$(ps aux | grep -c "opencode --model")
if [ "$count" -gt "$MAX_INSTANCES" ]; then
    echo "$(date): Too many opencode instances ($count), cleaning up..." >> "$LOG_FILE"
    
    # Get oldest processes (except current one)
    ps aux | grep "opencode --model" | grep -v grep | sort -k 9 | head -n $((count - MAX_INSTANCES)) | awk '{print $2}' | xargs kill -9 2>/dev/null
fi
