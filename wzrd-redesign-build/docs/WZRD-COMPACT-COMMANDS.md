# /wzrd-compact Commands

## Quick Reference

| Command | What it does | How to use |
|---------|--------------|------------|
| `/wzrd-compact` | Truly resets chat like Claude | Type in OpenCode TUI |
| `/wzrdc` | Short version of above | Type in OpenCode TUI |
| `compact` | Same as above (bash alias) | Type in OpenCode TUI |
| `compact-status` | Show token usage & monitor status | Type in OpenCode TUI |
| `compact-check` | Check current token count | Type in OpenCode TUI |

## How It Works

1. **When you type `/wzrd-compact`** in OpenCode TUI:
   - Backs up current conversation
   - Truly resets `prompt-history.jsonl` to 2 lines
   - Injects continuation prompt
   - Works exactly like Claude's compact

2. **Difference from OpenCode's `/compact`**:
   - `/compact` (OpenCode): Only summarizes, doesn't delete messages ❌
   - `/wzrd-compact` (WZRD): Actually deletes messages, truly resets chat ✅

## Setup Commands

```bash
# Make commands available
export PATH="$HOME/.local/bin:$PATH"

# Or add to ~/.bashrc or ~/.zshrc:
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

## Usage Examples

### Inside OpenCode TUI:
```bash
/wzrd-compact     # Truly reset chat
/wzrdc            # Short version
compact           # Alias version
compact-status    # Check token usage
compact-check     # Quick token check
```

### From terminal:
```bash
wzrd --true-compact   # Using wzrd-mode
```

## Auto-Start Features

When you launch `wzrd`:
1. Auto-starts compact monitor (runs every 30s)
2. Shows current token usage
3. Auto-triggers at 80,000 tokens
4. Prevents TUI slowdown

## Verification

After running `/wzrd-compact`:
```bash
wc -l ~/.local/state/opencode/prompt-history.jsonl
```
Should show `2` lines (truly reset).

## Backup Location

Conversations are backed up to:
```
~/.local/state/opencode/wzrd-backups/
  backup-YYYYMMDD_HHMMSS.jsonl
  summary-YYYYMMDD_HHMMSS.txt
```

## Why This Is Better

1. **Actually works** - Unlike OpenCode's `/compact`
2. **Easy to remember** - `/wzrd-compact` is intuitive
3. **Claude-like** - Works exactly how you expect
4. **Auto-protection** - Monitor prevents slowdown
5. **Safe** - Backs up before resetting

## Troubleshooting

### Command not found:
```bash
# Ensure PATH includes ~/.local/bin
echo $PATH | grep -q ".local/bin" || export PATH="$HOME/.local/bin:$PATH"

# Or use full path
~/wzrd-redesign/wzrd-compact-solution.sh compact
```

### Want to stop auto-monitor:
```bash
compact-stop
```

### Want to restart auto-monitor:
```bash
compact-monitor
```

## Remember

Use `/wzrd-compact` instead of `/compact` for actual chat reset!
