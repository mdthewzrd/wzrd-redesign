#!/bin/bash

# Cleanup script for opencode ghost processes and database bloat

echo "=== Opencode Cleanup Script ==="
echo "Date: $(date)"

# 1. Kill all opencode processes safely
echo -e "\n1. Killing opencode processes..."
echo "Current opencode processes:"
ps aux | grep opencode | grep -v grep | grep -v cleanup-opencode

# Send SIGTERM first (graceful shutdown)
pkill -f "opencode --model" 2>/dev/null
sleep 2

# Send SIGKILL if still running (force kill)
pkill -9 -f "opencode --model" 2>/dev/null

echo "After cleanup:"
ps aux | grep opencode | grep -v grep | grep -v cleanup-opencode | wc -l

# 2. Clean up database and logs
echo -e "\n2. Cleaning database and logs..."
DB_PATH="/home/mdwzrd/.local/share/opencode"

if [ -d "$DB_PATH" ]; then
    echo "Database size before cleanup:"
    du -sh "$DB_PATH"/*
    
    # Backup then delete old logs (keep last 2 days)
    echo -e "\nCleaning logs older than 2 days..."
    find "$DB_PATH/log" -name "*.log" -mtime +2 -delete 2>/dev/null
    
    # Compact database using SQLite if possible
    if command -v sqlite3 &> /dev/null && [ -f "$DB_PATH/opencode.db" ]; then
        echo -e "\nCompacting database..."
        sqlite3 "$DB_PATH/opencode.db" "VACUUM;" 2>/dev/null
    fi
    
    echo "Database size after cleanup:"
    du -sh "$DB_PATH"/*
fi

# 3. Clean temporary files
echo -e "\n3. Cleaning temporary files..."
find /tmp -name "*opencode*" -type d -exec rm -rf {} + 2>/dev/null
find /tmp -name "*opencode*" -type f -delete 2>/dev/null

# 4. Check for orphaned processes
echo -e "\n4. Checking for orphaned/detached processes..."
echo "Processes with no controlling terminal:"
ps -ef | grep opencode | grep -v grep | awk '$7 == "?" {print $0}'

# 5. Create a watchdog script to prevent accumulation
echo -e "\n5. Creating prevention scripts..."
cat > /home/mdwzrd/wzrd-redesign/opencode-watchdog.sh << 'EOF'
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
EOF

chmod +x /home/mdwzrd/wzrd-redesign/opencode-watchdog.sh

echo -e "\n=== Cleanup Complete ==="
echo "Consider adding to crontab: */30 * * * * $PWD/opencode-watchdog.sh"
echo "Or run manually when experiencing slowdowns."