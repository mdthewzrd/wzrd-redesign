#!/bin/bash
# OpenCode Power Wrapper for WZRD Framework
# Integrates power optimization into all OpenCode launches within WZRD

set -e

# Configuration
WZRD_HOME="/home/mdwzrd"
CONFIG_DIR="$WZRD_HOME/wzrd-redesign/wzrd-redesign-build/configs"
LOG_DIR="/tmp/wzrd-power-logs"
mkdir -p "$LOG_DIR"

# Default power optimization settings
export OPENCODE_POWER_NICE=10
export OPENCODE_POWER_CONTEXT=8000
export OPENCODE_POWER_MODEL="${OPENCODE_MODEL:-nvidia/z-ai/glm4.7}"
export OPENCODE_POWER_AGENT="${OPENCODE_AGENT:-remi}"
export OPENCODE_POWER_TEMP=0.7
export OPENCODE_POWER_MAX_TOKENS=2000

# Log function
log_power() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_DIR/power-wrapper.log"
}

# Function to launch with power optimization
launch_power_optimized() {
    local args="$*"
    local power_env=""
    
    log_power "Launching with power optimization: $args"
    
    # Extract model if specified
    local model="$OPENCODE_POWER_MODEL"
    for arg in $args; do
        if [[ "$arg" == "--model" ]]; then
            model_next=true
        elif [[ "$model_next" == "true" ]]; then
            model="$arg"
            model_next=false
        fi
    done
    
    # Extract agent if specified
    local agent="$OPENCODE_POWER_AGENT"
    for arg in $args; do
        if [[ "$arg" == "--agent" ]]; then
            agent_next=true
        elif [[ "$agent_next" == "true" ]]; then
            agent="$arg"
            agent_next=false
        fi
    done
    
    log_power "Model: $model, Agent: $agent, Nice: $OPENCODE_POWER_NICE"
    
    # Launch with power optimization
    exec nice -n "$OPENCODE_POWER_NICE" \
        /home/mdwzrd/.opencode/bin/opencode \
        --model "$model" \
        --context "$OPENCODE_POWER_CONTEXT" \
        --agent "$agent" \
        --temperature "$OPENCODE_POWER_TEMP" \
        --max-tokens "$OPENCODE_POWER_MAX_TOKENS" \
        $args
}

# Function to check and optimize existing processes
optimize_existing_processes() {
    log_power "Optimizing existing OpenCode processes..."
    
    local pids=$(ps aux | grep "opencode --model" | grep -v grep | awk '{print $2}')
    local count=$(echo "$pids" | wc -w)
    
    if [ "$count" -eq 0 ]; then
        log_power "No OpenCode processes found"
        return 0
    fi
    
    log_power "Found $count OpenCode processes"
    
    for pid in $pids; do
        local current_nice=$(ps -o ni= -p "$pid" 2>/dev/null || echo "0")
        if [ "$current_nice" -lt "$OPENCODE_POWER_NICE" ]; then
            log_power "PID $pid: Setting nice from $current_nice to $OPENCODE_POWER_NICE"
            renice "$OPENCODE_POWER_NICE" -p "$pid" 2>/dev/null || true
        fi
    done
    
    log_power "Existing processes optimized"
}

# Function to generate power report
generate_power_report() {
    local report_file="$LOG_DIR/power-report-$(date +%s).txt"
    
    cat > "$report_file" << EOF
WZRD OpenCode Power Optimization Report
======================================
Generated: $(date)
System: $(uname -a)
CPU Cores: $(nproc)
Total Memory: $(free -h | awk '/^Mem:/ {print $2}')

Power Optimization Settings:
- Nice Level: $OPENCODE_POWER_NICE (0=high, 19=low)
- Context Limit: $OPENCODE_POWER_CONTEXT tokens
- Default Model: $OPENCODE_POWER_MODEL
- Default Agent: $OPENCODE_POWER_AGENT
- Temperature: $OPENCODE_POWER_TEMP
- Max Tokens: $OPENCODE_POWER_MAX_TOKENS

Active OpenCode Sessions:
$(ps aux | grep "opencode --model" | grep -v grep | awk '{print "  PID "$2": "$3"% CPU, "$4"% MEM, nice="$18}')

System Load: $(uptime | awk -F'load average:' '{print $2}')
EOF
    
    log_power "Report generated: $report_file"
    echo "$report_file"
}

# Function to install hooks into WZRD framework
install_wzrd_hooks() {
    log_power "Installing power optimization hooks into WZRD framework..."
    
    # Backup original files
    cp "$WZRD_HOME/wzrd-dev-launch.sh" "$WZRD_HOME/wzrd-dev-launch.sh.backup-$(date +%s)"
    
    # Add to cron for regular optimization
    if ! crontab -l 2>/dev/null | grep -q "opencode-power-wrapper"; then
        (crontab -l 2>/dev/null; echo "*/15 * * * * $WZRD_HOME/wzrd-redesign/wzrd-redesign-build/scripts/opencode/opencode-power-wrapper.sh --optimize") | crontab -
        log_power "Added to crontab (runs every 15 minutes)"
    fi
    
    log_power "WZRD hooks installed"
}

# Main command dispatcher
main() {
    case "$1" in
        --launch|--run)
            shift
            launch_power_optimized "$@"
            ;;
        --optimize)
            optimize_existing_processes
            generate_power_report
            ;;
        --report)
            generate_power_report
            cat "$(ls -t $LOG_DIR/power-report-*.txt 2>/dev/null | head -1)"
            ;;
        --install-hooks)
            install_wzrd_hooks
            ;;
        --help|-h)
            cat << EOF
OpenCode Power Wrapper for WZRD Framework
=========================================

Usage:
  $0 --launch [opencode args]    Launch OpenCode with power optimization
  $0 --optimize                  Optimize existing OpenCode processes
  $0 --report                    Generate power optimization report
  $0 --install-hooks            Install hooks into WZRD framework
  $0 --help                     Show this help

Environment Variables:
  OPENCODE_POWER_NICE          Nice level (default: 10)
  OPENCODE_POWER_CONTEXT       Context limit (default: 8000)
  OPENCODE_POWER_MODEL         Default model
  OPENCODE_POWER_AGENT         Default agent
  OPENCODE_POWER_TEMP          Temperature (default: 0.7)
  OPENCODE_POWER_MAX_TOKENS    Max tokens (default: 2000)

Examples:
  $0 --launch --model nvidia/z-ai/glm4.7 --agent remi
  OPENCODE_POWER_NICE=15 $0 --launch --model deepseek-ai/deepseek-v3.2
  $0 --optimize
  $0 --report

EOF
            ;;
        *)
            echo "Unknown command: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
}

# Initialize logging
mkdir -p "$LOG_DIR"
log_power "=== OpenCode Power Wrapper Started ==="
log_power "Command: $0 $*"

# Run main function
main "$@"