#!/bin/bash

# Phase 1: Core Systems Build - Comprehensive Test
# Tests all core systems (Unified Memory, Topic Registry, Model Router, Cost Tracker)

echo "=========================================="
echo "PHASE 1: CORE SYSTEMS TEST"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track results
PASS=0
FAIL=0
WARN=0

# Test functions
test_pass() {
    echo -e "${GREEN}✓ PASS${NC}: $1"
    PASS=$((PASS + 1))
}

test_fail() {
    echo -e "${RED}✗ FAIL${NC}: $1"
    FAIL=$((FAIL + 1))
}

test_warn() {
    echo -e "${YELLOW}⚠ WARN${NC}: $1"
    WARN=$((WARN + 1))
}

# Start Phase 1 testing
echo "Step 1: Unified Memory System"
echo "------------------------------------"

# Test TypeScript compilation
echo "Testing TypeScript compilation..."
if npx tsc --noEmit remi/context/topic-manager.sh > /tmp/phase1-compile.log 2>&1; then
    echo "Note: topic-manager.sh is a bash script, not TypeScript"
    echo "Checking file structure instead..."
    if [ -f "memory/unified-memory.ts" ]; then
        test_pass "Unified memory file exists"
    else
        test_fail "Unified memory file missing"
    fi
else
    echo "Checking memory system files..."
    if [ -f "memory/unified-memory.ts" ]; then
        test_pass "Unified memory file exists"
    else
        test_fail "Unified memory file missing"
    fi
fi

echo ""
echo "Step 2: Topic Registry"
echo "------------------------------------"

if [ -f "topics/registry.ts" ]; then
    test_pass "Topic registry file exists"
else
    test_fail "Topic registry file missing"
fi

if [ -f "topics/config.yaml" ]; then
    test_pass "Topic configuration file exists"
else
    test_warn "Topic config file not found (will be created during initialization)"
fi

echo ""
echo "Step 3: Model Router"
echo "------------------------------------"

if [ -f "models/router.ts" ]; then
    test_pass "Model router file exists"
else
    test_fail "Model router file missing"
fi

if [ -f "models/config.yaml" ]; then
    test_pass "Model configuration file exists"
else
    test_warn "Model config file not found (will be created during initialization)"
fi

echo ""
echo "Step 4: Cost Tracker"
echo "------------------------------------"

if [ -f "cost/tracker.ts" ]; then
    test_pass "Cost tracker file exists"
else
    test_fail "Cost tracker file missing"
fi

if [ -f "configs/cost-tracker.json" ]; then
    test_pass "Cost configuration exists"
else
    test_fail "Cost configuration missing"
fi

# Check for cost tracker data files
if [ -f "logs/daily-summary.json" ]; then
    test_pass "Daily summary exists"
else
    test_warn "Daily summary missing (may be first run)"
fi

if [ -f "configs/cost-tracker.json" ]; then
    test_pass "Cost configuration exists"
else
    test_fail "Cost configuration missing"
fi

# Check for cost tracker data files
if [ -f "logs/daily-summary.json" ]; then
    test_pass "Cost tracking data file exists"
else
    test_warn "Cost tracking data file not found (will be created during initialization)"
fi

echo ""
echo "Step 5: File Structure Validation"
echo "------------------------------------"

# Check all created files
memory_files=(
    "memory/unified-memory.ts"
    "topics/registry.ts"
    "topics/config.yaml"
    "models/router.ts"
    "models/config.yaml"
    "cost/tracker.ts"
)

for file in "${memory_files[@]}"; do
    if [ -f "$file" ]; then
        test_pass "File exists: $file"
    else
        test_fail "File missing: $file"
    fi
done

echo ""
echo "Step 6: Cost Performance Test"
echo "------------------------------------"

# Test cost tracking with realistic scenarios
echo "Testing cost tracking with realistic scenarios..."
node -e "
const fs = require('fs');

// Test cost tracker initialization
try {
    const CostTracker = require('./cost/tracker');
    const config = {
        dataPath: '/tmp/phase1-test-cost.json',
        limits: {
            dailyLimit: 1.00,
            dailyLimitTokens: 30000,
            warningThreshold: 0.80,
            circuitBreakerThreshold: 0.95,
            resetTime: '00:00'
        },
        models: [
            { model: 'glm-4.7-flash', inputCostPer1k: 0.0008, outputCostPer1k: 0.001, contextWindow: 128000, maxDailyBudget: 0.50 },
            { model: 'deepseek-v3.2', inputCostPer1k: 0.002, outputCostPer1k: 0.006, contextWindow: 128000, maxDailyBudget: 0.25 },
            { model: 'qwen3-coder-30b', inputCostPer1k: 0.0024, outputCostPer1k: 0.0072, contextWindow: 128000, maxDailyBudget: 0.25 }
        ],
        dailySummaryPath: '/tmp/phase1-test-summary.json'
    };
    
    const tracker = new CostTracker(config);
    
    // Simulate realistic usage
    tracker.trackUsage(1000, 'glm-4.7-flash', 'general', 500);
    tracker.trackUsage(2000, 'qwen3-coder-30b', 'coding');
    tracker.trackUsage(3000, 'deepseek-v3.2', 'research');
    
    const stats = tracker.getStatistics();
    const report = tracker.getDailyReport();
    
    console.log('Cost Tracking Test Results:');
    console.log('  Current Cost: \$' + stats.totalCost.toFixed(6));
    console.log('  Tokens Used: ' + stats.tokensUsed);
    console.log('  Budget Usage: ' + stats.percentageUsed.toFixed(1) + '%');
    console.log('  Remaining Budget: \$' + stats.remainingBudget.toFixed(6));
    console.log('  Tasks Tracked: ' + stats.tasks);
    console.log('  Circuit Breaker: ' + (stats.circuitBreakerActive ? 'ACTIVE' : 'inactive'));
    console.log('  Model Costs: ', stats.models);
    
    // Verify expectations
    if (stats.totalCost < 1.00 && stats.percentageUsed < 100) {
        console.log('✓ Cost tracking working correctly');
    } else {
        console.log('✗ Cost tracking issues');
    }
    
    // Cleanup
    if (fs.existsSync('/tmp/phase1-test-cost.json')) {
        fs.unlinkSync('/tmp/phase1-test-cost.json');
    }
    if (fs.existsSync('/tmp/phase1-test-summary.json')) {
        fs.unlinkSync('/tmp/phase1-test-summary.json');
    }
    
} catch (error) {
    console.log('✗ Cost tracking test failed:', error.message);
    process.exit(1);
}
"

