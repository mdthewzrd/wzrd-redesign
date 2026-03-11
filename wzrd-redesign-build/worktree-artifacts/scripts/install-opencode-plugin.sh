#!/bin/bash
# Install OpenCode Dynamic Context Pruning Plugin

echo "=== Installing OpenCode Dynamic Context Pruning Plugin ==="
echo "Date: $(date)"
echo ""

# Check if we're in the right directory
if [ ! -f package.json ]; then
    echo "⚠ Not in project root with package.json"
    echo "Changing to ~/.config/opencode"
    cd ~/.config/opencode || exit 1
fi

echo "Step 1: Checking npm package availability..."
NPM_CHECK=$(npm view @tarquinen/opencode-dcp 2>&1)
if echo "$NPM_CHECK" | grep -q "not found"; then
    echo "❌ NPM package not found"
    exit 1
else
    echo "✅ NPM package found: @tarquinen/opencode-dcp"
    echo "$NPM_CHECK" | head -5
fi

echo ""
echo "Step 2: Installing plugin..."
npm install @tarquinen/opencode-dcp@latest
INSTALL_STATUS=$?

if [ $INSTALL_STATUS -eq 0 ]; then
    echo "✅ Plugin installed successfully"
else
    echo "❌ Plugin installation failed"
    exit 1
fi

echo ""
echo "Step 3: Creating OpenCode configuration..."
CONFIG_FILE="$HOME/.config/opencode/opencode.jsonc"
if [ ! -f "$CONFIG_FILE" ]; then
    echo "Creating new OpenCode config..."
    cat > "$CONFIG_FILE" << 'EOF'
{
  "$schema": "https://opencode.ai/config.json",
  
  "model": "nvidia/z-ai/glm4.7",
  "agent": "remi",
  
  "plugin": ["@tarquinen/opencode-dcp@latest"],
  
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
    echo "✅ Created $CONFIG_FILE"
else
    echo "⚠ Config file already exists: $CONFIG_FILE"
    echo "You need to manually add: \"plugin\": [\"@tarquinen/opencode-dcp@latest\"]"
fi

echo ""
echo "Step 4: Creating DCP configuration..."
DCP_CONFIG_DIR="$HOME/.config/opencode"
DCP_CONFIG_FILE="$DCP_CONFIG_DIR/dcp.jsonc"

if [ ! -f "$DCP_CONFIG_FILE" ]; then
    echo "Creating DCP configuration..."
    cat > "$DCP_CONFIG_FILE" << 'EOF'
{
  "$schema": "https://raw.githubusercontent.com/Opencode-DCP/opencode-dynamic-context-pruning/master/dcp.schema.json",
  
  "enabled": true,
  "debug": false,
  "pruneNotification": "detailed",
  "pruneNotificationType": "chat",
  
  "commands": {
    "enabled": true,
    "protectedTools": []
  },
  
  "manualMode": {
    "enabled": false,
    "automaticStrategies": true
  },
  
  "tools": {
    "settings": {
      "nudgeEnabled": true,
      "nudgeFrequency": 10,
      "contextLimit": 100000,
      "protectedTools": []
    },
    "distill": {
      "permission": "allow",
      "showDistillation": false
    },
    "compress": {
      "permission": "deny",
      "showCompression": false
    },
    "prune": {
      "permission": "allow"
    }
  },
  
  "strategies": {
    "deduplication": {
      "enabled": true,
      "protectedTools": []
    },
    "supersedeWrites": {
      "enabled": true
    },
    "purgeErrors": {
      "enabled": true,
      "turns": 4,
      "protectedTools": []
    }
  }
}
EOF
    echo "✅ Created $DCP_CONFIG_FILE"
else
    echo "⚠ DCP config already exists: $DCP_CONFIG_FILE"
fi

echo ""
echo "=== Installation Summary ==="
echo "✅ NPM package installed: @tarquinen/opencode-dcp"
echo "✅ OpenCode config: $CONFIG_FILE"
echo "✅ DCP config: $DCP_CONFIG_FILE"
echo ""
echo "=== Next Steps ==="
echo "1. Restart OpenCode to load plugin"
echo "2. Run /dcp command to verify installation"
echo "3. Monitor prompt-history.jsonl changes"
echo "4. Test with /compact command"