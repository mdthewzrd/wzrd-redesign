#!/bin/bash
# WZRD.dev Wiring Test
# Validates all framework connections are working

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_FILE="${SCRIPT_DIR}/logs/wiring-test-$(date +%Y%m%d-%H%M%S).log"

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

log_section() {
    echo ""
    echo -e "${CYAN}==========================================${NC}" | tee -a "$LOG_FILE"
    echo -e "${CYAN}$1${NC}" | tee -a "$LOG_FILE"
    echo -e "${CYAN}==========================================${NC}" | tee -a "$LOG_FILE"
    echo ""
}

# Test database connection
test_database() {
    log_section "1. Database Connection Test"
    
    # Test Python interface
    log_info "Testing Python database interface..."
    JOB_ID=$(python3 "${SCRIPT_DIR}/lib/db.py" save-job "wiring-test" "test-blueprint")
    if [ -n "$JOB_ID" ]; then
        log_success "✓ Database save-job works (Job ID: $JOB_ID)"
    else
        log_error "✗ Database save-job failed"
        return 1
    fi
    
    # Test status update
    python3 "${SCRIPT_DIR}/lib/db.py" update-status "$JOB_ID" "running"
    STATUS=$(python3 "${SCRIPT_DIR}/lib/db.py" get-status "$JOB_ID" | grep -o '"status": "[^"]*"' | cut -d'"' -f4)
    if [ "$STATUS" = "running" ]; then
        log_success "✓ Database update-status works"
    else
        log_error "✗ Database update-status failed"
        return 1
    fi
    
    # Cleanup
    python3 "${SCRIPT_DIR}/lib/db.py" update-status "$JOB_ID" "completed"
    return 0
}

