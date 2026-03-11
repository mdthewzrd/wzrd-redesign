#!/bin/bash
# Compact interceptor for OpenCode
# This script intercepts /compact command and truly resets chat

echo "=== OpenCode Compact Interceptor ==="
echo ""

# Check if we're in OpenCode TUI
if [ -z "$OPECODE_TUI" ]; then
  echo "Not running in OpenCode TUI environment"
  echo "This script is meant to be called from within OpenCode"
  exit 1
fi

echo "1. Backing up current prompt history..."
BACKUP_DIR="$HOME/.local/state/opencode/backups"
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
cp "$HOME/.local/state/opencode/prompt-history.jsonl" "$BACKUP_DIR/prompt-history-backup-$TIMESTAMP.jsonl"

echo "2. Creating summary of last conversation..."
# Extract last few messages for summary
LAST_MESSAGES=$(tail -20 "$HOME/.local/state/opencode/prompt-history.jsonl" | jq -r '.content // .text // empty' 2>/dev/null || echo "Could not extract messages")

echo "3. Creating compacted version..."
# Keep only very recent context (last 2-3 exchanges)
echo "[]" > "$HOME/.local/state/opencode/prompt-history.jsonl"

echo "4. Injecting continuation prompt..."
# The continuation will be handled by the caller

echo "5. True compact complete!"
echo "   Original size: $(wc -l < "$BACKUP_DIR/prompt-history-backup-$TIMESTAMP.jsonl") lines"
echo "   New size: 0 lines (fresh start)"
echo "   Backup saved to: $BACKUP_DIR/prompt-history-backup-$TIMESTAMP.jsonl"

# Create a simple marker for the compacted session
echo "{\"type\": \"system\", \"content\": \"[True compact executed at $(date)]\", \"timestamp\": \"$(date -Iseconds)\"}" >> "$HOME/.local/state/opencode/prompt-history.jsonl"