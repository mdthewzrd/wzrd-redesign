#!/bin/bash
# Setup PATH for /wzrd-compact commands

echo "=== Setting up PATH for WZRD Compact Commands ==="

# Check if .local/bin is in PATH
if ! echo "$PATH" | grep -q ".local/bin"; then
  echo "Adding ~/.local/bin to PATH..."
  
  # Add to bashrc
  echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
  
  # Add to zshrc if it exists
  if [ -f ~/.zshrc ]; then
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
  fi
  
  # Export for current session
  export PATH="$HOME/.local/bin:$PATH"
  
  echo "✅ Added to PATH. Reload shell or run:"
  echo "   source ~/.bashrc"
else
  echo "✅ ~/.local/bin already in PATH"
fi

echo ""
echo "=== Commands Available ==="
echo ""
echo "To use in OpenCode TUI:"
echo "  /wzrd-compact     - Truly reset chat (like Claude)"
echo "  /wzrdc            - Short version"
echo ""
echo "Or use bash aliases (if set up):"
echo "  compact           - Same as /wzrd-compact"
echo "  compact-status    - Show token usage"
echo "  compact-check     - Check current tokens"
echo "  compact-monitor   - Start auto-monitor"
echo "  compact-stop      - Stop auto-monitor"
echo ""
echo "=== Test Commands ==="
echo ""
echo "Test /wzrd-compact:"
echo "  wzrd-compact-command"
echo ""
echo "Test short version:"
echo "  wzrdc"
echo ""
echo "Check current token usage:"
echo "  ~/wzrd-redesign/wzrd-compact-solution.sh check"
echo ""
echo "=== Documentation ==="
echo "See: ~/wzrd-redesign/WZRD-COMPACT-COMMANDS.md"