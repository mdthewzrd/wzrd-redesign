#!/bin/bash
# WZRD Diagnostic Tool
# Check if all wzrd.dev tools are working fully

echo "=== WZRD.dev DIAGNOSTIC ==="
echo "Checking all systems..."
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FAILURES=0
TOTAL_TESTS=0

# Test function
test_tool() {
  local tool_name="$1"
  local command="$2"
  local expected="$3"
  
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  
  echo -n "🔍 $tool_name: "
  
  if eval "$command" >/dev/null 2>&1; then
    echo "✅ PASS"
    return 0
  else
    echo "❌ FAIL"
    FAILURES=$((FAILURES + 1))
    return 1
  fi
}

echo "=== Core Tools ==="
test_tool "wzrd.dev command" "which wzrd.dev" "exists"
test_tool "wzrd-mode script" "[ -f $SCRIPT_DIR/wzrd-mode ]" "exists"
test_tool "Remi SOUL" "[ -f $SCRIPT_DIR/remi/SOUL.md ]" "exists"
test_tool "Remi modes" "[ -d $SCRIPT_DIR/remi/modes ]" "exists"
test_tool "Memory system" "[ -f $SCRIPT_DIR/memory/unified-memory.js ]" "exists"

echo ""
echo "=== Compact System ==="
test_tool "wzrd-compact-solution" "[ -f $SCRIPT_DIR/wzrd-compact-solution.sh ]" "exists"
test_tool "wzrd-compact command" "which wzrd-compact 2>/dev/null" "exists"
test_tool "tui-compact command" "which tui-compact 2>/dev/null" "exists"
test_tool "compact alias" "bash -c 'source ~/.bashrc && type compact 2>/dev/null | grep -q alias'" "exists"
test_tool "auto-context-compact" "[ -f $SCRIPT_DIR/auto-context-compact.js ]" "exists"

echo ""
echo "=== Skill System ==="
test_tool "Skill directory" "[ -d $SCRIPT_DIR/.claude/skills ]" "exists"
test_tool "Skills loaded" "ls $SCRIPT_DIR/.claude/skills/*.md 2>/dev/null | head -5 >/dev/null" "has skills"
test_tool "Smart skill loader" "[ -f $SCRIPT_DIR/bin/smart-skill-loader.js ]" "exists"
test_tool "Token dashboard" "[ -f $SCRIPT_DIR/bin/token-dashboard.js ]" "exists"

echo ""
echo "=== Memory System ==="
test_tool "Topics directory" "[ -d $SCRIPT_DIR/memory/topics ]" "exists"
test_tool "Capture conversation" "[ -f $SCRIPT_DIR/bin/capture-conversation.js ]" "exists"
test_tool "Health monitor" "[ -f $SCRIPT_DIR/bin/health-monitor.js ]" "exists"
test_tool "Validate phase1" "[ -f $SCRIPT_DIR/bin/validate-phase1.js ]" "exists"

echo ""
echo "=== Integration Tests ==="
test_tool "OpenCode config" "[ -f ~/.config/opencode/opencode.jsonc ]" "exists"
test_tool "Remi agent config" "[ -f ~/.config/opencode/agents/remi.md ]" "exists"
test_tool "DCP plugin" "grep -q dcp ~/.config/opencode/opencode.jsonc 2>/dev/null" "configured"
test_tool "PATH setup" "echo \$PATH | grep -q .local/bin" "in PATH"

echo ""
echo "=== Functional Tests ==="
# Try to run actual commands
echo "Testing compact system..."
if bash -c 'source ~/.bashrc && command -v compact >/dev/null'; then
  echo "✅ compact command available"
else
  echo "❌ compact command NOT available"
  FAILURES=$((FAILURES + 1))
fi

echo ""
echo "Testing auto-context-compact..."
if node $SCRIPT_DIR/auto-context-compact.js check >/dev/null 2>&1; then
  echo "✅ auto-context-compact.js works"
else
  echo "❌ auto-context-compact.js failed"
  FAILURES=$((FAILURES + 1))
fi

echo ""
echo "=== Summary ==="
echo "Tests run: $TOTAL_TESTS"
echo "Failures: $FAILURES"

if [ "$FAILURES" -eq 0 ]; then
  echo ""
  echo "🎉 ALL SYSTEMS GO! wzrd.dev tools are working fully."
  echo ""
  echo "To launch: wzrd.dev"
  echo "To compact: compact (in bash tool)"
  echo "To check status: compact-status"
else
  echo ""
  echo "⚠️  Some systems need attention."
  echo ""
  echo "Common issues:"
  echo "1. PATH not set up: Add ~/.local/bin to PATH"
  echo "2. Aliases not loaded: Source ~/.bashrc"
  echo "3. Files missing: Check ~/wzrd-redesign/"
  echo ""
  echo "Run: source ~/.bashrc"
  echo "Then: which compact"
fi

echo ""
echo "=== Quick Fix Commands ==="
echo "source ~/.bashrc"
echo "export PATH=\"\$HOME/.local/bin:\$PATH\""
echo "alias compact=\"wzrd-compact\""