# Test sandbox engine
test_sandbox_engine() {
    log_section "2. Sandbox Engine Test"
    
    # Create test project
    TEST_PROJECT="${SCRIPT_DIR}/test-wiring-project"
    rm -rf "$TEST_PROJECT"
    mkdir -p "$TEST_PROJECT"
    echo '{"name": "test-wiring"}' > "$TEST_PROJECT/package.json"
    
    log_info "Testing sandbox creation..."
    OUTPUT=$("${SCRIPT_DIR}/sandbox-engine.sh" create "$TEST_PROJECT" 2>&1)
    
    # Extract sandbox ID
    SANDBOX_ID=$(echo "$OUTPUT" | grep -o "Sandbox ID: [^ ]*" | cut -d' ' -f3)
    if [ -n "$SANDBOX_ID" ]; then
        log_success "✓ Sandbox creation works (Sandbox ID: $SANDBOX_ID)"
    else
        log_error "✗ Sandbox creation failed"
        echo "$OUTPUT" >> "$LOG_FILE"
        return 1
    fi
    
    # Check if job was created
    sleep 3  # Give more time for job creation and blueprint to complete
    
    # Check database directly for any sandbox job (including completed ones)
    JOB_INFO=$(python3 -c "
import sqlite3
import json
import os

db_path = os.path.join('${SCRIPT_DIR}', 'db/state.db')
conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute(\"SELECT id, topic, status FROM jobs WHERE topic LIKE 'sandbox-%' ORDER BY created_at DESC LIMIT 1\")
row = cursor.fetchone()
conn.close()

if row:
    print(json.dumps({'id': row[0], 'topic': row[1], 'status': row[2]}))
else:
    print('{}')
")
    
    if echo "$JOB_INFO" | grep -q '"id":'; then
        JOB_ID=$(echo "$JOB_INFO" | grep -o '"id": "[^"]*"' | cut -d'"' -f4)
        JOB_STATUS=$(echo "$JOB_INFO" | grep -o '"status": "[^"]*"' | cut -d'"' -f4)
        
        log_success "✓ Sandbox → Job wiring works (Job: $JOB_ID, Status: $JOB_STATUS)"
        
        echo "$JOB_ID" > "${SCRIPT_DIR}/.wiring-job-id"
        echo "$SANDBOX_ID" > "${SCRIPT_DIR}/.wiring-sandbox-id"
    else
        log_error "✗ Sandbox → Job wiring broken"
        echo "No sandbox jobs found in database" >> "$LOG_FILE"
        return 1
    fi
    
    # Cleanup
    rm -rf "$TEST_PROJECT"
    return 0
}

# Test blueprint engine
test_blueprint_engine() {
    log_section "3. Blueprint Engine Test"
    
    if [ ! -f "${SCRIPT_DIR}/.wiring-job-id" ]; then
        log_error "✗ No job ID found for blueprint test"
        return 1
    fi
    
    JOB_ID=$(cat "${SCRIPT_DIR}/.wiring-job-id")
    SANDBOX_ID=$(cat "${SCRIPT_DIR}/.wiring-sandbox-id")
    
    log_info "Testing blueprint execution for job $JOB_ID..."
    OUTPUT=$("${SCRIPT_DIR}/blueprint-engine.sh" execute "$JOB_ID" "sandbox-test-wiring" "$SANDBOX_ID" 2>&1)
    
    if echo "$OUTPUT" | grep -q "Blueprint execution successful"; then
        log_success "✓ Blueprint execution works"
    else
        log_error "✗ Blueprint execution failed"
        echo "$OUTPUT" >> "$LOG_FILE"
        return 1
    fi
    
    # Check job status was updated
    sleep 2
    STATUS=$(python3 "${SCRIPT_DIR}/lib/db.py" get-status "$JOB_ID" | grep -o '"status": "[^"]*"' | cut -d'"' -f4)
    if [ "$STATUS" = "completed" ]; then
        log_success "✓ Blueprint → Job status wiring works"
    else
        log_error "✗ Blueprint → Job status wiring broken (status: $STATUS)"
        return 1
    fi
    
    # Cleanup temp files
    rm -f "${SCRIPT_DIR}/.wiring-job-id" "${SCRIPT_DIR}/.wiring-sandbox-id"
    return 0
}

# Test component integration
test_component_integration() {
    log_section "4. Component Integration Test"
    
    COMPONENTS=(
        "sandbox-engine.sh"
        "blueprint-engine.sh" 
        "lib/db.py"
        "db/state.db"
        "logs/"
    )
    
    ALL_OK=true
    for component in "${COMPONENTS[@]}"; do
        if [ -e "${SCRIPT_DIR}/$component" ]; then
            log_success "✓ Component exists: $component"
        else
            log_error "✗ Missing component: $component"
            ALL_OK=false
        fi
    done
    
    if $ALL_OK; then
        log_success "✓ All framework components present"
        return 0
    else
        return 1
    fi
}

# Test background agent (Day 6-7)
test_background_agent() {
    log_section "5. Background Agent Test"
    
    if [ -f "${SCRIPT_DIR}/background-agent.sh" ]; then
        log_info "Testing background agent..."
        
        # Check if executable
        if [ -x "${SCRIPT_DIR}/background-agent.sh" ]; then
            log_success "✓ Background agent is executable"
        else
            log_warning "⚠ Background agent not executable (run: chmod +x background-agent.sh)"
        fi
        
        # Check if it has file watching logic
        if grep -q "inotifywait\|fswatch\|watch" "${SCRIPT_DIR}/background-agent.sh"; then
            log_success "✓ Background agent has file watching logic"
        else
            log_warning "⚠ Background agent missing file watching"
        fi
        
        return 0
    else
        log_warning "⚠ Background agent not found (Day 6-7 task)"
        return 0  # Not critical for basic wiring
    fi
}

# Main test
main() {
    log_section "WZRD.dev Framework Wiring Test"
    log_info "Validating all framework connections..."
    log_info "Log file: $LOG_FILE"
    echo ""
    
    # Create logs directory
    mkdir -p "${SCRIPT_DIR}/logs"
    
    # Run tests
    TESTS=(
        test_database
        test_sandbox_engine
        test_blueprint_engine
        test_component_integration
        test_background_agent
    )
    
    PASS_COUNT=0
    FAIL_COUNT=0
    TOTAL_TESTS=${#TESTS[@]}
    
    for test_func in "${TESTS[@]}"; do
        if $test_func; then
            PASS_COUNT=$((PASS_COUNT + 1))
        else
            FAIL_COUNT=$((FAIL_COUNT + 1))
        fi
    done
    
    # Summary
    log_section "Wiring Test Summary"
    echo -e "Total Tests: $TOTAL_TESTS" | tee -a "$LOG_FILE"
    echo -e "${GREEN}Passed: $PASS_COUNT${NC}" | tee -a "$LOG_FILE"
    echo -e "${RED}Failed: $FAIL_COUNT${NC}" | tee -a "$LOG_FILE"
    echo ""
    
    if [ "$FAIL_COUNT" -eq 0 ]; then
        echo -e "${GREEN}==========================================${NC}" | tee -a "$LOG_FILE"
        echo -e "${GREEN}✅ ALL WIRING TESTS PASSED!${NC}" | tee -a "$LOG_FILE"
        echo -e "${GREEN}WZRD.dev framework is fully wired.${NC}" | tee -a "$LOG_FILE"
        echo -e "${GREEN}==========================================${NC}" | tee -a "$LOG_FILE"
        echo ""
        echo "Framework Status:"
        echo "✓ Database layer operational"
        echo "✓ Sandbox engine creates jobs"
        echo "✓ Blueprint engine executes and updates status"
        echo "✓ All components integrated"
        echo "✓ Ready for Day 6-7 (Background agent)"
        return 0
    else
        echo -e "${RED}==========================================${NC}" | tee -a "$LOG_FILE"
        echo -e "${RED}❌ $FAIL_COUNT WIRING TEST(S) FAILED${NC}" | tee -a "$LOG_FILE"
        echo -e "${RED}Check $LOG_FILE for details${NC}" | tee -a "$LOG_FILE"
        echo -e "${RED}==========================================${NC}" | tee -a "$LOG_FILE"
        return 1
    fi
}

# Run main
main "$@"