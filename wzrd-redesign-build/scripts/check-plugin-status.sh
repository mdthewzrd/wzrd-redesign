#!/bin/bash
# Check Plugin Status
# Can be run from within OpenCode using bash tool

echo "=== Checking True Compact Plugin Status ==="
echo ""

# Files to check
CONFIG="$HOME/.config/opencode/opencode.jsonc"
PLUGIN_DIR="$HOME/.config/opencode/plugins/opencode-true-compact"
HISTORY_FILE="$HOME/.local/state/opencode/prompt-history.jsonl"

echo "1. OpenCode Config: $CONFIG"
if [ -f "$CONFIG" ]; then
    echo "   ✅ Config file exists"
    
    # Check plugin in config
    if grep -q "opencode-true-compact" "$CONFIG"; then
        echo "   ✅ Plugin configured"
    else
        echo "   ❌ Plugin NOT in config"
    fi
    
    # Check autoCompact
    if grep -q '"autoCompact": true' "$CONFIG"; then
        echo "   ✅ autoCompact enabled"
    else
        echo "   ⚠ autoCompact not enabled"
    fi
    
    # Check DCP plugin
    if grep -q "@tarquinen/opencode-dcp" "$CONFIG"; then
        echo "   ✅ DCP plugin configured"
    else
        echo "   ⚠ DCP plugin not configured (optional)"
    fi
else
    echo "   ❌ Config file missing"
fi

echo ""
echo "2. Plugin Files: $PLUGIN_DIR/"
if [ -d "$PLUGIN_DIR" ]; then
    echo "   ✅ Plugin directory exists"
    
    if [ -f "$PLUGIN_DIR/index.js" ]; then
        echo "   ✅ Plugin file exists"
        echo "   Plugin size: $(stat -c%s "$PLUGIN_DIR/index.js") bytes"
    else
        echo "   ❌ Plugin file missing"
    fi
    
    if [ -f "$PLUGIN_DIR/package.json" ]; then
        echo "   ✅ package.json exists"
    else
        echo "   ⚠ package.json missing"
    fi
else
    echo "   ❌ Plugin directory missing"
fi

echo ""
echo "3. Current Chat State:"
if [ -f "$HISTORY_FILE" ]; then
    SIZE_BYTES=$(stat -c%s "$HISTORY_FILE" 2>/dev/null || echo "0")
    SIZE_KB=$((SIZE_BYTES / 1024))
    LINE_COUNT=$(wc -l < "$HISTORY_FILE" 2>/dev/null || echo "0")
    
    echo "   ✅ History file exists"
    echo "   Size: ${SIZE_KB}KB"
    echo "   Lines: ${LINE_COUNT}"
    
    # Show first few lines
    echo "   First 3 lines:"
    head -3 "$HISTORY_FILE" | sed 's/^/     /'
else
    echo "   ⚠ No history file (new chat?)"
fi

echo ""
echo "4. OpenCode Processes:"
OPENCODE_PIDS=$(ps aux | grep -i opencode | grep -v grep | grep -v check | awk '{print $2}')
if [ -n "$OPENCODE_PIDS" ]; then
    echo "   ✅ OpenCode running (PIDs: $OPENCODE_PIDS)"
else
    echo "   ⚠ OpenCode not running"
fi

echo ""
echo "=== PLUGIN TEST INSTRUCTIONS ==="
echo ""
echo "To test if plugin works:"
echo ""
echo "From WITHIN OpenCode:"
echo "1. Type '/compact'"
echo "2. Watch for automatic chat reset"
echo "3. Look for '[true-compact]' logs"
echo ""
echo "From TERMINAL (exit OpenCode first):"
echo "1. Run validation: ./validate-plugin-works.sh"
echo "2. Or quick test:"
echo "   opencode --model deepseek-ai/deepseek-v3.2 --agent remi"
echo "   Then type '/compact'"
echo ""
echo "=== EXPECTED BEHAVIOR ==="
echo "When you type '/compact':"
echo "1. OpenCode compacts conversation"
echo "2. [1 second pause]"
echo "3. Plugin triggers '/new' automatically"
echo "4. Continuation prompt appears"
echo "5. Chat resets (true delete)"
echo ""
echo "=== STATUS SUMMARY ==="
if [ -f "$CONFIG" ] && grep -q "opencode-true-compact" "$CONFIG" && [ -f "$PLUGIN_DIR/index.js" ]; then
    echo "✅ Plugin appears to be installed correctly"
    echo "✅ Ready for testing"
    echo ""
    echo "Test command: Type '/compact' in OpenCode"
else
    echo "❌ Plugin NOT properly installed"
    echo ""
    echo "Fix: Run ./install-true-compact-plugin-generic.sh"
fi