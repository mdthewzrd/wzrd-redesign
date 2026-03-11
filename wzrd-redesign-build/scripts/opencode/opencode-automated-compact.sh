#!/bin/bash
# Attempt to automate the compact + new workflow
# This tries to interact with OpenCode programmatically

set -e

echo "=== OpenCode Automated Compact Test ==="
echo "Attempting to automate context reset..."
echo ""

# Configuration
OPENCODE_STATE_DIR="$HOME/.local/state/opencode"
PROMPT_HISTORY="$OPENCODE_STATE_DIR/prompt-history.jsonl"
SESSION_FILE="$OPENCODE_STATE_DIR/kv.json"
TOPICS_PATH="/home/mdwzrd/wzrd-redesign/topics"

# Check if we're in OpenCode TUI
if ! ps aux | grep -q "opencode.*--agent remi"; then
    echo "ERROR: Not running in OpenCode TUI with Remi agent"
    echo "This script must be run FROM WITHIN OpenCode TUI"
    exit 1
fi

# Step 1: Detect current session
echo "Step 1: Detecting OpenCode session..."
if [ ! -f "$PROMPT_HISTORY" ]; then
    echo "ERROR: No OpenCode prompt history found"
    exit 1
fi

SESSION_SIZE=$(wc -l < "$PROMPT_HISTORY")
FILE_SIZE=$(wc -c < "$PROMPT_HISTORY")
echo "Session stats: $SESSION_SIZE messages, $FILE_SIZE bytes"

# Step 2: Save conversation to topic memory (using our existing workflow)
echo ""
echo "Step 2: Saving conversation to topic memory..."
cd /home/mdwzrd/wzrd-redesign

# Extract conversation
CONVERSATION=$(tail -30 "$PROMPT_HISTORY" | jq -r '.input // empty' 2>/dev/null || \
               grep -o '"input":"[^"]*"' "$PROMPT_HISTORY" | sed 's/"input":"//g' | sed 's/"//g' | tail -30)

# Detect topic
PWD=$(pwd)
BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
DATE=$(date +%Y-%m-%d)
TOPIC_HASH=$(echo -n "${PWD}/${BRANCH}/${DATE}" | sha256sum | cut -c1-12)
TOPIC_NAME="$(basename "$PWD")-$BRANCH-$DATE"
TOPIC_DIR="$TOPICS_PATH/$TOPIC_HASH"

mkdir -p "$TOPIC_DIR"

# Save conversation
CONVERSATION_FILE="$TOPIC_DIR/CONVERSATION_$(date +%Y%m%d_%H%M%S).md"
cat > "$CONVERSATION_FILE" << EOF
# Conversation $(date)

## Summary
Automated save from OpenCode session

## Messages
$CONVERSATION
EOF

echo "✓ Saved conversation to: $CONVERSATION_FILE"

# Update memory file
MEMORY_FILE="$TOPIC_DIR/MEMORY.md"
if [ ! -f "$MEMORY_FILE" ]; then
    cat > "$MEMORY_FILE" << EOF
# $TOPIC_NAME

## Created
$(date)

## Status
Active - Auto-compacted

## Patterns
- Automated compaction
EOF
fi

echo -e "\n## Conversation $(date)" >> "$MEMORY_FILE"
echo "Auto-saved: $(basename "$CONVERSATION_FILE")" >> "$MEMORY_FILE"

# Step 3: Attempt to trigger /new programmatically
echo ""
echo "Step 3: Attempting to trigger context reset..."

# Method 1: Check for OpenCode control socket
echo "Looking for OpenCode control methods..."

# Check if we can find the OpenCode server port
PORTS=(3000 3001 3002 3003 8080 8081)
SERVER_FOUND=false

for port in "${PORTS[@]}"; do
    if curl -s "http://localhost:$port/health" >/dev/null 2>&1; then
        echo "Found OpenCode server on port $port"
        SERVER_FOUND=true
        OPENCODE_PORT=$port
        break
    fi
done

if [ "$SERVER_FOUND" = false ]; then
    echo "WARNING: No OpenCode server API found"
    echo "Falling back to manual instructions..."
    
    # Create continuation prompt
    CONTINUATION_PROMPT="Based on our conversation about $TOPIC_NAME, continue with next steps or ask for clarification if unsure how to proceed. [Memory saved to topic system.]"
    
    echo ""
    echo "=== AUTOMATION LIMITED ==="
    echo "Could not find OpenCode API for automation."
    echo ""
    echo "MANUAL STEPS REQUIRED:"
    echo "1. Type '/new' in OpenCode TUI"
    echo "2. Paste this continuation prompt:"
    echo ""
    echo "$CONTINUATION_PROMPT"
    echo ""
    echo "Reason: OpenCode doesn't expose automation API"
    echo "Solution options:"
    echo "A. Accept manual step (current limitation)"
    echo "B. Modify OpenCode source (hard)"
    echo "C. Use external automation (complex)"
    exit 0
fi

# If we found the server, try to use it
echo "Attempting to use OpenCode API on port $OPENCODE_PORT..."

# Try to send session.new command
API_RESPONSE=$(curl -s -X POST "http://localhost:$OPENCODE_PORT/tui/command" \
  -H "Content-Type: application/json" \
  -d '{"command": "session.new"}' 2>/dev/null || echo "API call failed")

if [ "$API_RESPONSE" = "true" ]; then
    echo "✓ Successfully triggered /new via API"
    
    # Try to append continuation prompt
    sleep 1  # Give time for new session
    
    CONTINUATION_PROMPT="Based on our conversation about $TOPIC_NAME, continue with next steps or ask for clarification if unsure how to proceed. [Memory saved to topic system.]"
    
    APPEND_RESPONSE=$(curl -s -X POST "http://localhost:$OPENCODE_PORT/tui/prompt/append" \
      -H "Content-Type: application/json" \
      -d "{\"text\": \"$CONTINUATION_PROMPT\"}" 2>/dev/null || echo "Append failed")
    
    if [ "$APPEND_RESPONSE" = "true" ]; then
        echo "✓ Successfully appended continuation prompt"
        echo ""
        echo "=== AUTOMATION SUCCESSFUL ==="
        echo "Conversation saved and context reset automatically!"
    else
        echo "⚠ Could not append prompt (API limitation)"
        echo "Manual step required: Paste continuation prompt"
        echo ""
        echo "Continuation prompt:"
        echo "$CONTINUATION_PROMPT"
    fi
else
    echo "⚠ Could not trigger /new (API limitation)"
    echo "Manual step required: Type '/new'"
fi

echo ""
echo "=== SUMMARY ==="
echo "Topic: $TOPIC_NAME"
echo "Memory saved: $CONVERSATION_FILE"
echo "Session size before: $SESSION_SIZE messages"
echo ""
echo "Even with manual step, memory is preserved and"
echo "context reset will prevent further slowdown."