#!/bin/bash
# OpenCode initialization with topic memory

echo "Starting OpenCode with topic memory injection..."
echo "Topic:  wzrd-redesign-main-2026-03-06 (799c19aa8fe7)
wzrd-redesign-main-2026-03-06"
echo ""

# Create memory injection file
cat > /tmp/opencode-memory-inject.txt << EOM
# WZRD Topic-Aware Session

## Active Topic:  wzrd-redesign-main-2026-03-06 (799c19aa8fe7)
wzrd-redesign-main-2026-03-06

### Memory Context
[1;33m[WARN][0m No memory file found for topic

### Session Guidelines
1. You are working in topic-aware mode
2. Relevant memory has been loaded
3. Conversations will be saved to topic memory
4. Use /wzrd-compact to reset context when needed

### Available Commands
- /wzrd-compact - Save conversation and reset context
- /topic - Show current topic info
- /topics - List available topics

Topic Hash: [0;34m[TOPIC][0m Using existing topic
799c19aa8fe7
Memory updated automatically.

What would you like to work on?
EOM

echo "Memory injection file created: /tmp/opencode-memory-inject.txt"
echo ""
echo "To use:"
echo "1. Start OpenCode"
echo "2. The initialization prompt will be in your clipboard"
echo "3. Paste as first message"
echo ""
