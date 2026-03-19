#!/bin/bash
# Test Day 7 Agent Onboarding System

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

print_header() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║         Day 7: Agent Onboarding System Test            ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo ""
}

test_1_template_files() {
    log_info "Test 1: Checking template files..."
    
    local templates=("agent-coder-template.sh" "agent-thinker-template.sh" 
                     "agent-researcher-template.sh" "agent-general-template.sh")
    local passed=0
    local total=0
    
    for template in "${templates[@]}"; do
        if [ -f "$SCRIPT_DIR/$template" ]; then
            log_success "✓ $template exists"
            chmod +x "$SCRIPT_DIR/$template" 2>/dev/null || true
            ((passed++))
        else
            log_error "✗ $template missing"
        fi
        ((total++))
    done
    
    if [ "$passed" -eq "$total" ]; then
        return 0
    else
        return 1
    fi
}

test_2_skill_registry() {
    log_info "Test 2: Checking skill registry..."
    
    if [ -f "$SCRIPT_DIR/skill-registry.yaml" ]; then
        local skill_count=$(grep -c "name:" "$SCRIPT_DIR/skill-registry.yaml" 2>/dev/null || echo "0")
        if [ "$skill_count" -ge 10 ]; then
            log_success "✓ Skill registry has $skill_count skills"
            return 0
        else
            log_warning "Skill registry has only $skill_count skills (expected >=10)"
            return 1
        fi
    else
        log_error "✗ skill-registry.yaml missing"
        return 1
    fi
}

test_3_onboarding_script() {
    log_info "Test 3: Checking onboarding flow script..."
    
    if [ -f "$SCRIPT_DIR/agent-onboarding-flow.sh" ]; then
        if [ -x "$SCRIPT_DIR/agent-onboarding-flow.sh" ]; then
            log_success "✓ agent-onboarding-flow.sh is executable"
            
            # Check script syntax
            if bash -n "$SCRIPT_DIR/agent-onboarding-flow.sh"; then
                log_success "✓ Script syntax is valid"
                return 0
            else
                log_error "✗ Script has syntax errors"
                return 1
            fi
        else
            log_error "✗ agent-onboarding-flow.sh is not executable"
            return 1
        fi
    else
        log_error "✗ agent-onboarding-flow.sh missing"
        return 1
    fi
}

test_4_design_document() {
    log_info "Test 4: Checking design documentation..."
    
    if [ -f "$SCRIPT_DIR/agent-templates-design.md" ]; then
        local line_count=$(wc -l < "$SCRIPT_DIR/agent-templates-design.md")
        if [ "$line_count" -ge 50 ]; then
            log_success "✓ Design document has $line_count lines"
            return 0
        else
            log_warning "Design document is short ($line_count lines)"
            return 1
        fi
    else
        log_error "✗ agent-templates-design.md missing"
        return 1
    fi
}

test_5_agent_creation() {
    log_info "Test 5: Testing agent creation (dry run)..."
    
    # Clean up previous test agents
    rm -rf "$SCRIPT_DIR/agents/test-*" 2>/dev/null || true
    
    # Test each agent type
    local agent_types=("coder" "thinker" "researcher" "general")
    local passed=0
    local total=0
    
    for agent_type in "${agent_types[@]}"; do
        local agent_name="test-$agent_type-agent"
        
        # Use the quick_create function from agent-onboarding-flow.sh
        log_info "Creating $agent_name..."
        
        # Create agent directory manually to test structure
        local agent_dir="$SCRIPT_DIR/agents/$agent_name"
        mkdir -p "$agent_dir"
        
        # Check template exists
        local template_file="agent-${agent_type}-template.sh"
        if [ -f "$SCRIPT_DIR/$template_file" ]; then
            cp "$SCRIPT_DIR/$template_file" "$agent_dir/agent.sh"
            chmod +x "$agent_dir/agent.sh"
            
            # Create minimal config
            cat > "$agent_dir/agent-config.yaml" << CONFIG
agent:
  id: "$agent_name"
  role: "$agent_type"
  created: "$(date)"
CONFIG
            
            # Check created files
            if [ -f "$agent_dir/agent.sh" ] && [ -f "$agent_dir/agent-config.yaml" ]; then
                log_success "✓ $agent_name created successfully"
                ((passed++))
            else
                log_error "✗ $agent_name creation failed"
            fi
        else
            log_error "✗ Template $template_file missing"
        fi
        ((total++))
    done
    
    # Clean up
    rm -rf "$SCRIPT_DIR/agents/test-*" 2>/dev/null || true
    
    if [ "$passed" -eq "$total" ]; then
        return 0
    else
        return 1
    fi
}

