#!/bin/bash

# WZRD.dev Auto-Trigger Detector
# Monitors input channels and triggers proactive actions

set -e

# Configuration
BASE_DIR="/home/mdwzrd/wzrd-redesign"
CONDUCTOR_DIR="$BASE_DIR/conductor"
INTEGRATION_SCRIPT="$CONDUCTOR_DIR/agent-sandbox-integration.sh"
LOG_FILE="$BASE_DIR/logs/auto-trigger-$(date +%Y%m%d-%H%M%S).log"
CHECK_INTERVAL=30  # seconds

# Trigger Patterns
TRIGGER_PATTERNS=(
    # Project creation
    "create.*project"
    "start.*development"
    "build.*app"
    "new.*project"
    
    # Feature implementation
    "implement.*feature"
    "add.*feature"
    "build.*feature"
    
    # Bug fixing
    "fix.*bug"
    "debug.*issue"
    "solve.*problem"
    
    # Research
    "research.*topic"
    "analyze.*data"
    "investigate.*issue"
    
    # Planning
    "design.*system"
    "plan.*architecture"
    "create.*plan"
)

# Pattern to Blueprint Mapping
PATTERN_MAPPING=(
    "create.*project:feature_implementation"
    "start.*development:feature_implementation"
    "build.*app:feature_implementation"
    "new.*project:feature_implementation"
    
    "implement.*feature:feature_implementation"
    "add.*feature:feature_implementation"
    "build.*feature:feature_implementation"
    
    "fix.*bug:bug_fixing"
    "debug.*issue:bug_fixing"
    "solve.*problem:bug_fixing"
    
    "research.*topic:research"
    "analyze.*data:research"
    "investigate.*issue:research"
    
    "design.*system:planning"
    "plan.*architecture:planning"
    "create.*plan:planning"
)

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

log_trigger() {
    echo -e "${GREEN}[TRIGGER]${NC} $1" | tee -a "$LOG_FILE"
}

log_monitor() {
    echo -e "${BLUE}[MONITOR]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

# Ensure logs directory exists
mkdir -p "$BASE_DIR/logs"

# Monitor Discord channel (simplified - would use Discord API)
monitor_discord() {
    local channel_id="$1"
    
    log_monitor "Monitoring Discord channel: $channel_id"
    
    # For now, simulate by checking a file
    local discord_file="$BASE_DIR/.worktrees/discord-input.json"
    
    if [ ! -f "$discord_file" ]; then
        echo '{"messages": []}' > "$discord_file"
    fi
    
    # Check for new messages
    local last_check_file="$BASE_DIR/.worktrees/discord-last-check"
    
    if [ ! -f "$last_check_file" ]; then
        echo "0" > "$last_check_file"
    fi
    
    local last_check=$(cat "$last_check_file")
    local current_time=$(date +%s)
    
    # Simulate message check (in real implementation, would use Discord API)
    local new_messages=$(jq --argjson since "$last_check" '.messages[] | select(.timestamp > $since)' "$discord_file" 2>/dev/null || echo "[]")
    
    echo "$current_time" > "$last_check_file"
    
    echo "$new_messages"
}

# Monitor CLI input (from file or stdin)
monitor_cli() {
    local input_file="$BASE_DIR/.worktrees/cli-input.txt"
    
    if [ ! -f "$input_file" ]; then
        touch "$input_file"
    fi
    
    # Check for new lines
    local last_line_count_file="$BASE_DIR/.worktrees/cli-line-count"
    
    if [ ! -f "$last_line_count_file" ]; then
        echo "0" > "$last_line_count_file"
    fi
    
    local last_line_count=$(cat "$last_line_count_file")
    local current_line_count=$(wc -l < "$input_file")
    
    if [ "$current_line_count" -gt "$last_line_count" ]; then
        # Get new lines
        local new_lines=$(tail -n $((current_line_count - last_line_count)) "$input_file")
        
        echo "$current_line_count" > "$last_line_count_file"
        
        echo "$new_lines"
    else
        echo ""
    fi
}

# Monitor worktree creation (from sandbox engine)
monitor_worktrees() {
    local registry_file="$BASE_DIR/.worktrees/sandbox-registry.json"
    
    if [ ! -f "$registry_file" ]; then
        echo "{}"
        return
    fi
    
    # Check for new sandboxes created in last CHECK_INTERVAL seconds
    local current_time=$(date +%s)
    local check_time=$((current_time - CHECK_INTERVAL))
    
    local new_sandboxes=$(jq --argjson since "$check_time" '.sandboxes[] | select(.created_at | fromdate > $since)' "$registry_file" 2>/dev/null || echo "[]")
    
    echo "$new_sandboxes"
}

# Check if input matches any trigger pattern
check_for_triggers() {
    local input="$1"
    local source="$2"
    
    log_monitor "Checking input from $source: \"$input\""
    
    # Convert to lowercase for matching
    local input_lower=$(echo "$input" | tr '[:upper:]' '[:lower:]')
    
    for pattern in "${TRIGGER_PATTERNS[@]}"; do
        if [[ "$input_lower" =~ $pattern ]]; then
            log_trigger "Pattern matched: '$pattern' in input"
            
            # Find blueprint mapping
            local blueprint="feature_implementation"  # default
            for mapping in "${PATTERN_MAPPING[@]}"; do
                local map_pattern=$(echo "$mapping" | cut -d':' -f1)
                local map_blueprint=$(echo "$mapping" | cut -d':' -f2)
                
                if [[ "$input_lower" =~ $map_pattern ]]; then
                    blueprint="$map_blueprint"
                    break
                fi
            done
            
            echo "$blueprint"
            return 0
        fi
    done
    
    echo ""
    return 1
}

# Extract project path from input (simplified)
extract_project_path() {
    local input="$1"
    
    # Look for path-like patterns
    if [[ "$input" =~ /[a-zA-Z0-9_\-/]+ ]]; then
        local path="${BASH_REMATCH[0]}"
        
        # Check if path exists
        if [ -d "$path" ]; then
            echo "$path"
            return 0
        fi
        
        # Check relative to home
        if [ -d "/home/mdwzrd/$path" ]; then
            echo "/home/mdwzrd/$path"
            return 0
        fi
        
        # Check relative to current directory
        if [ -d "./$path" ]; then
            echo "./$path"
            return 0
        fi
    fi
    
    # Default: use current directory
    echo "."
}

# Determine agent type based on blueprint
get_agent_type() {
    local blueprint="$1"
    
    case "$blueprint" in
        "feature_implementation")
            echo "coder"
            ;;
        "bug_fixing")
            echo "debugger"
            ;;
        "research")
            echo "researcher"
            ;;
        "planning")
            echo "thinker"
            ;;
        *)
            echo "coder"
            ;;
    esac
}

