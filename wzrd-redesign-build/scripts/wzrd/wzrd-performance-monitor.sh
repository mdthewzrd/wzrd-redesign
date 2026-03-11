#!/bin/bash
# WZRD Performance Monitor
# Runs cleanup and optimization on a schedule

set -e

LOG_DIR="/home/mdwzrd/wzrd-redesign/logs"
MONITOR_LOG="$LOG_DIR/performance-monitor.log"
CLEANUP_SCRIPT="/home/mdwzrd/wzrd-redesign/cleanup-ghost-processes.sh"
CONTEXT_SCRIPT="/home/mdwzrd/wzrd-redesign/chat-context-manager.sh"
INTERVAL_MINUTES=30  # Run every 30 minutes
MAX_RUNTIME_MINUTES=5  # Don't run longer than 5 minutes

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$MONITOR_LOG"
}

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Check if already running
check_running() {
    if [ -f "$LOG_DIR/monitor.pid" ]; then
        PID=$(cat "$LOG_DIR/monitor.pid" 2>/dev/null)
        if ps -p "$PID" > /dev/null 2>&1; then
            log "Monitor already running with PID $PID"
            exit 0
        fi
    fi
    echo $$ > "$LOG_DIR/monitor.pid"
}

# Cleanup PID file on exit
cleanup() {
    rm -f "$LOG_DIR/monitor.pid"
    log "Monitor stopped"
    exit 0
}

trap cleanup EXIT INT TERM

# Run cleanup with timeout
run_cleanup() {
    log "Starting cleanup cycle"
    
    # Run with timeout
    timeout ${MAX_RUNTIME_MINUTES}m "$CLEANUP_SCRIPT"
    
    if [ $? -eq 124 ]; then
        log "WARNING: Cleanup timed out after ${MAX_RUNTIME_MINUTES} minutes"
    else
        log "Cleanup completed successfully"
    fi
}

# Run context management with timeout
run_context_management() {
    log "Starting context management cycle"
    
    # Run with timeout
    timeout ${MAX_RUNTIME_MINUTES}m "$CONTEXT_SCRIPT"
    
    if [ $? -eq 124 ]; then
        log "WARNING: Context management timed out after ${MAX_RUNTIME_MINUTES} minutes"
    else
        log "Context management completed successfully"
    fi
}

# System health check
check_system_health() {
    log "Checking system health..."
    
    # CPU usage
    CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    log "CPU usage: ${CPU_USAGE}%"
    
    # Memory usage
    MEM_USAGE=$(free | awk '/^Mem:/ {printf "%.0f", $3/$2 * 100}')
    log "Memory usage: ${MEM_USAGE}%"
    
    # Disk usage
    DISK_USAGE=$(df -h /home/mdwzrd | awk 'NR==2 {print $5}' | tr -d '%')
    log "Disk usage: ${DISK_USAGE}%"
    
    # Process count
    PROCESS_COUNT=$(ps aux | wc -l)
    log "Process count: $((PROCESS_COUNT - 1))"
    
    # WZRD-specific process count
    WZRD_PROCESSES=$(ps aux | grep -E "(opencode|gateway|remi|wzrd)" | grep -v grep | wc -l)
    log "WZRD processes: $WZRD_PROCESSES"
    
    # Alert if thresholds exceeded
    if [ "$CPU_USAGE" -gt 90 ]; then
        log "ALERT: High CPU usage: ${CPU_USAGE}%"
    fi
    
    if [ "$MEM_USAGE" -gt 85 ]; then
        log "ALERT: High memory usage: ${MEM_USAGE}%"
    fi
    
    if [ "$DISK_USAGE" -gt 90 ]; then
        log "ALERT: High disk usage: ${DISK_USAGE}%"
    fi
}

# Main monitoring loop
main() {
    check_running
    log "=== WZRD Performance Monitor Started ==="
    log "Interval: ${INTERVAL_MINUTES} minutes"
    log "Max runtime: ${MAX_RUNTIME_MINUTES} minutes"
    
    while true; do
        log "--- Cycle start: $(date '+%Y-%m-%d %H:%M:%S') ---"
        
        run_cleanup
        run_context_management
        check_system_health
        
        log "--- Cycle complete, sleeping ${INTERVAL_MINUTES} minutes ---"
        sleep $((INTERVAL_MINUTES * 60))
    done
}

# Run as daemon or one-shot
if [ "$1" = "--daemon" ]; then
    main
elif [ "$1" = "--once" ]; then
    check_running
    run_cleanup
    run_context_management
    check_system_health
    cleanup
else
    echo "Usage: $0 [--daemon|--once]"
    echo "  --daemon   Run as continuous daemon"
    echo "  --once     Run once and exit"
    exit 1
fi