#!/bin/bash
# Chat Context Manager for WZRD system
# Manages chat length, context accumulation, and memory optimization

set -e

LOG_FILE="/home/mdwzrd/wzrd-redesign/logs/context-manager.log"
MAX_CONTEXT_LINES=2000  # Maximum lines in active context
MAX_CONVERSATION_FILES=20  # Keep max 20 conversation files
COMPRESSION_THRESHOLD=100  # Lines threshold for compression

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

# Monitor and truncate long chat contexts
manage_chat_context() {
    log "Managing chat context..."
    
    # Check for active OpenCode sessions
    OPENCODE_PIDS=$(ps aux | grep "opencode --" | grep -v grep | grep -v "opencode x" | awk '{print $2}' | head -5)
    
    for pid in $OPENCODE_PIDS; do
        log "Checking session PID $pid"
        
        # In a real implementation, we would:
        # 1. Check context size via OpenCode API
        # 2. Summarize if too large
        # 3. Reset context if necessary
        # For now, just log the check
    done
    
    log "Chat context management complete"
}

# Compress large conversation files
compress_conversations() {
    log "Compressing conversation files..."
    
    # Find all conversation files
    CONV_FILES=$(find /home/mdwzrd/wzrd-redesign/memory/topics -type f -name "conversation-*.json" 2>/dev/null || true)
    
    for file in $CONV_FILES; do
        SIZE=$(wc -l < "$file" 2>/dev/null || echo 0)
        
        if [ $SIZE -gt $COMPRESSION_THRESHOLD ]; then
            log "Compressing $file ($SIZE lines)"
            
            # Simple compression: keep only metadata and summary
            # In production, use smarter compression
            jq '{
                metadata: .metadata,
                summary: .summary,
                keyPoints: .keyPoints,
                compressed: true,
                originalSize: .originalSize // '$SIZE',
                compressedSize: 1
            }' "$file" > "${file}.tmp" 2>/dev/null || continue
            
            mv "${file}.tmp" "$file"
        fi
    done
    
    log "Conversation compression complete"
}

# Clean up old context files
cleanup_context_files() {
    log "Cleaning up old context files..."
    
    # Keep only recent context files
    find /home/mdwzrd/wzrd-redesign/memory/topics -type f -name "context-*.json" 2>/dev/null | \
        sort -r | tail -n +$((MAX_CONVERSATION_FILES + 1)) | xargs rm -f 2>/dev/null || true
    
    # Keep only recent conversation files
    find /home/mdwzrd/wzrd-redesign/memory/topics -type f -name "conversation-*.json" 2>/dev/null | \
        sort -r | tail -n +$((MAX_CONVERSATION_FILES + 1)) | xargs rm -f 2>/dev/null || true
    
    log "Kept only latest $MAX_CONVERSATION_FILES context/conversation files"
}

# Summarize long-running sessions
summarize_long_sessions() {
    log "Checking for long-running sessions..."
    
    # Find OpenCode sessions running > 2 hours
    LONG_SESSIONS=$(ps aux | awk '/opencode --/ && !/grep/ && !/opencode x/ {
        cmd=$0
        pid=$2
        start=$9
        # Parse start time
        if (start ~ /^[0-9]{2}:[0-9]{2}$/) {
            # Today, check if > 2 hours
            split(start, t, ":")
            hours=t[1]
            now=strftime("%H")
            if (now - hours >= 2) print pid
        } else {
            # Not today, definitely old
            print pid
        }
    }')
    
    for pid in $LONG_SESSIONS; do
        log "Long-running session PID $pid detected"
        # In production: send summary command, then reset
        # For now, just log
    done
}

# Optimize memory usage
optimize_memory() {
    log "Optimizing memory usage..."
    
    # Clear system cache if memory is high
    MEM_USAGE=$(free | awk '/^Mem:/ {printf "%.0f", $3/$2 * 100}')
    
    if [ $MEM_USAGE -gt 80 ]; then
        log "High memory usage detected: ${MEM_USAGE}%"
        sync && echo 3 > /proc/sys/vm/drop_caches 2>/dev/null || true
        log "Cleared system cache"
    fi
    
    # Check for memory leaks in Node.js processes
    NODE_PIDS=$(ps aux | grep node | grep -v grep | awk '{print $2, $6/1024"MB"}' | head -10)
    log "Node.js memory usage:"
    echo "$NODE_PIDS" | while read pid mem; do
        log "  PID $pid: $mem"
    done
}

# Main function
main() {
    log "=== Starting Chat Context Manager ==="
    
    manage_chat_context
    compress_conversations
    cleanup_context_files
    summarize_long_sessions
    optimize_memory
    
    log "=== Context management completed ==="
}

# Run manager
main "$@"