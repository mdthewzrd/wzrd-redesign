#!/bin/bash
# Adaptive Cleanup for WZRD System
# Adjusts cleanup frequency based on activity level

set -e

LOG_FILE="/home/mdwzrd/wzrd-redesign/logs/adaptive-cleanup.log"
ACTIVITY_THRESHOLD=10  # Minimum processes for "active" mode
BASE_INTERVAL_HOURS=24  # Normal interval
ACTIVE_INTERVAL_HOURS=12  # Active interval
MIN_INTERVAL_HOURS=6     # Minimum interval (very active)

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

# Detect activity level
detect_activity() {
    log "Detecting activity level..."
    
    # Count WZRD-related processes
    WZRD_PROCESSES=$(ps aux | grep -E "(opencode|gateway|remi|wzrd|tail.*server.log)" | grep -v grep | wc -l)
    
    # Count active OpenCode sessions
    OPENCODE_SESSIONS=$(ps aux | grep "opencode --" | grep -v grep | grep -v "opencode x" | wc -l)
    
    # Check for recent TUI activity (last hour)
    RECENT_TUI=$(find /tmp -name "*.opencode*" -mmin -60 2>/dev/null | wc -l)
    
    log "Activity stats:"
    log "  WZRD processes: $WZRD_PROCESSES"
    log "  OpenCode sessions: $OPENCODE_SESSIONS"
    log "  Recent TUI activity: $RECENT_TUI"
    
    # Determine activity level
    TOTAL_ACTIVITY=$((WZRD_PROCESSES + OPENCODE_SESSIONS + RECENT_TUI))
    
    if [ $TOTAL_ACTIVITY -gt 20 ]; then
        echo "very_active"
    elif [ $TOTAL_ACTIVITY -gt $ACTIVITY_THRESHOLD ]; then
        echo "active"
    else
        echo "idle"
    fi
}

# Determine cleanup interval
get_cleanup_interval() {
    ACTIVITY_LEVEL=$(detect_activity)
    
    case "$ACTIVITY_LEVEL" in
        "very_active")
            INTERVAL=$MIN_INTERVAL_HOURS
            MODE="very_active"
            ;;
        "active")
            INTERVAL=$ACTIVE_INTERVAL_HOURS
            MODE="active"
            ;;
        *)
            INTERVAL=$BASE_INTERVAL_HOURS
            MODE="idle"
            ;;
    esac
    
    log "Activity level: $MODE, Cleanup interval: ${INTERVAL}h"
    echo $INTERVAL
}

# Run appropriate cleanup
run_adaptive_cleanup() {
    INTERVAL=$(get_cleanup_interval)
    
    log "Running adaptive cleanup for ${INTERVAL}h interval..."
    
    # More aggressive cleanup for active modes
    if [ "$(detect_activity)" = "very_active" ]; then
        log "Very active mode - aggressive cleanup"
        /home/mdwzrd/wzrd-redesign/cleanup-ghost-processes.sh
        /home/mdwzrd/wzrd-redesign/chat-context-manager.sh
    elif [ "$(detect_activity)" = "active" ]; then
        log "Active mode - standard cleanup"
        /home/mdwzrd/wzrd-redesign/cleanup-ghost-processes.sh
    else
        log "Idle mode - minimal cleanup"
        # Only clean ghost processes
        /home/mdwzrd/wzrd-redesign/cleanup-ghost-processes.sh
    fi
    
    log "Next cleanup in ${INTERVAL}h"
}

# Manual trigger
manual_cleanup() {
    log "Manual cleanup triggered"
    echo "Select cleanup level:"
    echo "1) Light (ghost processes only)"
    echo "2) Standard (ghost + old logs)"
    echo "3) Full (ghost + logs + context)"
    echo "4) Aggressive (everything + force)"
    
    read -p "Choice [1-4]: " choice
    
    case "$choice" in
        1)
            log "Running light cleanup..."
            /home/mdwzrd/wzrd-redesign/cleanup-ghost-processes.sh
            ;;
        2)
            log "Running standard cleanup..."
            /home/mdwzrd/wzrd-redesign/cleanup-ghost-processes.sh
            find /home/mdwzrd/wzrd-redesign/logs -type f -name "*.log" -mtime +3 -delete
            ;;
        3)
            log "Running full cleanup..."
            /home/mdwzrd/wzrd-redesign/cleanup-ghost-processes.sh
            /home/mdwzrd/wzrd-redesign/chat-context-manager.sh
            ;;
        4)
            log "Running aggressive cleanup..."
            /home/mdwzrd/wzrd-redesign/cleanup-ghost-processes.sh
            /home/mdwzrd/wzrd-redesign/chat-context-manager.sh
            # Force kill any hanging processes
            pkill -9 -f "tail.*server.log" 2>/dev/null || true
            pkill -9 -f "opencode --" 2>/dev/null || true
            ;;
        *)
            echo "Invalid choice"
            exit 1
            ;;
    esac
    
    log "Manual cleanup complete"
}

# Main function
main() {
    log "=== WZRD Adaptive Cleanup ==="
    
    if [ "$1" = "--manual" ]; then
        manual_cleanup
    elif [ "$1" = "--auto" ]; then
        run_adaptive_cleanup
    elif [ "$1" = "--detect" ]; then
        detect_activity
    else
        echo "Usage: $0 [--manual|--auto|--detect]"
        echo "  --manual   Interactive manual cleanup"
        echo "  --auto     Run adaptive cleanup based on activity"
        echo "  --detect   Just detect and show activity level"
        exit 1
    fi
}

main "$@"