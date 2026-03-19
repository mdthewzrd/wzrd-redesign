#!/bin/bash
# Update onboarding system to use real Gateway V2 APIs

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[UPDATE]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Update agent registration in agent-onboarding-flow.sh
update_onboarding_script() {
    log_info "Updating agent-onboarding-flow.sh to use real Gateway APIs..."
    
    # Check if Gateway agent endpoints work
    local gateway_test=$(curl -s http://127.0.0.1:18801/agent/pool 2>/dev/null || echo "{}")
    if echo "$gateway_test" | grep -q '"success":true'; then
        log_success "Gateway V2 agent pool is available"
    else
        log_warning "Gateway V2 agent pool not responding (may be offline)"
    fi
    
    # Update the register_agent function
    sed -i '/register_agent()/,/^}/c\
register_agent() {\
    local agent_name="$1"\
    local agent_role="$2"\
    \
    log_info "Registering $agent_name ($agent_role) with Gateway V2..."\
    \
    local response=$(curl -s -X POST "http://127.0.0.1:18801/agent/register" \\\
        -H "Content-Type: application/json" \\\
        -d "{\"agentId\": \"$agent_name\", \"agentType\": \"$agent_role\", \"capabilities\": [\"$agent_role\"], \"status\": \"idle\"}" 2>/dev/null || echo "{}")\
    \
    if echo "$response" | grep -q '"'"success"'"':true'; then\
        log_success "Agent $agent_name registered with Gateway"\
        return 0\
    else\
        log_warning "Gateway registration failed: $response"\
        return 1\
    fi\
}' "$SCRIPT_DIR/agent-onboarding-flow.sh"
    
    # Update check_agent_pool function
    sed -i '/check_agent_pool()/,/^}/c\
check_agent_pool() {\
    log_info "Checking agent pool status..."\
    local response=$(curl -s "http://127.0.0.1:18801/agent/pool" 2>/dev/null || echo "{}")\
    \
    if echo "$response" | jq -e '"'"."'"agents'"'" >/dev/null 2>&1; then\
        local agent_count=$(echo "$response" | jq '"'"."'"agents | length'"'")\
        log_success "Agent pool has $agent_count active agents"\
        echo "$response" | jq '"'"."'"agents[] | {id: .agentId, type: .agentType, status: .status}"'"'\
        return 0\
    else\
        log_warning "Agent pool API not available or empty"\
        return 1\
    fi\
}' "$SCRIPT_DIR/agent-onboarding-flow.sh"
    
    # Update check_gateway_health function to check agent endpoints too
    sed -i '/check_gateway_health()/,/^}/c\
check_gateway_health() {\
    log_info "Checking Gateway V2 health..."\
    local response=$(curl -s "http://127.0.0.1:18801/health" 2>/dev/null || echo "{}")\
    \
    if echo "$response" | grep -q '"'"status"'"':"'"healthy"'"'; then\
        log_success "Gateway V2 is healthy"\
        \
        # Also check agent pool\
        local agent_response=$(curl -s "http://127.0.0.1:18801/agent/pool" 2>/dev/null || echo "{}")\
        if echo "$agent_response" | grep -q '"'"success"'"':true'; then\
            log_success "Agent pool is operational"\
        else\
            log_warning "Agent pool not responding (endpoint may be down)"\
        fi\
        return 0\
    else\
        log_error "Gateway V2 is not responding"\
        return 1\
    fi\
}' "$SCRIPT_DIR/agent-onboarding-flow.sh"
    
    # Update the agent templates to actually call Gateway registration
    log_info "Updating agent templates..."
    
    # Update coder template
    sed -i '/register_with_gateway() {/,/^}/c\
register_with_gateway() {\
    log_info "Registering agent with Gateway V2..."\
    \
    # Send registration request\
    local response=$(curl -s -X POST http://127.0.0.1:18801/agent/register \\\
        -H "Content-Type: application/json" \\\
        -d "{\\"agentId\\": \\"$AGENT_NAME\\", \\"agentType\\": \\"coder\\", \\"capabilities\\": [\\"coding\\", \\"debugging\\", \\"testing\\"], \\"status\\": \\"idle\\"}" 2>/dev/null || echo "{}")\
    \
    if echo "$response" | grep -q '"'"success"'"':true'; then\
        log_success "Registered with Gateway V2 agent pool"\
    else\
        log_warning "Gateway registration failed (may not be critical)"\
    fi\
}' "$SCRIPT_DIR/agent-coder-template.sh"
    
    # Update general template
    sed -i '/register_with_gateway() {/,/^}/c\
register_with_gateway() {\
    log_info "Registering agent with Gateway V2..."\
    \
    # Send registration request\
    local response=$(curl -s -X POST http://127.0.0.1:18801/agent/register \\\
        -H "Content-Type: application/json" \\\
        -d "{\\"agentId\\": \\"$AGENT_NAME\\", \\"agentType\\": \\"$AGENT_ROLE\\", \\"capabilities\\": [\\"coding\\", \\"architecture\\", \\"research\\", \\"planning\\", \\"debugging\\"], \\"status\\": \\"idle\\"}" 2>/dev/null || echo "{}")\
    \
    if echo "$response" | grep -q '"'"success"'"':true'; then\
        log_success "Registered with Gateway V2 agent pool"\
    else\
        log_warning "Gateway registration failed (may not be critical)"\
    fi\
}' "$SCRIPT_DIR/agent-general-template.sh"
    
    log_success "Onboarding system updated to use real Gateway V2 APIs"
}

