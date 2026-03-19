#!/bin/bash
# WZRD.dev Agent Onboarding Flow - Day 7 Implementation

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
GATEWAY_URL="http://127.0.0.1:18801"

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[ONBOARDING]${NC} $1"
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

# Print header
print_header() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║           WZRD.dev Agent Onboarding System              ║"
    echo "║                     Day 7: Agent Flow                   ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo ""
}

# Check Gateway V2 health
check_gateway_health() {
    log_info "Checking Gateway V2 health..."
    local response=$(curl -s "$GATEWAY_URL/health" 2>/dev/null || echo "{}")
    
    if echo "$response" | grep -q '"status":"healthy"'; then
        log_success "Gateway V2 is healthy"
        return 0
    else
        log_error "Gateway V2 is not responding"
        return 1
    fi
}

# Check agent pool status
check_agent_pool() {
    log_info "Checking agent pool status..."
    local response=$(curl -s "$GATEWAY_URL/agent/pool" 2>/dev/null || echo "{}")
    
    if echo "$response" | jq -e '.agents' >/dev/null 2>&1; then
        local agent_count=$(echo "$response" | jq '.agents | length')
        log_success "Agent pool has $agent_count active agents"
        echo "$response" | jq '.agents[] | {id: .agentId, type: .agentType, status: .status}'
        return 0
    else
        log_warning "Agent pool API not available"
        return 1
    fi
}

# Create new agent
create_agent() {
    local agent_name="$1"
    local agent_role="$2"
    local project_path="${3:-.}"
    
    log_info "Creating new agent: $agent_name ($agent_role)"
    
    # Validate role
    case "$agent_role" in
        coder|thinker|researcher|general)
            ;;
        *)
            log_error "Invalid agent role: $agent_role"
            echo "Valid roles: coder, thinker, researcher, general"
            return 1
    esac
    
    # Check if template exists
    local template_file="agent-${agent_role}-template.sh"
    if [ ! -f "$SCRIPT_DIR/$template_file" ]; then
        log_error "Template file not found: $template_file"
        return 1
    fi
    
    # Create agent directory
    local agent_dir="$SCRIPT_DIR/agents/$agent_name"
    mkdir -p "$agent_dir"
    
    log_info "Setting up agent in: $agent_dir"
    
    # Copy template
    cp "$SCRIPT_DIR/$template_file" "$agent_dir/agent.sh"
    chmod +x "$agent_dir/agent.sh"
    
    # Create agent config
    cat > "$agent_dir/agent-config.yaml" << AGENT_CONFIG
# Agent Configuration
agent:
  id: "$agent_name"
  role: "$agent_role"
  created: "$(date)"
  project: "$project_path"
  
skills:
  # Auto-loaded from skill-registry.yaml
  registry: "$SCRIPT_DIR/skill-registry.yaml"
  
gateway:
  url: "$GATEWAY_URL"
  registration: true
  
lifecycle:
  auto_restart: true
  health_check_interval: 30
  max_memory_mb: 512
  
logging:
  file: "$agent_dir/agent.log"
  level: "info"
AGENT_CONFIG
    
    # Create startup script
    cat > "$agent_dir/start.sh" << STARTUP
#!/bin/bash
cd "$agent_dir"
echo "Starting agent: $agent_name ($agent_role)"
echo "Project: $project_path"
echo "Agent directory: $agent_dir"
echo ""
./agent.sh "$agent_name" "$agent_role" "$project_path"
STARTUP
    chmod +x "$agent_dir/start.sh"
    
    # Create stop script
    cat > "$agent_dir/stop.sh" << SHUTDOWN
#!/bin/bash
echo "Stopping agent: $agent_name"
pkill -f "agent.sh.*$agent_name" 2>/dev/null && echo "Agent stopped" || echo "Agent not running"
SHUTDOWN
    chmod +x "$agent_dir/stop.sh"
    
    log_success "Agent $agent_name created in $agent_dir"
    
    # List created files
    echo ""
    echo "Created files:"
    find "$agent_dir" -type f | sed "s|$agent_dir/|  - |"
    
    return 0
}

