#!/bin/bash

# WZRD.dev Sandbox Engine Script
# Implements automated project isolation with worktree/Docker containers, resource limits, and cleanup

set -e

# Configuration
SANDBOX_CONFIG="./conductor/sandbox-engine.yaml"
SANDBOX_REGISTRY="/home/mdwzrd/wzrd-redesign/.worktrees/sandbox-registry.json"
WORKTREE_BASE="/home/mdwzrd/wzrd-redesign/.worktrees"
LOG_FILE="./logs/sandbox-$(date +%Y%m%d-%H%M%S).log"

# Colors for output
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
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
    echo -e "${MAGENTA}[STEP]${NC} $1" | tee -a "$LOG_FILE"
}

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

# Initialize sandbox registry
init_registry() {
    if [ ! -f "$SANDBOX_REGISTRY" ]; then
        log_info "Creating sandbox registry: $SANDBOX_REGISTRY"
        mkdir -p "$(dirname "$SANDBOX_REGISTRY")"
        echo '{"sandboxes": [], "created_at": "'$(date -Iseconds)'", "updated_at": "'$(date -Iseconds)'"}' > "$SANDBOX_REGISTRY"
        log_success "Sandbox registry initialized"
    fi
}

# Register a new sandbox
register_sandbox() {
    local sandbox_id="$1"
    local project_path="$2"
    local sandbox_type="$3"
    
    # Create temporary JSON file
    local temp_json="/tmp/sandbox-entry-$(date +%s).json"
    cat << EOF > "$temp_json"
{
    "sandbox_id": "$sandbox_id",
    "project_path": "$project_path",
    "sandbox_type": "$sandbox_type",
    "created_at": "$(date -Iseconds)",
    "resource_usage": {},
    "health_status": "healthy",
    "last_accessed": "$(date -Iseconds)"
}
EOF
    
    # Update registry
    if jq --slurpfile entry "$temp_json" '.sandboxes += $entry | .updated_at = "'$(date -Iseconds)'"' "$SANDBOX_REGISTRY" > "$SANDBOX_REGISTRY.tmp"; then
        mv "$SANDBOX_REGISTRY.tmp" "$SANDBOX_REGISTRY"
        log_success "Sandbox $sandbox_id registered"
    else
        log_warning "Failed to update registry, but sandbox created successfully"
    fi
    
    # Cleanup temp file
    rm -f "$temp_json"
}

# Determine sandbox type based on project
determine_sandbox_type() {
    local project_path="$1"
    local result=""
    
    # Check for Dockerfile
    if [ -f "$project_path/Dockerfile" ]; then
        result="docker_container"
    # Check for package.json (Node.js project)
    elif [ -f "$project_path/package.json" ]; then
        result="git_worktree"
    # Check for Python project
    elif [ -f "$project_path/requirements.txt" ] || [ -f "$project_path/pyproject.toml" ]; then
        result="git_worktree"
    # Default to git worktree
    else
        result="git_worktree"
    fi
    
    echo "$result"
}

# Create git worktree sandbox
create_git_worktree() {
    local project_path="$1"
    local sandbox_id="$2"
    
    log_phase "Creating git worktree sandbox: $sandbox_id"
    
    # Create unique worktree name
    local worktree_name="${sandbox_id}"
    local worktree_path="$WORKTREE_BASE/$worktree_name"
    
    log_step "Creating worktree at: $worktree_path"
    
    # Check if we're already in a git repo
    if [ -d "$project_path/.git" ]; then
        # Create worktree from existing repo
        cd "$project_path"
        git worktree add "$worktree_path" main 2>&1 | tee -a "$LOG_FILE"
    else
        # Create new directory and initialize git
        mkdir -p "$worktree_path"
        cd "$worktree_path"
        git init 2>&1 | tee -a "$LOG_FILE"
        
        # Copy essential files if they exist
        for file in "package.json" "requirements.txt" "pyproject.toml" "conductor/"; do
            if [ -e "$project_path/$file" ]; then
                cp -r "$project_path/$file" "$worktree_path/"
                log_info "Copied $file to sandbox"
            fi
        done
    fi
    
    # Skip directories like node_modules
    for skip_dir in "node_modules" ".git" ".next" "dist" "build"; do
        if [ -d "$worktree_path/$skip_dir" ]; then
            rm -rf "$worktree_path/$skip_dir"
            log_info "Removed $skip_dir directory"
        fi
    done
    
    echo "$worktree_path"
}

