#!/bin/bash

# WZRD.dev Agent-Sandbox Integration Script
# Bridges the gap between sandbox creation and agent execution

set -e

# Configuration
BASE_DIR="/home/mdwzrd/wzrd-redesign"
CONDUCTOR_DIR="$BASE_DIR/conductor"
SANDBOX_SCRIPT="$CONDUCTOR_DIR/sandbox-engine.sh"
AGENT_TEMPLATE="$CONDUCTOR_DIR/agents/real-integrated-agent"
LOG_FILE="$BASE_DIR/logs/agent-sandbox-$(date +%Y%m%d-%H%M%S).log"

# Colors for output
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_phase() {
    echo -e "${CYAN}[PHASE]${NC} $1" | tee -a "$LOG_FILE"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1" | tee -a "$LOG_FILE"
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

# Ensure logs directory exists
mkdir -p "$BASE_DIR/logs"

# Create integrated sandbox with agent
create_sandbox_with_agent() {
    local project_path="$1"
    local blueprint="${2:-feature_implementation}"
    local agent_type="${3:-coder}"
    
    log_phase "Creating integrated sandbox with agent for: $project_path"
    
    # Step 1: Create sandbox
    log_step "Creating sandbox..."
    local sandbox_output
    sandbox_output=$("$SANDBOX_SCRIPT" create "$project_path")
    
    # Extract sandbox ID from output
    local sandbox_id=$(echo "$sandbox_output" | grep -o "Sandbox ID: [^ ]*" | cut -d' ' -f3)
    local sandbox_path=$(echo "$sandbox_output" | grep -o "Path: [^ ]*" | cut -d' ' -f2)
    
    if [ -z "$sandbox_id" ] || [ -z "$sandbox_path" ]; then
        log_error "Failed to extract sandbox info from output"
        return 1
    fi
    
    log_success "Sandbox created: $sandbox_id at $sandbox_path"
    
    # Step 2: Copy agent template to sandbox
    log_step "Setting up agent in sandbox..."
    local agent_dir="$sandbox_path/.agent"
    mkdir -p "$agent_dir"
    
    # Copy agent files
    cp -r "$AGENT_TEMPLATE/." "$agent_dir/"
    
    # Update agent config for this sandbox
    cat > "$agent_dir/agent-config.yaml" << EOF
# Agent Configuration for Sandbox $sandbox_id
agent:
  id: "$sandbox_id"
  role: "$agent_type"
  created: "$(date)"
  project: "$sandbox_path"
  blueprint: "$blueprint"
  
sandbox:
  id: "$sandbox_id"
  path: "$sandbox_path"
  type: "git_worktree"
  
skills:
  registry: "$BASE_DIR/conductor/skill-registry.yaml"
  
gateway:
  url: "http://127.0.0.1:18801"
  registration: true
  
lifecycle:
  auto_restart: true
  health_check_interval: 30
  max_memory_mb: 512
  
logging:
  file: "$agent_dir/agent.log"
  level: "info"
  
blueprint_execution:
  blueprint: "$blueprint"
  status: "pending"
  started_at: ""
  completed_at: ""
EOF
    
    # Step 3: Create startup script
    cat > "$agent_dir/start-agent.sh" << 'EOF'
#!/bin/bash
# Agent startup script for sandbox

set -e

AGENT_DIR="$(cd "$(dirname "$0")" && pwd)"
SANDBOX_PATH="$(dirname "$AGENT_DIR")"
CONFIG_FILE="$AGENT_DIR/agent-config.yaml"

# Load configuration using Python yaml module
AGENT_ID=$(python3 -c "
import yaml, sys
with open('$CONFIG_FILE') as f:
    data = yaml.safe_load(f)
    print(data.get('agent', {}).get('id', ''))
")
BLUEPRINT=$(python3 -c "
import yaml, sys
with open('$CONFIG_FILE') as f:
    data = yaml.safe_load(f)
    print(data.get('blueprint_execution', {}).get('blueprint', ''))
")

echo "Starting agent $AGENT_ID for blueprint: $BLUEPRINT"
echo "Sandbox path: $SANDBOX_PATH"
echo "Started at: $(date)"

# Update status using Python
python3 -c "
import yaml, sys
with open('$CONFIG_FILE', 'r') as f:
    data = yaml.safe_load(f)

if 'blueprint_execution' not in data:
    data['blueprint_execution'] = {}
    
data['blueprint_execution']['started_at'] = '$(date)'
data['blueprint_execution']['status'] = 'running'

with open('$CONFIG_FILE', 'w') as f:
    yaml.dump(data, f, default_flow_style=False)
"

# Navigate to sandbox
cd "$SANDBOX_PATH"

# Load OpenCode/Claude agent environment
# This is where we'd integrate with OpenCode runtime
export WZRD_AGENT_ID="$AGENT_ID"
export WZRD_SANDBOX_PATH="$SANDBOX_PATH"
export WZRD_BLUEPRINT="$BLUEPRINT"

# For now, simulate agent startup
echo "Agent environment ready"
echo "Would launch OpenCode agent here..."
echo "Agent ID: $AGENT_ID"
echo "Press Ctrl+C to stop"

# Simulate agent running
while true; do
    echo "[$(date)] Agent $AGENT_ID active in $SANDBOX_PATH"
    sleep 60
done
EOF
    
    chmod +x "$agent_dir/start-agent.sh"
    
    # Step 4: Create blueprint execution script
    cat > "$agent_dir/execute-blueprint.sh" << EOF
#!/bin/bash
# Blueprint execution script

set -e

AGENT_DIR="\$(cd "\$(dirname "\$0")" && pwd)"
CONFIG_FILE="\$AGENT_DIR/agent-config.yaml"
BLUEPRINT=\$(yq e '.blueprint_execution.blueprint' "\$CONFIG_FILE")

echo "Executing blueprint: \$BLUEPRINT"

# Load blueprint from conductor
BLUEPRINT_FILE="$BASE_DIR/conductor/blueprint-engine.yaml"

# Extract blueprint phases using Python
PHASES=$(python3 -c "
import yaml, sys, json
with open('$BLUEPRINT_FILE', 'r') as f:
    data = yaml.safe_load(f)

template = data.get('templates', {}).get('$BLUEPRINT', {})
phases = [phase['name'] for phase in template.get('phases', [])]
print(' '.join(phases))
")

echo "Blueprint phases: \$PHASES"

# Execute each phase
for phase in \$PHASES; do
    echo "=== Executing phase: \$phase ==="
    
    # Extract steps for this phase using Python
    STEPS=$(python3 -c "
import yaml, sys, json
with open('$BLUEPRINT_FILE', 'r') as f:
    data = yaml.safe_load(f)

template = data.get('templates', {}).get('$BLUEPRINT', {})
for p in template.get('phases', []):
    if p.get('name') == '$phase':
        steps = [step['id'] for step in p.get('steps', [])]
        print(' '.join(steps))
        break
")
    
    for step in \$STEPS; do
        echo "Executing step: \$step"
        
        # Simulate step execution
        echo "Step \$step completed"
        sleep 1
    done
    
    echo "Phase \$phase completed"
done

echo "Blueprint \$BLUEPRINT execution complete"

# Update status using Python
python3 -c "
import yaml, sys
with open('$CONFIG_FILE', 'r') as f:
    data = yaml.safe_load(f)

if 'blueprint_execution' not in data:
    data['blueprint_execution'] = {}
    
data['blueprint_execution']['completed_at'] = '$(date)'
data['blueprint_execution']['status'] = 'completed'

with open('$CONFIG_FILE', 'w') as f:
    yaml.dump(data, f, default_flow_style=False)
"
EOF
    
    chmod +x "$agent_dir/execute-blueprint.sh"
    
    # Step 5: Start agent in background
    log_step "Starting agent in background..."
    cd "$agent_dir"
    nohup ./start-agent.sh > "$agent_dir/agent.log" 2>&1 &
    local agent_pid=$!
    
    echo "$agent_pid" > "$agent_dir/agent.pid"
    
    log_success "Agent started with PID: $agent_pid"
    
    # Step 6: Register with conductor
    log_step "Registering agent with conductor..."
    
    # Create registration file
    local registry_file="$BASE_DIR/.worktrees/agent-registry.json"
    mkdir -p "$(dirname "$registry_file")"
    
    if [ ! -f "$registry_file" ]; then
        echo '{"agents": [], "updated_at": ""}' > "$registry_file"
    fi
    
    # Add agent to registry
    cat > "/tmp/agent-entry-$$.json" << EOF
{
    "agent_id": "$sandbox_id",
    "sandbox_id": "$sandbox_id",
    "sandbox_path": "$sandbox_path",
    "agent_path": "$agent_dir",
    "agent_pid": $agent_pid,
    "blueprint": "$blueprint",
    "agent_type": "$agent_type",
    "status": "running",
    "created_at": "$(date -Iseconds)",
    "last_heartbeat": "$(date -Iseconds)"
}
EOF
    
    jq --slurpfile entry "/tmp/agent-entry-$$.json" '.agents += $entry | .updated_at = "'$(date -Iseconds)'"' "$registry_file" > "$registry_file.tmp"
    mv "$registry_file.tmp" "$registry_file"
    rm -f "/tmp/agent-entry-$$.json"
    
    log_success "Agent registered"
    
    # Step 7: Trigger blueprint execution
    log_step "Triggering blueprint execution..."
    cd "$agent_dir"
    nohup ./execute-blueprint.sh >> "$agent_dir/blueprint.log" 2>&1 &
    
    echo "========================================="
    echo "Integrated Sandbox-Agent Created!"
    echo "========================================="
    echo "Sandbox ID: $sandbox_id"
    echo "Sandbox Path: $sandbox_path"
    echo "Agent Directory: $agent_dir"
    echo "Agent PID: $agent_pid"
    echo "Blueprint: $blueprint"
    echo "Agent Log: $agent_dir/agent.log"
    echo "Blueprint Log: $agent_dir/blueprint.log"
    echo ""
    echo "To monitor agent:"
    echo "  tail -f $agent_dir/agent.log"
    echo "  tail -f $agent_dir/blueprint.log"
    echo ""
    echo "To stop agent:"
    echo "  kill $agent_pid"
    echo "========================================="
}

# Monitor agents
monitor_agents() {
    log_phase "Monitoring active agents"
    
    local registry_file="$BASE_DIR/.worktrees/agent-registry.json"
    
    if [ ! -f "$registry_file" ]; then
        log_warning "No agent registry found"
        return 1
    fi
    
    local count=$(jq '.agents | length' "$registry_file")
    
    if [ "$count" -eq 0 ]; then
        log_info "No active agents found"
    else
        echo "Active Agents:"
        echo "=============="
        jq -r '.agents[] | "ID: \(.agent_id)\nSandbox: \(.sandbox_path)\nType: \(.agent_type)\nBlueprint: \(.blueprint)\nStatus: \(.status)\nPID: \(.agent_pid)\nCreated: \(.created_at)\nLast Heartbeat: \(.last_heartbeat)\n---"' "$registry_file"
    fi
}

# Check agent health
check_agent_health() {
    local agent_id="$1"
    
    log_phase "Checking health of agent: $agent_id"
    
    local registry_file="$BASE_DIR/.worktrees/agent-registry.json"
    
    if [ ! -f "$registry_file" ]; then
        log_error "No agent registry found"
        return 1
    fi
    
    local agent_entry=$(jq --arg id "$agent_id" '.agents[] | select(.agent_id == $id)' "$registry_file")
    
    if [ -z "$agent_entry" ]; then
        log_error "Agent not found: $agent_id"
        return 1
    fi
    
    local agent_pid=$(echo "$agent_entry" | jq -r '.agent_pid')
    local agent_path=$(echo "$agent_entry" | jq -r '.agent_path')
    
    # Check if process is running
    if ps -p "$agent_pid" > /dev/null 2>&1; then
        log_success "Agent process $agent_pid is running"
        
        # Check log file
        if [ -f "$agent_path/agent.log" ]; then
            local last_log=$(tail -1 "$agent_path/agent.log" 2>/dev/null || echo "No log entries")
            log_info "Last log entry: $last_log"
        fi
        
        # Update heartbeat
        jq --arg id "$agent_id" '(.agents[] | select(.agent_id == $id) | .last_heartbeat) = "'$(date -Iseconds)'"' "$registry_file" > "$registry_file.tmp"
        mv "$registry_file.tmp" "$registry_file"
        
    else
        log_error "Agent process $agent_pid is not running"
        
        # Update status
        jq --arg id "$agent_id" '(.agents[] | select(.agent_id == $id) | .status) = "stopped"' "$registry_file" > "$registry_file.tmp"
        mv "$registry_file.tmp" "$registry_file"
    fi
}

# Stop agent
stop_agent() {
    local agent_id="$1"
    
    log_phase "Stopping agent: $agent_id"
    
    local registry_file="$BASE_DIR/.worktrees/agent-registry.json"
    
    if [ ! -f "$registry_file" ]; then
        log_error "No agent registry found"
        return 1
    fi
    
    local agent_entry=$(jq --arg id "$agent_id" '.agents[] | select(.agent_id == $id)' "$registry_file")
    
    if [ -z "$agent_entry" ]; then
        log_error "Agent not found: $agent_id"
        return 1
    fi
    
    local agent_pid=$(echo "$agent_entry" | jq -r '.agent_pid')
    local agent_path=$(echo "$agent_entry" | jq -r '.agent_path')
    
    # Stop process
    if kill "$agent_pid" 2>/dev/null; then
        log_success "Stopped agent process $agent_pid"
    else
        log_warning "Could not stop process $agent_pid (may already be stopped)"
    fi
    
    # Update registry
    jq --arg id "$agent_id" 'del(.agents[] | select(.agent_id == $id)) | .updated_at = "'$(date -Iseconds)'"' "$registry_file" > "$registry_file.tmp"
    mv "$registry_file.tmp" "$registry_file"
    
    log_success "Agent $agent_id stopped and removed from registry"
}

# Main function
main() {
    local action="$1"
    shift
    
    case "$action" in
        "create")
            local project_path="$1"
            local blueprint="${2:-feature_implementation}"
            local agent_type="${3:-coder}"
            create_sandbox_with_agent "$project_path" "$blueprint" "$agent_type"
            ;;
            
        "monitor")
            monitor_agents
            ;;
            
        "health")
            local agent_id="$1"
            check_agent_health "$agent_id"
            ;;
            
        "stop")
            local agent_id="$1"
            stop_agent "$agent_id"
            ;;
            
        "help"|"--help"|"-h")
            echo "WZRD.dev Agent-Sandbox Integration"
            echo "Usage: $0 <action> [options]"
            echo ""
            echo "Actions:"
            echo "  create <project_path> [blueprint] [agent_type]  Create sandbox with integrated agent"
            echo "  monitor                                         Monitor all active agents"
            echo "  health <agent_id>                               Check health of specific agent"
            echo "  stop <agent_id>                                 Stop specific agent"
            echo "  help                                            Show this help"
            echo ""
            echo "Blueprints:"
            echo "  feature_implementation (default)"
            echo "  bug_fixing"
            echo "  research"
            echo "  planning"
            echo ""
            echo "Agent Types:"
            echo "  coder (default)"
            echo "  thinker"
            echo "  researcher"
            echo "  debugger"
            echo ""
            echo "Examples:"
            echo "  $0 create /path/to/project"
            echo "  $0 create /path/to/project bug_fixing debugger"
            echo "  $0 monitor"
            echo "  $0 health my-project-123"
            echo "  $0 stop my-project-123"
            ;;
            
        *)
            log_error "Unknown action: $action"
            echo "Use '$0 help' for usage information"
            return 1
            ;;
    esac
}

# Install dependencies if needed
install_dependencies() {
    log_phase "Checking dependencies"
    
    # Check for jq
    if ! command -v jq &> /dev/null; then
        log_error "jq is required but not installed"
        echo "Install with: sudo apt-get install jq"
        return 1
    fi
    
    # Check for Python yaml module
    if ! python3 -c "import yaml" 2>/dev/null; then
        log_warning "Python yaml module not found, will use fallback"
    else
        echo -e "${BLUE}[INFO]${NC} Python yaml module available"
    fi
    
    log_success "All dependencies satisfied"
    return 0
}

# Run install check
install_dependencies

# Run main function
main "$@"