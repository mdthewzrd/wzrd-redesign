# Auto-Compact Skill
## Triggers compact automatically at 75% context usage

### Skill Description
This skill monitors context usage and automatically triggers true compact when reaching 75% of token limit, preventing TUI slowdown.

### Triggers
- **Context monitoring**: Check token usage periodically
- **Auto-trigger at 75%**: Before slowdown occurs
- **Before long responses**: Check before generating large outputs
- **After file operations**: Check after significant file writes

### Workflow
```
Monitor context → Check token usage → If > 75% → Trigger compact
```

### Implementation

```javascript
// Pseudo-code for auto-compact logic
function checkAndAutoCompact() {
  const tokenUsage = estimateTokenUsage();
  const threshold = getContextLimit() * 0.75;
  
  if (tokenUsage > threshold) {
    log("Auto-compact triggered at " + Math.round((tokenUsage/threshold)*100) + "%");
    runTrueCompact();
    return true;
  }
  return false;
}

// Hook points
1. Before generating long response
2. After file operations
3. Periodically (every 5-10 minutes)
4. When context window warning appears
```

### Integration Points
1. **Agent workflow**: Add check before major operations
2. **Periodic check**: Run in background every 5 minutes
3. **Context-aware**: Adjust threshold based on conversation type
4. **User notification**: Inform before auto-compact

### Configuration
```json
{
  "auto_compact": {
    "enabled": true,
    "threshold_percent": 75,
    "check_interval_minutes": 5,
    "notify_user": true,
    "backup_before_compact": true
  }
}
```

### Benefits
1. **Proactive**: Prevents slowdown before it happens
2. **Transparent**: User knows when compact happens
3. **Configurable**: Adjust thresholds as needed
4. **Integrated**: Works with existing compact solution

### Next Steps
1. Create skill file in `.claude/skills/`
2. Integrate with wzrd-mode launch
3. Test with actual context monitoring
4. Add user preferences
```