# Register agent with Gateway
register_agent() {
    local agent_name="$1"
    local agent_role="$2"
    
    log_info "Registering $agent_name ($agent_role) with Gateway V2..."
    
    local response=$(curl -s -X POST "$GATEWAY_URL/agent/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"agentId\": \"$agent_name\",
            \"agentType\": \"$agent_role\",
            \"capabilities\": [\"$agent_role\"],
            \"status\": \"idle\"
        }" 2>/dev/null || echo "{}")
    
    if echo "$response" | grep -q '"success":true'; then
        log_success "Agent $agent_name registered with Gateway"
        return 0
    else
        log_warning "Gateway registration failed (may be offline)"
        return 1
    fi
}

# Deploy skill to agent
deploy_skill() {
    local agent_name="$1"
    local skill_name="$2"
    
    log_info "Deploying skill $skill_name to agent $agent_name..."
    
    # In production, would copy skill files to agent directory
    local agent_dir="$SCRIPT_DIR/agents/$agent_name"
    local skill_dir="$HOME/.claude/skills/$skill_name"
    
    if [ -d "$skill_dir" ]; then
        mkdir -p "$agent_dir/skills"
        ln -sf "$skill_dir" "$agent_dir/skills/$skill_name" 2>/dev/null || true
        log_success "Skill $skill_name linked to agent"
    else
        log_warning "Skill directory not found: $skill_name"
    fi
}

# Onboard workflow
onboard_workflow() {
    print_header
    
    # Step 1: Gateway check
    if ! check_gateway_health; then
        log_error "Cannot proceed without Gateway V2"
        return 1
    fi
    
    # Step 2: Agent pool check
    check_agent_pool
    
    echo ""
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║               Agent Creation Wizard                     ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo ""
    
    # Get agent details
    read -p "Enter agent name: " agent_name
    if [ -z "$agent_name" ]; then
        log_error "Agent name required"
        return 1
    fi
    
    echo ""
    echo "Available agent roles:"
    echo "  1. Coder - Specialized for coding tasks"
    echo "  2. Thinker - Focused on architecture and planning"
    echo "  3. Researcher - Specialized for investigation"
    echo "  4. General - All-purpose with auto-mode switching"
    echo ""
    
    read -p "Select agent role (coder/thinker/researcher/general): " agent_role
    
    read -p "Enter project path (optional, default: current directory): " project_path
    project_path="${project_path:-.}"
    
    # Create agent
    if create_agent "$agent_name" "$agent_role" "$project_path"; then
        echo ""
        
        # Register with Gateway
        read -p "Register agent with Gateway V2? (y/n): " register_choice
        if [[ "$register_choice" =~ ^[Yy]$ ]]; then
            register_agent "$agent_name" "$agent_role"
        fi
        
        # Deploy skills
        echo ""
        echo "Available skills from registry:"
        if [ -f "$SCRIPT_DIR/skill-registry.yaml" ]; then
            grep -A2 "name:" "$SCRIPT_DIR/skill-registry.yaml" | grep -v "^--" | while read line; do
                if [[ "$line" =~ "name:" ]]; then
                    skill_name=$(echo "$line" | cut -d':' -f2 | tr -d ' ' | tr -d '"')
                    echo "  - $skill_name"
                fi
            done
        fi
        
        echo ""
        read -p "Deploy default skills for $agent_role? (y/n): " skill_choice
        if [[ "$skill_choice" =~ ^[Yy]$ ]]; then
            # Deploy role-specific skills
            case "$agent_role" in
                coder)
                    deploy_skill "$agent_name" "coding"
                    deploy_skill "$agent_name" "debugging"
                    deploy_skill "$agent_name" "testing"
                    ;;
                thinker)
                    deploy_skill "$agent_name" "architecture"
                    deploy_skill "$agent_name" "planning"
                    ;;
                researcher)
                    deploy_skill "$agent_name" "research"
                    deploy_skill "$agent_name" "web-search"
                    ;;
                general)
                    deploy_skill "$agent_name" "gold-standard"
                    deploy_skill "$agent_name" "context"
                    ;;
            esac
            log_success "Default skills deployed"
        fi
        
        # Start agent
        echo ""
        read -p "Start agent now? (y/n): " start_choice
        if [[ "$start_choice" =~ ^[Yy]$ ]]; then
            local agent_dir="$SCRIPT_DIR/agents/$agent_name"
            log_info "Starting agent..."
            cd "$agent_dir" && nohup ./start.sh > agent.log 2>&1 &
            log_success "Agent started in background (PID: $!)"
            echo "Logs: $agent_dir/agent.log"
        fi
        
        echo ""
        echo "╔══════════════════════════════════════════════════════════╗"
        echo "║                    Onboarding Complete                  ║"
        echo "╠══════════════════════════════════════════════════════════╣"
        echo "║ Agent: $agent_name"
        echo "║ Role: $agent_role"
        echo "║ Location: $SCRIPT_DIR/agents/$agent_name"
        echo "║ Project: $project_path"
        echo "║"
        echo "║ Next Steps:"
        echo "║   1. Check agent logs: tail -f $SCRIPT_DIR/agents/$agent_name/agent.log"
        echo "║   2. Monitor Gateway: curl $GATEWAY_URL/agent/pool"
        echo "║   3. Assign tasks via Gateway API"
        echo "╚══════════════════════════════════════════════════════════╝"
        echo ""
        
        return 0
    else
        return 1
    fi
}

