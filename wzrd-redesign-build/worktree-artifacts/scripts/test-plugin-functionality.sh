#!/bin/bash
# Test OpenCode Dynamic Context Pruning Plugin Functionality

echo "=== Testing OpenCode Dynamic Context Pruning Plugin ==="
echo "Date: $(date)"
echo ""

# Record baseline
echo "Step 1: Recording baseline..."
BASELINE_FILE="/tmp/opencode-test-baseline-$(date +%Y%m%d_%H%M%S).txt"
./scripts/monitor-opencode-baseline.sh > "$BASELINE_FILE"
echo "Baseline recorded to $BASELINE_FILE"

echo ""
echo "Step 2: Checking plugin installation..."
if [ -d ~/.config/opencode/node_modules/@tarquinen/opencode-dcp ]; then
    echo "✅ Plugin installed: ~/.config/opencode/node_modules/@tarquinen/opencode-dcp"
else
    echo "❌ Plugin not found in node_modules"
fi

if [ -f ~/.config/opencode/opencode.jsonc ]; then
    if grep -q "@tarquinen/opencode-dcp" ~/.config/opencode/opencode.jsonc; then
        echo "✅ Plugin configured in opencode.jsonc"
    else
        echo "❌ Plugin not configured in opencode.jsonc"
    fi
fi

echo ""
echo "Step 3: Checking DCP configuration..."
if [ -f ~/.config/opencode/dcp.jsonc ]; then
    echo "✅ DCP config exists: ~/.config/opencode/dcp.jsonc"
    echo "Configuration summary:"
    grep -E "(enabled|debug|pruneNotification)" ~/.config/opencode/dcp.jsonc | head -10
else
    echo "❌ DCP config not found"
fi

echo ""
echo "=== Test Plan ==="
echo ""
echo "To test the plugin, you need to:"
echo ""
echo "1. Restart OpenCode (kill current session)"
echo "2. Start new OpenCode session"
echo "3. Generate 20+ messages"
echo "4. Run /compact command"
echo "5. Monitor prompt-history.jsonl size changes"
echo "6. Check /dcp command output"
echo ""
echo "=== Manual Test Instructions ==="
echo ""
echo "1. First, check current OpenCode processes:"
echo "   ps aux | grep -i opencode | grep -v grep"
echo ""
echo "2. Kill current session (if testing in new terminal):"
echo "   pkill -f opencode"
echo ""
echo "3. Start OpenCode with plugin:"
echo "   opencode --model nvidia/z-ai/glm4.7 --agent remi"
echo ""
echo "4. In OpenCode, test plugin commands:"
echo "   /dcp            # Show available commands"
echo "   /dcp context    # Show token usage breakdown"
echo "   /dcp stats      # Show pruning statistics"
echo ""
echo "5. Generate conversation:"
echo "   Ask questions, get responses, use tools"
echo "   Target: 20+ messages total"
echo ""
echo "6. Test /compact command:"
echo "   /compact        # Should work with plugin"
echo ""
echo "7. Monitor file size:"
echo "   Before: $(stat -c%s ~/.local/state/opencode/prompt-history.jsonl 2>/dev/null || echo 0) bytes"
echo "   After:  monitor for decrease"
echo ""
echo "=== Automated Test (Future) ==="
echo ""
echo "For automated testing, we would need to:"
echo "1. Script OpenCode interaction"
echo "2. Automatically generate conversation"
echo "3. Monitor file changes"
echo "4. Validate pruning effectiveness"

echo ""
echo "=== Test Results Template ==="
echo ""
echo "Copy and fill out:"
echo "Date: $(date)"
echo "Plugin Version: $(npm list @tarquinen/opencode-dcp 2>/dev/null | grep @tarquinen/opencode-dcp)"
echo "Initial Size: ___ bytes"
echo "After 20 messages: ___ bytes"
echo "After /compact: ___ bytes"
echo "/dcp context output: ___"
echo "Plugin Working: Yes/No"
echo "Notes: ___"