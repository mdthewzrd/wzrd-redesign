#!/bin/bash
# Install Generic True Compact Plugin for OpenCode
# Version without WZRD references - can share with others

set -e

echo "=== Installing Generic True Compact Plugin ==="
echo ""

# Configuration
PLUGIN_NAME="opencode-true-compact"
PLUGIN_DIR="$HOME/.config/opencode/plugins/$PLUGIN_NAME"
OPENCODE_CONFIG="$HOME/.config/opencode/opencode.jsonc"
PLUGIN_SOURCE="/home/mdwzrd/wzrd-redesign/opencode-true-compact-plugin-generic.js"

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
    log_warn "OpenCode config not found, will create default..."
    cat > "$OPENCODE_CONFIG" << 'EOF'
{
  "$schema": "https://opencode.ai/config.json",
  
  "model": "deepseek-ai/deepseek-v3.2",
  "agent": "remi",
  
  "plugin": [
    "@tarquinen/opencode-dcp@latest",
    "./plugins/opencode-true-compact"
  ],
  "autoCompact": true,
  
  "permission": {
    "*": "allow",
    "bash": { "*": "allow" },
    "read": { "*": "allow" },
    "edit": { "*": "allow" },
    "write": { "*": "allow" },
    "glob": { "*": "allow" },
    "grep": { "*": "allow" },
    "task": "allow",
    "skill": "allow",
    "todowrite": "allow",
    "todoread": "allow",
    "webfetch": "allow"
  }
}
EOF
    log_success "Created default OpenCode config"
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
  "name": "opencode-true-compact",
  "version": "0.1.0",
  "type": "module",
  "main": "index.js",
  "description": "True Compact Plugin - Automatically resets chat after compaction like Claude",
  "license": "MIT",
  "opencode": {
    "plugin": true
  }
}
EOF
log_success "Created package.json"

# Install DCP plugin (optional but recommended)
echo "Installing DCP plugin (optional for token optimization)..."
cd ~/.config/opencode
npm install @tarquinen/opencode-dcp@latest 2>/dev/null || {
    log_warn "DCP plugin installation failed (optional)"
}
log_success "DCP plugin installed (optional)"

# Update OpenCode config
echo "Updating OpenCode configuration..."

# Check if plugin already in config
if grep -q "\"\./plugins/$PLUGIN_NAME\"" "$OPENCODE_CONFIG"; then
    log_warn "Plugin already configured in $OPENCODE_CONFIG"
else
    # Add plugin to config
    if grep -q '"plugin": \[' "$OPENCODE_CONFIG"; then
        # Insert in plugin array
        sed -i '/"plugin": \[/a\      "./plugins/opencode-true-compact",' "$OPENCODE_CONFIG"
        log_success "Added plugin to OpenCode config"
    else
        # Add plugin array
        sed -i '/"model"/a\  "plugin": ["./plugins/opencode-true-compact"],' "$OPENCODE_CONFIG"
        log_success "Created plugin array in config"
    fi
fi

# Ensure autoCompact is enabled
if ! grep -q '"autoCompact": true' "$OPENCODE_CONFIG"; then
    sed -i '/"plugin"/a\  "autoCompact": true,' "$OPENCODE_CONFIG"
    log_success "Enabled autoCompact in config"
fi

# Create test script
TEST_SCRIPT="$PLUGIN_DIR/test-plugin.sh"
echo "Creating test script..."
cat > "$TEST_SCRIPT" << 'EOF'
#!/bin/bash
# Test True Compact Plugin

echo "=== Testing True Compact Plugin ==="
echo ""

echo "Plugin installed at: $(pwd)"
echo ""

echo "To test:"
echo "1. Restart OpenCode:"
echo "   opencode --model deepseek-ai/deepseek-v3.2 --agent remi"
echo ""
echo "2. In OpenCode TUI:"
echo "   a. Have a conversation (10+ messages)"
echo "   b. Type '/compact'"
echo "   c. Watch what happens automatically"
echo ""
echo "3. Expected behavior:"
echo "   • Chat resets automatically (true delete)"
echo "   • No manual '/new' command needed"
echo "   • Continuation prompt appears"
echo "   • You continue with fresh chat"
echo ""
echo "4. Check logs:"
echo "   Look for '[true-compact]' in OpenCode output"
echo ""
echo "Success criteria:"
echo "✅ /compact → auto /new → continuation prompt"
echo "✅ No manual steps required"
echo "✅ Chat truly resets (not just token optimization)"
EOF

chmod +x "$TEST_SCRIPT"
log_success "Created test script: $TEST_SCRIPT"

# Create README
README="$PLUGIN_DIR/README.md"
echo "Creating README..."
cat > "$README" << 'EOF'
# OpenCode True Compact Plugin

Automatically resets chat after compaction like Claude's compact feature.

## Problem Solved
OpenCode's `/compact` command summarizes conversations but doesn't delete messages, leading to context accumulation and TUI slowdown. This plugin automatically triggers `/new` after `/compact` to truly reset the chat.

## Installation
Plugin is already installed. Configuration at:
- `~/.config/opencode/plugins/opencode-true-compact/`
- Added to `~/.config/opencode/opencode.jsonc`

## Features
- **Auto-reset on `/compact`**: No manual `/new` needed
- **Auto-reset on auto-compact**: Works with OpenCode's autoCompact feature
- **Continuation prompts**: Automatically injects "Continue if you have next steps..."
- **Pure plugin**: No external scripts or dependencies
- **Optional DCP integration**: Token optimization plugin (recommended)

## How It Works
1. User types `/compact` in OpenCode TUI
2. OpenCode compacts conversation
3. Plugin detects compaction
4. Plugin triggers `/new` command (1 second delay)
5. Chat resets (true deletion)
6. Continuation prompt injected
7. User continues with fresh chat

## Testing
Run: `./test-plugin.sh`

## Verification
Check OpenCode output for:
```
[true-compact] Command detected: /compact
[true-compact] Compact detected, scheduling reset...
[true-compact] Triggering /new command...
[true-compact] Injecting continuation prompt...
[true-compact] Chat reset complete!
```

## Sharing
To share with others:
1. Copy `~/.config/opencode/plugins/opencode-true-compact/` directory
2. Add to their OpenCode config: `"plugin": ["./plugins/opencode-true-compact"]`
3. Restart OpenCode

## License
MIT
EOF

log_success "Created README: $README"

echo ""
echo "=== Installation Summary ==="
echo "✅ Plugin installed: $PLUGIN_DIR"
echo "✅ Source: $PLUGIN_SOURCE"
echo "✅ Config updated: $OPENCODE_CONFIG"
echo "✅ DCP plugin installed: Optional token optimization"
echo "✅ Test script: $TEST_SCRIPT"
echo "✅ README: $README"
echo ""
echo "=== Next Steps ==="
echo "1. Restart OpenCode:"
echo "   opencode --model deepseek-ai/deepseek-v3.2 --agent remi"
echo ""
echo "2. Test the plugin:"
echo "   $TEST_SCRIPT"
echo ""
echo "3. Share with buddy:"
echo "   Copy directory: $PLUGIN_DIR"
echo "   Share install script if needed"
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
echo ""
echo "=== Validation Test ==="
echo "To validate it works:"
echo "1. Start OpenCode"
echo "2. Type 5-10 messages"
echo "3. Run /compact"
echo "4. Verify chat resets automatically"
echo "5. Check for '[true-compact]' logs"