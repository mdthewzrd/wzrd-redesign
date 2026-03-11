#!/bin/bash
# Slash command workaround for OpenCode
# Since OpenCode doesn't allow registering new slash commands,
# we work around it

echo "=== Slash Command Workaround ==="
echo ""
echo "OpenCode doesn't support registering new slash commands."
echo "But we have alternatives:"
echo ""

echo "1. ✅ Type WITHOUT slash:"
echo "   wzrd-compact"
echo ""
echo "2. ✅ Create bash alias:"
echo "   alias compact='wzrd-compact'"
echo "   Then type: compact"
echo ""
echo "3. ✅ Intercept OpenCode's /compact:"
echo "   We can detect when /compact is typed and run our version"
echo ""
echo "4. ✅ Use wzrd-mode command:"
echo "   wzrd --true-compact"
echo ""

echo "=== Recommended Approach ==="
echo ""
echo "Add to ~/.bashrc or ~/.zshrc:"
echo '  alias compact="wzrd-compact"'
echo '  export PATH="$HOME/.local/bin:$PATH"'
echo ""
echo "Then in OpenCode TUI, type:"
echo "  compact"
echo ""
echo "It will:"
echo "  1. Truly reset chat (like Claude)"
echo "  2. Back up conversation"
echo "  3. Inject continuation prompt"
echo "  4. Work 100% reliably"
echo ""

echo "=== Why No /wzrd-compact? ==="
echo "OpenCode's slash commands are hardcoded:"
echo "  /compact, /new, /help, /models, /session, etc."
echo ""
echo "You can't add new ones without modifying OpenCode source."
echo "But our bash-based solution works perfectly without slashes."