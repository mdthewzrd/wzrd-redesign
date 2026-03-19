#!/bin/bash

# WZRD.dev Agent Pool Manager
# Manages lightweight research agents for PIV workflow (Plan → Implement → Validate)

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BASE_DIR="$SCRIPT_DIR/.."
POOL_DIR="$BASE_DIR/.worktrees/agent-pool"
GATEWAY_URL="http://127.0.0.1:18801"
MAX_WORKERS=3
WORKER_MEMORY_MB=256
LOG_FILE="$BASE_DIR/logs/agent-pool-$(date +%Y%m%d-%H%M%S).log"

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging
log_info() {
    echo -e "${BLUE}[POOL]${NC} $1" | tee -a "$LOG_FILE"
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

# Check if gateway is running
check_gateway() {
    log_info "Checking gateway at $GATEWAY_URL..."
    if curl -s "$GATEWAY_URL/health" > /dev/null; then
        log_success "Gateway is running"
        return 0
    else
        log_error "Gateway not responding. Start with: cd gateway && npm start"
        return 1
    fi
}

# Create worker agent configuration
create_worker() {
    local worker_id="$1"
    local role="$2"
    local task="$3"
    
    local worker_dir="$POOL_DIR/$worker_id"
    mkdir -p "$worker_dir"
    
    log_info "Creating worker $worker_id ($role)..."
    
    # Create lightweight config
    cat > "$worker_dir/agent-config.yaml" << EOF
# Lightweight Research Worker
agent:
  id: "$worker_id"
  role: "$role"
  created: "$(date)"
  task: "$task"

gateway:
  url: "$GATEWAY_URL"
  registration: true

lifecycle:
  auto_terminate: true
  max_runtime_seconds: 300
  max_memory_mb: $WORKER_MEMORY_MB

skills:
  # Minimal skill set for research
  enabled:
    - research
    - web-search
    - github
    - file-ops
    - cli
EOF

    # Create startup script
    cat > "$worker_dir/start.sh" << 'EOF'
#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/agent-config.yaml"
LOG_FILE="$SCRIPT_DIR/worker.log"

echo "Starting worker $(basename "$SCRIPT_DIR") at $(date)" > "$LOG_FILE"

# Parse task from config
TASK=$(yq eval '.agent.task' "$CONFIG_FILE")
ROLE=$(yq eval '.agent.role' "$CONFIG_FILE")

echo "Role: $ROLE" >> "$LOG_FILE"
echo "Task: $TASK" >> "$LOG_FILE"

# Simulate research work (replace with actual OpenCode invocation)
echo "Researching: $TASK" >> "$LOG_FILE"
sleep 2  # Simulate work

# Generate research findings
findings_file="$SCRIPT_DIR/findings.json"
cat > "$findings_file" << FINDINGS_EOF
{
  "worker_id": "$(basename "$SCRIPT_DIR")",
  "role": "$ROLE",
  "task": "$TASK",
  "findings": [
    "Analysis of $TASK completed",
    "Key insights identified",
    "Recommendations prepared"
  ],
  "resources": [
    "https://example.com/resource1",
    "https://example.com/resource2"
  ],
  "timestamp": "$(date -Iseconds)"
}
FINDINGS_EOF

echo "Research complete. Findings saved to $findings_file" >> "$LOG_FILE"
echo "COMPLETED" > "$SCRIPT_DIR/status.txt"

# Signal completion to gateway
curl -s -X POST "$GATEWAY_URL/api/worker/complete" \
  -H "Content-Type: application/json" \
  -d "{\"worker_id\": \"$(basename "$SCRIPT_DIR")\", \"status\": \"completed\"}" \
  >> "$LOG_FILE" 2>&1

exit 0
EOF

    chmod +x "$worker_dir/start.sh"
    
    # Create status file
    echo "READY" > "$worker_dir/status.txt"
    
    log_success "Worker $worker_id created"
    echo "$worker_dir"
}

# Start worker
start_worker() {
    local worker_dir="$1"
    local worker_id=$(basename "$worker_dir")
    
    log_info "Starting worker $worker_id..."
    
    cd "$worker_dir"
    nohup ./start.sh > "$worker_dir/output.log" 2>&1 &
    local pid=$!
    echo $pid > "$worker_dir/pid.txt"
    
    log_success "Worker $worker_id started (PID: $pid)"
    return $pid
}

# Stop worker
stop_worker() {
    local worker_id="$1"
    local worker_dir="$POOL_DIR/$worker_id"
    
    if [ -f "$worker_dir/pid.txt" ]; then
        local pid=$(cat "$worker_dir/pid.txt")
        log_info "Stopping worker $worker_id (PID: $pid)..."
        kill $pid 2>/dev/null || true
        rm -f "$worker_dir/pid.txt"
        echo "STOPPED" > "$worker_dir/status.txt"
        log_success "Worker $worker_id stopped"
    fi
}

# Launch research pool for a task
launch_research_pool() {
    local task="$1"
    local num_workers=${2:-$MAX_WORKERS}
    
    log_info "Launching research pool for task: $task"
    log_info "Workers: $num_workers"
    
    # Clean up old pool
    rm -rf "$POOL_DIR"
    mkdir -p "$POOL_DIR"
    
    # Create workers with different specializations
    local worker_dirs=()
    for i in $(seq 1 $num_workers); do
        case $i in
            1) role="web-researcher"; ;;
            2) role="code-analyzer"; ;;
            3) role="documentation-reviewer"; ;;
            *) role="general-researcher"; ;;
        esac
        
        worker_id="research-worker-$i-$(date +%s)"
        worker_dir=$(create_worker "$worker_id" "$role" "$task")
        worker_dirs+=("$worker_dir")
    done
    
    # Start all workers
    local pids=()
    for worker_dir in "${worker_dirs[@]}"; do
        start_worker "$worker_dir"
        pids+=($!)
    done
    
    log_success "Research pool launched with ${#pids[@]} workers"
    echo "${worker_dirs[@]}"
}

