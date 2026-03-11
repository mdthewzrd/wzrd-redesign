#!/bin/bash
# Benchmark wzrd.dev performance
# Check if optimizations are working

echo "=== WZRD.dev PERFORMANCE BENCHMARK ==="
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TIMEFORMAT='%R seconds'

# Kill existing OpenCode
pkill -f opencode 2>/dev/null
sleep 2

echo "1. 🚀 Cold Start Test (no OpenCode running)"
echo "------------------------------------------"
time bash -c 'wzrd.dev --health >/dev/null 2>&1'

echo ""
echo "2. 🔧 Skill Loading Test"
echo "----------------------"
echo "Checking smart skill loader..."
if node "$SCRIPT_DIR/bin/smart-skill-loader.js" --mode coder --message "test" 2>/dev/null | grep -q "Loading"; then
  echo "✅ Smart skill loader working"
else
  echo "❌ Smart skill loader NOT working"
fi

echo ""
echo "3. 🧠 Memory System Test"
echo "----------------------"
if node "$SCRIPT_DIR/bin/capture-conversation.js" test "benchmark" "test" 2>/dev/null; then
  echo "✅ Memory capture working"
else
  echo "❌ Memory capture NOT working"
fi

echo ""
echo "4. 📊 Token Dashboard Test"
echo "-------------------------"
if node "$SCRIPT_DIR/bin/token-dashboard.js" --mode chat 2>/dev/null | grep -q "Token"; then
  echo "✅ Token dashboard working"
else
  echo "❌ Token dashboard NOT working"
fi

echo ""
echo "5. 🩺 Health Monitor Test"
echo "------------------------"
if node "$SCRIPT_DIR/bin/health-monitor.js" 2>/dev/null | grep -q "Health"; then
  echo "✅ Health monitor working"
else
  echo "❌ Health monitor NOT working"
fi

echo ""
echo "6. ⚡ Compact System Test"
echo "-----------------------"
time bash -c 'tui-compact >/dev/null 2>&1'

echo ""
echo "=== OPTIMIZATION CHECK ==="
echo ""
echo "Expected optimizations:"
echo "1. Smart skill loading → Only 4-5 skills vs 65+"
echo "2. Token reduction → ~90% savings"
echo "3. Mode detection → Auto-switch based on task"
echo "4. Memory integration → Conversations captured"
echo "5. Compact automation → Auto-trigger at 75%"

echo ""
echo "=== RECOMMENDATIONS ==="
echo ""
echo "If wzrd.dev feels slow:"
echo "1. Ensure ONE OpenCode instance: pkill -f opencode"
echo "2. Use compact regularly: tui-compact"
echo "3. Check auto-monitor: ~/wzrd-redesign/auto-compact-workflow.sh status"
echo "4. Verify skill loading: wzrd.dev --skills"
echo ""
echo "For maximum speed:"
echo "1. Kill all OpenCode first"
echo "2. Run: wzrd.dev (fresh start)"
echo "3. Use: tui-compact when context grows"
echo "4. Monitor with: compact-status"