#!/bin/bash
# WZRD System Status Command
# Provides a nice summary of ecosystem health

set -e

LOG_FILE="/home/mdwzrd/wzrd-redesign/logs/status.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG_FILE"
}

# Color output for TUI
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Print colored section header
section() {
    echo -e "\n${CYAN}=== $1 ===${NC}"
}

# Print colored status
status_ok() {
    echo -e "${GREEN}✓ $1${NC}"
}

status_warn() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

status_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Get system stats
get_system_stats() {
    section "System Statistics"
    
    # CPU (convert decimal to integer)
    CPU_USAGE_FLOAT=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    CPU_USAGE=${CPU_USAGE_FLOAT%.*}  # Convert to integer
    if [ "$CPU_USAGE" -lt 70 ]; then
        status_ok "CPU: ${CPU_USAGE_FLOAT}%"
    elif [ "$CPU_USAGE" -lt 90 ]; then
        status_warn "CPU: ${CPU_USAGE_FLOAT}%"
    else
        status_error "CPU: ${CPU_USAGE_FLOAT}%"
    fi
    
    # Memory
    MEM_USAGE=$(free | awk '/^Mem:/ {printf "%.0f", $3/$2 * 100}')
    if [ "$MEM_USAGE" -lt 80 ]; then
        status_ok "Memory: ${MEM_USAGE}%"
    elif [ "$MEM_USAGE" -lt 95 ]; then
        status_warn "Memory: ${MEM_USAGE}%"
    else
        status_error "Memory: ${MEM_USAGE}%"
    fi
    
    # Disk
    DISK_USAGE=$(df -h /home/mdwzrd | awk 'NR==2 {print $5}' | tr -d '%')
    if [ "$DISK_USAGE" -lt 85 ]; then
        status_ok "Disk: ${DISK_USAGE}%"
    elif [ "$DISK_USAGE" -lt 95 ]; then
        status_warn "Disk: ${DISK_USAGE}%"
    else
        status_error "Disk: ${DISK_USAGE}%"
    fi
}

# Get process counts
get_process_counts() {
    section "Process Counts"
    
    # Ghost processes (tail monitoring)
    GHOST_COUNT=$(ps aux | grep "tail -f server.log" | grep -v grep | wc -l)
    if [ "$GHOST_COUNT" -eq 0 ]; then
        status_ok "Ghost processes: 0"
    elif [ "$GHOST_COUNT" -le 2 ]; then
        status_warn "Ghost processes: ${GHOST_COUNT}"
    else
        status_error "Ghost processes: ${GHOST_COUNT}"
    fi
    
    # OpenCode sessions
    OPENCODE_COUNT=$(ps aux | grep "opencode --" | grep -v grep | grep -v "opencode x" | wc -l)
    if [ "$OPENCODE_COUNT" -le 2 ]; then
        status_ok "OpenCode sessions: ${OPENCODE_COUNT}"
    else
        status_warn "OpenCode sessions: ${OPENCODE_COUNT}"
    fi
    
    # Active WZRD services
    WZRD_SERVICES=$(ps aux | grep -E "(dist/service.js|jobs-server.js|bot-health-monitor)" | grep -v grep | wc -l)
    status_ok "WZRD services: ${WZRD_SERVICES}"
    
    # Total processes
    TOTAL_PROCESSES=$(ps aux | wc -l)
    echo -e "${BLUE}Total system processes: $((TOTAL_PROCESSES - 1))${NC}"
}

# Get session info
get_session_info() {
    section "Active Sessions"
    
    # Current TUI session (if any)
    CURRENT_PID=$$
    PARENT_PID=$(ps -o ppid= -p $CURRENT_PID)
    GRANDPARENT_PID=$(ps -o ppid= -p $PARENT_PID)
    
    # Check if we're in OpenCode TUI
    if ps -p $GRANDPARENT_PID -o cmd= | grep -q "opencode"; then
        status_ok "Current: OpenCode TUI session"
        echo -e "${BLUE}  PID: $GRANDPARENT_PID${NC}"
        
        # Check session age
        START_TIME=$(ps -p $GRANDPARENT_PID -o lstart=)
        echo -e "${BLUE}  Started: $START_TIME${NC}"
    else
        echo "Current: Shell session"
    fi
    
    # List other OpenCode sessions
    echo -e "\n${BLUE}Other OpenCode sessions:${NC}"
    ps aux | awk '/opencode --/ && !/grep/ && !/opencode x/ {
        printf "  PID: %s, Started: %s %s\n", $2, $9, $10
    }' | head -5
}

