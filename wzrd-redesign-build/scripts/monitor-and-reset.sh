#!/bin/bash
# Monitor and reset script for OpenCode
# Monitors prompt-history.jsonl and resets when compaction happens

echo "=== OpenCode Monitor & Reset ==="
echo ""

HISTORY_FILE="$HOME/.local/state/opencode/prompt-history.jsonl"
MONITOR_FILE="$HOME/.local/state/opencode/.monitor-last-size"

# Get current file size
CURRENT_SIZE=$(stat -c%s "$HISTORY_FILE" 2>/dev/null || echo "0")
LAST_SIZE=$(cat "$MONITOR_FILE" 2>/dev/null || echo "0")

echo "Current size: $CURRENT_SIZE bytes"
echo "Last size: $LAST_SIZE bytes"

# If file was compacted (size decreased significantly)
if [ "$CURRENT_SIZE" -lt "$((LAST_SIZE * 3 / 4))" ] && [ "$CURRENT_SIZE" -gt 1000 ]; then
  echo "Detected compaction! Size decreased from $LAST_SIZE to $CURRENT_SIZE"
  
  echo "1. Backing up compacted version..."
  BACKUP_DIR="$HOME/.local/state/opencode/backups"
  mkdir -p "$BACKUP_DIR"
  TIMESTAMP=$(date +%Y%m%d_%H%M%S)
  cp "$HISTORY_FILE" "$BACKUP_DIR/compacted-backup-$TIMESTAMP.jsonl"
  
  echo "2. Truncating to fresh start..."
  # Keep only the system message if it exists, otherwise start fresh
  if grep -q '"type": "system"' "$HISTORY_FILE"; then
    # Extract system message
    grep '"type": "system"' "$HISTORY_FILE" | tail -1 > "$HISTORY_FILE.tmp"
    mv "$HISTORY_FILE.tmp" "$HISTORY_FILE"
  else
    echo "[]" > "$HISTORY_FILE"
    echo "{\"type\": \"system\", \"content\": \"[Auto-reset after compaction at $(date)]\", \"timestamp\": \"$(date -Iseconds)\"}" >> "$HISTORY_FILE"
  fi
  
  echo "3. Auto-reset complete!"
  echo "   New size: $(stat -c%s "$HISTORY_FILE") bytes"
  
  # Create a simple script to inject continuation
  CONTINUATION_SCRIPT="$HOME/.local/state/opencode/inject-continuation.sh"
  cat > "$CONTINUATION_SCRIPT" << 'EOF'
#!/bin/bash
echo "Auto-reset complete. Continue with your work..."
EOF
  chmod +x "$CONTINUATION_SCRIPT"
  
  echo "4. Run this to continue:"
  echo "   $CONTINUATION_SCRIPT"
else
  echo "No significant compaction detected."
fi

# Update monitor file
echo "$CURRENT_SIZE" > "$MONITOR_FILE"

echo ""
echo "Monitor complete. Next compaction will trigger auto-reset."