# Process trigger and take action
process_trigger() {
    local input="$1"
    local source="$2"
    local blueprint="$3"
    
    log_phase "Processing trigger from $source"
    log_trigger "Input: $input"
    log_trigger "Blueprint: $blueprint"
    
    # Extract project path
    local project_path=$(extract_project_path "$input")
    log_trigger "Project path: $project_path"
    
    # Determine agent type
    local agent_type=$(get_agent_type "$blueprint")
    log_trigger "Agent type: $agent_type"
    
    # Create integrated sandbox with agent
    log_trigger "Creating sandbox with agent..."
    
    # Run integration script
    if "$INTEGRATION_SCRIPT" create "$project_path" "$blueprint" "$agent_type"; then
        log_trigger "Successfully created integrated sandbox-agent"
        
        # Log the action
        local action_log="$BASE_DIR/.worktrees/trigger-actions.json"
        
        if [ ! -f "$action_log" ]; then
            echo '{"actions": []}' > "$action_log"
        fi
        
        local action_entry=$(cat << EOF
{
    "timestamp": "$(date -Iseconds)",
    "source": "$source",
    "input": "$input",
    "blueprint": "$blueprint",
    "project_path": "$project_path",
    "agent_type": "$agent_type",
    "action": "created_sandbox_agent"
}
EOF
)
        
        jq --argjson entry "$action_entry" '.actions += [$entry]' "$action_log" > "$action_log.tmp"
        mv "$action_log.tmp" "$action_log"
        
    else
        log_error "Failed to create integrated sandbox-agent"
    fi
}

