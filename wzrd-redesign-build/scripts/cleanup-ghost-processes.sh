#!/bin/bash
# Cleanup ghost processes for WZRD system
# Removes orphaned monitoring processes, old sessions, and cleans up logs

set -e

LOG_FILE="/home/mdwzrd/wzrd-redesign/logs/cleanup.log"
MAX_AGE_HOURS=24  # Clean up processes older than 24 hours
MAX_LOG_DAYS=7    # Keep logs for 7 days

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

# Clean up orphaned tail processes monitoring server.log
cleanup_tail_processes() {
    log "Cleaning up orphaned tail processes..."
    
    # Find all tail -f server.log processes
    TAIL_PIDS=$(ps aux | grep "tail -f server.log" | grep -v grep | awk '{print $2}' | xargs)
    
    if [ -n "$TAIL_PIDS" ]; then
        log "Found tail PIDs: $TAIL_PIDS"
        
        # Kill them
        kill $TAIL_PIDS 2>/dev/null && sleep 2
        
        # Force kill if still running
        kill -9 $TAIL_PIDS 2>/dev/null
        
        log "Cleaned up $(echo $TAIL_PIDS | wc -w) tail processes"
    else
        log "No orphaned tail processes found"
    fi
}

# Clean up old OpenCode sessions
cleanup_opencode_sessions() {
    log "Cleaning up old OpenCode sessions..."
    
    # Find and kill orphaned OpenCode processes older than MAX_AGE_HOURS
    OPENCODE_PIDS=$(ps aux | grep "opencode --" | grep -v grep | grep -v "opencode x" | awk '{print $2, $9}' | while read pid start_time; do
        # Check if process is old
        if [[ "$start_time" =~ [0-9]{2}:[0-9]{2}$ ]]; then
            # Today's process, format like "11:45"
            continue
        else
            # Older process, has date like "Mar03"
            echo "$pid"
        fi
    done)
    
    if [ -n "$OPENCODE_PIDS" ]; then
        log "Found old OpenCode PIDs: $OPENCODE_PIDS"
        kill $OPENCODE_PIDS 2>/dev/null
        kill -9 $OPENCODE_PIDS 2>/dev/null 2>/dev/null
        log "Cleaned up $(echo $OPENCODE_PIDS | wc -w) old OpenCode sessions"
    fi
}

# Clean up old log files
cleanup_old_logs() {
    log "Cleaning up old log files..."
    
    # Clean logs in wzrd-redesign/logs older than MAX_LOG_DAYS
    if [ -d "/home/mdwzrd/wzrd-redesign/logs" ]; then
        find /home/mdwzrd/wzrd-redesign/logs -type f -name "*.log" -mtime +$MAX_LOG_DAYS -delete
        log "Cleaned up old log files"
    fi
    
    # Clean server.log tail files
    if [ -f "/home/mdwzrd/wzrd.dev/gateway-v2/server.log" ]; then
        # Truncate if too large (> 10MB)
        SIZE=$(stat -c%s "/home/mdwzrd/wzrd.dev/gateway-v2/server.log" 2>/dev/null || echo 0)
        if [ $SIZE -gt 10485760 ]; then  # 10MB
            log "Truncating large server.log ($((SIZE/1024/1024))MB)"
            tail -10000 "/home/mdwzrd/wzrd.dev/gateway-v2/server.log" > "/home/mdwzrd/wzrd.dev/gateway-v2/server.log.tmp"
            mv "/home/mdwzrd/wzrd.dev/gateway-v2/server.log.tmp" "/home/mdwzrd/wzrd.dev/gateway-v2/server.log"
        fi
    fi
}

# Clean up conversation memory files
cleanup_old_conversations() {
    log "Cleaning up old conversation files..."
    
    # Keep only last 10 conversation files per topic
    find /home/mdwzrd/wzrd-redesign/memory/topics -type f -name "conversation-*.json" | sort -r | tail -n +11 | xargs rm -f 2>/dev/null || true
    log "Kept only latest 10 conversation files per topic"
}

# Main cleanup function
main() {
    log "=== Starting WZRD cleanup ==="
    
    cleanup_tail_processes
    cleanup_opencode_sessions
    cleanup_old_logs
    cleanup_old_conversations
    
    log "=== Cleanup completed ==="
}

# Run cleanup
main "$@"