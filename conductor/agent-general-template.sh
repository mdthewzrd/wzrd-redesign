#!/bin/bash
# WZRD.dev General Agent Template
# All-purpose agent with auto-mode switching

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
AGENT_NAME="${1:-$(basename "$(pwd)")}"
AGENT_ROLE="general"
PROJECT_PATH="${2:-.}"

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[GENERAL]${NC} $1"
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
    
    # Load context skill (for progressive disclosure)
    log_info "Loading context skill..."
    # skill load context
    
    log_success "Skills loaded for $AGENT_ROLE agent"
}

# Load project context - general agent loads everything
load_project_context() {
    if [ -f "$PROJECT_PATH/.wzrd/project-config.yaml" ]; then
        log_info "Loading project context from $PROJECT_PATH/.wzrd/project-config.yaml"
        # Load project-specific config
        
        # Load all available context files
        for file in "$PROJECT_PATH"/*.md; do
            if [ -f "$file" ]; then
                log_info "Loading $(basename "$file")"
            fi
        done
        
        # Detect project type for skill recommendations
        if [ -f "$PROJECT_PATH/package.json" ]; then
            log_info "Detected JavaScript/Node.js project"
            log_info "Recommended skills: coding, debugging, testing"
        fi
        
        if [ -f "$PROJECT_PATH/requirements.txt" ]; then
            log_info "Detected Python project"
            log_info "Recommended skills: coding, cli"
        fi
        
        if [ -f "$PROJECT_PATH/go.mod" ]; then
            log_info "Detected Go project"
            log_info "Recommended skills: coding, architecture"
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
            \"capabilities\": [\"coding\", \"architecture\", \"research\", \"planning\", \"debugging\"],
            \"status\": \"idle\"
        }" 2>/dev/null || echo "{}")
    
    if echo "$response" | grep -q '"success":true'; then
        log_success "Registered with Gateway V2 agent pool"
    else
        log_warning "Gateway registration failed (may not be critical)"
    fi
}

# Auto-mode detection function
auto_detect_mode() {
    local task="$1"
    
    # Mode detection logic
    if [[ "$task" =~ "write.*code|function.*create|implement.*" ]]; then
        echo "coder"
    elif [[ "$task" =~ "design.*|architecture.*|plan.*|system.*" ]]; then
        echo "thinker"
    elif [[ "$task" =~ "research.*|analyze.*|compare.*|investigate.*" ]]; then
        echo "researcher"
    elif [[ "$task" =~ "debug.*|error.*|fix.*|broken.*" ]]; then
        echo "debugger"
    else
        echo "general"
    fi
}

# Main agent loop
main_loop() {
    log_info "Starting general agent: $AGENT_NAME"
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
    echo "🤖 WZRD.dev General Agent Ready"
    echo "========================================"
    echo ""
    echo "Agent Name: $AGENT_NAME"
    echo "Role: $AGENT_ROLE"
    echo "Location: $(pwd)"
    echo "Project: $PROJECT_PATH"
    echo ""
    echo "Skills Loaded:"
    echo "  ✓ gold-standard"
    echo "  ✓ context"
    echo ""
    echo "Mode: Auto-switching based on task"
    echo "  • [CODER MODE] for coding tasks"
    echo "  • [THINKER MODE] for architecture"
    echo "  • [RESEARCH MODE] for investigation"
    echo "  • [DEBUG MODE] for troubleshooting"
    echo "  • [CHAT MODE] for casual conversation"
    echo ""
    echo "Ready for any task!"
    echo "========================================"
    
    # Agent stays alive waiting for tasks
    # In production, would connect to task queue
    log_info "Agent running. Auto-mode detection active..."
    
    # Example: Auto-detect mode for sample tasks
    echo ""
    echo "Auto-mode detection examples:"
    echo "Task: 'Write a Python function' → Mode: $(auto_detect_mode "Write a Python function")"
    echo "Task: 'Design database schema' → Mode: $(auto_detect_mode "Design database schema")"
    echo "Task: 'Research React patterns' → Mode: $(auto_detect_mode "Research React patterns")"
    echo "Task: 'Fix broken code' → Mode: $(auto_detect_mode "Fix broken code")"
    echo ""
    
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
export -f log_info log_success log_warning log_error auto_detect_mode
export AGENT_NAME AGENT_ROLE PROJECT_PATH
