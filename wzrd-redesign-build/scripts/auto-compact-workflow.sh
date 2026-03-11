#!/bin/bash
# Auto Compact Workflow
# Integrates auto-context monitoring with wzrd.dev

echo "=== Auto Compact Workflow ==="
echo "Monitors context and auto-compacts at 75% usage"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AUTO_COMPACT_JS="$SCRIPT_DIR/auto-context-compact.js"
COMPACT_SOLUTION="$SCRIPT_DIR/wzrd-compact-solution.sh"
PID_FILE="$HOME/.local/state/opencode/auto-compact.pid"
LOG_FILE="$HOME/.local/state/opencode/auto-compact.log"

# Ensure node is available
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Required for auto-compact."
  exit 1
fi

# Start auto-monitor
start_auto_monitor() {
  echo "🔍 Starting Auto Context Monitor (75% threshold)..."
  
  # Kill existing monitor if running
  if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if kill -0 "$OLD_PID" 2>/dev/null; then
      echo "Stopping existing monitor (PID $OLD_PID)..."
      kill "$OLD_PID"
    fi
    rm -f "$PID_FILE"
  fi
  
  # Start new monitor in background
  node "$AUTO_COMPACT_JS" monitor >> "$LOG_FILE" 2>&1 &
  MONITOR_PID=$!
  
  echo "$MONITOR_PID" > "$PID_FILE"
  echo "✅ Monitor started (PID $MONITOR_PID)"
  echo "Logs: $LOG_FILE"
  
  # Show current status
  echo ""
  node "$AUTO_COMPACT_JS" check
}

# Stop auto-monitor
stop_auto_monitor() {
  echo "🛑 Stopping Auto Context Monitor..."
  
  if [ -f "$PID_FILE" ]; then
    MONITOR_PID=$(cat "$PID_FILE")
    if kill -0 "$MONITOR_PID" 2>/dev/null; then
      kill "$MONITOR_PID"
      echo "✅ Monitor stopped (PID $MONITOR_PID)"
    else
      echo "⚠️  Monitor not running"
    fi
    rm -f "$PID_FILE"
  else
    echo "⚠️  No monitor PID file found"
  fi
}

# Check current status
check_status() {
  echo "=== Auto Compact Status ==="
  
  if [ -f "$PID_FILE" ]; then
    MONITOR_PID=$(cat "$PID_FILE")
    if kill -0 "$MONITOR_PID" 2>/dev/null; then
      echo "Monitor: RUNNING (PID $MONITOR_PID)"
    else
      echo "Monitor: STOPPED (PID file exists but process dead)"
    fi
  else
    echo "Monitor: STOPPED"
  fi
  
  echo ""
  node "$AUTO_COMPACT_JS" check
  
  echo ""
  echo "Recent logs:"
  tail -10 "$LOG_FILE" 2>/dev/null || echo "No log file"
}

# Integrate with wzrd.dev launch
integrate_with_wzrd() {
  echo "=== Integrating with wzrd.dev ==="
  
  # Update wzrd-mode to start auto-monitor
  if grep -q "auto-context-compact" "$SCRIPT_DIR/wzrd-mode"; then
    echo "✅ Already integrated with wzrd-mode"
  else
    echo "Adding auto-compact to wzrd-mode launch..."
    
    # Backup original
    cp "$SCRIPT_DIR/wzrd-mode" "$SCRIPT_DIR/wzrd-mode.backup"
    
    # Find the compact monitor section
    # We'll add after existing compact monitor start
    echo "Integration requires manual update to wzrd-mode"
    echo ""
    echo "Add this to wzrd-mode (around line 320):"
    echo ""
    echo '    # Start auto-context monitor'
    echo '    echo "🔍 Starting Auto Context Monitor (75% threshold)..."'
    echo "    (cd \"\$SCRIPT_DIR\" && ./auto-context-compact.js monitor >/dev/null 2>&1 &)"
    echo ""
  fi
  
  # Create wrapper for wzrd.dev
  cat > ~/.local/bin/wzrd-auto-compact << 'EOF'
#!/bin/bash
# wzrd.dev with auto-compact integration

cd ~/wzrd-redesign

# Start auto-compact monitor
if [ ! -f ~/.local/state/opencode/auto-compact.pid ] || \
   ! kill -0 $(cat ~/.local/state/opencode/auto-compact.pid) 2>/dev/null; then
  echo "🔍 Starting Auto Context Monitor..."
  ./auto-context-compact.js monitor >/dev/null 2>&1 &
fi

# Show current status
echo "📊 Context status:"
./auto-context-compact.js check

# Launch wzrd.dev
exec ./wzrd-mode "$@"
EOF
  
  chmod +x ~/.local/bin/wzrd-auto-compact
  
  echo "✅ Created: wzrd-auto-compact"
  echo "Usage: wzrd-auto-compact [args]"
}

# Main command handling
case "${1:-status}" in
  "start")
    start_auto_monitor
    ;;
  "stop")
    stop_auto_monitor
    ;;
  "status")
    check_status
    ;;
  "check")
    node "$AUTO_COMPACT_JS" check
    ;;
  "compact")
    node "$AUTO_COMPACT_JS" compact
    ;;
  "integrate")
    integrate_with_wzrd
    ;;
  "test")
    echo "=== Test Auto Compact ==="
    echo "1. Current status:"
    node "$AUTO_COMPACT_JS" check
    echo ""
    echo "2. Forcing compact (for testing):"
    node "$AUTO_COMPACT_JS" compact
    echo ""
    echo "3. Status after compact:"
    node "$AUTO_COMPACT_JS" check
    ;;
  *)
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  start     - Start auto-monitor (75% threshold)"
    echo "  stop      - Stop auto-monitor"
    echo "  status    - Show current status"
    echo "  check     - Check if should compact"
    echo "  compact   - Run compact immediately"
    echo "  integrate - Integrate with wzrd.dev"
    echo "  test      - Run comprehensive test"
    echo ""
    echo "Auto-compact will trigger when context reaches 75%"
    echo "Default: 128K context window, triggers at 96K tokens"
    ;;
esac