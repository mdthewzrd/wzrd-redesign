# WZRD Commands for Performance Management

## Overview

These commands help manage WZRD performance, clean up ghost processes, reset TUI context, and monitor system health.

## Quick Reference

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/status` | Show ecosystem status | Check system health |
| `/cleanup` | Interactive cleanup | Ghost processes accumulating |
| `/context-reset` | Reset TUI context | Chat slowing down |
| `/compact-reset` | Compact + reset | After long conversation |
| `/adaptive-cleanup` | Smart cleanup | Regular maintenance |
| `/system-stats` | Detailed stats | Debugging performance |

## Command Details

### `/status` - Ecosystem Status
```bash
# Show colored status summary
/home/mdwzrd/wzrd-redesign/wzrd-system-status.sh

# Quick status (compact)
/home/mdwzrd/wzrd-redesign/wzrd-system-status.sh --quick

# JSON output (for automation)
/home/mdwzrd/wzrd-redesign/wzrd-system-status.sh --json
```

**Output includes:**
- System stats (CPU, memory, disk)
- Process counts (ghost, sessions, services)
- Session info
- Memory system status
- Cleanup status
- Color-coded alerts (✓ ⚠ ✗)

### `/cleanup` - Interactive Cleanup
```bash
# Interactive menu with levels
/home/mdwzrd/wzrd-redesign/wzrd-adaptive-cleanup.sh --manual
```

**Cleanup levels:**
1. **Light**: Ghost processes only
2. **Standard**: Ghost + old logs (3+ days)
3. **Full**: Ghost + logs + context
4. **Aggressive**: Everything + force kill

### `/context-reset` - TUI Context Reset
```bash
# Critical: Fixes chat length issue
/home/mdwzrd/wzrd-redesign/wzrd-context-reset.sh --compact-reset
```

**What it does (conceptually):**
1. Finds active TUI sessions
2. Checks conversation length
3. Offers to reset context
4. **Actually clears TUI message history** (unlike current /compact)

### `/compact-reset` - Complete Workflow
```bash
# Ideal workflow for long conversations
/home/mdwzrd/wzrd-redesign/wzrd-context-reset.sh --compact-reset
```

**Workflow:**
```
Current Conversation → /compact → Save to Topic → RESET TUI → /continue → Fresh Context
                    (problem: no reset)           (FIXED)              (clean slate)
```

### `/adaptive-cleanup` - Smart Maintenance
```bash
# Automatically adjusts based on activity
/home/mdwzrd/wzrd-redesign/wzrd-adaptive-cleanup.sh --auto
```

**Activity detection:**
- **Idle** (24h interval): Minimal cleanup
- **Active** (12h interval): Standard cleanup  
- **Very Active** (6h interval): Aggressive cleanup

### `/system-stats` - Detailed Monitoring
```bash
# All stats in one place
/home/mdwzrd/wzrd-redesign/wzrd-performance-monitor.sh --once
```

## Integration with TUI

### As OpenCode Commands
Add to Remi's command list:
```json
{
  "commands": {
    "status": "/home/mdwzrd/wzrd-redesign/wzrd-system-status.sh",
    "cleanup": "/home/mdwzrd/wzrd-redesign/wzrd-adaptive-cleanup.sh --manual",
    "context-reset": "/home/mdwzrd/wzrd-redesign/wzrd-context-reset.sh --compact-reset"
  }
}
```

### As Shell Aliases
Add to `~/.bashrc`:
```bash
alias wzrd-status='/home/mdwzrd/wzrd-redesign/wzrd-system-status.sh'
alias wzrd-cleanup='/home/mdwzrd/wzrd-redesign/wzrd-adaptive-cleanup.sh --manual'
alias wzrd-reset='/home/mdwzrd/wzrd-redesign/wzrd-context-reset.sh --compact-reset'
```

### As Cron Jobs
For automatic maintenance:
```bash
# Every 6 hours, adaptive cleanup
0 */6 * * * /home/mdwzrd/wzrd-redesign/wzrd-adaptive-cleanup.sh --auto

