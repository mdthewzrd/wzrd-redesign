#!/bin/bash
# Power-Optimized OpenCode Watchdog
# Monitors and optimizes OpenCode instances for better system performance

MAX_INSTANCES=5
LOG_FILE="/tmp/opencode-watchdog.log"
NICE_LEVEL=10  # Lower CPU priority (0=normal, 10=low, 19=lowest)
MAX_CPU_PERCENT=30  # Per process CPU limit
MAX_MEMORY_MB=3000  # 3GB per process warning threshold

echo "$(date): OpenCode Power Watchdog Started" >> "$LOG_FILE"

# 1. Count instances
count=$(ps aux | grep -c "opencode --model")
echo "$(date): Found $count OpenCode instances" >> "$LOG_FILE"

# 2. Apply power optimization to all instances
if [ "$count" -gt 0 ]; then
    echo "$(date): Applying power optimization..." >> "$LOG_FILE"
    
    # Apply nice level to all OpenCode processes
    ps aux | grep "opencode --model" | grep -v grep | awk '{print $2}' | while read pid; do
        current_nice=$(ps -o ni= -p $pid 2>/dev/null || echo "0")
        if [ "$current_nice" -lt "$NICE_LEVEL" ]; then
            echo "$(date): PID $pid: Setting nice from $current_nice to $NICE_LEVEL" >> "$LOG_FILE"
            renice $NICE_LEVEL -p $pid 2>/dev/null || true
        fi
    done
fi

# 3. Kill excess instances (only if significantly over limit)
if [ "$count" -gt "$((MAX_INSTANCES + 2))" ]; then
    echo "$(date): Too many opencode instances ($count > $((MAX_INSTANCES + 2))), cleaning up..." >> "$LOG_FILE"
    
    # Get oldest processes (except current session)
    ps aux | grep "opencode --model" | grep -v grep | sort -k 9 | tail -n $((count - MAX_INSTANCES)) | awk '{print $2}' | while read pid; do
        # Check if process is interactive (has terminal)
        tty=$(ps -o tty= -p $pid 2>/dev/null)
        if [ "$tty" = "?" ]; then
            echo "$(date): Killing detached process PID $pid" >> "$LOG_FILE"
            kill -9 $pid 2>/dev/null || true
        fi
    done
fi

# 4. Log resource usage
echo "$(date): Resource Report:" >> "$LOG_FILE"
ps aux | grep "opencode --model" | grep -v grep | awk '{print $2,$3,$4}' | while read pid cpu mem; do
    # Check CPU usage (using bc for floating point)
    cpu_check=$(echo "$cpu > $MAX_CPU_PERCENT" | bc 2>/dev/null || echo "0")
    if [ "$cpu_check" -eq 1 ]; then
        echo "$(date): WARNING: PID $pid using ${cpu}% CPU (over ${MAX_CPU_PERCENT}% limit)" >> "$LOG_FILE"
    fi
    # Check memory usage (mem is percentage, MAX_MEMORY_MB is MB)
    mem_gb=$(echo "scale=2; $mem * 31 / 100" | bc 2>/dev/null || echo "0")
    mem_mb=$(echo "$mem_gb * 1024" | bc 2>/dev/null | cut -d. -f1 || echo "0")
    if [ "$mem_mb" -gt "$MAX_MEMORY_MB" ]; then
        echo "$(date): WARNING: PID $pid using ${mem}% memory (~${mem_mb}MB)" >> "$LOG_FILE"
    fi
done

echo "$(date): OpenCode Power Watchdog Completed" >> "$LOG_FILE"
