#!/bin/bash
# OpenCode Baseline Monitoring Script
# Records current state of prompt-history.jsonl for comparison

echo "=== OpenCode Baseline Monitoring ==="
echo "Date: $(date)"
echo ""

# Check prompt-history.jsonl
HISTORY_FILE="$HOME/.local/state/opencode/prompt-history.jsonl"
if [ -f "$HISTORY_FILE" ]; then
    SIZE=$(stat -c%s "$HISTORY_FILE")
    LINE_COUNT=$(wc -l < "$HISTORY_FILE")
    echo "📊 prompt-history.jsonl:"
    echo "  Size: $SIZE bytes"
    echo "  Lines: $LINE_COUNT"
    echo "  Last modified: $(stat -c%y "$HISTORY_FILE")"
    
    # Save baseline to file
    BASELINE_FILE="/tmp/opencode-baseline-$(date +%Y%m%d_%H%M%S).txt"
    echo "Baseline saved to: $BASELINE_FILE"
    {
        echo "Baseline recorded at: $(date)"
        echo "File: $HISTORY_FILE"
        echo "Size: $SIZE bytes"
        echo "Lines: $LINE_COUNT"
        echo "Last modified: $(stat -c%y "$HISTORY_FILE")"
    } > "$BASELINE_FILE"
else
    echo "⚠ prompt-history.jsonl not found at $HISTORY_FILE"
fi

echo ""
echo "=== OpenCode Process Status ==="
OPENCODE_PROCESSES=$(ps aux | grep -i opencode | grep -v grep)
if [ -n "$OPENCODE_PROCESSES" ]; then
    echo "✅ OpenCode processes running:"
    echo "$OPENCODE_PROCESSES"
else
    echo "⚠ No OpenCode processes found"
fi

echo ""
echo "=== OpenCode Config Status ==="
if [ -d ~/.config/opencode ]; then
    echo "✅ OpenCode config directory exists"
    if [ -f ~/.config/opencode/opencode.jsonc ]; then
        echo "  Config file: ~/.config/opencode/opencode.jsonc"
        # Check for plugin configuration
        if grep -q "plugin" ~/.config/opencode/opencode.jsonc; then
            echo "  ⚠ Plugin configuration found in main config"
        fi
    else
        echo "  ⚠ No opencode.jsonc config file"
    fi
else
    echo "⚠ OpenCode config directory not found"
fi

echo ""
echo "=== Recommendations ==="
echo "1. Record baseline before plugin installation"
echo "2. Compare after plugin installation"
echo "3. Monitor for 24 hours with normal usage"
echo "4. Test /compact command functionality"