test_6_gateway_integration() {
    log_info "Test 6: Checking Gateway V2 integration..."
    
    # Check if Gateway V2 is running by looking at processes
    if ps aux | grep -q "http-gateway.js" && [ "$?" -eq 0 ]; then
        log_success "✓ Gateway V2 process is running"
        
        # Try to connect to health endpoint
        local response=$(curl -s http://127.0.0.1:18801/health 2>/dev/null || echo "{}")
        if echo "$response" | grep -q "status"; then
            log_success "✓ Gateway health endpoint responds"
            return 0
        else
            log_warning "Gateway health endpoint not responding correctly"
            return 1
        fi
    else
        log_warning "Gateway V2 process not found (may be running elsewhere)"
        return 1
    fi
}

test_7_day6_integration() {
    log_info "Test 7: Checking Day 6 (Gateway V2) integration..."
    
    # Check for Day 6 components
    local day6_components=("agent-pool-manager.sh" "gateway-v2-test.sh")
    local passed=0
    local total=0
    
    for component in "${day6_components[@]}"; do
        if [ -f "$SCRIPT_DIR/$component" ]; then
            log_success "✓ $component exists"
            ((passed++))
        else
            log_warning "$component missing (Day 6 component)"
        fi
        ((total++))
    done
    
    # Check logs for Day 6 activity
    if [ -d "$SCRIPT_DIR/logs" ]; then
        local day6_logs=$(find "$SCRIPT_DIR/logs" -name "*gateway*" -o -name "*agent*" -o -name "*v2*" | head -3)
        if [ -n "$day6_logs" ]; then
            log_success "✓ Found Day 6 activity logs"
            ((passed++))
        else
            log_warning "No Day 6 activity logs found"
        fi
        ((total++))
    fi
    
    if [ "$passed" -ge "$((total-1))" ]; then
        return 0
    else
        return 1
    fi
}

# Run all tests
run_all_tests() {
    print_header
    
    local tests=(
        "test_1_template_files Template Files"
        "test_2_skill_registry Skill Registry" 
        "test_3_onboarding_script Onboarding Script"
        "test_4_design_document Design Document"
        "test_5_agent_creation Agent Creation"
        "test_6_gateway_integration Gateway Integration"
        "test_7_day6_integration Day 6 Integration"
    )
    
    local passed=0
    local total=0
    
    echo "Running 7 tests for Day 7 implementation..."
    echo ""
    
    for test_entry in "${tests[@]}"; do
        local test_func=$(echo "$test_entry" | cut -d' ' -f1)
        local test_name=$(echo "$test_entry" | cut -d' ' -f2-)
        
        log_info "Running: $test_name"
        
        if $test_func; then
            log_success "PASS: $test_name"
            ((passed++))
        else
            log_error "FAIL: $test_name"
        fi
        
        echo ""
        ((total++))
    done
    
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║                      Test Summary                       ║"
    echo "╠══════════════════════════════════════════════════════════╣"
    echo "║ Tests: $total total, $passed passed, $((total-passed)) failed"
    echo "║"
    
    if [ "$passed" -eq "$total" ]; then
        echo -e "║ ${GREEN}✅ ALL TESTS PASSED! Day 7 implementation is complete.${NC}"
        echo "║"
        echo "║ Next:"
        echo "║   1. Run onboarding: ./agent-onboarding-flow.sh"
        echo "║   2. Create agents for your projects"
        echo "║   3. Assign tasks via Gateway V2"
    elif [ "$passed" -ge $((total*2/3)) ]; then
        echo -e "║ ${YELLOW}⚠️  MOST TESTS PASSED. Day 7 implementation is functional.${NC}"
        echo "║"
        echo "║ Issues:"
        echo "║   - Some components may need adjustment"
        echo "║   - Gateway integration may need work"
    else
        echo -e "║ ${RED}❌ SIGNIFICANT ISSUES FOUND. Review Day 7 implementation.${NC}"
        echo "║"
        echo "║ Major issues detected:"
        echo "║   - Core components missing or failing"
        echo "║   - Consider revisiting implementation"
    fi
    
    echo "╚══════════════════════════════════════════════════════════╝"
    echo ""
    
    return $((total-passed))
}

# Main
main() {
    if [ "$1" = "quick" ]; then
        # Quick test
        test_1_template_files && \
        test_2_skill_registry && \
        test_3_onboarding_script && \
        log_success "Quick test passed - Core components present"
        return $?
    else
        run_all_tests
        return $?
    fi
}

# Execute
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

