#!/bin/bash
# OpenCode wrapper that adds custom slash commands
# Intercepts input before passing to OpenCode

echo "=== OpenCode with Custom Slash Commands ==="
echo "Adds /wzrd-compact and /compact commands"
echo ""

# Check if OpenCode is installed
if ! command -v opencode &> /dev/null; then
  echo "Error: OpenCode not found in PATH"
  exit 1
fi

# Function to handle custom commands
handle_custom_command() {
  local input="$1"
  
  case "$input" in
    "/wzrd-compact"|"/compact")
      echo "Running WZRD True Compact..."
      ~/wzrd-redesign/wzrd-compact-solution.sh compact
      return 0
      ;;
    "/wzrd-status")
      ~/wzrd-redesign/wzrd-compact-solution.sh status
      return 0
      ;;
    "/wzrd-monitor")
      ~/wzrd-redesign/wzrd-compact-solution.sh monitor
      return 0
      ;;
    *)
      # Not our command, pass through
      return 1
      ;;
  esac
}

# Main function
run_opencode() {
  echo "Starting OpenCode with custom slash commands..."
  echo "Available: /wzrd-compact, /compact, /wzrd-status, /wzrd-monitor"
  echo ""
  
  # We can't actually intercept TUI input without modifying OpenCode
  # But we can create a wrapper that explains the limitation
  
  echo "⚠️  Technical Limitation:"
  echo "OpenCode doesn't allow intercepting TUI input."
  echo ""
  echo "Instead, use these bash commands in OpenCode TUI:"
  echo "  compact          - Same as /wzrd-compact"
  echo "  compact-status   - Same as /wzrd-status"
  echo "  compact-monitor  - Same as /wzrd-monitor"
  echo ""
  echo "Or from terminal:"
  echo "  wzrd.dev --true-compact"
  echo ""
  
  # Launch OpenCode normally
  opencode "$@"
}

# Check if we're trying to run a custom command
if [[ "$1" == "--slash-test" ]]; then
  handle_custom_command "$2"
  exit $?
fi

# Otherwise run OpenCode
run_opencode "$@"