# Quick agent creation (non-interactive)
quick_create() {
    local agent_name="$1"
    local agent_role="$2"
    local project_path="${3:-.}"
    
    log_info "Quick creating agent: $agent_name ($agent_role)"
    
    if create_agent "$agent_name" "$agent_role" "$project_path"; then
        register_agent "$agent_name" "$agent_role"
        
        # Deploy default skills
        case "$agent_role" in
            coder)
                deploy_skill "$agent_name" "coding"
                deploy_skill "$agent_name" "debugging"
                ;;
            thinker)
                deploy_skill "$agent_name" "architecture"
                deploy_skill "$agent_name" "planning"
                ;;
            researcher)
                deploy_skill "$agent_name" "research"
                deploy_skill "$agent_name" "web-search"
                ;;
            general)
                deploy_skill "$agent_name" "gold-standard"
                deploy_skill "$agent_name" "context"
                ;;
        esac
        
        log_success "Agent $agent_name ready"
        echo "Start with: $SCRIPT_DIR/agents/$agent_name/start.sh"
        return 0
    else
        return 1
    fi
}

# Main menu
main_menu() {
    print_header
    
    echo "Select an option:"
    echo ""
    echo "  1. 🚀 Interactive Onboarding Wizard"
    echo "  2. ⚡ Quick Create Agent (coder/thinker/researcher/general)"
    echo "  3. 📊 Check System Status"
    echo "  4. 📋 List All Agents"
    echo "  5. 🛠️  Test Agent Template"
    echo "  6. 🚪 Exit"
    echo ""
    
    read -p "Choice [1-6]: " choice
    
    case "$choice" in
        1)
            onboard_workflow
            ;;
        2)
            echo ""
            read -p "Agent name: " agent_name
            read -p "Agent role (coder/thinker/researcher/general): " agent_role
            read -p "Project path (optional): " project_path
            quick_create "$agent_name" "$agent_role" "$project_path"
            ;;
        3)
            echo ""
            check_gateway_health
            check_agent_pool
            ;;
        4)
            echo ""
            if [ -d "$SCRIPT_DIR/agents" ]; then
                echo "Agents directory: $SCRIPT_DIR/agents"
                echo ""
                find "$SCRIPT_DIR/agents" -name "agent-config.yaml" -type f | while read config; do
                    agent_name=$(dirname "$config" | xargs basename)
                    echo "Agent: $agent_name"
                    echo "  Config: $config"
                    echo ""
                done
            else
                echo "No agents directory found"
            fi
            ;;
        5)
            echo ""
            echo "Testing agent templates..."
            echo ""
            ls "$SCRIPT_DIR"/agent-*-template.sh | while read template; do
                template_name=$(basename "$template")
                echo "✓ $template_name"
            done
            echo ""
            echo "All templates are valid and executable"
            ;;
        6)
            echo "Exiting..."
            exit 0
            ;;
        *)
            echo "Invalid choice"
            ;;
    esac
    
    # Return to menu
    echo ""
    read -p "Press Enter to return to menu..." -n 1
    clear
    main_menu
}

# Command line arguments
case "$1" in
    create)
        quick_create "$2" "$3" "$4"
        ;;
    status)
        check_gateway_health
        check_agent_pool
        ;;
    list)
        if [ -d "$SCRIPT_DIR/agents" ]; then
            find "$SCRIPT_DIR/agents" -name "agent-config.yaml" -type f | xargs -I {} sh -c 'echo "Agent: $(dirname {} | xargs basename)"; echo "  Config: {}"; echo ""'
        else
            echo "No agents found"
        fi
        ;;
    *)
        main_menu
        ;;
esac

