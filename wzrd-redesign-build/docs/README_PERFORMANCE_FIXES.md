# WZRD Performance Fixes - Solutions for Speed & Stability Issues

## Problem Summary

The WZRD system was experiencing performance degradation over time due to:

1. **Ghost Processes**: Orphaned `tail -f server.log` processes accumulating
2. **Chat Length Issues**: Context growing indefinitely without cleanup
3. **Memory Accumulation**: Old conversation files and logs not cleaned up
4. **Long-running Services**: Services running for days without restart cycles

## Root Causes Identified

### 1. Ghost Processes (`tail -f server.log`)
- Monitoring processes spawn but don't clean up on session exit
- No parent-child relationship management
- Multiple independent `tail` processes watching the same file

### 2. Chat Context Accumulation
- Conversation files saved but never compressed or cleaned
- Context grows with each interaction
- No automatic summarization or reset

### 3. Memory Issues
- Old log files accumulate
- Compressed conversation files still accumulate
- No cleanup of temporary files

### 4. Performance Degradation
- Multiple Node.js processes running for days
- No restart cycles for long-running services
- Memory leaks in long sessions

## Solutions Implemented

### 1. Ghost Process Cleanup (`cleanup-ghost-processes.sh`)
```
Features:
- Kills orphaned tail processes monitoring server.log
- Cleans up old OpenCode sessions (> 24 hours)
- Removes old log files (> 7 days)
- Keeps only latest 10 conversation files per topic
- Truncates large server.log files (> 10MB)
```

### 2. Chat Context Management (`chat-context-manager.sh`)
```
Features:
- Monitors and truncates long chat contexts (> 2000 lines)
- Compresses large conversation files (> 100 lines)
- Keeps only latest 20 context/conversation files
- Summarizes long-running sessions (> 2 hours)
- Optimizes memory usage (clears cache > 80% usage)
```

### 3. Performance Monitoring (`wzrd-performance-monitor.sh`)
```
Features:
- Runs cleanup and context management every 30 minutes
- Monitors system health (CPU, memory, disk, processes)
- Runs as daemon or one-shot
- Timeout protection (max 5 minutes per task)
- PID locking to prevent duplicates
```

## How to Use

### Install and Test
```bash
# Make scripts executable
chmod +x /home/mdwzrd/wzrd-redesign/*.sh

# Test cleanup once
/home/mdwzrd/wzrd-redesign/wzrd-performance-monitor.sh --once

# Run as daemon (background)
nohup /home/mdwzrd/wzrd-redesign/wzrd-performance-monitor.sh --daemon &

# Check logs
tail -f /home/mdwzrd/wzrd-redesign/logs/performance-monitor.log
```

### Manual Cleanup
```bash
# Clean ghost processes only
/home/mdwzrd/wzrd-redesign/cleanup-ghost-processes.sh

# Manage chat context only
/home/mdwzrd/wzrd-redesign/chat-context-manager.sh
```

## Integration with Existing Systems

### 1. Heartbeat Service Integration
The performance monitor can be integrated with the existing heartbeat service:
```javascript
// Add to heartbeat config
{
  "performance_monitor": {
    "enabled": true,
    "interval_minutes": 30,
    "cleanup_script": "/home/mdwzrd/wzrd-redesign/cleanup-ghost-processes.sh",
    "context_script": "/home/mdwzrd/wzrd-redesign/chat-context-manager.sh"
  }
}
```

### 2. Cron Job Setup
Add to crontab for regular execution:
```bash
# Run every hour
0 * * * * /home/mdwzrd/wzrd-redesign/wzrd-performance-monitor.sh --once
```

### 3. Systemd Service (Recommended)
Create a systemd service for automatic startup:
```ini
[Unit]
Description=WZRD Performance Monitor
After=network.target

[Service]
Type=simple
User=mdwzrd
WorkingDirectory=/home/mdwzrd/wzrd-redesign
ExecStart=/home/mdwzrd/wzrd-redesign/wzrd-performance-monitor.sh --daemon
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

## Expected Improvements

| Metric | Before Fix | After Fix | Improvement |
|--------|------------|-----------|-------------|
| Ghost Processes | 6+ `tail` processes | 0-1 monitored | ~85% reduction |
| Memory Usage | Growing indefinitely | Bounded cleanup | ~50% reduction |
| Chat Context | Unlimited growth | Max 2000 lines | Controlled growth |
| Log Files | Accumulate forever | Keep 7 days only | ~90% reduction |
| System Stability | Degrades over time | Consistent performance | Major improvement |

## Monitoring and Alerts

### Log Files Created
```
/home/mdwzrd/wzrd-redesign/logs/
├── cleanup.log              # Cleanup script logs
├── context-manager.log      # Context management logs
├── performance-monitor.log  # Monitor daemon logs
└── monitor.pid             # PID lock file
```

### Alert Thresholds
- CPU > 90%: Warning
- Memory > 85%: Warning  
- Disk > 90%: Critical
- WZRD processes > 20: Warning
- Any cleanup timeout: Warning

## Best Practices

1. **Run Regularly**: Schedule every 30 minutes for best results
2. **Monitor Logs**: Check logs weekly for issues
3. **Adjust Thresholds**: Tune based on your usage patterns
4. **Integrate with Alerts**: Connect to Discord/email alerts
5. **Test Before Deploy**: Run in --once mode first

## Troubleshooting

### Common Issues

1. **Script not executable**: `chmod +x script.sh`
2. **Permission denied**: Run as correct user or check file ownership
3. **Timeout errors**: Increase `MAX_RUNTIME_MINUTES` in scripts
4. **PID lock issues**: Delete `/home/mdwzrd/wzrd-redesign/logs/monitor.pid`
5. **Missing jq tool**: Install with `sudo apt-get install jq`

### Debug Mode
```bash
# Run with debug output
bash -x /home/mdwzrd/wzrd-redesign/cleanup-ghost-processes.sh
```

## Future Enhancements

1. **Machine Learning**: Predict optimal cleanup times based on usage patterns
2. **Integration with Gateway**: Direct API calls for context management
3. **Advanced Compression**: Smarter conversation summarization
4. **Performance Analytics**: Track improvements over time
5. **Alert Integration**: Push notifications for critical issues

## Conclusion

These fixes address the core performance issues in the WZRD system by implementing systematic cleanup, bounded context management, and proactive monitoring. The solutions are designed to work together to maintain system stability and performance over time.

**Key Benefits:**
- Eliminates ghost process accumulation
- Controls chat context growth  
- Reduces memory and disk usage
- Improves long-term stability
- Easy to monitor and maintain