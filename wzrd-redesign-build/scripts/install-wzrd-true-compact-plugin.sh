#!/bin/bash
# Install WZRD True Compact Plugin for OpenCode

set -e

echo "=== Installing WZRD True Compact Plugin ==="
echo ""

# Configuration
PLUGIN_NAME="wzrd-true-compact"
PLUGIN_DIR="$HOME/.config/opencode/plugins/$PLUGIN_NAME"
OPENCODE_CONFIG="$HOME/.config/opencode/opencode.jsonc"
PLUGIN_SOURCE="/home/mdwzrd/wzrd-redesign/wzrd-true-compact-plugin.js"

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

# Check prerequisites
echo "Checking prerequisites..."
if [ ! -f "$OPENCODE_CONFIG" ]; then
    log_error "OpenCode config not found: $OPENCODE_CONFIG"
    exit 1
fi

if [ ! -f "$PLUGIN_SOURCE" ]; then
    log_error "Plugin source not found: $PLUGIN_SOURCE"
    exit 1
fi

# Create plugin directory
echo "Creating plugin directory..."
mkdir -p "$PLUGIN_DIR"
log_success "Created: $PLUGIN_DIR"

# Copy plugin file
echo "Copying plugin..."
cp "$PLUGIN_SOURCE" "$PLUGIN_DIR/index.js"
log_success "Copied plugin to: $PLUGIN_DIR/index.js"

# Create package.json for plugin
echo "Creating package.json..."
cat > "$PLUGIN_DIR/package.json" << 'EOF'
{
  "name": "wzrd-true-compact",
  "version": "0.1.0",
  "type": "module",
  "main": "index.js",
  "description": "WZRD True Compact Plugin - Automatically resets chat after compaction",
  "license": "MIT",
  "opencode": {
    "plugin": true
  }
}
EOF
log_success "Created package.json"

# Update OpenCode config
echo "Updating OpenCode configuration..."

# Check if plugin already in config
if grep -q "\"\./plugins/$PLUGIN_NAME\"" "$OPENCODE_CONFIG"; then
    log_warn "Plugin already configured in $OPENCODE_CONFIG"
else
    # Add plugin to config
    # Using sed to insert after "plugin": [ line
    if grep -q '"plugin": \[' "$OPENCODE_CONFIG"; then
        # Insert after plugin array
        sed -i '/"plugin": \[/a\      "./plugins/wzrd-true-compact",' "$OPENCODE_CONFIG"
        log_success "Added plugin to OpenCode config"
    else
        log_warn "Could not find plugin array in config, manual addition needed"
        echo ""
        echo "Add this to your $OPENCODE_CONFIG:"
        echo '  "plugin": ['
        echo '    "@tarquinen/opencode-dcp@latest",'
        echo '    "./plugins/wzrd-true-compact"'
        echo '  ],'
    fi
fi

# Create test script
TEST_SCRIPT="$PLUGIN_DIR/test-plugin.sh"
echo "Creating test script..."
cat > "$TEST_SCRIPT" << 'EOF'
#!/bin/bash
# Test WZRD True Compact Plugin

echo "=== Testing WZRD True Compact Plugin ==="
echo ""

echo "Plugin installed at: $(pwd)"
echo ""

echo "To test:"
echo "1. Restart OpenCode:"
echo "   opencode --model nvidia/z-ai/glm4.7 --agent remi"
echo ""
echo "2. In OpenCode TUI:"
echo "   a. Type '/compact'"
echo "   b. Plugin should automatically trigger '/new'"
echo "   c. Continuation prompt should appear"
echo ""
echo "3. Expected behavior:"
echo "   • Chat resets automatically after compaction"
echo "   • No manual '/new' command needed"
echo "   • Continuation prompt injected"
echo ""
echo "4. Check logs:"
echo "   Look for '[wzrd-true-compact]' in OpenCode logs"
echo ""
echo "Note: Plugin logs to console, check OpenCode output"
EOF

chmod +x "$TEST_SCRIPT"
log_success "Created test script: $TEST_SCRIPT"

# Create uninstall script
UNINSTALL_SCRIPT="$PLUGIN_DIR/uninstall.sh"
echo "Creating uninstall script..."
cat > "$UNINSTALL_SCRIPT" << 'EOF'
#!/bin/bash
# Uninstall WZRD True Compact Plugin

echo "=== Uninstalling WZRD True Compact Plugin ==="
echo ""

PLUGIN_DIR="$HOME/.config/opencode/plugins/wzrd-true-compact"
OPENCODE_CONFIG="$HOME/.config/opencode/opencode.jsonc"

if [ -d "$PLUGIN_DIR" ]; then
    echo "Removing plugin directory..."
    rm -rf "$PLUGIN_DIR"
    echo "✅ Plugin directory removed"
else
    echo "⚠ Plugin directory not found: $PLUGIN_DIR"
fi

if [ -f "$OPENCODE_CONFIG" ]; then
    echo "Cleaning up OpenCode config..."
    # Remove plugin from config
    sed -i '/\.\/plugins\/wzrd-true-compact/d' "$OPENCODE_CONFIG"
    echo "✅ Plugin removed from config"
else
    echo "⚠ OpenCode config not found"
fi

echo ""
echo "Uninstall complete. Restart OpenCode to apply changes."
EOF

chmod +x "$UNINSTALL_SCRIPT"
log_success "Created uninstall script: $UNINSTALL_SCRIPT"

echo ""
echo "=== Installation Summary ==="
echo "✅ Plugin installed: $PLUGIN_DIR"
echo "✅ Source: $PLUGIN_SOURCE"
echo "✅ Config updated: $OPENCODE_CONFIG"
echo "✅ Test script: $TEST_SCRIPT"
echo "✅ Uninstall script: $UNINSTALL_SCRIPT"
echo ""
echo "=== Next Steps ==="
echo "1. Restart OpenCode:"
echo "   opencode --model nvidia/z-ai/glm4.7 --agent remi"
echo ""
echo "2. Test the plugin:"
echo "   $TEST_SCRIPT"
echo ""
echo "3. Use OpenCode normally:"
echo "   • Plugin auto-triggers after /compact"
echo "   • No manual /new needed"
echo "   • Continuation prompt auto-injected"
echo ""
echo "=== Troubleshooting ==="
echo "If plugin doesn't work:"
echo "1. Check OpenCode logs for '[wzrd-true-compact]' messages"
echo "2. Verify plugin in config: grep 'wzrd-true-compact' $OPENCODE_CONFIG"
echo "3. Check plugin file: ls -la $PLUGIN_DIR/"
echo "4. Restart OpenCode"
echo ""
echo "=== Plugin Behavior ==="
echo "When /compact is executed in OpenCode:"
echo "1. Plugin detects /compact command"
echo "2. Waits 1 second (for compaction to finish)"
echo "3. Executes /new command (resets chat)"
echo "4. Injects continuation prompt"
echo "5. Chat continues with fresh context"
echo ""
echo "Result: True chat reset like Claude's compact!"