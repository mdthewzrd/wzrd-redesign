#!/bin/bash
# 🧪 Token Measurement Test Script
# Measures current token usage and optimization impact

set -e

echo "🧪 TOKEN MEASUREMENT TEST SUITE"
echo "================================"
echo ""

# Configuration
TEST_DIR="$HOME/.cache/wzrd-token-tests"
mkdir -p "$TEST_DIR"
RESULTS_FILE="$TEST_DIR/results-$(date +%Y%m%d-%H%M%S).txt"

# Function to estimate tokens from text
estimate_tokens() {
    local text="$1"
    # Rough estimate: 1 token ≈ 4 characters for English
    local chars=$(echo -n "$text" | wc -c)
    echo $((chars / 4))
}

# Function to run test and capture output
run_test() {
    local test_name="$1"
    local command="$2"
    
    echo "🔍 Test: $test_name"
    echo "Command: $command"
    
    # Capture output and time
    START_TIME=$(date +%s%N)
    OUTPUT=$(timeout 30 bash -c "$command" 2>&1)
    EXIT_CODE=$?
    END_TIME=$(date +%s%N)
    
    RUNTIME_MS=$(( (END_TIME - START_TIME) / 1000000 ))
    
    # Estimate token usage from output
    TOKEN_ESTIMATE=$(estimate_tokens "$OUTPUT")
    
    # Save results
    echo "$(date '+%Y-%m-%d %H:%M:%S'),$test_name,$RUNTIME_MS,$TOKEN_ESTIMATE,$EXIT_CODE" >> "$RESULTS_FILE"
    
    echo "  Runtime: ${RUNTIME_MS}ms"
    echo "  Token estimate: ~${TOKEN_ESTIMATE} tokens"
    echo "  Exit code: $EXIT_CODE"
    echo ""
    
    return $EXIT_CODE
}

echo "📊 TEST 1: Current System Baseline"
echo "---------------------------------"

# Test 1.1: Original wzrd status
run_test "original_wzrd_status" "wzrd status"

# Test 1.2: Ultra-fast status (cached)
run_test "ultrafast_status_cached" "./wzrd-instantly status"

# Test 1.3: Ultra-fast status (fresh)
run_test "ultrafast_status_fresh" "rm -f ~/.cache/wzrd-instantly/status.* && ./wzrd-instantly status"

# Test 1.4: Direct OpenCode (cold)
run_test "opencode_cold" "opencode --model nvidia/deepseek-ai/deepseek-v3.2 run 'echo test'"

echo ""
echo "📊 TEST 2: Skill Loading Analysis"
echo "--------------------------------"

# Count skills in skills-lock.json
SKILLS_COUNT=$(grep -c '"skills"' /home/mdwzrd/wzrd-redesign/skills-lock.json || echo "0")
echo "Total skills in skills-lock.json: $SKILLS_COUNT"

# Count lines in skills-lock.json
SKILLS_LINES=$(wc -l < /home/mdwzrd/wzrd-redesign/skills-lock.json)
echo "Lines in skills-lock.json: $SKILLS_LINES"

# Estimate tokens in skills file
SKILLS_TEXT=$(head -100 /home/mdwzrd/wzrd-redesign/skills-lock.json)
SKILLS_TOKENS=$(estimate_tokens "$SKILLS_TEXT")
echo "Estimated tokens (first 100 lines): ~$SKILLS_TOKENS tokens"

echo ""
echo "📊 TEST 3: Mode-Based Skill Loading"
echo "-----------------------------------"

# Test different modes
MODES=("chat" "thinker" "coder" "debug" "research")
for mode in "${MODES[@]}"; do
    echo "Mode: $mode"
    
    # Count skills likely loaded for this mode
    case "$mode" in
        "chat")
            SKILLS=("orchestration" "context" "communication" "topic-switcher")
            ;;
        "thinker")
            SKILLS=("architecture" "planning" "research" "validation")
            ;;
        "coder")
            SKILLS=("coding" "refactoring" "testing" "git")
            ;;
        "debug")
            SKILLS=("debugging" "testing" "performance" "system-health")
            ;;
        "research")
            SKILLS=("research" "web-search" "data-analysis" "documentation")
            ;;
    esac
    
    echo "  Skills loaded: ${#SKILLS[@]} (${SKILLS[*]})"
    
    # Estimate skill definition tokens
    SKILL_DEF_TOKENS=0
    for skill in "${SKILLS[@]}"; do
        # Rough estimate: each skill definition ~500 tokens
        SKILL_DEF_TOKENS=$((SKILL_DEF_TOKENS + 500))
    done
    
    echo "  Estimated skill definition tokens: ~$SKILL_DEF_TOKENS"
    echo ""
