#!/bin/bash
# WZRD.dev Researcher Agent Template
# Specialized for investigation, analysis, and information gathering

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
AGENT_NAME="${1:-$(basename "$(pwd)")}"
AGENT_ROLE="researcher"
PROJECT_PATH="${2:-.}"

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[RESEARCHER]${NC} $1"
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
    
    # Load research skill
    log_info "Loading research skill..."
    # skill load research
    
    # Load web-search skill  
    log_info "Loading web-search skill..."
    # skill load web-search
    
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
        
        if [ -f "$PROJECT_PATH/research-questions.md" ]; then
            log_info "Loading research questions"
        fi
        
        if [ -f "$PROJECT_PATH/sources.md" ]; then
            log_info "Loading source references"
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
            \"capabilities\": [\"research\", \"web-search\", \"analysis\"],
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
    log_info "Starting researcher agent: $AGENT_NAME"
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
    echo "🤖 WZRD.dev Researcher Agent Ready"
    echo "========================================"
    echo ""
    echo "Agent Name: $AGENT_NAME"
    echo "Role: $AGENT_ROLE"
    echo "Location: $(pwd)"
    echo "Project: $PROJECT_PATH"
    echo ""
    echo "Skills Loaded:"
    echo "  ✓ gold-standard"
    echo "  ✓ research"
    echo "  ✓ web-search"
    echo ""
    echo "Mode: [RESEARCH MODE]"
    echo "  • Focus on investigation and analysis"
    echo "  • Source verification and credibility checking"
    echo "  • Comprehensive research reporting"
    echo "  • Information gathering and synthesis"
    echo ""
    echo "Ready for research tasks!"
    echo "========================================"
    
    # Agent stays alive waiting for tasks
    # In production, would connect to task queue
    log_info "Agent running. Waiting for research tasks..."
    
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
