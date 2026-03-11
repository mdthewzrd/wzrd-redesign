#!/bin/bash
# Intercept OpenCode's /compact command
# Monitors prompt-history.jsonl and triggers true compact when /compact is used

HISTORY_FILE="$HOME/.local/state/opencode/prompt-history.jsonl"
STATE_FILE="$HOME/.local/state/opencode/.compact-interceptor-state"
LOG_FILE="$HOME/.local/state/opencode/compact-interceptor.log"

mkdir -p "$(dirname "$STATE_FILE")"
touch "$STATE_FILE"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

# Get current file stats
get_stats() {
  if [ ! -f "$HISTORY_FILE" ]; then
    echo "0 0"
    return
  fi
  
  SIZE=$(stat -c%s "$HISTORY_FILE")
  MOD_TIME=$(stat -c%Y "$HISTORY_FILE")
  echo "$SIZE $MOD_TIME"
}

# Check if /compact was just used
check_compact() {
  CURRENT_STATS=$(get_stats)
  CURRENT_SIZE=$(echo "$CURRENT_STATS" | awk '{print $1}')
  CURRENT_TIME=$(echo "$CURRENT_STATS" | awk '{print $2}')
  
  LAST_STATS=$(cat "$STATE_FILE" 2>/dev/null || echo "0 0")
  LAST_SIZE=$(echo "$LAST_STATS" | awk '{print $1}')
  LAST_TIME=$(echo "$LAST_STATS" | awk '{print $2}')
  
  # Save current stats
  echo "$CURRENT_STATS" > "$STATE_FILE"
  
  # If file was recently modified AND size decreased significantly
  TIME_DIFF=$((CURRENT_TIME - LAST_TIME))
  
  if [ "$TIME_DIFF" -lt 10 ] && [ "$TIME_DIFF" -gt 0 ]; then  # Modified within last 10 seconds
    if [ "$CURRENT_SIZE" -lt "$((LAST_SIZE * 9 / 10))" ] && [ "$CURRENT_SIZE" -gt 1000 ]; then
      log "Detected OpenCode /compact! Size: $LAST_SIZE → $CURRENT_SIZE"
      log "Time since last modification: $TIME_DIFF seconds"
      return 0  # /compact detected
    fi
  fi
  
  return 1  # No /compact
}

# Intercept and trigger true compact
intercept_compact() {
  log "=== INTERCEPTING OPENCODE /COMPACT ==="
  
  # Wait a moment for OpenCode to finish its compaction
  sleep 2
  
  # Run our true compact
  log "Running true compact after OpenCode /compact..."
  ~/wzrd-redesign/wzrd-compact-solution.sh compact >> "$LOG_FILE" 2>&1
  
  log "=== INTERCEPT COMPLETE ==="
}

# Main loop
main() {
  log "Starting OpenCode /compact interceptor..."
  log "Monitoring: $HISTORY_FILE"
  log "State file: $STATE_FILE"
  
  # Initialize state
  get_stats > "$STATE_FILE"
  
  while true; do
    if check_compact; then
      intercept_compact
    fi
    
    # Check every 5 seconds
    sleep 5
  done
}

# Run once or start daemon
case "${1:-daemon}" in
  "once")
    if check_compact; then
      intercept_compact
    fi
    ;;
  "daemon")
    main
    ;;
  "test")
    echo "Current stats: $(get_stats)"
    echo "Last stats: $(cat "$STATE_FILE" 2>/dev/null || echo "none")"
    echo "Log: $LOG_FILE"
    tail -20 "$LOG_FILE" 2>/dev/null || echo "No log file"
    ;;
  *)
    echo "Usage: $0 [once|daemon|test]"
    echo "  once    - Check once and intercept if needed"
    echo "  daemon  - Run continuously (default)"
    echo "  test    - Show current status"
    ;;
esac