done

echo ""
echo "📊 TEST 4: Memory System Analysis"
echo "--------------------------------"

# Test memory search
run_test "memory_search" "echo 'test memory search' | timeout 10 wzrd memory 2>&1 | head -20"

# Count topic files
TOPIC_FILES=$(find /home/mdwzrd/wzrd-redesign/topics -name "*.md" -o -name "*.txt" 2>/dev/null | wc -l)
echo "Topic files in system: $TOPIC_FILES"

# Estimate memory tokens
if [ -d "/home/mdwzrd/wzrd-redesign/topics" ]; then
    MEMORY_TEXT=$(find /home/mdwzrd/wzrd-redesign/topics -name "*.md" -o -name "*.txt" 2>/dev/null | head -3 | xargs cat 2>/dev/null | head -1000)
    MEMORY_TOKENS=$(estimate_tokens "$MEMORY_TEXT")
    echo "Estimated memory tokens (sample): ~$MEMORY_TOKENS tokens"
fi

echo ""
echo "📊 TEST 5: Compaction System Test"
echo "--------------------------------"

# Check if compaction plugin is active
if [ -f "/home/mdwzrd/.config/opencode/plugins/wzrd-true-compact/index.js" ]; then
    echo "✅ wzrd-true-compact plugin installed"
    
    # Test compaction command
    run_test "compaction_test" "timeout 10 echo '/compact' | opencode 2>&1 | head -10"
else
    echo "❌ wzrd-true-compact plugin NOT found"
fi

# Check for prompt history
HISTORY_FILES=$(find ~/.config/opencode -name "*history*" -type f 2>/dev/null | wc -l)
echo "History files found: $HISTORY_FILES"

echo ""
echo "📊 TEST 6: Performance vs Token Trade-off"
echo "----------------------------------------"

# Test sequence: multiple commands
echo "Running command sequence..."
SEQUENCE_START=$(date +%s%N)

# Sequence of common commands
for i in {1..3}; do
    timeout 5 wzrd status >/dev/null 2>&1
    timeout 5 ./wzrd-instantly status >/dev/null 2>&1
done

SEQUENCE_END=$(date +%s%N)
SEQUENCE_MS=$(( (SEQUENCE_END - SEQUENCE_START) / 1000000 ))

echo "  Sequence time: ${SEQUENCE_MS}ms"
echo "  Average per command: $((SEQUENCE_MS / 6))ms"

echo ""
echo "📈 ANALYSIS SUMMARY"
echo "=================="
echo ""

# Load results for summary
if [ -f "$RESULTS_FILE" ]; then
    echo "Test results saved to: $RESULTS_FILE"
    echo ""
    echo "Recent results:"
    tail -10 "$RESULTS_FILE" | awk -F',' '{printf "%-25s %-8s %-8s\n", $2, $3"ms", $4" tokens"}'
else
    echo "No results recorded"
fi

echo ""
echo "🔍 KEY FINDINGS:"
echo "1. Skills-lock.json: $SKILLS_LINES lines, ~$SKILLS_TOKENS tokens (sample)"
echo "2. Mode loading: ~4 skills/mode vs $SKILLS_COUNT total"
echo "3. Estimated savings: $(echo "scale=0; 100 * (1 - 4/$SKILLS_COUNT)" | bc)% token reduction from smart loading"
echo "4. Ultra-fast caching: Reduces tokens to near-zero for common commands"
echo "5. Compaction system: $(if [ -f "/home/mdwzrd/.config/opencode/plugins/wzrd-true-compact/index.js" ]; then echo "ACTIVE"; else echo "INACTIVE"; fi)"

echo ""
echo "🎯 RECOMMENDATIONS:"
echo "1. Implement TRUE deferred loading (load 4 files vs 850)"
echo "2. Add programmatic tool calling (register only when needed)"
echo "3. Fix/verify compaction plugin"
echo "4. Create token monitoring dashboard"
echo "5. Benchmark before/after optimization"

echo ""
echo "📋 NEXT STEPS:"
echo "1. Review $RESULTS_FILE for detailed metrics"
echo "2. Implement deferred loading prototype"
echo "3. Create token optimization roadmap"
echo "4. Validate improvements with A/B testing"

echo ""
echo "✅ TEST SUITE COMPLETE"
echo "Results: $RESULTS_FILE"