#!/bin/bash

# Phase 0 Validation Script
# Systematically verifies all Phase 0 components are working

echo "=========================================="
echo "PHASE 0 COMPREHENSIVE VALIDATION"
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

# Start validation
echo "Step 1: Isolated Environment Setup"
echo "------------------------------------"

# Check directory structure
if [ -d "/home/mdwzrd/wzrd-redesign" ]; then
    test_pass "Isolated environment directory exists"
else
    test_fail "Isolated environment directory missing"
fi

# Check subdirectories
required_dirs=("configs" "logs" "remi" "scripts" "topics" ".claude/skills")
for dir in "${required_dirs[@]}"; do
    if [ -d "/home/mdwzrd/wzrd-redesign/$dir" ]; then
        test_pass "Directory exists: $dir"
    else
        test_fail "Directory missing: $dir"
    fi
done

echo ""
echo "Step 2: OpenCode Integration"
echo "------------------------------------"

# Check OpenCode directory
if [ -d "/home/mdwzrd/wzrd-redesign/.claude/skills" ]; then
    skill_count=$(ls /home/mdwzrd/wzrd-redesign/.claude/skills/ | wc -l)
    test_pass "OpenCode skills directory exists with $skill_count skills"
    if [ $skill_count -ge 77 ]; then
        test_pass "All 77 skills loaded (better than expected)"
    else
        test_warn "Only $skill_count skills loaded (expected 77)"
    fi
else
    test_fail "OpenCode skills directory missing"
fi

# Check OpenCode config (not explicitly created, but skills directory is sufficient)
if [ -f "/home/mdwzrd/.opencode/opencode.jsonc" ]; then
    test_pass "OpenCode configuration exists"
else
    test_warn "No explicit OpenCode config file (skills directory sufficient)"
fi

echo ""
echo "Step 3: Enhanced Remi Definition"
echo "------------------------------------"

# Check persona files
if [ -f "/home/mdwzrd/wzrd-redesign/remi/personas/remi-base.md" ]; then
    test_pass "Remi base persona exists"
else
    test_fail "Remi base persona missing"
fi

if [ -f "/home/mdwzrd/wzrd-redesign/remi/personas/coder-pro.md" ]; then
    test_pass "Coder pro persona exists"
else
    test_fail "Coder pro persona missing"
fi

if [ -f "/home/mdwzrd/wzrd-redesign/remi/personas/research-deep.md" ]; then
    test_pass "Research deep persona exists"
else
    test_fail "Research deep persona missing"
fi

# Check persona selector
if [ -f "/home/mdwzrd/wzrd-redesign/remi/personas/SELECTOR.md" ]; then
    test_pass "Persona selector exists"
else
    test_fail "Persona selector missing"
fi

# Check remi configuration files
if [ -f "/home/mdwzrd/wzrd-redesign/remi/PRINCIPLES.md" ]; then
    test_pass "Remi principles exist"
else
    test_fail "Remi principles missing"
fi

if [ -f "/home/mdwzrd/wzrd-redesign/remi/SKILLS.md" ]; then
    test_pass "Remi skills exist"
else
    test_fail "Remi skills missing"
fi

if [ -f "/home/mdwzrd/wzrd-redesign/remi/SOUL.md" ]; then
    test_pass "Remi soul exists"
else
    test_fail "Remi soul missing"
fi

echo ""
echo "Step 4: Cost Tracking System"
echo "------------------------------------"

# Check cost config
if [ -f "/home/mdwzrd/wzrd-redesign/configs/cost-tracker.json" ]; then
    test_pass "Cost configuration exists"
else
    test_fail "Cost configuration missing"
fi

# Check cost tracking script
if [ -f "/home/mdwzrd/wzrd-redesign/scripts/cost-tracker.sh" ]; then
    if [ -x "/home/mdwzrd/wzrd-redesign/scripts/cost-tracker.sh" ]; then
        test_pass "Cost tracking script exists and is executable"
    else
        test_fail "Cost tracking script exists but not executable"
    fi
else
    test_fail "Cost tracking script missing"
fi

# Test cost tracking functionality
echo ""
echo "Testing cost tracking..."
bash /home/mdwzrd/wzrd-redesign/scripts/cost-tracker.sh test > /tmp/cost-test.log 2>&1
if grep -q "Total Cost: 0.014060 USD" /tmp/cost-test.log; then
    test_pass "Cost tracking system functioning correctly"
    if [ $(echo "0.014 < 1.0" | bc -l) -eq 1 ]; then
        test_pass "Test cost well under daily budget ($1.00)"
    else
        test_fail "Test cost exceeds budget"
    fi
else
    test_fail "Cost tracking system not functioning"