# Create Docker container sandbox
create_docker_container() {
    local project_path="$1"
    local sandbox_id="$2"
    
    log_phase "Creating Docker container sandbox: $sandbox_id"
    
    local container_name="wzrd-$sandbox_id"
    local worktree_path="$WORKTREE_BASE/$sandbox_id"
    
    log_step "Creating worktree for container: $worktree_path"
    
    # First create a worktree
    create_git_worktree "$project_path" "$sandbox_id" > /dev/null
    
    log_step "Building Docker container: $container_name"
    
    # Check if Dockerfile exists
    if [ -f "$worktree_path/Dockerfile" ]; then
        docker build -t "wzrd/$sandbox_id" "$worktree_path" 2>&1 | tee -a "$LOG_FILE"
    else
        # Use default Node.js image
        log_warning "No Dockerfile found, using default Node.js image"
    fi
    
    log_step "Running Docker container"
    
    # Run container with mounted volume
    docker run -d \
        --name "$container_name" \
        -v "$worktree_path:/app" \
        -e "WZRD_SANDBOX=true" \
        -e "WZRD_PROJECT_NAME=${sandbox_id}" \
        -e "WZRD_WORKTREE_PATH=${worktree_path}" \
        --memory="2g" \
        --cpus="2.0" \
        "node:18-alpine" \
        tail -f /dev/null 2>&1 | tee -a "$LOG_FILE"
    
    # Wait for container to be ready
    sleep 2
    
    # Check if container is running
    if docker ps --filter "name=$container_name" --format "{{.Names}}" | grep -q "$container_name"; then
        log_success "Docker container $container_name is running"
        echo "$worktree_path"
    else
        log_error "Failed to start Docker container"
        return 1
    fi
}

# Check resource availability
check_resource_availability() {
    local sandbox_type="$1"
    
    log_info "Checking resource availability for $sandbox_type"
    
    case "$sandbox_type" in
        "docker_container")
            # Check Docker is running
            if ! docker info > /dev/null 2>&1; then
                log_error "Docker is not running"
                return 1
            fi
            
            # Check memory availability
            local total_memory=$(free -m | awk '/^Mem:/{print $2}')
            local used_memory=$(free -m | awk '/^Mem:/{print $3}')
            local available_memory=$((total_memory - used_memory))
            
            if [ $available_memory -lt 2048 ]; then
                log_warning "Low memory available: ${available_memory}MB (minimum 2048MB)"
            fi
            ;;
            
        "git_worktree")
            # Check disk space
            local available_space=$(df -BG "$WORKTREE_BASE" | awk 'NR==2{print $4}' | sed 's/G//')
            
            if [ $available_space -lt 10 ]; then
                log_warning "Low disk space: ${available_space}GB (minimum 10GB)"
            fi
            ;;
    esac
    
    log_success "Resource check passed"
    return 0
}