# Wait for pool completion
wait_for_pool() {
    local timeout_seconds=300
    local start_time=$(date +%s)
    
    log_info "Waiting for research pool completion (timeout: ${timeout_seconds}s)..."
    
    while true; do
        local all_complete=true
        local completed_count=0
        local total_count=0
        
        for worker_dir in "$POOL_DIR"/*/; do
            [ -d "$worker_dir" ] || continue
            total_count=$((total_count + 1))
            
            if [ -f "$worker_dir/status.txt" ] && [ "$(cat "$worker_dir/status.txt")" = "COMPLETED" ]; then
                completed_count=$((completed_count + 1))
            else
                all_complete=false
            fi
        done
        
        log_info "Progress: $completed_count/$total_count workers completed"
        
        if [ "$all_complete" = true ] && [ $total_count -gt 0 ]; then
            log_success "All workers completed!"
            break
        fi
        
        # Check timeout
        local current_time=$(date +%s)
        local elapsed=$((current_time - start_time))
        
        if [ $elapsed -ge $timeout_seconds ]; then
            log_warning "Timeout reached. Forcing pool shutdown."
            break
        fi
        
        sleep 5
    done
}

# Aggregate research findings
aggregate_findings() {
    log_info "Aggregating research findings..."
    
    local findings_file="$POOL_DIR/aggregated-findings.json"
    local findings_array="[]"
    
    # Collect findings from all workers
    for worker_dir in "$POOL_DIR"/*/; do
        [ -d "$worker_dir" ] || continue
        
        local worker_findings="$worker_dir/findings.json"
        if [ -f "$worker_findings" ]; then
            # Merge JSON (simplified - in production use jq)
            local worker_data=$(cat "$worker_findings")
            findings_array=$(echo "$findings_array" | jq ". + [$worker_data]" 2>/dev/null || echo "$findings_array")
        fi
    done
    
    # Create aggregated report
    cat > "$findings_file" << EOF
{
  "task": "$1",
  "timestamp": "$(date -Iseconds)",
  "worker_count": $(ls -d "$POOL_DIR"/*/ 2>/dev/null | wc -l),
  "findings": $findings_array,
  "summary": "Research completed by parallel agent pool",
  "compressed_size_bytes": $(echo "$findings_array" | wc -c)
}
EOF
    
    log_success "Findings aggregated to $findings_file"
    echo "$findings_file"
}

# Compress findings for handoff
compress_findings() {
    local findings_file="$1"
    
    log_info "Compressing findings for handoff..."
    
    # Simple compression: base64 encode
    local compressed_file="$POOL_DIR/handoff-token.txt"
    cat "$findings_file" | gzip | base64 > "$compressed_file"
    
    local original_size=$(wc -c < "$findings_file")
    local compressed_size=$(wc -c < "$compressed_file")
    local ratio=$(echo "scale=2; $compressed_size / $original_size * 100" | bc)
    
    log_info "Compression: ${original_size}B → ${compressed_size}B (${ratio}%)"
    log_success "Handoff token created: $compressed_file"
    
    echo "$compressed_file"
}

# Main PIV workflow
piv_workflow() {
    local task="$1"
    
    log_info "=== Starting PIV Workflow ==="
    log_info "Task: $task"
    
    # Phase 1: Plan (parallel research)
    log_info "--- Phase 1: Plan (Research) ---"
    check_gateway || return 1
    
    launch_research_pool "$task"
    wait_for_pool
    
    local findings_file=$(aggregate_findings "$task")
    local token_file=$(compress_findings "$findings_file")
    
    # Phase 2: Implement (build agent)
    log_info "--- Phase 2: Implement (Build) ---"
    log_info "Launching build agent with research token..."
    
    # Create build agent config with token
    local build_dir="$POOL_DIR/build-agent"
    mkdir -p "$build_dir"
    
    cat > "$build_dir/build-config.yaml" << EOF
# Build Agent Configuration
agent:
  id: "build-agent-$(date +%s)"
  role: "builder"
  task: "$task"
  research_token: "$(cat "$token_file")"

gateway:
  url: "$GATEWAY_URL"

skills:
  enabled:
    - coding
    - architecture
    - debugging
    - git
EOF
    
    log_success "Build agent configured with research token"
    
    # Phase 3: Validate (validation agent)
    log_info "--- Phase 3: Validate (Testing) ---"
    log_info "Validation phase ready..."
    
    # Create validation config
    local validate_dir="$POOL_DIR/validate-agent"
    mkdir -p "$validate_dir"
    
    cat > "$validate_dir/validate-config.yaml" << EOF
# Validation Agent Configuration
agent:
  id: "validate-agent-$(date +%s)"
  role: "validator"
  task: "$task"

gateway:
  url: "$GATEWAY_URL"

skills:
  enabled:
    - testing
    - validation
    - e2e-test
    - performance
EOF
    
    log_success "Validation agent configured"
    
    # Summary
    log_info "=== PIV Workflow Complete ==="
    log_info "Research: Completed with $(ls -d "$POOL_DIR"/research-worker-*/ 2>/dev/null | wc -l) workers"
    log_info "Build: Agent configured with compressed research"
    log_info "Validate: Agent ready for testing"
    log_info "Handoff token: $token_file ($(wc -c < "$token_file") bytes)"
    
    echo "$token_file"
}

# Cleanup
cleanup_pool() {
    log_info "Cleaning up agent pool..."
    
    # Stop all workers
    for worker_dir in "$POOL_DIR"/*/; do
        [ -d "$worker_dir" ] || continue
        stop_worker "$(basename "$worker_dir")"
    done
    
    # Remove pool directory
    rm -rf "$POOL_DIR"
    log_success "Pool cleaned up"
}

# Status check
pool_status() {
    log_info "=== Agent Pool Status ==="
    
    if [ ! -d "$POOL_DIR" ]; then
        log_info "No active pool"
        return
    fi
    
    local total=0
    local ready=0
    local running=0
    local completed=0
    
    for worker_dir in "$POOL_DIR"/*/; do
        [ -d "$worker_dir" ] || continue
        total=$((total + 1))
        
        if [ -f "$worker_dir/status.txt" ]; then
            case $(cat "$worker_dir/status.txt") in
                "READY") ready=$((ready + 1)); ;;
                "RUNNING") running=$((running + 1)); ;;
                "COMPLETED") completed=$((completed + 1)); ;;
            esac
        fi
    done
    
    log_info "Workers: $total total"
    log_info "  Ready: $ready"
    log_info "  Running: $running"
    log_info "  Completed: $completed"
    
    if [ -f "$POOL_DIR/handoff-token.txt" ]; then
        log_info "Handoff token: $(wc -c < "$POOL_DIR/handoff-token.txt") bytes"
    fi
}

# Main command dispatcher
main() {
    case "$1" in
        "start")
            if [ -z "$2" ]; then
                log_error "Usage: $0 start \"<task description>\""
                exit 1
            fi
            piv_workflow "$2"
            ;;
        "status")
            pool_status
            ;;
        "cleanup")
            cleanup_pool
            ;;
        "test")
            log_info "Testing agent pool..."
            piv_workflow "Test research task"
            ;;
        *)
            echo "Usage: $0 {start|status|cleanup|test}"
            echo ""
            echo "Commands:"
            echo "  start \"<task>\"    Start PIV workflow for task"
            echo "  status             Check pool status"
            echo "  cleanup            Clean up pool"
            echo "  test               Run test workflow"
            exit 1
            ;;
    esac
}

# Run main
main "$@"