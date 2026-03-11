#!/bin/bash
# Research OpenCode Dynamic Context Pruning Plugin availability

echo "Researching OpenCode Dynamic Context Pruning Plugin..."

# Check GitHub URL
PLUGIN_URL="https://github.com/Opencode-DCP/opencode-dynamic-context-pruning"
echo "Plugin URL: $PLUGIN_URL"

# Try to access repository
echo "Checking repository accessibility..."
HTTP_STATUS=$(curl -s -I "$PLUGIN_URL" | head -1)
echo "HTTP Status: $HTTP_STATUS"

# Check if plugin mentioned in OpenCode docs
if [ -d ~/.config/opencode ]; then
    echo "✅ OpenCode config directory exists at ~/.config/opencode"
    echo "Contents:"
    ls -la ~/.config/opencode/
else
    echo "⚠ OpenCode config directory not found at ~/.config/opencode"
fi

echo ""
echo "=== Plugin Information ==="
echo ""
echo "Repository: https://github.com/Opencode-DCP/opencode-dynamic-context-pruning"
echo "Description: Dynamic context pruning plugin for OpenCode - intelligently manages conversation context to optimize token usage"
echo "Stars: 1.2k"
echo "Latest Release: v2.1.8 (Feb 25, 2026)"
echo "License: AGPL-3.0"
echo ""
echo "=== Installation Methods ==="
echo "1. Add to OpenCode config: {\"plugin\": [\"@tarquinen/opencode-dcp@latest\"]}"
echo "2. NPM: @tarquinen/opencode-dcp"
echo "3. Manual configuration"
echo ""
echo "=== Next Steps ==="
echo "1. Check npm package availability"
echo "2. Test installation"
echo "3. Configure plugin"
echo "4. Run tests"