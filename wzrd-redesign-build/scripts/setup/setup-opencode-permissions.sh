#!/bin/bash
# Setup OpenCode permissions for WZRD redesign project
# Run this script to grant full permissions to Remi in this project

set -e  # Exit on error

echo "=== WZRD OpenCode Permission Setup ==="
echo "This script will configure OpenCode to grant full permissions"
echo "to Remi when working in the wzrd-redesign project."
echo ""

# Backup current config
BACKUP_DIR="/tmp/opencode-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "Creating backup in $BACKUP_DIR..."

if [ -f "$HOME/.opencode.jsonc" ]; then
  cp "$HOME/.opencode.jsonc" "$BACKUP_DIR/opencode.jsonc.backup"
  echo "✓ Backed up global config"
fi

if [ -f "$HOME/.config/opencode/projects/wzrd-redesign.jsonc" ]; then
  cp "$HOME/.config/opencode/projects/wzrd-redesign.jsonc" "$BACKUP_DIR/wzrd-redesign.jsonc.backup"
  echo "✓ Backed up project config"
fi

# Create project directory
mkdir -p "$HOME/.config/opencode/projects"

# Create project-specific config
echo "Creating project config..."
cat > "$HOME/.config/opencode/projects/wzrd-redesign.jsonc" << 'EOF'
{
  "$schema": "https://opencode.ai/config.json",
  
  "permission": {
    "*": "allow",
    
    "bash": {
      "*": "allow"
    },
    
    "read": {
      "*": "allow"
    },
    "edit": {
      "*": "allow"
    },
    "write": {
      "*": "allow"
    },
    "glob": {
      "*": "allow"
    },
    "grep": {
      "*": "allow"
    },
    "list": {
      "*": "allow"
    },
    
    "task": "allow",
    "skill": "allow",
    "todoread": "allow",
    "todowrite": "allow",
    "webfetch": "allow",
    "websearch": "allow",
    "codesearch": "allow",
    
    "external_directory": {
      "/home/mdwzrd/wzrd-redesign/**": "allow",
      "/home/mdwzrd/wzrd.dev/**": "allow",
      "~/.claude/**": "allow",
      "~/.opencode/**": "allow"
    },
    
    "doom_loop": "ask"
  },
  
  "agent": {
    "remi": {
      "permission": {
        "*": "allow",
        "bash": {
          "*": "allow"
        }
      }
    }
  }
}
EOF

echo "✓ Created project config at $HOME/.config/opencode/projects/wzrd-redesign.jsonc"

# Create local project config (for when OpenCode starts in this directory)
echo "Creating local project config..."
cat > "$PWD/.opencode.jsonc" << 'EOF'
{
  "$schema": "https://opencode.ai/config.json",
  
  "permission": {
    "*": "allow",
    
    "bash": {
      "*": "allow"
    },
    
    "read": {
      "*": "allow"
    },
    "edit": {
      "*": "allow"
    },
    "write": {
      "*": "allow"
    },
    "glob": {
      "*": "allow"
    },
    "grep": {
      "*": "allow"
    },
    "list": {
      "*": "allow"
    },
    
    "task": "allow",
    "skill": "allow",
    "todoread": "allow",
    "todowrite": "allow",
    "webfetch": "allow",
    "websearch": "allow",
    "codesearch": "allow",
    
    "external_directory": {
      "/home/mdwzrd/wzrd-redesign/**": "allow",
      "/home/mdwzrd/wzrd.dev/**": "allow",
      "~/.claude/**": "allow",
      "~/.opencode/**": "allow"
    },
    
    "doom_loop": "ask"
  },
  
  "agent": {
    "remi": {
      "permission": {
        "*": "allow",
        "bash": {
          "*": "allow"
        }
      }
    }
  }
}
EOF

echo "✓ Created local config at $PWD/.opencode.jsonc"

# Create rollback script
cat > "$BACKUP_DIR/rollback-permissions.sh" << 'EOF'
#!/bin/bash
# Rollback OpenCode permissions

echo "=== Rolling back OpenCode permissions ==="

if [ -f "$HOME/.opencode.jsonc.backup" ]; then
  mv "$HOME/.opencode.jsonc" "$HOME/.opencode.jsonc.disabled" 2>/dev/null || true
  mv "$HOME/.opencode.jsonc.backup" "$HOME/.opencode.jsonc"
  echo "✓ Restored global config"
fi

if [ -f "$HOME/.config/opencode/projects/wzrd-redesign.jsonc.backup" ]; then
  mv "$HOME/.config/opencode/projects/wzrd-redesign.jsonc" "$HOME/.config/opencode/projects/wzrd-redesign.jsonc.disabled" 2>/dev/null || true
  mv "$HOME/.config/opencode/projects/wzrd-redesign.jsonc.backup" "$HOME/.config/opencode/projects/wzrd-redesign.jsonc"
  echo "✓ Restored project config"
fi

rm -f "$PWD/.opencode.jsonc"
echo "✓ Removed local config"

echo ""
echo "Rollback complete. You may need to restart OpenCode for changes to take effect."
EOF

chmod +x "$BACKUP_DIR/rollback-permissions.sh"

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Summary:"
echo "1. Created project config at ~/.config/opencode/projects/wzrd-redesign.jsonc"
echo "2. Created local config at $PWD/.opencode.jsonc"
echo "3. Backup created at $BACKUP_DIR"
echo ""
echo "⚠️  IMPORTANT: You need to RESTART OpenCode for these changes to take effect."
echo ""
echo "To rollback if needed, run:"
echo "  $BACKUP_DIR/rollback-permissions.sh"
echo ""
echo "Permissions granted:"
echo "  ✓ Full bash command execution"
echo "  ✓ Full file read/write/edit access"
echo "  ✓ All tools enabled"
echo "  ✓ External directory access to WZRD ecosystem"
echo "  ✓ Doom loop protection remains (asks for permission)"
echo ""
echo "Remi should now run without permission prompts in this project."