# Main monitoring loop
monitor_loop() {
    log_phase "Starting auto-trigger monitoring loop"
    echo "Monitoring interval: ${CHECK_INTERVAL}s"
    echo "Press Ctrl+C to stop"
    echo ""
    
    while true; do
        local triggered=false
        
        # Check Discord
        local discord_messages=$(monitor_discord "general")
        if [ -n "$discord_messages" ] && [ "$discord_messages" != "[]" ]; then
            # Process each message
            while IFS= read -r message; do
                if [ -n "$message" ]; then
                    local content=$(echo "$message" | jq -r '.content')
                    local blueprint=$(check_for_triggers "$content" "discord")
                    
                    if [ -n "$blueprint" ]; then
                        process_trigger "$content" "discord" "$blueprint"
                        triggered=true
                    fi
                fi
            done <<< "$(echo "$discord_messages" | jq -c '.[]')"
        fi
        
        # Check CLI
        local cli_input=$(monitor_cli)
        if [ -n "$cli_input" ]; then
            while IFS= read -r line; do
                if [ -n "$line" ]; then
                    local blueprint=$(check_for_triggers "$line" "cli")
                    
                    if [ -n "$blueprint" ]; then
                        process_trigger "$line" "cli" "$blueprint"
                        triggered=true
                    fi
                fi
            done <<< "$cli_input"
        fi
        
        # Check new worktrees (auto-trigger agent for new sandboxes)
        local new_sandboxes=$(monitor_worktrees)
        if [ -n "$new_sandboxes" ] && [ "$new_sandboxes" != "[]" ]; then
            # Auto-attach agents to new sandboxes
            while IFS= read -r sandbox; do
                if [ -n "$sandbox" ]; then
                    local sandbox_id=$(echo "$sandbox" | jq -r '.sandbox_id')
                    local project_path=$(echo "$sandbox" | jq -r '.project_path')
                    
                    log_trigger "New sandbox detected: $sandbox_id"
                    
                    # Auto-create agent for sandbox (with default blueprint)
                    if "$INTEGRATION_SCRIPT" create "$project_path" "feature_implementation" "coder"; then
                        log_trigger "Auto-attached agent to sandbox $sandbox_id"
                        triggered=true
                    fi
                fi
            done <<< "$(echo "$new_sandboxes" | jq -c '.[]')"
        fi
        
        # If nothing triggered this cycle, log idle
        if [ "$triggered" = false ]; then
            log_monitor "No triggers detected this cycle ($(date))"
        fi
        
        # Wait before next check
        sleep "$CHECK_INTERVAL"
    done
}

# Simulate input (for testing)
simulate_input() {
    local source="$1"
    local message="$2"
    
    log_phase "Simulating $source input: \"$message\""
    
    case "$source" in
        "discord")
            local discord_file="$BASE_DIR/.worktrees/discord-input.json"
            
            # Add simulated message
            local new_message=$(cat << EOF
{
    "content": "$message",
    "timestamp": $(date +%s),
    "author": "test-user",
    "channel": "general"
}
EOF
)
            
            jq --argjson msg "$new_message" '.messages += [$msg]' "$discord_file" > "$discord_file.tmp"
            mv "$discord_file.tmp" "$discord_file"
            
            log_monitor "Added simulated Discord message"
            ;;
            
        "cli")
            local cli_file="$BASE_DIR/.worktrees/cli-input.txt"
            echo "$message" >> "$cli_file"
            
            log_monitor "Added simulated CLI input"
            ;;
            
        *)
            log_error "Unknown source: $source"
            ;;
    esac
}

# Manual trigger test
test_trigger() {
    local test_message="$1"
    
    log_phase "Manual trigger test"
    
    local blueprint=$(check_for_triggers "$test_message" "manual_test")
    
    if [ -n "$blueprint" ]; then
        log_trigger "Test PASSED: Pattern detected"
        log_trigger "Blueprint: $blueprint"
        
        # Extract info without creating sandbox
        local project_path=$(extract_project_path "$test_message")
        local agent_type=$(get_agent_type "$blueprint")
        
        echo "Would create:"
        echo "  Project: $project_path"
        echo "  Blueprint: $blueprint"
        echo "  Agent type: $agent_type"
        
        return 0
    else
        log_trigger "Test FAILED: No pattern detected"
        return 1
    fi
}

# Main function
main() {
    local action="$1"
    shift
    
    case "$action" in
        "start")
            monitor_loop
            ;;
            
        "simulate")
            local source="$1"
            local message="$2"
            simulate_input "$source" "$message"
            ;;
            
        "test")
            local test_message="$1"
            test_trigger "$test_message"
            ;;
            
        "patterns")
            echo "Available trigger patterns:"
            echo "=========================="
            for pattern in "${TRIGGER_PATTERNS[@]}"; do
                echo "  $pattern"
            done
            echo ""
            echo "Pattern to Blueprint mapping:"
            echo "============================="
            for mapping in "${PATTERN_MAPPING[@]}"; do
                echo "  $mapping"
            done
            ;;
            
        "help"|"--help"|"-h")
            echo "WZRD.dev Auto-Trigger Detector"
            echo "Usage: $0 <action> [options]"
            echo ""
            echo "Actions:"
            echo "  start                            Start monitoring loop"
            echo "  simulate <source> <message>      Simulate input (discord|cli)"
            echo "  test <message>                   Test trigger detection"
            echo "  patterns                         List trigger patterns"
            echo "  help                             Show this help"
            echo ""
            echo "Examples:"
            echo "  $0 start"
            echo "  $0 simulate discord \"create a new project\""
            echo "  $0 simulate cli \"fix the bug in api\""
            echo "  $0 test \"I need to build a React app\""
            echo "  $0 test \"Research machine learning trends\""
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