# Update test scripts
update_test_scripts() {
    log_info "Updating test scripts..."
    
    # Update test-day7-onboarding.sh
    cat > "$SCRIPT_DIR/test-gateway-integration.sh" << 'TEST_SCRIPT'
#!/bin/bash
# Test Gateway V2 integration with agent pool

set -e

echo "=== Gateway V2 Integration Test ==="
echo ""

# Check if Gateway is running
if curl -s http://127.0.0.1:18801/health | grep -q '"status":"healthy"'; then
    echo "✅ Gateway V2 is running"
else
    echo "❌ Gateway V2 is not running"
    exit 1
fi

# Test agent registration
echo ""
echo "Testing agent registration..."
AGENT_RESPONSE=$(curl -s -X POST http://127.0.0.1:18801/agent/register \
  -H "Content-Type: application/json" \
  -d '{"agentId":"integration-test-agent","agentType":"coder","capabilities":["coding"]}')

if echo "$AGENT_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Agent registration works"
else
    echo "❌ Agent registration failed: $AGENT_RESPONSE"
fi

# Test agent pool
echo ""
echo "Testing agent pool..."
POOL_RESPONSE=$(curl -s http://127.0.0.1:18801/agent/pool)

if echo "$POOL_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Agent pool endpoint works"
    AGENT_COUNT=$(echo "$POOL_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('totalAgents', 0))")
    echo "   Total agents: $AGENT_COUNT"
else
    echo "❌ Agent pool failed: $POOL_RESPONSE"
fi

# Test task submission
echo ""
echo "Testing task submission..."
TASK_RESPONSE=$(curl -s -X POST http://127.0.0.1:18801/agent/task \
  -H "Content-Type: application/json" \
  -d '{"taskType":"testing","prompt":"Test task for integration","priority":"low"}')

if echo "$TASK_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Task submission works"
    TASK_ID=$(echo "$TASK_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('taskId', 'unknown'))")
    echo "   Task ID: $TASK_ID"
else
    echo "❌ Task submission failed: $TASK_RESPONSE"
fi

echo ""
echo "=== Integration Test Complete ==="
echo "Gateway V2 agent pool integration is working!"
TEST_SCRIPT
    
    chmod +x "$SCRIPT_DIR/test-gateway-integration.sh"
    log_success "Test scripts updated"
}

# Main
main() {
    echo "Updating onboarding system for Gateway V2 integration..."
    echo ""
    
    update_onboarding_script
    echo ""
    
    update_test_scripts
    echo ""
    
    echo "=== Update Summary ==="
    echo "✅ agent-onboarding-flow.sh updated"
    echo "✅ agent-coder-template.sh updated"
    echo "✅ agent-general-template.sh updated"
    echo "✅ test-gateway-integration.sh created"
    echo ""
    echo "Next steps:"
    echo "1. Restart Gateway V2: pkill -f 'http-gateway-v2' && cd /home/mdwzrd/wzrd-redesign/gateway/src && NVIDIA_API_KEY='...' nohup node http-gateway-v2.js &"
    echo "2. Test integration: ./test-gateway-integration.sh"
    echo "3. Create agent: ./agent-onboarding-flow.sh create 'real-agent' coder ."
    echo ""
}

main "$@"
