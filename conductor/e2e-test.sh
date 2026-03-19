#!/bin/bash
# WZRD.dev Day 5: End-to-End Test Framework
# Tests complete flow: Database → Sandbox → Job → Blueprint → Validation

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_FILE="${SCRIPT_DIR}/logs/e2e-test-$(date +%Y%m%d-%H%M%S).log"
TEST_PROJECT="${SCRIPT_DIR}/test-e2e-project"

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

log_test() {
    local test_name="$1"
    local status="$2"
    local message="$3"
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    
    if [ "$status" = "PASS" ]; then
        TESTS_PASSED=$((TESTS_PASSED + 1))
        echo -e "${GREEN}[PASS]${NC} $test_name: $message" | tee -a "$LOG_FILE"
    else
        TESTS_FAILED=$((TESTS_FAILED + 1))
        echo -e "${RED}[FAIL]${NC} $test_name: $message" | tee -a "$LOG_FILE"
    fi
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_section() {
    echo ""
    echo -e "${CYAN}==========================================${NC}" | tee -a "$LOG_FILE"
    echo -e "${CYAN}$1${NC}" | tee -a "$LOG_FILE"
    echo -e "${CYAN}==========================================${NC}" | tee -a "$LOG_FILE"
    echo ""
}

cleanup() {
    log_info "Cleaning up test artifacts..."
    
    # Clean test project
    if [ -d "$TEST_PROJECT" ]; then
        rm -rf "$TEST_PROJECT"
    fi
    
    # Clean test sandboxes
    if [ -f "${SCRIPT_DIR}/sandbox-engine.sh" ]; then
        "${SCRIPT_DIR}/sandbox-engine.sh" list 2>/dev/null | grep "test-e2e" | while read -r line; do
            SANDBOX_ID=$(echo "$line" | awk '{print $1}')
            log_info "Cleaning up sandbox: $SANDBOX_ID"
            "${SCRIPT_DIR}/sandbox-engine.sh" cleanup "$SANDBOX_ID" force 2>/dev/null || true
        done
    fi
    
    # Clean test jobs older than 1 hour
    python3 "${SCRIPT_DIR}/lib/db.py" cleanup 0 2>/dev/null || true
}

# Test 1: Database operations
test_database() {
    log_section "Test 1: Database Layer"
    
    # Test save-job
    JOB_ID=$(python3 "${SCRIPT_DIR}/lib/db.py" save-job "e2e-test" "test-blueprint")
    if [ -n "$JOB_ID" ]; then
        log_test "save-job" "PASS" "Created job $JOB_ID"
    else
        log_test "save-job" "FAIL" "Failed to create job"
        return 1
    fi
    
    # Test get-status
    STATUS=$(python3 "${SCRIPT_DIR}/lib/db.py" get-status "$JOB_ID" | grep -o '"status": "[^"]*"' | cut -d'"' -f4)
    if [ "$STATUS" = "pending" ]; then
        log_test "get-status" "PASS" "Job status is pending"
    else
        log_test "get-status" "FAIL" "Expected 'pending', got '$STATUS'"
    fi
    
    # Test update-status
    python3 "${SCRIPT_DIR}/lib/db.py" update-status "$JOB_ID" "running"
    STATUS=$(python3 "${SCRIPT_DIR}/lib/db.py" get-status "$JOB_ID" | grep -o '"status": "[^"]*"' | cut -d'"' -f4)
    if [ "$STATUS" = "running" ]; then
        log_test "update-status" "PASS" "Updated status to running"
    else
        log_test "update-status" "FAIL" "Expected 'running', got '$STATUS'"
    fi
    
    # Test list-active
    ACTIVE_COUNT=$(python3 "${SCRIPT_DIR}/lib/db.py" list-active | grep -c "id")
    if [ "$ACTIVE_COUNT" -gt 0 ]; then
        log_test "list-active" "PASS" "Found $ACTIVE_COUNT active jobs"
    else
        log_test "list-active" "FAIL" "No active jobs found"
    fi
    
    # Cleanup test job
    python3 "${SCRIPT_DIR}/lib/db.py" update-status "$JOB_ID" "completed"
    return 0
}

# Test 2: Sandbox creation
test_sandbox_creation() {
    log_section "Test 2: Sandbox Creation"
    
    # Create test project
    mkdir -p "$TEST_PROJECT"
    echo '{"name": "test-e2e", "version": "1.0.0"}' > "$TEST_PROJECT/package.json"
    
    # Create sandbox
    OUTPUT=$("${SCRIPT_DIR}/sandbox-engine.sh" create "$TEST_PROJECT" 2>&1)
    SANDBOX_ID=$(echo "$OUTPUT" | grep -o "Sandbox ID: [^ ]*" | cut -d' ' -f3)
    
    if [ -n "$SANDBOX_ID" ]; then
        log_test "sandbox-create" "PASS" "Created sandbox $SANDBOX_ID"
    else
        log_test "sandbox-create" "FAIL" "Failed to create sandbox"
        echo "$OUTPUT" >> "$LOG_FILE"
        return 1
    fi
    
    # Check if job was created
    sleep 2  # Give time for job creation
    ACTIVE_JOBS=$(python3 "${SCRIPT_DIR}/lib/db.py" list-active)
    
    # Look for job with sandbox- prefix (topic is "sandbox-<project_name>")
    if echo "$ACTIVE_JOBS" | grep -q '"topic": "sandbox-'; then
        log_test "sandbox-job-link" "PASS" "Job created for sandbox"
        
        # Extract the most recent job with sandbox- topic
        JOB_ID=$(echo "$ACTIVE_JOBS" | grep -B2 '"topic": "sandbox-' | head -1 | grep '"id"' | cut -d'"' -f4)
        if [ -n "$JOB_ID" ]; then
            echo "$JOB_ID" > "${SCRIPT_DIR}/test-job-id.txt"
            echo "$SANDBOX_ID" > "${SCRIPT_DIR}/test-sandbox-id.txt"
            log_test "sandbox-job-id-extract" "PASS" "Extracted job ID: $JOB_ID"
        else
            log_test "sandbox-job-id-extract" "FAIL" "Could not extract job ID"
            echo "Active jobs:" >> "$LOG_FILE"
            echo "$ACTIVE_JOBS" >> "$LOG_FILE"
        fi
    else
        log_test "sandbox-job-link" "FAIL" "No job created for sandbox"
        echo "Active jobs:" >> "$LOG_FILE"
        echo "$ACTIVE_JOBS" >> "$LOG_FILE"
    fi
    
    return 0
}

# Test 3: Blueprint execution
test_blueprint_execution() {
    log_section "Test 3: Blueprint Execution"
    
    if [ ! -f "${SCRIPT_DIR}/test-job-id.txt" ]; then
        log_test "blueprint-execution" "FAIL" "No test job ID found"
        return 1
    fi
    
    JOB_ID=$(cat "${SCRIPT_DIR}/test-job-id.txt")
    SANDBOX_ID=$(cat "${SCRIPT_DIR}/test-sandbox-id.txt")
    
    # Manually trigger blueprint
    OUTPUT=$("${SCRIPT_DIR}/blueprint-engine.sh" execute "$JOB_ID" "sandbox-$SANDBOX_ID" "$SANDBOX_ID" 2>&1)
    
    if echo "$OUTPUT" | grep -q "Blueprint execution successful"; then
        log_test "blueprint-execution" "PASS" "Blueprint executed successfully"
    else
        log_test "blueprint-execution" "FAIL" "Blueprint execution failed"
        echo "$OUTPUT" >> "$LOG_FILE"
        return 1
    fi
    
    # Check job status
    sleep 2
    STATUS=$(python3 "${SCRIPT_DIR}/lib/db.py" get-status "$JOB_ID" | grep -o '"status": "[^"]*"' | cut -d'"' -f4)
    if [ "$STATUS" = "completed" ]; then
        log_test "job-status-update" "PASS" "Job status updated to completed"
    else
        log_test "job-status-update" "FAIL" "Expected 'completed', got '$STATUS'"
    fi
    
    return 0
}

# Test 4: Integration validation
test_integration_validation() {
    log_section "Test 4: Integration Validation"
    
    # Check all components are wired
    COMPONENTS=("db.py" "sandbox-engine.sh" "blueprint-engine.sh" "lib/db.py")
    
    for component in "${COMPONENTS[@]}"; do
        if [ -f "${SCRIPT_DIR}/$component" ] || [ -f "${SCRIPT_DIR}/../$component" ]; then
            log_test "component-exists:$component" "PASS" "Component exists"
        else
            log_test "component-exists:$component" "FAIL" "Missing component: $component"
        fi
    done
    
    # Check logs directory
    if [ -d "${SCRIPT_DIR}/logs" ]; then
        log_test "logs-directory" "PASS" "Logs directory exists"
    else
        log_test "logs-directory" "FAIL" "Logs directory missing"
    fi
    
    # Check database file
    if [ -f "${SCRIPT_DIR}/db/state.db" ]; then
        log_test "database-file" "PASS" "Database file exists"
    else
        log_test "database-file" "FAIL" "Database file missing"
    fi
    
    return 0
}

# Run all tests
main() {
    log_section "WZRD.dev End-to-End Test Framework"
    log_info "Starting comprehensive test suite..."
    log_info "Log file: $LOG_FILE"
    log_info "Test project: $TEST_PROJECT"
    echo ""
    
    # Create logs directory
    mkdir -p "${SCRIPT_DIR}/logs"
    
    # Setup cleanup trap
    trap cleanup EXIT
    
    # Run tests
    test_database
    test_sandbox_creation
    test_blueprint_execution
    test_integration_validation
    
    # Summary
    log_section "Test Summary"
    echo -e "Total Tests: $TESTS_TOTAL" | tee -a "$LOG_FILE"
    echo -e "${GREEN}Passed: $TESTS_PASSED${NC}" | tee -a "$LOG_FILE"
    echo -e "${RED}Failed: $TESTS_FAILED${NC}" | tee -a "$LOG_FILE"
    
    if [ "$TESTS_FAILED" -eq 0 ]; then
        echo ""
        echo -e "${GREEN}==========================================${NC}" | tee -a "$LOG_FILE"
        echo -e "${GREEN}ALL TESTS PASSED!${NC}" | tee -a "$LOG_FILE"
        echo -e "${GREEN}WZRD.dev framework is correctly wired.${NC}" | tee -a "$LOG_FILE"
        echo -e "${GREEN}==========================================${NC}" | tee -a "$LOG_FILE"
        return 0
    else
        echo ""
        echo -e "${RED}==========================================${NC}" | tee -a "$LOG_FILE"
        echo -e "${RED}$TESTS_FAILED TEST(S) FAILED${NC}" | tee -a "$LOG_FILE"
        echo -e "${RED}Check $LOG_FILE for details${NC}" | tee -a "$LOG_FILE"
        echo -e "${RED}==========================================${NC}" | tee -a "$LOG_FILE"
        return 1
    fi
}

# Run main
main "$@"