# Daily status report
0 9 * * * /home/mdwzrd/wzrd-redesign/wzrd-system-status.sh --json > /home/mdwzrd/wzrd-redesign/logs/daily-status.json
```

## Usage Patterns

### Daily Check
```bash
wzrd-status  # Quick health check
```

### When Chat Slows Down
```bash
wzrd-reset   # Reset TUI context
wzrd-status  # Verify improvement
```

### After Long Work Session
```bash
wzrd-cleanup # Choose level 3 (Full)
wzrd-reset   # Reset any long sessions
```

### Regular Maintenance
```bash
# Run adaptive cleanup (auto-detects activity)
wzrd-adaptive-cleanup --auto

# Or schedule in crontab (recommended)
```

## Implementation Notes

### Critical Fix: TUI Context Reset
The `/compact` command currently:
1. Saves conversation to topic ✓
2. **Does NOT reset TUI message history** ✗ (THE PROBLEM)
3. Leaves long history slowing down TUI

**Solution needed:**
- OpenCode API support for context reset
- Or signal-based graceful restart
- Or enhanced `/compact` command

### Ghost Process Detection
Current script detects:
- `tail -f server.log` processes
- Old OpenCode sessions (>24h)
- Orphaned monitoring processes

### Memory Management
- Conversation files: Keep last 20 per topic
- Log files: Keep 7 days
- Temporary files: Clean regularly

## Testing

### Step 1: Make Executable
```bash
chmod +x /home/mdwzrd/wzrd-redesign/*.sh
```

### Step 2: Test Commands
```bash
# Test status
/home/mdwzrd/wzrd-redesign/wzrd-system-status.sh

# Test cleanup (choose level 1 first)
/home/mdwzrd/wzrd-redesign/wzrd-adaptive-cleanup.sh --manual

# Test context reset (list sessions)
/home/mdwzrd/wzrd-redesign/wzrd-context-reset.sh --list
```

### Step 3: Integration Test
```bash
# Run full workflow
/home/mdwzrd/wzrd-redesign/wzrd-performance-monitor.sh --once

# Check logs
tail -f /home/mdwzrd/wzrd-redesign/logs/*.log
```

## Troubleshooting

### Command Not Found
```bash
# Ensure executable
chmod +x /path/to/script.sh

# Check path
ls -la /home/mdwzrd/wzrd-redesign/*.sh
```

### Permission Issues
```bash
# Run as correct user
sudo -u mdwzrd /home/mdwzrd/wzrd-redesign/wzrd-system-status.sh

# Or fix ownership
chown mdwzrd:mdwzrd /home/mdwzrd/wzrd-redesign/*.sh
```

### Script Errors
```bash
# Debug mode
bash -x /home/mdwzrd/wzrd-redesign/wzrd-system-status.sh

# Check dependencies
which jq ps top free df  # Ensure available
```

## Advanced Usage

### Custom Intervals
Edit scripts to change:
- `BASE_INTERVAL_HOURS` in adaptive-cleanup.sh
- `MAX_CONTEXT_LINES` in chat-context-manager.sh
- `MAX_LOG_DAYS` in cleanup-ghost-processes.sh

### Custom Alerts
Add to scripts:
```bash
# Discord alerts
curl -X POST -H "Content-Type: application/json" \
  -d '{"content": "WZRD Alert: High CPU"}' \
  https://discord.com/api/webhooks/...
```

### Monitoring Integration
```bash
# Integrate with existing monitoring
/home/mdwzrd/wzrd-redesign/wzrd-system-status.sh --json | \
  jq '.status' | \
  if [ "$(cat)" = "warning" ]; then echo "ALERT"; fi
```

## Conclusion

These commands provide a complete solution for:
1. **Monitoring**: `/status` shows ecosystem health
2. **Cleanup**: `/cleanup` removes ghost processes  
3. **Performance**: `/context-reset` fixes TUI slowdown
4. **Maintenance**: `/adaptive-cleanup` auto-manages

**Key improvement**: Actual TUI context reset after compaction (fixing the core performance issue).