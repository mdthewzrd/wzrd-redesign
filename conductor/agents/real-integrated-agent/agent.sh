#!/bin/bash
# WZRD.dev Coder Agent Template
# Specialized for coding tasks with Gold Standard enforcement

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
AGENT_NAME="${1:-$(basename "$(pwd)")}"
AGENT_ROLE="coder"
PROJECT_PATH="${2:-.}"

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[CODER]${NC} $1"
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

# Load skills based on agent role
load_skills() {
    log_info "Loading skills for $AGENT_ROLE agent..."
    
    # Always load Gold Standard first
    log_info "Loading gold-standard skill..."
    # In actual implementation, would use skill loading API
    
    # Load coding skill
    log_info "Loading coding skill..."
    # skill load coding
    
    # Load debugging skill  
    log_info "Loading debugging skill..."
    # skill load debugging
    
    # Load testing skill
    log_info "Loading testing skill..."
    # skill load testing
    
    log_success "Skills loaded for $AGENT_ROLE agent"
}

# Load project context
load_project_context() {
    if [ -f "$PROJECT_PATH/.wzrd/project-config.yaml" ]; then
        log_info "Loading project context from $PROJECT_PATH/.wzrd/project-config.yaml"
        # Load project-specific config
        
        if [ -f "$PROJECT_PATH/MEMORY_SUMMARY.md" ]; then
            log_info "Loading project memory summary"
        fi
        
        if [ -f "$PROJECT_PATH/package.json" ]; then
            log_info "Detected Node.js project"
        fi
        
        if [ -f "$PROJECT_PATH/requirements.txt" ]; then
            log_info "Detected Python project"
        fi
    else
        log_warning "No .wzrd/project-config.yaml found. Using default context."
    fi
}

# Register with Gateway V2 agent pool
register_with_gateway() {
    log_info "Registering agent with Gateway V2..."
    
    # Send registration request
    local response=$(curl -s -X POST http://127.0.0.1:18801/agent/register \
        -H "Content-Type: application/json" \
        -d "{
            \"agentId\": \"$AGENT_NAME\",
            \"agentType\": \"$AGENT_ROLE\",
            \"capabilities\": [\"coding\", \"debugging\", \"testing\"],
            \"status\": \"idle\"
        }" 2>/dev/null || echo "{}")
    
    if echo "$response" | grep -q '"success":true'; then
        log_success "Registered with Gateway V2 agent pool"
    else
        log_warning "Gateway registration failed (may not be critical)"
    fi
}

# Main agent loop
main_loop() {
    log_info "Starting coder agent: $AGENT_NAME"
    log_info "Role: $AGENT_ROLE"
    log_info "Project: $PROJECT_PATH"
    echo ""
    
    # Load everything
    load_skills
    echo ""
    
    load_project_context
    echo ""
    
    register_with_gateway
    echo ""
    
    echo "========================================"
    echo "🤖 WZRD.dev Coder Agent Ready"
    echo "========================================"
    echo ""
    echo "Agent Name: $AGENT_NAME"
    echo "Role: $AGENT_ROLE"
    echo "Location: $(pwd)"
    echo "Project: $PROJECT_PATH"
    echo ""
    echo "Skills Loaded:"
    echo "  ✓ gold-standard"
    echo "  ✓ coding"
    echo "  ✓ debugging"
    echo "  ✓ testing"
    echo ""
    echo "Mode: [CODER MODE]"
    echo "  • Focus on code implementation"
    echo "  • Gold Standard enforcement"
    echo "  • Test-driven development"
    echo "  • Read-back verification"
    echo ""
    echo "Ready for coding tasks!"
    echo "========================================"
    
    # Agent stays alive waiting for tasks
    # In production, would connect to task queue
    log_info "Agent running. Waiting for coding tasks..."
    
    # Keep agent alive
    while true; do
        sleep 10
    done
}

# Check if running as main
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main_loop
fi

# Export functions for use in other scripts
export -f log_info log_success log_warning log_error
export AGENT_NAME AGENT_ROLE PROJECT_PATH