# Create sandbox
create_sandbox() {
    local project_path="$1"
    local sandbox_type="${2:-auto}"
    
    # Ensure logs directory exists
    mkdir -p logs
    
    log_phase "Creating sandbox for project: $project_path"
    
    # Validate project path
    if [ ! -d "$project_path" ]; then
        log_error "Project path does not exist: $project_path"
        return 1
    fi
    
    # Generate sandbox ID
    local timestamp=$(date +%Y%m%d-%H%M%S)
    local random_hex=$(openssl rand -hex 4)
    local project_name=$(basename "$project_path")
    local sanitized_name=$(echo "$project_name" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//')
    local sandbox_id="${sanitized_name}-${timestamp}-${random_hex}"
    
    log_info "Generated sandbox ID: $sandbox_id"
    
    # Determine sandbox type if auto
    if [ "$sandbox_type" = "auto" ]; then
        sandbox_type=$(determine_sandbox_type "$project_path")
        log_info "Auto-detected sandbox type: $sandbox_type"
    fi
    
    # Check resource availability
    if ! check_resource_availability "$sandbox_type"; then
        log_error "Resource check failed, cannot create sandbox"
        return 1
    fi
    
    # Initialize registry
    init_registry
    
    # Create sandbox based on type
    local sandbox_path=""
    case "$sandbox_type" in
        "git_worktree")
            sandbox_path=$(create_git_worktree "$project_path" "$sandbox_id")
            ;;
            
        "docker_container")
            sandbox_path=$(create_docker_container "$project_path" "$sandbox_id")
            ;;
            
        *)
            log_error "Unknown sandbox type: $sandbox_type"
            return 1
            ;;
    esac
    
    # Register sandbox
    register_sandbox "$sandbox_id" "$project_path" "$sandbox_type" "$sandbox_path"
    
    log_success "Sandbox created successfully"

# ============================================
# WZRD.dev Integration: Create job & trigger blueprint
# ============================================
echo "Creating WZRD.dev job..."

# Get the script directory for relative paths
WZRD_SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Derive topic from project path (or use default)
TOPIC="sandbox-$(basename "$project_path")"

# Create job in SQLite (use lowercase variables from function)
JOB_ID=$(python3 "${WZRD_SCRIPT_DIR}/lib/db.py" save-job "$TOPIC" "${sandbox_type}-blueprint")
echo "Job created: $JOB_ID"

# Link sandbox to job
python3 "${WZRD_SCRIPT_DIR}/lib/db.py" link-sandbox "$JOB_ID" "$sandbox_id"

# Register sandbox in database
python3 "${WZRD_SCRIPT_DIR}/lib/db.py" register-sandbox "$sandbox_id" "$JOB_ID" "$project_path" "$sandbox_type"

# Update job status to running
python3 "${WZRD_SCRIPT_DIR}/lib/db.py" update-status "$JOB_ID" "running"

# Trigger blueprint execution (background)
echo "Triggering blueprint..."
"${WZRD_SCRIPT_DIR}/blueprint-engine.sh" execute "$JOB_ID" "$TOPIC" "$sandbox_id" &
# ============================================

    echo "Sandbox ID: $sandbox_id"
    echo "Type: $sandbox_type"
    echo "Path: $sandbox_path"
    
    return 0
}

# List sandboxes
list_sandboxes() {
    log_phase "Listing sandboxes"
    
    if [ ! -f "$SANDBOX_REGISTRY" ]; then
        log_warning "No sandbox registry found"
        return 1
    fi
    
    local count=$(jq '.sandboxes | length' "$SANDBOX_REGISTRY")
    
    if [ "$count" -eq 0 ]; then
        log_info "No sandboxes found"
    else
        jq -r '.sandboxes[] | "\(.sandbox_id) | \(.sandbox_type) | \(.project_path) | \(.health_status) | \(.last_accessed)"' "$SANDBOX_REGISTRY" | \
        awk 'BEGIN {printf "%-40s %-20s %-50s %-15s %-25s\n", "ID", "Type", "Project", "Health", "Last Accessed"; printf "%-150s\n", "------------------------------------------------------------------------------------------------------------------------------------------------"} {printf "%-40s %-20s %-50s %-15s %-25s\n", $1, $2, $3, $4, $5}'
    fi
}

