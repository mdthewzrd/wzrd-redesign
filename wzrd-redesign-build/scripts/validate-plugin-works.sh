#!/bin/bash
# Validate True Compact Plugin Works
# Quick test to verify plugin auto-resets chat on /compact

set -e

echo "=== Validating True Compact Plugin ==="
echo ""

# Configuration
HISTORY_FILE="$HOME/.local/state/opencode/prompt-history.jsonl"
OPENCODE_CONFIG="$HOME/.config/opencode/opencode.jsonc"
PLUGIN_DIR="$HOME/.config/opencode/plugins/opencode-true-compact"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Check plugin installation
echo "Step 1: Checking plugin installation..."
if [ ! -d "$PLUGIN_DIR" ]; then
    log_error "Plugin not found: $PLUGIN_DIR"
    echo "Run: ./install-true-compact-plugin-generic.sh"
    exit 1
fi

if [ ! -f "$PLUGIN_DIR/index.js" ]; then
    log_error "Plugin file missing: $PLUGIN_DIR/index.js"
    exit 1
fi

log_success "Plugin directory exists"

# Check plugin in config
if grep -q "opencode-true-compact" "$OPENCODE_CONFIG"; then
    log_success "Plugin configured in OpenCode config"
else
    log_error "Plugin not in OpenCode config"
    echo "Add to $OPENCODE_CONFIG:"
    echo '  "plugin": ["./plugins/opencode-true-compact"]'
    exit 1
fi

# Step 2: Check DCP plugin (optional)
echo ""
echo "Step 2: Checking DCP plugin (optional)..."
if grep -q "@tarquinen/opencode-dcp" "$OPENCODE_CONFIG"; then
    log_success "DCP plugin configured"
else
    log_warn "DCP plugin not configured (optional for token optimization)"
fi

# Step 3: Check autoCompact
echo ""
echo "Step 3: Checking autoCompact setting..."
if grep -q '"autoCompact": true' "$OPENCODE_CONFIG"; then
    log_success "autoCompact enabled"
else
    log_warn "autoCompact not enabled (recommended)"
fi

# Step 4: Show current chat state
echo ""
echo "Step 4: Current chat state..."
if [ -f "$HISTORY_FILE" ]; then
    SIZE_BYTES=$(stat -c%s "$HISTORY_FILE" 2>/dev/null || echo "0")
    SIZE_KB=$((SIZE_BYTES / 1024))
    LINE_COUNT=$(wc -l < "$HISTORY_FILE" 2>/dev/null || echo "0")
    
    echo "Chat history: ${SIZE_KB}KB, ${LINE_COUNT} lines"
    
    if [ "$SIZE_KB" -gt 10 ]; then
        log_warn "Chat is large (>10KB) - good test candidate"
    else
        log_warn "Chat is small - may want to generate more messages before test"
    fi
else
    echo "No chat history found"
fi

# Step 5: Check OpenCode processes
echo ""
echo "Step 5: Checking OpenCode processes..."
OPENCODE_PIDS=$(ps aux | grep -i opencode | grep -v grep | grep -v validate | awk '{print $2}')
if [ -n "$OPENCODE_PIDS" ]; then
    log_warn "OpenCode is running (PIDs: $OPENCODE_PIDS)"
    echo "For clean test, exit OpenCode first"
else
    log_success "OpenCode not running - ready for test"
fi

# Step 6: Validation instructions
echo ""
echo "=== VALIDATION TEST INSTRUCTIONS ==="
echo ""
echo "To validate plugin works:"
echo ""
echo "OPTION A: Quick test (if OpenCode not running)"
echo "1. Start OpenCode:"
echo "   opencode --model deepseek-ai/deepseek-v3.2 --agent remi"
echo ""
echo "2. Generate conversation:"
echo "   Type 5-10 messages (ask questions, get responses)"
echo ""
echo "3. Test plugin:"
echo "   Type '/compact'"
echo ""
echo "4. Watch for:"
echo "   • Chat should reset automatically"
echo "   • Continuation prompt should appear"
echo "   • Look for '[true-compact]' logs in output"
echo ""
echo "5. Expected sequence:"
echo "   [true-compact] Command detected: /compact"
echo "   [true-compact] Compact detected, scheduling reset..."
echo "   [true-compact] Triggering /new command..."
echo "   [true-compact] Injecting continuation prompt..."
echo "   [true-compact] Chat reset complete!"
echo ""
echo "OPTION B: Automated check (monitor logs)"
echo "1. Start OpenCode in one terminal"
echo "2. In another terminal, monitor:"
echo "   tail -f ~/.local/state/opencode/*.log 2>/dev/null | grep true-compact"
echo "3. Run /compact in OpenCode"
echo "4. Check for plugin logs"
echo ""
echo "OPTION C: File monitoring test"
echo "1. Record initial file size:"
echo "   stat -c%s $HISTORY_FILE"
echo "2. Run /compact"
echo "3. Check if file resets to empty array:"
echo "   cat $HISTORY_FILE | head -5"
echo "4. Should show: []"
echo ""
echo "=== SUCCESS CRITERIA ==="
echo "✅ Plugin logs appear"
echo "✅ Chat resets without manual /new"
echo "✅ Continuation prompt appears"
echo "✅ prompt-history.jsonl resets to empty array"
echo "✅ Can continue conversation seamlessly"
echo ""
echo "=== TROUBLESHOOTING ==="
echo "If plugin doesn't work:"
echo "1. Check plugin file: ls -la $PLUGIN_DIR/"
echo "2. Check config: grep 'opencode-true-compact' $OPENCODE_CONFIG"
echo "3. Restart OpenCode"
echo "4. Check OpenCode version supports plugins"
echo "5. Look for errors in OpenCode output"
echo ""
echo "=== READY TO TEST ==="
read -p "Start validation test now? (Exit OpenCode first if running) (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Starting OpenCode for test..."
    echo ""
    echo "Run this command in another terminal:"
    echo "opencode --model deepseek-ai/deepseek-v3.2 --agent remi"
    echo ""
    echo "Then follow the test instructions above."
else
    echo "Run test when ready using instructions above."
fi

echo ""
echo "=== NEXT AFTER VALIDATION ==="
echo "Once plugin is validated to work:"
echo "1. Create WZRD-integrated version"
echo "2. Add topic memory saving"
echo "3. Update wzrd-compact-workflow.sh"
echo "4. Integrate with existing ecosystem"