# Get memory system status
get_memory_status() {
    section "Memory System"
    
    # Conversation files
    CONV_COUNT=$(find /home/mdwzrd/wzrd-redesign/memory/topics -type f -name "conversation-*.json" 2>/dev/null | wc -l)
    if [ "$CONV_COUNT" -le 50 ]; then
        status_ok "Conversation files: ${CONV_COUNT}"
    elif [ "$CONV_COUNT" -le 100 ]; then
        status_warn "Conversation files: ${CONV_COUNT}"
    else
        status_error "Conversation files: ${CONV_COUNT}"
    fi
    
    # Topic count
    TOPIC_COUNT=$(find /home/mdwzrd/wzrd-redesign/memory/topics -type d -mindepth 1 -maxdepth 1 2>/dev/null | wc -l)
    status_ok "Active topics: ${TOPIC_COUNT}"
    
    # Log directory size
    LOG_SIZE=$(du -sh /home/mdwzrd/wzrd-redesign/logs 2>/dev/null | cut -f1 || echo "0")
    echo -e "${BLUE}Log directory: ${LOG_SIZE}${NC}"
}

# Get cleanup status
get_cleanup_status() {
    section "Cleanup Status"
    
    # Last cleanup run
    if [ -f "/home/mdwzrd/wzrd-redesign/logs/cleanup.log" ]; then
        LAST_CLEANUP=$(tail -1 "/home/mdwzrd/wzrd-redesign/logs/cleanup.log" 2>/dev/null | grep -o "\[.*\]" | head -1 || echo "Never")
        status_ok "Last cleanup: ${LAST_CLEANUP}"
    else
        status_warn "Last cleanup: Never"
    fi
    
    # Adaptive cleanup mode
    if [ -f "/home/mdwzrd/wzrd-redesign/logs/adaptive-cleanup.log" ]; then
        LAST_MODE=$(tail -5 "/home/mdwzrd/wzrd-redesign/logs/adaptive-cleanup.log" | grep "Activity level" | tail -1 | awk '{print $NF}' | tr -d ',')
        if [ -n "$LAST_MODE" ]; then
            echo -e "${BLUE}Last mode: ${LAST_MODE}${NC}"
        fi
    fi
    
    # Next suggested cleanup
    echo -e "${BLUE}Run '/cleanup' for manual cleanup${NC}"
}

# Main status display
show_status() {
    echo -e "\n${CYAN}╔══════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║      WZRD Ecosystem Status          ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════╝${NC}"
    
    get_system_stats
    get_process_counts
    get_session_info
    get_memory_status
    get_cleanup_status
    
    echo -e "\n${CYAN}════════════════════════════════════════${NC}"
    echo -e "${GREEN}✓ Good${NC} | ${YELLOW}⚠ Warning${NC} | ${RED}✗ Critical${NC}"
    echo -e "${CYAN}════════════════════════════════════════${NC}"
}

# Quick status (compact)
show_quick_status() {
    GHOST_COUNT=$(ps aux | grep "tail -f server.log" | grep -v grep | wc -l)
    OPENCODE_COUNT=$(ps aux | grep "opencode --" | grep -v grep | grep -v "opencode x" | wc -l)
    CPU_USAGE_FLOAT=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    CPU_USAGE=${CPU_USAGE_FLOAT%.*}  # Convert to integer
    MEM_USAGE=$(free | awk '/^Mem:/ {printf "%.0f", $3/$2 * 100}')
    
    echo -e "${CYAN}WZRD Status:${NC}"
    echo -e "  Ghost: ${GHOST_COUNT} | Sessions: ${OPENCODE_COUNT}"
    echo -e "  CPU: ${CPU_USAGE_FLOAT}% | Memory: ${MEM_USAGE}%"
    
    if [ "$GHOST_COUNT" -gt 2 ]; then
        echo -e "${YELLOW}⚠ Ghost processes detected${NC}"
    fi
    
    if [ "$CPU_USAGE" -gt 90 ]; then
        echo -e "${YELLOW}⚠ High CPU usage${NC}"
    fi
}

# Main function
main() {
    log "Status check requested"
    
    if [ "$1" = "--quick" ]; then
        show_quick_status
    elif [ "$1" = "--json" ]; then
        # JSON output for programmatic use
        GHOST_COUNT=$(ps aux | grep "tail -f server.log" | grep -v grep | wc -l)
        OPENCODE_COUNT=$(ps aux | grep "opencode --" | grep -v grep | grep -v "opencode x" | wc -l)
        CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
        MEM_USAGE=$(free | awk '/^Mem:/ {printf "%.0f", $3/$2 * 100}')
        
        cat << EOF
{
  "timestamp": "$(date -Iseconds)",
  "system": {
    "cpu_percent": $CPU_USAGE,
    "memory_percent": $MEM_USAGE
  },
  "processes": {
    "ghost_count": $GHOST_COUNT,
    "opencode_sessions": $OPENCODE_COUNT
  },
  "status": "$([ $GHOST_COUNT -gt 2 ] && echo "warning" || echo "healthy")"
}
EOF
    else
        show_status
    fi
}

main "$@"