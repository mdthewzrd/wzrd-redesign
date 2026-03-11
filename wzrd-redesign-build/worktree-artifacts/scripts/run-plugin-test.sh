#!/bin/bash
# Run comprehensive plugin test (requires restarting OpenCode)

echo "=== OpenCode Plugin Comprehensive Test ==="
echo "Date: $(date)"
echo ""
echo "⚠ WARNING: This test requires restarting OpenCode"
echo "Do not run this script from within OpenCode!"
echo ""

echo "Step 1: Check if we're in OpenCode..."
if ps -p $PPID -o comm= | grep -q opencode; then
    echo "❌ Running from within OpenCode - cannot restart"
    echo "Please run this script from a separate terminal"
    exit 1
fi

echo "✅ Not running from OpenCode, proceeding..."

echo ""
echo "Step 2: Kill existing OpenCode processes..."
OPENCODE_PIDS=$(ps aux | grep -i opencode | grep -v grep | awk '{print $2}')
if [ -n "$OPENCODE_PIDS" ]; then
    echo "Found OpenCode PIDs: $OPENCODE_PIDS"
    read -p "Kill these processes? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kill $OPENCODE_PIDS 2>/dev/null
        sleep 2
        echo "✅ OpenCode processes killed"
    else
        echo "⚠ Skipping kill - test may be inaccurate"
    fi
else
    echo "✅ No OpenCode processes running"
fi

echo ""
echo "Step 3: Record pre-test baseline..."
PRE_TEST_FILE="/tmp/opencode-pretest-$(date +%Y%m%d_%H%M%S).txt"
HISTORY_FILE="$HOME/.local/state/opencode/prompt-history.jsonl"
if [ -f "$HISTORY_FILE" ]; then
    PRE_SIZE=$(stat -c%s "$HISTORY_FILE")
    PRE_LINES=$(wc -l < "$HISTORY_FILE")
    echo "Pre-test baseline:"
    echo "  Size: $PRE_SIZE bytes"
    echo "  Lines: $PRE_LINES"
    echo "  Saved to: $PRE_TEST_FILE"
    echo "Pre-test: $PRE_SIZE bytes, $PRE_LINES lines" > "$PRE_TEST_FILE"
else
    echo "⚠ No prompt-history.jsonl found"
    PRE_SIZE=0
    PRE_LINES=0
fi

echo ""
echo "Step 4: Start OpenCode with plugin..."
echo "Opening OpenCode in background..."
echo "In the new OpenCode session, please:"
echo "1. Run /dcp to verify plugin is loaded"
echo "2. Have a conversation (20+ messages)"
echo "3. Run /compact command"
echo "4. Exit OpenCode when done"
echo ""
echo "To start OpenCode manually:"
echo "  opencode --model nvidia/z-ai/glm4.7 --agent remi"
echo ""
echo "Or use WZRD wrapper:"
echo "  ./wzrd --mode chat"
echo ""
read -p "Press Enter when ready to continue test analysis..." -n 1 -r

echo ""
echo ""
echo "Step 5: Analyze test results..."
if [ -f "$HISTORY_FILE" ]; then
    POST_SIZE=$(stat -c%s "$HISTORY_FILE")
    POST_LINES=$(wc -l < "$HISTORY_FILE")
    
    echo "Post-test results:"
    echo "  Size: $POST_SIZE bytes"
    echo "  Lines: $POST_LINES"
    
    SIZE_DIFF=$((PRE_SIZE - POST_SIZE))
    LINE_DIFF=$((PRE_LINES - POST_LINES))
    
    echo ""
    echo "=== Test Results ==="
    echo "Pre-test:  $PRE_SIZE bytes, $PRE_LINES lines"
    echo "Post-test: $POST_SIZE bytes, $POST_LINES lines"
    echo "Difference: $SIZE_DIFF bytes, $LINE_DIFF lines"
    
    if [ $SIZE_DIFF -gt 0 ]; then
        echo "✅ Plugin appears to be reducing context size"
    elif [ $SIZE_DIFF -eq 0 ]; then
        echo "⚠ No size reduction - plugin may not be working"
    else
        echo "❌ Context size increased - check plugin configuration"
    fi
else
    echo "❌ prompt-history.jsonl not found after test"
fi

echo ""
echo "Step 6: Check for DCP logs..."
DCP_LOG_DIR="$HOME/.config/opencode/logs/dcp"
if [ -d "$DCP_LOG_DIR" ]; then
    echo "✅ DCP log directory exists: $DCP_LOG_DIR"
    echo "Recent logs:"
    find "$DCP_LOG_DIR" -name "*.log" -type f | head -5
else
    echo "⚠ No DCP logs found - plugin may not be logging"
fi

echo ""
echo "=== Test Complete ==="
echo ""
echo "Next steps:"
echo "1. Review test results above"
echo "2. Check OpenCode for /dcp command output"
echo "3. Test with longer conversations (50+ messages)"
echo "4. Monitor over 24 hours of normal usage"
echo "5. Integrate with existing wzrd-compact-workflow.sh"