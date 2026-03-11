#!/bin/bash
# True Compact Automation for OpenCode
# Monitors prompt-history.jsonl and automatically resets chat when threshold reached
# Works like Claude's compact: deletes old messages, starts fresh with continuation

set -e

# Configuration
CONFIG_FILE="$HOME/.config/opencode/true-compact-config.json"
HISTORY_FILE="$HOME/.local/state/opencode/prompt-history.jsonl"
LOG_FILE="$HOME/.local/state/opencode/true-compact.log"
TOPICS_DIR="/home/mdwzrd/wzrd-redesign/topics"
WZRD_DIR="/home/mdwzrd/wzrd-redesign"

# Default configuration
DEFAULT_CONFIG='{
  "enabled": true,
  "monitor_interval": 60,
  "size_threshold_kb": 15,
  "line_threshold": 40,
  "auto_reset": true,
  "save_to_topics": true,
  "continuation_prompt": "Continue if you have next steps...",
  "notification": true,
  "debug": false
}'

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
  local level="$1"
  local message="$2"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  
  case "$level" in
    "INFO") color="$BLUE" ;;
    "SUCCESS") color="$GREEN" ;;
    "WARN") color="$YELLOW" ;;
    "ERROR") color="$RED" ;;
    *) color="$NC" ;;
  esac
  
  echo -e "${color}[$timestamp] [$level]${NC} $message"
  
  # Log to file
  echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
}

# Load or create configuration
load_config() {
  if [ ! -f "$CONFIG_FILE" ]; then
    log "INFO" "Creating default configuration at $CONFIG_FILE"
    echo "$DEFAULT_CONFIG" > "$CONFIG_FILE"
  fi
  
  # Load config using jq if available, otherwise use defaults
  if command -v jq >/dev/null 2>&1; then
    CONFIG_ENABLED=$(jq -r '.enabled' "$CONFIG_FILE" 2>/dev/null || echo "true")
    CONFIG_INTERVAL=$(jq -r '.monitor_interval' "$CONFIG_FILE" 2>/dev/null || echo "60")
    CONFIG_SIZE_KB=$(jq -r '.size_threshold_kb' "$CONFIG_FILE" 2>/dev/null || echo "15")
    CONFIG_LINES=$(jq -r '.line_threshold' "$CONFIG_FILE" 2>/dev/null || echo "40")
    CONFIG_AUTO_RESET=$(jq -r '.auto_reset' "$CONFIG_FILE" 2>/dev/null || echo "true")
    CONFIG_SAVE_TOPICS=$(jq -r '.save_to_topics' "$CONFIG_FILE" 2>/dev/null || echo "true")
    CONFIG_CONTINUATION=$(jq -r '.continuation_prompt' "$CONFIG_FILE" 2>/dev/null || echo "Continue if you have next steps...")
    CONFIG_NOTIFY=$(jq -r '.notification' "$CONFIG_FILE" 2>/dev/null || echo "true")
    CONFIG_DEBUG=$(jq -r '.debug' "$CONFIG_FILE" 2>/dev/null || echo "false")
  else
    # Fallback to defaults
    CONFIG_ENABLED="true"
    CONFIG_INTERVAL="60"
    CONFIG_SIZE_KB="15"
    CONFIG_LINES="40"
    CONFIG_AUTO_RESET="true"
    CONFIG_SAVE_TOPICS="true"
    CONFIG_CONTINUATION="Continue if you have next steps..."
    CONFIG_NOTIFY="true"
    CONFIG_DEBUG="false"
  fi
}