# Cleanup sandbox
cleanup_sandbox() {
    local sandbox_id="$1"
    local force="${2:-false}"
    
    log_phase "Cleaning up sandbox: $sandbox_id"
    
    if [ ! -f "$SANDBOX_REGISTRY" ]; then
        log_error "No sandbox registry found"
        return 1
    fi
    
    # Find sandbox in registry
    local sandbox_entry=$(jq --arg id "$sandbox_id" '.sandboxes[] | select(.sandbox_id == $id)' "$SANDBOX_REGISTRY")
    
    if [ -z "$sandbox_entry" ]; then
        log_error "Sandbox not found: $sandbox_id"
        return 1
    fi
    
    local sandbox_type=$(echo "$sandbox_entry" | jq -r '.sandbox_type')
    local sandbox_path=$(echo "$sandbox_entry" | jq -r '.sandbox_path')
    
    log_info "Cleaning up $sandbox_type sandbox at: $sandbox_path"
    
    case "$sandbox_type" in
        "git_worktree")
            # Remove worktree
            if [ -d "$sandbox_path" ]; then
                rm -rf "$sandbox_path"
                log_success "Removed worktree: $sandbox_path"
            fi
            ;;
            
        "docker_container")
            local container_name="wzrd-$sandbox_id"
            
            # Stop and remove container
            if docker ps --filter "name=$container_name" --format "{{.Names}}" | grep -q "$container_name"; then
                docker stop "$container_name" 2>&1 | tee -a "$LOG_FILE"
                docker rm "$container_name" 2>&1 | tee -a "$LOG_FILE"
                log_success "Stopped and removed container: $container_name"
            fi
            
            # Remove worktree
            if [ -d "$sandbox_path" ]; then
                rm -rf "$sandbox_path"
                log_success "Removed worktree: $sandbox_path"
            fi
            ;;
    esac
    
    # Remove from registry
    jq --arg id "$sandbox_id" 'del(.sandboxes[] | select(.sandbox_id == $id)) | .updated_at = "'$(date -Iseconds)'"' "$SANDBOX_REGISTRY" > "$SANDBOX_REGISTRY.tmp"
    mv "$SANDBOX_REGISTRY.tmp" "$SANDBOX_REGISTRY"
    
    log_success "Sandbox $sandbox_id cleaned up and removed from registry"
}

# Check sandbox health
check_health() {
    local sandbox_id="$1"
    
    log_phase "Checking health of sandbox: $sandbox_id"
    
    if [ ! -f "$SANDBOX_REGISTRY" ]; then
        log_error "No sandbox registry found"
        return 1
    fi
    
    # Find sandbox in registry
    local sandbox_entry=$(jq --arg id "$sandbox_id" '.sandboxes[] | select(.sandbox_id == $id)' "$SANDBOX_REGISTRY")
    
    if [ -z "$sandbox_entry" ]; then
        log_error "Sandbox not found: $sandbox_id"
        return 1
    fi
    
    local sandbox_type=$(echo "$sandbox_entry" | jq -r '.sandbox_type')
    local sandbox_path=$(echo "$sandbox_entry" | jq -r '.sandbox_path')
    local health="healthy"
    
    log_info "Checking $sandbox_type sandbox at: $sandbox_path"
    
    case "$sandbox_type" in
        "git_worktree")
            # Check if worktree exists
            if [ ! -d "$sandbox_path" ]; then
                log_error "Worktree does not exist"
                health="unhealthy"
            else
                # Check if it's accessible
                if [ ! -r "$sandbox_path" ]; then
                    log_error "Worktree not readable"
                    health="unhealthy"
                fi
                
                # Check storage usage
                local usage_mb=$(du -sm "$sandbox_path" 2>/dev/null | cut -f1)
                if [ $usage_mb -gt 10240 ]; then
                    log_warning "Storage usage high: ${usage_mb}MB"
                    health="warning"
                fi
            fi
            ;;
            
        "docker_container")
            local container_name="wzrd-$sandbox_id"
            
            # Check if container is running
            if ! docker ps --filter "name=$container_name" --format "{{.Names}}" | grep -q "$container_name"; then
                log_error "Container not running"
                health="unhealthy"
            else
                # Check container health
                if docker ps --filter "name=$container_name" --filter "health=healthy" --format "{{.Names}}" | grep -q "$container_name"; then
                    log_success "Container is healthy"
                else
                    log_warning "Container health check failed"
                    health="warning"
                fi
                
                # Check memory usage
                local memory_usage=$(docker stats "$container_name" --no-stream --format "{{.MemUsage}}" 2>/dev/null | grep -oE '[0-9]+' | head -1)
                if [ -n "$memory_usage" ] && [ $memory_usage -gt 1800000000 ]; then
                    log_warning "Memory usage high: ${memory_usage} bytes"
                    health="warning"
                fi
            fi
            ;;
    esac
    
    # Update health status in registry
    jq --arg id "$sandbox_id" --arg health "$health" '(.sandboxes[] | select(.sandbox_id == $id) | .health_status) = $health | .updated_at = "'$(date -Iseconds)'"' "$SANDBOX_REGISTRY" > "$SANDBOX_REGISTRY.tmp"
    mv "$SANDBOX_REGISTRY.tmp" "$SANDBOX_REGISTRY"
    
    echo "Health status: $health"
    return 0
}

