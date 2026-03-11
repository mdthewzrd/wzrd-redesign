#!/bin/bash
# WZRD Compact Solution
# Our own compact command that actually works like Claude's

set -e

HISTORY_FILE="$HOME/.local/state/opencode/prompt-history.jsonl"
BACKUP_DIR="$HOME/.local/state/opencode/wzrd-backups"
STATE_FILE="$HOME/.local/state/opencode/wzrd-compact-state.json"
LOG_FILE="$HOME/.local/state/opencode/wzrd-compact.log"

# Ensure directories exist
mkdir -p "$BACKUP_DIR"

# Log function
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

# Check context usage
check_context_usage() {
  if [ ! -f "$HISTORY_FILE" ]; then
    echo "0"
    return
  fi
  
  # Simple heuristic: file size correlates with token count
  # 1KB ~= 250 tokens (rough estimate)
  FILE_SIZE=$(stat -c%s "$HISTORY_FILE" 2>/dev/null || echo "0")
  TOKEN_ESTIMATE=$((FILE_SIZE / 4))
  
  echo "$TOKEN_ESTIMATE"
}

# Our true compact function
wzrd_true_compact() {
  log "=== WZRD TRUE COMPACT STARTED ==="
  
  # Get current state
  CURRENT_TOKENS=$(check_context_usage)
  log "Current token estimate: $CURRENT_TOKENS"
  
  # Backup current conversation
  TIMESTAMP=$(date +%Y%m%d_%H%M%S)
  BACKUP_FILE="$BACKUP_DIR/backup-$TIMESTAMP.jsonl"
  cp "$HISTORY_FILE" "$BACKUP_FILE"
  log "Backup saved: $BACKUP_FILE"
  
  # Create summary file
  SUMMARY_FILE="$BACKUP_DIR/summary-$TIMESTAMP.txt"
  echo "=== Conversation Backup Summary ===" > "$SUMMARY_FILE"
  echo "Backup time: $(date)" >> "$SUMMARY_FILE"
  echo "Estimated tokens: $CURRENT_TOKENS" >> "$SUMMARY_FILE"
  echo "File size: $(stat -c%s "$HISTORY_FILE") bytes" >> "$SUMMARY_FILE"
  echo "" >> "$SUMMARY_FILE"
  
  # Extract last messages for context
  echo "=== Last Messages ===" >> "$SUMMARY_FILE"
  tail -30 "$HISTORY_FILE" | jq -r 'select(.content) | "\(.role // "unknown"): \(.content[0:200])"' 2>/dev/null | head -20 >> "$SUMMARY_FILE"
  
  # TRULY RESET - Like Claude compact
  log "Truly resetting chat history..."
  echo "[]" > "$HISTORY_FILE"
  echo "{\"role\": \"system\", \"content\": \"[Chat reset via WZRD True Compact at $(date)]\", \"timestamp\": \"$(date -Iseconds)\"}" >> "$HISTORY_FILE"
  
  NEW_TOKENS=$(check_context_usage)
  log "New token estimate: $NEW_TOKENS"
  log "Reduction: $((CURRENT_TOKENS - NEW_TOKENS)) tokens"
  
  # Update state
  echo "{\"last_compact\": \"$(date -Iseconds)\", \"backup\": \"$BACKUP_FILE\", \"reduced_tokens\": $((CURRENT_TOKENS - NEW_TOKENS))}" > "$STATE_FILE"
  
  log "=== WZRD TRUE COMPACT COMPLETE ==="
  
  # Print continuation message
  echo ""
  echo "✅ Chat truly reset! Previous conversation backed up."
  echo ""
  echo "Continue if you have next steps, or stop and ask for clarification..."
  echo ""
  echo "Backup: $BACKUP_FILE"
  echo "Summary: $SUMMARY_FILE"
}

# Monitor function (runs in background)
start_monitor() {
  log "Starting WZRD compact monitor..."
  
  # Kill any existing monitor
  pkill -f "wzrd-compact-monitor" 2>/dev/null || true
  
  # Start monitor in background
  nohup bash -c "
    while true; do
      sleep 30
      TOKENS=\$(bash '$0' check)
      if [ \"\$TOKENS\" -gt 80000 ]; then
        log \"Auto-triggering compact at \$TOKENS tokens\"
        bash '$0' compact
      fi
    done
  " > "$BACKUP_DIR/monitor.log" 2>&1 &
  
  MONITOR_PID=$!
  echo "$MONITOR_PID" > "$BACKUP_DIR/monitor.pid"
  log "Monitor started with PID $MONITOR_PID"
}

# Stop monitor
stop_monitor() {
  if [ -f "$BACKUP_DIR/monitor.pid" ]; then
    MONITOR_PID=$(cat "$BACKUP_DIR/monitor.pid")
    kill "$MONITOR_PID" 2>/dev/null && log "Monitor stopped" || log "Monitor not running"
    rm -f "$BACKUP_DIR/monitor.pid"
  else
    log "No monitor PID file found"
  fi
}

# Show status
show_status() {
  CURRENT_TOKENS=$(check_context_usage)
  echo "=== WZRD Compact Status ==="
  echo "Current token estimate: $CURRENT_TOKENS"
  echo "Auto-compact threshold: 80,000 tokens"
  echo ""
  
  if [ -f "$STATE_FILE" ]; then
    echo "Last compact: $(jq -r '.last_compact' "$STATE_FILE")"
    echo "Last reduction: $(jq -r '.reduced_tokens' "$STATE_FILE") tokens"
  fi
  
  if [ -f "$BACKUP_DIR/monitor.pid" ]; then
    MONITOR_PID=$(cat "$BACKUP_DIR/monitor.pid" 2>/dev/null)
    if ps -p "$MONITOR_PID" > /dev/null 2>&1; then
      echo "Monitor: RUNNING (PID $MONITOR_PID)"
    else
      echo "Monitor: STOPPED"
    fi
  else
    echo "Monitor: STOPPED"
  fi
  
  echo ""
  echo "Usage:"
  echo "  $0 compact     - Manually trigger true compact"
  echo "  $0 check       - Check current token usage"
  echo "  $0 monitor     - Start auto-monitor (80K threshold)"
  echo "  $0 stop        - Stop auto-monitor"
  echo "  $0 status      - Show current status"
}

# Main command handling
case "${1:-status}" in
  "compact")
    wzrd_true_compact
    ;;
  "check")
    check_context_usage
    ;;
  "monitor")
    start_monitor
    ;;
  "stop")
    stop_monitor
    ;;
  "status")
    show_status
    ;;
  *)
    show_status
    ;;
esac