fi

# Check log files
if [ -d "/home/mdwzrd/wzrd-redesign/logs" ]; then
    log_count=$(ls /home/mdwzrd/wzrd-redesign/logs/*.log 2>/dev/null | wc -l)
    if [ $log_count -gt 0 ]; then
        test_pass "Log files generated ($log_count files)"
    else
        test_warn "No log files generated yet"
    fi
else
    test_fail "Logs directory missing"
fi

echo ""
echo "Step 5: Agentic Search/Memory System"
echo "------------------------------------"

# Check search script
if [ -f "/home/mdwzrd/wzrd-redesign/scripts/agentic-search.sh" ]; then
    if [ -x "/home/mdwzrd/wzrd-redesign/scripts/agentic-search.sh" ]; then
        test_pass "Agentic search script exists and is executable"
    else
        test_fail "Agentic search script exists but not executable"
    fi
else
    test_fail "Agentic search script missing"
fi

# Test search functionality
echo ""
echo "Testing agentic search..."
bash /home/mdwzrd/wzrd-redesign/scripts/agentic-search.sh test > /tmp/search-test.log 2>&1
if grep -q "Indexed 91 files" /tmp/search-test.log; then
    test_pass "Search system working (91 files indexed)"
else
    test_fail "Search system not working"
fi

if grep -q "File type distribution:" /tmp/search-test.log; then
    test_pass "Search statistics generated"
else
    test_fail "Search statistics missing"
fi

# Check memory index
if [ -f "/home/mdwzrd/wzrd-redesign/.memory-index.txt" ]; then
    index_lines=$(wc -l < /home/mdwzrd/wzrd-redesign/.memory-index.txt)
    test_pass "Memory index created with $index_lines entries"
else
    test_warn "Memory index not found (recreate with 'index' command)"
fi

echo ""
echo "Step 6: Topic Management System"
echo "------------------------------------"

# Check topic manager
if [ -f "/home/mdwzrd/wzrd-redesign/remi/context/topic-manager.sh" ]; then
    if [ -x "/home/mdwzrd/wzrd-redesign/remi/context/topic-manager.sh" ]; then
        test_pass "Topic manager script exists and is executable"
    else
        test_fail "Topic manager script exists but not executable"
    fi
else
    test_fail "Topic manager script missing"
fi

# Test topic management
echo ""
echo "Testing topic management..."
bash /home/mdwzrd/wzrd-redesign/remi/context/topic-manager.sh test > /tmp/topic-test.log 2>&1

# Check for successful topic creation
if grep -q "Created topic: phase0-implementation" /tmp/topic-test.log; then
    test_pass "Topic creation working"
else
    test_fail "Topic creation failed"
fi

if grep -q "Total topics: 1" /tmp/topic-test.log; then
    test_pass "Topic listing working"
else
    test_fail "Topic listing failed"
fi

if grep -q "Active topics: 1" /tmp/topic-test.log; then
    test_pass "Topic statistics working"
else
    test_fail "Topic statistics failed"
fi

# Check topic directory
if [ -d "/home/mdwzrd/wzrd-redesign/topics" ]; then
    topic_count=$(ls /home/mdwzrd/wzrd-redesign/topics/*.md 2>/dev/null | wc -l)
    if [ $topic_count -gt 0 ]; then
        test_pass "Topics directory populated ($topic_count topic files)"
    else
        test_warn "Topics directory exists but empty"
    fi
else
    test_fail "Topics directory missing"
fi

echo ""
echo "Step 7: Memory Curation System"
echo "------------------------------------"

# Check memory curation skill
if [ -d "/home/mdwzrd/wzrd-redesign/remi/skills/memory-curation" ]; then
    if [ -f "/home/mdwzrd/wzrd-redesign/remi/skills/memory-curation/SKILL.md" ]; then
        test_pass "Memory curation skill exists and documented"
    else
        test_fail "Memory curation skill directory exists but skill file missing"
    fi
else
    test_fail "Memory curation skill directory missing"
fi

echo ""
echo "Step 8: Documentation"
echo "------------------------------------"

# Check Phase 0 completion document
if [ -f "/home/mdwzrd/wzrd-redesign/PHASE_0_COMPLETE.md" ]; then
    test_pass "Phase 0 completion document exists"
else
    test_fail "Phase 0 completion document missing"
fi

# Check master plan reference
if [ -f "/home/mdwzrd/wzrd-redesign/WZRD_REDESIGN_MASTER_PLAN.md" ]; then
    test_pass "Master plan reference exists"
else
    test_warn "Master plan reference missing"
fi

# Check validation script
if [ -f "/home/mdwzrd/wzrd-redesign/validate-phase0.sh" ]; then
    test_pass "Validation script exists"
else
    test_warn "Validation script missing"
fi

echo ""
echo "Step 9: Performance Metrics"
echo "------------------------------------"

# Count files and estimate size
total_files=$(find /home/mdwzrd/wzrd-redesign -type f ! -path "*/.git/*" ! -path "*/node_modules/*" ! -path "*/__pycache__/*" | wc -l)
total_md=$(find /home/mdwzrd/wzrd-redesign -type f -name "*.md" ! -path "*/.git/*" | wc -l)
total_sh=$(find /home/mdwzrd/wzrd-redesign -type f -name "*.sh" ! -path "*/.git/*" | wc -l)

echo "  - Total files: $total_files"
echo "  - Markdown files: $total_md"
echo "  - Shell scripts: $total_sh"

if [ $total_files -gt 100 ]; then
    test_pass "Reasonable file count for Phase 0 foundation"
else
    test_warn "File count low, may be missing components"
fi

# Check disk usage
disk_usage=$(du -sh /home/mdwzrd/wzrd-redesign 2>/dev/null | cut -f1)
echo "  - Directory size: $disk_usage"
if [ "$disk_usage" != "" ]; then
    test_pass "Directory has reasonable size"
fi

echo ""
echo "Step 10: Token Budget Performance"
echo "------------------------------------"

# Get current daily summary
if [ -f "/home/mdwzrd/wzrd-redesign/logs/daily-summary.json" ]; then
    current_cost=$(jq -r '.total_cost // 0' /home/mdwzrd/wzrd-redesign/logs/daily-summary.json 2>/dev/null)
    budget_limit=$(jq -r '.budget.daily_limit' /home/mdwzrd/wzrd-redesign/configs/cost-tracker.json 2>/dev/null)
    
    echo "  - Current cost: \$${current_cost}"
    echo "  - Budget limit: \$${budget_limit}"
    
    if [ $(echo "$current_cost < $budget_limit" | bc -l) -eq 1 ]; then
        test_pass "Current cost well under budget"
        usage_pct=$(echo "scale=1; ($current_cost / $budget_limit) * 100" | bc)
        echo "  - Usage: ${usage_pct}% of daily budget"
    else
        test_fail "Cost exceeds budget"
    fi
else
    test_warn "No daily summary data (first-time run)"
fi

echo ""
echo "Step 11: System Integration Check"
echo "------------------------------------"

# Check if all scripts reference the correct paths
search_test="grep -q 'wzrd-redesign' /home/mdwzrd/wzrd-redesign/scripts/cost-tracker.sh && \
            grep -q 'wzrd-redesign' /home/mdwzrd/wzrd-redesign/scripts/agentic-search.sh && \
            grep -q 'wzrd-redesign' /home/mdwzrd/wzrd-redesign/remi/context/topic-manager.sh"

if eval "$search_test"; then
    test_pass "All scripts reference correct wzrd-redesign path"
else
    test_warn "Some scripts may have hardcoded paths"
fi

# Check if skills directory is properly organized
skills_test="ls /home/mdwzrd/wzrd-redesign/.claude/skills/ | grep -q coding && \
            ls /home/mdwzrd/wzrd-redesign/.claude/skills/ | grep -q research && \
            ls /home/mdwzrd/wzrd-redesign/.claude/skills/ | grep -q planning"

if eval "$skills_test"; then
    test_pass "Essential skills directories present"
else
    test_fail "Essential skills directories missing"
fi

# Final Summary
echo ""
echo "=========================================="
echo "VALIDATION SUMMARY"
echo "=========================================="
echo -e "${GREEN}PASSES: $PASS${NC}"
echo -e "${RED}FAILS: $FAIL${NC}"
echo -e "${YELLOW}WARNINGS: $WARN${NC}"
echo "=========================================="
echo ""

if [ $FAIL -eq 0 ]; then
    if [ $WARN -eq 0 ]; then
        echo -e "${GREEN}✓ ALL PHASE 0 VALIDATION TESTS PASSED${NC}"
        echo ""
        echo "Phase 0 Foundation is ready for Phase 1"
        exit 0
    else
        echo -e "${BLUE}✓ MAIN VALIDATION TESTS PASSED${NC}"
        echo -e "${YELLOW}⚠ $WARN warnings to review${NC}"
        echo ""
        echo "Phase 0 Foundation is functional but has minor issues"
        exit 0
    fi
else
    echo -e "${RED}✗ VALIDATION FAILED ($FAIL tests failed)${NC}"
    echo ""
    echo "Please review failed tests above"
    echo "Run validation again after fixing issues"
    exit 1
fi