# Execute command in sandbox
exec_in_sandbox() {
    local sandbox_id="$1"
    local command="$2"
    
    log_phase "Executing command in sandbox: $sandbox_id"
    
    if [ ! -f "$SANDBOX_REGISTRY" ]; then
        log_error "No sandbox registry found"
        return 1
    fi
    
    # Find sandbox in registry
    local sandbox_entry=$(jq --arg id "$sandbox_id" '.sandboxes[] | select(.sandbox_id == $id)' "$SANDBOX_REGISTRY")
    
    if [ -z "$sandbox_entry" ]; then
        log_error "Sandbox not found: $sandbox_id"
        return 1
    fi
    
    local sandbox_type=$(echo "$sandbox_entry" | jq -r '.sandbox_type')
    local sandbox_path=$(echo "$sandbox_entry" | jq -r '.sandbox_path')
    
    log_info "Executing '$command' in $sandbox_type sandbox"
    
    case "$sandbox_type" in
        "git_worktree")
            cd "$sandbox_path"
            eval "$command"
            ;;
            
        "docker_container")
            local container_name="wzrd-$sandbox_id"
            docker exec "$container_name" sh -c "$command"
            ;;
            
        *)
            log_error "Unknown sandbox type: $sandbox_type"
            return 1
            ;;
    esac
}

# Monitor resource usage
monitor_resources() {
    local sandbox_id="$1"
    local metrics="${2:-memory,cpu,storage}"
    
    log_phase "Monitoring resources for sandbox: $sandbox_id"
    
    if [ ! -f "$SANDBOX_REGISTRY" ]; then
        log_error "No sandbox registry found"
        return 1
    fi
    
    # Find sandbox in registry
    local sandbox_entry=$(jq --arg id "$sandbox_id" '.sandboxes[] | select(.sandbox_id == $id)' "$SANDBOX_REGISTRY")
    
    if [ -z "$sandbox_entry" ]; then
        log_error "Sandbox not found: $sandbox_id"
        return 1
    fi
    
    local sandbox_type=$(echo "$sandbox_entry" | jq -r '.sandbox_type')
    local sandbox_path=$(echo "$sandbox_entry" | jq -r '.sandbox_path')
    
    log_info "Monitoring $metrics for $sandbox_type sandbox"
    
    case "$sandbox_type" in
        "git_worktree")
            # Monitor storage
            if [[ "$metrics" == *"storage"* ]]; then
                local storage_usage=$(du -sh "$sandbox_path" 2>/dev/null | cut -f1)
                echo "Storage usage: $storage_usage"
            fi
            
            # Monitor file count
            if [[ "$metrics" == *"files"* ]]; then
                local file_count=$(find "$sandbox_path" -type f | wc -l)
                echo "File count: $file_count"
            fi
            ;;
            
        "docker_container")
            local container_name="wzrd-$sandbox_id"
            
            # Get Docker stats
            if docker ps --filter "name=$container_name" --format "{{.Names}}" | grep -q "$container_name"; then
                docker stats "$container_name" --no-stream --format "table {{.Container}}\t{{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}\t{{.PIDs}}"
            else
                log_error "Container not running"
            fi
            ;;
    esac
}