# Check current state
check_state() {
  if [ ! -f "$HISTORY_FILE" ]; then
    log "WARN" "History file not found: $HISTORY_FILE"
    SIZE_KB=0
    LINE_COUNT=0
    return 1
  fi
  
  SIZE_BYTES=$(stat -c%s "$HISTORY_FILE" 2>/dev/null || echo "0")
  SIZE_KB=$((SIZE_BYTES / 1024))
  LINE_COUNT=$(wc -l < "$HISTORY_FILE" 2>/dev/null || echo "0")
  
  if [ "$CONFIG_DEBUG" = "true" ]; then
    log "INFO" "Current state: ${SIZE_KB}KB, ${LINE_COUNT} lines"
  fi
  
  # Check thresholds
  if [ "$SIZE_KB" -ge "$CONFIG_SIZE_KB" ] || [ "$LINE_COUNT" -ge "$CONFIG_LINES" ]; then
    log "WARN" "Threshold reached: ${SIZE_KB}KB >= ${CONFIG_SIZE_KB}KB or ${LINE_COUNT} lines >= ${CONFIG_LINES} lines"
    return 0  # Threshold reached
  else
    return 1  # Below threshold
  fi
}

# Save conversation to topic memory
save_to_topic_memory() {
  local timestamp=$(date '+%Y%m%d_%H%M%S')
  local topic_id="autocompact_$timestamp"
  local topic_dir="$TOPICS_DIR/$topic_id"
  
  mkdir -p "$topic_dir"
  
  if [ -f "$HISTORY_FILE" ]; then
    cp "$HISTORY_FILE" "$topic_dir/prompt-history-backup.jsonl"
    
    # Create memory file
    cat > "$topic_dir/MEMORY.md" << EOF
# Auto-Compact Backup: $timestamp

## Summary
Automatically saved conversation before chat reset.

## Stats
- Original size: ${SIZE_KB}KB
- Line count: ${LINE_COUNT}
- Saved at: $(date)
- Trigger: Size threshold reached (${CONFIG_SIZE_KB}KB/${CONFIG_LINES} lines)

## Contents
The full conversation is available in \`prompt-history-backup.jsonl\`.

## Next Steps
This conversation was automatically archived to prevent TUI slowdown.
The chat has been reset with continuation prompt: "$CONFIG_CONTINUATION"
EOF
    
    log "SUCCESS" "Conversation saved to topic: $topic_dir"
  else
    log "WARN" "No history file to save"
  fi
}

# Kill OpenCode processes (carefully)
kill_opencode() {
  log "INFO" "Looking for OpenCode processes..."
  
  # Find OpenCode processes (excluding this script)
  OPENCODE_PIDS=$(ps aux | grep -i opencode | grep -v grep | grep -v "true-compact" | awk '{print $2}')
  
  if [ -n "$OPENCODE_PIDS" ]; then
    log "WARN" "Found OpenCode PIDs: $OPENCODE_PIDS"
    
    # Send SIGTERM first (graceful shutdown)
    kill $OPENCODE_PIDS 2>/dev/null
    sleep 2
    
    # Check if still running
    STILL_RUNNING=$(ps aux | grep -i opencode | grep -v grep | grep -v "true-compact" | awk '{print $2}')
    if [ -n "$STILL_RUNNING" ]; then
      log "WARN" "OpenCode still running, sending SIGKILL"
      kill -9 $STILL_RUNNING 2>/dev/null
      sleep 1
    fi
    
    log "SUCCESS" "OpenCode processes terminated"
  else
    log "INFO" "No OpenCode processes found"
  fi
}

# Reset chat history
reset_chat() {
  log "INFO" "Resetting chat history..."
  
  # Create fresh history file
  echo '[]' > "$HISTORY_FILE"
  
  # Also clear related state files
  STATE_DIR=$(dirname "$HISTORY_FILE")
  for file in "$STATE_DIR"/kv.json "$STATE_DIR"/model.json; do
    if [ -f "$file" ]; then
      cp "$file" "$file.backup-$(date +%s)" 2>/dev/null || true
    fi
  done
  
  log "SUCCESS" "Chat history reset"
}

# Start OpenCode with continuation
start_opencode_with_continuation() {
  log "INFO" "Starting OpenCode with continuation..."
  
  # The continuation prompt needs to be entered manually
  # We'll create a script that user can run
  local start_script="/tmp/opencode-continue-$(date +%s).sh"
  
  cat > "$start_script" << EOF
#!/bin/bash
echo "🚀 Starting OpenCode with continuation..."
echo "Continuation prompt: \"$CONFIG_CONTINUATION\""
echo ""
echo "Run this command:"
echo "opencode --model nvidia/z-ai/glm4.7 --agent remi"
echo ""
echo "Then type: $CONFIG_CONTINUATION"
EOF
  
  chmod +x "$start_script"
  
  log "INFO" "Start script created: $start_script"
  echo "To continue, run: $start_script"
}

# Main monitoring loop
monitor_loop() {
  log "INFO" "Starting True Compact Automation Monitor"
  log "INFO" "Config: ${CONFIG_SIZE_KB}KB/${CONFIG_LINES} lines threshold, check every ${CONFIG_INTERVAL}s"
  log "INFO" "History file: $HISTORY_FILE"
  
  while true; do
    load_config
    
    if [ "$CONFIG_ENABLED" != "true" ]; then
      log "INFO" "Monitor disabled in config"
      sleep "$CONFIG_INTERVAL"
      continue
    fi
    
    if check_state; then
      log "WARN" "Threshold reached! Triggering auto-compact..."
      
      # Save to topic memory if enabled
      if [ "$CONFIG_SAVE_TOPICS" = "true" ]; then
        save_to_topic_memory
      fi
      
      # Kill OpenCode if auto-reset enabled
      if [ "$CONFIG_AUTO_RESET" = "true" ]; then
        kill_opencode
        reset_chat
        
        if [ "$CONFIG_NOTIFY" = "true" ]; then
          log "SUCCESS" "Chat reset complete"
          echo ""
          echo "=== CHAT RESET COMPLETE ==="
          echo "Conversation archived to topic memory"
          echo "Chat history cleared"
          echo ""
          echo "To continue:"
          start_opencode_with_continuation
          echo ""
        fi
        
        # Exit monitoring after reset (user needs to restart)
        log "INFO" "Monitor exiting after reset"
        exit 0
      else
        log "WARN" "Auto-reset disabled, manual intervention required"
        echo ""
        echo "=== THRESHOLD REACHED ==="
        echo "Size: ${SIZE_KB}KB (threshold: ${CONFIG_SIZE_KB}KB)"
        echo "Lines: ${LINE_COUNT} (threshold: ${CONFIG_LINES})"
        echo ""
        echo "Manual steps:"
        echo "1. Exit OpenCode"
        echo "2. Run: $0 --reset"
        echo "3. Restart OpenCode"
        echo ""
      fi
    fi
    
    sleep "$CONFIG_INTERVAL"
  done
}

# Manual reset function
manual_reset() {
  load_config
  
  log "INFO" "Manual reset requested"
  
  if [ -f "$HISTORY_FILE" ]; then
    SIZE_BYTES=$(stat -c%s "$HISTORY_FILE")
    SIZE_KB=$((SIZE_BYTES / 1024))
    LINE_COUNT=$(wc -l < "$HISTORY_FILE")
    
    echo "Current: ${SIZE_KB}KB, ${LINE_COUNT} lines"
    read -p "Reset chat? (y/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      kill_opencode
      
      if [ "$CONFIG_SAVE_TOPICS" = "true" ]; then
        save_to_topic_memory
      fi
      
      reset_chat
      start_opencode_with_continuation
    else
      log "INFO" "Reset cancelled"
    fi
  else
    log "ERROR" "No history file found"
  fi
}

# Show status
show_status() {
  load_config
  
  echo "=== True Compact Automation Status ==="
  echo "Config file: $CONFIG_FILE"
  echo "History file: $HISTORY_FILE"
  echo "Log file: $LOG_FILE"
  echo ""
  echo "Configuration:"
  echo "  Enabled: $CONFIG_ENABLED"
  echo "  Check interval: ${CONFIG_INTERVAL}s"
  echo "  Size threshold: ${CONFIG_SIZE_KB}KB"
  echo "  Line threshold: ${CONFIG_LINES} lines"
  echo "  Auto reset: $CONFIG_AUTO_RESET"
  echo "  Save to topics: $CONFIG_SAVE_TOPICS"
  echo "  Notification: $CONFIG_NOTIFY"
  echo "  Debug: $CONFIG_DEBUG"
  echo ""
  
  if [ -f "$HISTORY_FILE" ]; then
    SIZE_BYTES=$(stat -c%s "$HISTORY_FILE")
    SIZE_KB=$((SIZE_BYTES / 1024))
    LINE_COUNT=$(wc -l < "$HISTORY_FILE")
    
    echo "Current state:"
    echo "  Size: ${SIZE_KB}KB"
    echo "  Lines: ${LINE_COUNT}"
    
    if [ "$SIZE_KB" -ge "$CONFIG_SIZE_KB" ]; then
      echo "  ⚠ SIZE THRESHOLD EXCEEDED"
    fi
    
    if [ "$LINE_COUNT" -ge "$CONFIG_LINES" ]; then
      echo "  ⚠ LINE THRESHOLD EXCEEDED"
    fi
    
    PERCENT_SIZE=$((SIZE_KB * 100 / CONFIG_SIZE_KB))
    PERCENT_LINES=$((LINE_COUNT * 100 / CONFIG_LINES))
    echo ""
    echo "Threshold usage:"
    echo "  Size: ${PERCENT_SIZE}% (${SIZE_KB}/${CONFIG_SIZE_KB}KB)"
    echo "  Lines: ${PERCENT_LINES}% (${LINE_COUNT}/${CONFIG_LINES})"
  else
    echo "History file not found"
  fi
}

# Show help
show_help() {
  echo "True Compact Automation for OpenCode"
  echo "Automatically resets chat when prompt-history.jsonl grows too large"
  echo ""
  echo "Usage: $0 [command]"
  echo ""
  echo "Commands:"
  echo "  monitor      Start monitoring in foreground"
  echo "  daemon       Start monitoring in background (daemon)"
  echo "  status       Show current status and thresholds"
  echo "  reset        Manual reset (save & clear chat)"
  echo "  config       Edit configuration"
  echo "  help         Show this help"
  echo ""
  echo "Examples:"
  echo "  $0 monitor    # Start monitoring"
  echo "  $0 daemon     # Run in background"
  echo "  $0 status     # Check current state"
  echo "  $0 reset      # Manual reset"
  echo ""
  echo "The automation:"
  echo "  1. Monitors prompt-history.jsonl size/line count"
  echo "  2. When threshold reached:"
  echo "     - Saves conversation to topic memory"
  echo "     - Kills OpenCode processes"
  echo "     - Clears chat history"
  echo "     - Provides instructions to continue"
}

# Main
case "${1:-monitor}" in
  monitor)
    monitor_loop
    ;;
    
  daemon)
    log "INFO" "Starting daemon mode"
    nohup "$0" monitor >/dev/null 2>&1 &
    DAEMON_PID=$!
    echo "Daemon started with PID: $DAEMON_PID"
    echo "Logs: $LOG_FILE"
    ;;
    
  status)
    show_status
    ;;
    
  reset)
    manual_reset
    ;;
    
  config)
    if [ -f "$CONFIG_FILE" ]; then
      ${EDITOR:-nano} "$CONFIG_FILE"
    else
      load_config
      echo "Config file created at: $CONFIG_FILE"
    fi
    ;;
    
  help|--help|-h)
    show_help
    ;;
    
  *)
    echo "Unknown command: $1"
    show_help
    exit 1
    ;;
esac