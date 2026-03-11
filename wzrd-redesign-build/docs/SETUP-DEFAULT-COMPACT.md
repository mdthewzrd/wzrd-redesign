# Setting WZRD True Compact as Default

## 1. Add to Your Shell Profile

Add this to `~/.bashrc` or `~/.zshrc`:

```bash
# WZRD True Compact Aliases
alias compact='bash ~/wzrd-redesign/wzrd-compact-solution.sh compact'
alias compact-status='bash ~/wzrd-redesign/wzrd-compact-solution.sh status'
alias compact-check='bash ~/wzrd-redesign/wzrd-compact-solution.sh check'
alias compact-monitor='bash ~/wzrd-redesign/wzrd-compact-solution.sh monitor'
alias compact-stop='bash ~/wzrd-redesign/wzrd-compact-solution.sh stop'

# Add ~/.local/bin to PATH for wzrd-compact command
export PATH="$HOME/.local/bin:$PATH"
```

Then reload:
```bash
source ~/.bashrc  # or source ~/.zshrc
```

## 2. Commands Available in OpenCode TUI

After setup, you can type:

```bash
compact          # Truly reset chat (like Claude)
compact-status   # Show token usage and monitor status
compact-check    # Check current token count
compact-monitor  # Start auto-monitor (80K threshold)
compact-stop     # Stop auto-monitor
```

Or use the shorter wrapper:
```bash
wzrd-compact     # Same as 'compact'
```

## 3. Auto-Start Monitor with wzrd.dev

The `wzrd-mode` now automatically starts the monitor when launching OpenCode TUI:

```bash
wzrd             # Launches OpenCode + starts auto-monitor
```

You'll see:
```
🔍 Starting WZRD Compact Monitor (80K token auto-compact)...
📊 Current token estimate: X (auto-compact at 80,000)
```

## 4. Testing It Works

1. **Launch OpenCode**:
   ```bash
   wzrd
   ```

2. **Check it's running** (from another terminal):
   ```bash
   ps aux | grep wzrd-compact-monitor
   ```

3. **Test compact manually** (inside OpenCode):
   ```bash
   compact
   ```

4. **Verify chat reset**:
   ```bash
   wc -l ~/.local/state/opencode/prompt-history.jsonl
   ```
   Should show `2` lines after compact.

## 5. What Happens Automatically

### When you type `wzrd`:
1. Starts WZRD compact monitor (if not running)
2. Shows current token usage
3. Launches OpenCode TUI
4. Monitor runs every 30s checking tokens
5. Auto-triggers compact at 80,000 tokens

### When monitor triggers compact:
1. Backs up current conversation
2. Truly resets `prompt-history.jsonl` to 2 lines
3. Injects continuation prompt
4. Logs the action
5. Updates state file

## 6. Manual Override

Even with auto-monitor, you can always:
```bash
compact          # Manually trigger anytime
compact-stop     # Stop auto-monitor if needed
compact-monitor  # Restart auto-monitor
```

## 7. Verification Commands

```bash
# Check if monitor is running
compact-status

# Check current token usage
compact-check

# Check backups created
ls -la ~/.local/state/opencode/wzrd-backups/

# Check logs
tail -f ~/.local/state/opencode/wzrd-compact.log
```

## 8. Troubleshooting

### Monitor not starting:
```bash
# Kill any existing monitor
pkill -f wzrd-compact-monitor

# Start manually
compact-monitor

# Check logs
tail -f ~/.local/state/opencode/wzrd-compact.log
```

### Commands not found:
```bash
# Add to PATH
export PATH="$HOME/.local/bin:$PATH"

# Or use full path
bash ~/wzrd-redesign/wzrd-compact-solution.sh compact
```

### No auto-compact happening:
```bash
# Check token threshold
compact-check

# Should trigger at 80,000 tokens
# If file is 320KB, that's ~80,000 tokens
```

## Summary

Now when you launch `wzrd`, it automatically:
1. Starts compact monitor
2. Auto-compacts at 80K tokens
3. Prevents TUI slowdown
4. Works like Claude's compact

And you can type `compact` anytime in OpenCode TUI for immediate reset!