# Automatic cleanup of old sandboxes
auto_cleanup() {
    log_phase "Running automatic cleanup"
    
    if [ ! -f "$SANDBOX_REGISTRY" ]; then
        log_warning "No sandbox registry found"
        return 0
    fi
    
    local current_time=$(date +%s)
    local cleaned_count=0
    
    # Find sandboxes older than 7 days
    for sandbox in $(jq -r '.sandboxes[] | select(.expires_at != null) | "\(.sandbox_id) \(.expires_at)"' "$SANDBOX_REGISTRY"); do
        local sandbox_id=$(echo "$sandbox" | awk '{print $1}')
        local expires_at=$(echo "$sandbox" | awk '{print $2}')
        
        # Convert expires_at to timestamp
        local expires_timestamp=$(date -d "$expires_at" +%s 2>/dev/null || echo "0")
        
        if [ $expires_timestamp -gt 0 ] && [ $current_time -gt $expires_timestamp ]; then
            log_info "Cleaning up expired sandbox: $sandbox_id"
            cleanup_sandbox "$sandbox_id" "true" > /dev/null 2>&1
            cleaned_count=$((cleaned_count + 1))
        fi
    done
    
    log_success "Auto-cleanup completed. Removed $cleaned_count sandboxes."
}

# Main function
main() {
    local action="$1"
    shift
    
    case "$action" in
        "create")
            local project_path="$1"
            local sandbox_type="${2:-auto}"
            create_sandbox "$project_path" "$sandbox_type"
            ;;
            
        "list")
            list_sandboxes
            ;;
            
        "cleanup")
            local sandbox_id="$1"
            local force="${2:-false}"
            cleanup_sandbox "$sandbox_id" "$force"
            ;;
            
        "health")
            local sandbox_id="$1"
            check_health "$sandbox_id"
            ;;
            
        "exec")
            local sandbox_id="$1"
            shift
            local command="$*"
            exec_in_sandbox "$sandbox_id" "$command"
            ;;
            
        "monitor")
            local sandbox_id="$1"
            local metrics="${2:-memory,cpu,storage}"
            monitor_resources "$sandbox_id" "$metrics"
            ;;
            
        "auto-cleanup")
            auto_cleanup
            ;;
            
        "help"|"--help"|"-h")
            echo "WZRD.dev Sandbox Engine"
            echo "Usage: $0 <action> [options]"
            echo ""
            echo "Actions:"
            echo "  create <project_path> [sandbox_type]  Create new sandbox (auto, git_worktree, docker_container)"
            echo "  list                                   List all sandboxes"
            echo "  cleanup <sandbox_id> [force]          Cleanup specific sandbox"
            echo "  health <sandbox_id>                   Check sandbox health"
            echo "  exec <sandbox_id> <command>           Execute command in sandbox"
            echo "  monitor <sandbox_id> [metrics]        Monitor resource usage"
            echo "  auto-cleanup                          Cleanup old sandboxes automatically"
            echo "  help                                  Show this help"
            echo ""
            echo "Examples:"
            echo "  $0 create /path/to/project"
            echo "  $0 create /path/to/project docker_container"
            echo "  $0 list"
            echo "  $0 health sandbox-123"
            echo "  $0 exec sandbox-123 'npm test'"
            echo "  $0 monitor sandbox-123 memory,cpu"
            ;;
            
        *)
            log_error "Unknown action: $action"
            echo "Use '$0 help' for usage information"
            return 1
            ;;
    esac
}

# Run main function
main "$@"
