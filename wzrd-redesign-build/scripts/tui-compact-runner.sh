#!/bin/bash
# TUI Compact Runner
# Ways to run compact from within OpenCode TUI

echo "=== Running Compact from OpenCode TUI ==="
echo ""

echo "Method 1: Use bash tool (if available)"
echo "----------------------------------------"
echo "If OpenCode gives you bash tool access, you can:"
echo "1. Select 'bash' tool"
echo "2. Type: compact"
echo "3. Execute"
echo ""

echo "Method 2: Direct bash command"
echo "------------------------------"
echo "Type this exact text in TUI:"
echo "bash -c 'compact'"
echo ""

echo "Method 3: Use full path"
echo "------------------------"
echo "bash -c '~/wzrd-redesign/wzrd-compact-solution.sh compact'"
echo ""

echo "Method 4: Create TUI wrapper script"
echo "------------------------------------"
echo "Create ~/.local/bin/tui-compact:"
echo '#!/bin/bash'
echo 'exec ~/wzrd-redesign/wzrd-compact-solution.sh compact'
echo ""
echo "Then type: bash -c 'tui-compact'"
echo ""

echo "Method 5: Ask the AI to run it"
echo "-------------------------------"
echo "Type: Please run the compact command"
echo "The AI might use bash tool to run it"
echo ""

echo "=== Current Setup Check ==="
echo ""

# Check if compact alias exists
if alias compact 2>/dev/null | grep -q "wzrd-compact"; then
  echo "✅ compact alias: SET (compact = wzrd-compact)"
else
  echo "❌ compact alias: NOT SET"
  echo "   Run: echo 'alias compact=\"wzrd-compact\"' >> ~/.bashrc"
fi

# Check if wzrd-compact exists
if command -v wzrd-compact &> /dev/null; then
  echo "✅ wzrd-compact command: AVAILABLE"
else
  echo "❌ wzrd-compact command: NOT FOUND"
  echo "   Check: ls -la ~/.local/bin/wzrd*"
fi

# Check if in PATH
if echo "$PATH" | grep -q ".local/bin"; then
  echo "✅ ~/.local/bin in PATH"
else
  echo "❌ ~/.local/bin NOT in PATH"
  echo "   Add: export PATH=\"\$HOME/.local/bin:\$PATH\""
fi

echo ""
echo "=== Recommendation ==="
echo "In OpenCode TUI, type:"
echo "bash -c 'compact'"
echo ""
echo "Or if bash tool is available, use it to run: compact"
echo ""
echo "Test now:"
echo "bash -c 'compact'"