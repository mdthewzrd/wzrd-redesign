#!/bin/bash
# WZRD Resource Monitor
# Use: ./monitor-resources.sh [interval_seconds]

INTERVAL=${1:-5}

echo "=== WZRD Resource Monitor - Started at $(date) ==="
echo "Monitoring interval: ${INTERVAL}s"
echo ""

while true; do
    clear
    echo "=== $(date) ==="
    echo "System Load: $(uptime | sed 's/.*load average: //')"
    echo ""
    
    # CPU and Memory Overview
    echo "=== CPU/Memory Overview ==="
    top -b -n 1 | grep -A5 "top -"
    echo ""
    
    # WZRD Processes
    echo "=== WZRD-Related Processes ==="
    ps aux | grep -E "(opencode|wzrd|python.*discord|python.*whisper|transcribe)" | grep -v grep | awk '{printf "%-10s %-8s %-6s %-6s %-s\n", $1, $2, $3, $4, $11}'
    echo ""
    
    # High CPU Processes
    echo "=== Top 5 CPU Processes ==="
    ps aux --sort=-%cpu | head -6
    echo ""
    
    # High Memory Processes
    echo "=== Top 5 Memory Processes ==="
    ps aux --sort=-%mem | head -6
    echo ""
    
    # Disk Usage
    echo "=== Disk Usage ==="
    df -h /home/mdwzrd/wzrd-redesign | tail -1
    echo ""
    
    echo "Press Ctrl+C to stop monitoring..."
    sleep $INTERVAL
done