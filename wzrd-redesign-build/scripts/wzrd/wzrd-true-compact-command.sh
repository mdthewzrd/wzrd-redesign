#!/bin/bash
# WZRD True Compact Command
# Run this from within OpenCode to truly reset chat after compaction

echo "=== WZRD True Compact Command ==="
echo "This command will truly reset your chat like Claude's compact feature."
echo ""

HISTORY_FILE="$HOME/.local/state/opencode/prompt-history.jsonl"
BACKUP_DIR="$HOME/.local/state/opencode/backups"

echo "1. Checking current chat history..."
if [ ! -f "$HISTORY_FILE" ]; then
  echo "   Error: No prompt history found at $HISTORY_FILE"
  exit 1
fi

LINE_COUNT=$(wc -l < "$HISTORY_FILE")
SIZE_BYTES=$(stat -c%s "$HISTORY_FILE")
echo "   Current history: $LINE_COUNT lines, $SIZE_BYTES bytes"

echo ""
echo "2. Backing up current conversation..."
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/prompt-history-backup-$TIMESTAMP.jsonl"
cp "$HISTORY_FILE" "$BACKUP_FILE"
echo "   Backup saved to: $BACKUP_FILE"

echo ""
echo "3. Creating summary of last conversation..."
# Try to extract meaningful content
echo "=== LAST CONVERSATION SUMMARY ===" > "$BACKUP_DIR/summary-$TIMESTAMP.txt"
echo "Backup time: $(date)" >> "$BACKUP_DIR/summary-$TIMESTAMP.txt"
echo "Lines: $LINE_COUNT" >> "$BACKUP_DIR/summary-$TIMESTAMP.txt"
echo "" >> "$BACKUP_DIR/summary-$TIMESTAMP.txt"

# Extract user and assistant messages
echo "Extracting messages..." >> "$BACKUP_DIR/summary-$TIMESTAMP.txt"
tail -50 "$HISTORY_FILE" | jq -r 'select(.role == "user" or .role == "assistant") | "\(.role): \(.content)"' 2>/dev/null | head -20 >> "$BACKUP_DIR/summary-$TIMESTAMP.txt"

echo ""
echo "4. Truly resetting chat (like Claude compact)..."
# Create fresh history with just a system message
echo "[]" > "$HISTORY_FILE"
echo "{\"type\": \"system\", \"role\": \"system\", \"content\": \"[Chat truly reset via WZRD True Compact at $(date)]\", \"timestamp\": \"$(date -Iseconds)\"}" >> "$HISTORY_FILE"

echo ""
echo "5. Reset complete!"
NEW_SIZE=$(stat -c%s "$HISTORY_FILE")
echo "   New history size: $NEW_SIZE bytes"
echo "   Reduction: $((SIZE_BYTES - NEW_SIZE)) bytes"

echo ""
echo "6. To continue your work, type:"
echo "   Continue if you have next steps, or stop and ask for clarification..."
echo ""
echo "   Your previous conversation is backed up at:"
echo "   $BACKUP_FILE"
echo "   Summary at: $BACKUP_DIR/summary-$TIMESTAMP.txt"

echo ""
echo "=== TIP: Add this as an alias ==="
echo "Add to your ~/.bashrc or ~/.zshrc:"
echo "  alias true-compact='bash $HOME/wzrd-redesign/wzrd-true-compact-command.sh'"
echo ""
echo "Then run 'true-compact' from within OpenCode to reset chat."