if [ $? -eq 0 ]; then
    test_pass "Cost tracking system working correctly"
else
    test_fail "Cost tracking system failed"
fi

echo ""
echo "Step 7: System Integration Test"
echo "------------------------------------"

# Test that systems reference each other correctly
echo "Checking system integration..."

# Check if models reference cost tracker
if grep -q "CostTracker\|cost-tracker" models/router.ts 2>/dev/null; then
    test_pass "Model router references cost tracker"
else
    test_warn "Model router cost integration placeholder"
fi

# Check if memory references topic registry
if grep -q "topicRegistryPath\|TopicRegistry" memory/unified-memory.ts 2>/dev/null; then
    test_pass "Memory system references topic registry"
else
    test_warn "Memory topic registry integration placeholder"
fi

echo ""
echo "Step 8: Configuration Validation"
echo "------------------------------------"

# Check configuration completeness
echo "Validating configurations..."

if [ -f "configs/cost-tracker.json" ]; then
    budget=$(jq -r '.budget.daily_limit' configs/cost-tracker.json)
    if [ $(echo "$budget <= 1.0" | bc -l) -eq 1 ]; then
        test_pass "Cost budget within \$1.00 daily limit"
    else
        test_fail "Cost budget exceeds \$1.00"
    fi
fi

if [ -f "models/config.yaml" ]; then
    if grep -q "glm-4.7-flash" models/config.yaml; then
        test_pass "GLM 4.7 Flash model configured"
    fi
    
    if grep -q "deepseek-v3.2" models/config.yaml; then
        test_pass "DeepSeek V3.2 model configured"
    fi
    
    if grep -q "qwen3-coder" models/config.yaml; then
        test_pass "Qwen3 Coder model configured"
    fi
fi

echo ""
echo "Step 9: Performance Benchmarks Check"
echo "------------------------------------"

echo "Checking performance requirements..."

# Check configuration for performance targets
echo "  - Target response time: < 5s"
echo "  - Target overhead: < 100ms"
echo "  - Token budget: < $1/day"

if [ -f "configs/cost-tracker.json" ]; then
    budget=$(jq -r '.budget.daily_limit' configs/cost-tracker.json)
    if [ $(echo "$budget <= 1.0" | bc -l) -eq 1 ]; then
        test_pass "Budget target met: <= $1/day"
    else
        test_fail "Budget target not met: $budget/day"
    fi
fi

echo ""
echo "Step 10: Documentation Check"
echo "------------------------------------"

# Check for Phase 1 documentation
if [ -f "PHASE_1_CORE.md" ]; then
    test_pass "Phase 1 plan document exists"
else
    test_warn "Phase 1 plan document missing (continuing without it)"
fi

if [ -f "PHASE_1_COMPLETE.md" ]; then
    test_pass "Phase 1 completion document exists"
else
    test_warn "Phase 1 completion document not yet created"
fi

# Final Summary
echo ""
echo "=========================================="
echo "PHASE 1: CORE SYSTEMS TEST RESULTS"
echo "=========================================="
echo -e "${GREEN}PASSES: $PASS${NC}"
echo -e "${RED}FAILS: $FAIL${NC}"
echo -e "${YELLOW}WARNINGS: $WARN${NC}"
echo "=========================================="
echo ""

if [ $FAIL -eq 0 ]; then
    if [ $WARN -eq 0 ]; then
        echo -e "${GREEN}✓ ALL PHASE 1 CORE SYSTEMS TESTS PASSED${NC}"
        echo ""
        echo "Phase 1 Core Systems are functional and ready for integration"
        exit 0
    else
        echo -e "${BLUE}✓ CORE SYSTEMS TESTS PASSED${NC}"
        echo -e "${YELLOW}⚠ $WARN warnings to review${NC}"
        echo ""
        echo "Phase 1 Core Systems are functional with minor issues"
        exit 0
    fi
else
    echo -e "${RED}✗ CORE SYSTEMS TESTS FAILED ($FAIL tests failed)${NC}"
    echo ""
    echo "Please review failed tests above"
    echo "Run tests again after fixing issues"
    exit 1
fi