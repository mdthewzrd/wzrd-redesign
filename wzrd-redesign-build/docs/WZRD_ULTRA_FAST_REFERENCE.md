# 🚀 WZRD Ultra-Fast Reference

## Quick Commands

### Aliases (after setup)
```bash
wzf status           # Ultra-fast status (6ms)
wzf health          # Health check (<10ms)
wstatus             # Shortcut for status
whealth             # Shortcut for health
```

### Performance Comparison
```bash
wzrd-slow           # Original version (~1016ms)
wzrd-fast-test      # Ultra-fast version (~6ms)
```

## What's Ultra-Fast

| Command | Original | Ultra-Fast | Speedup |
|---------|----------|------------|---------|
| `status` | 1016ms | 6ms | 169× |
| `health` | ~1000ms | <10ms | 100×+ |
| `--version` | ~1000ms | <5ms | 200×+ |

## Cache System

- **Location**: `~/.cache/wzrd-ultra/`
- **TTL**: 5 minutes
- **Files**: `status.txt`, `health.txt`

To clear cache:
```bash
rm -rf ~/.cache/wzrd-ultra/
```

## Daily Workflow Integration

### Option 1: Use Aliases (Recommended)
Add to your terminal startup:
```bash
source /home/mdwzrd/wzrd-redesign/wzrd-ultra-fast-setup.sh
```

### Option 2: Use Directly
```bash
/home/mdwzrd/wzrd-redesign/wzrd-ultra-fast status
```

### Option 3: Create Symbolic Link
```bash
ln -s /home/mdwzrd/wzrd-redesign/wzrd-ultra-fast ~/bin/wzrd-ultra
```

## When to Use Which Version

### Use `wzrd-ultra-fast` for:
- Quick status checks
- Health monitoring  
- Performance testing
- Any time you need instant response

### Use original `wzrd` for:
- Complex commands (`topic list`, `memory stats`)
- Full functionality needs
- When cache isn't sufficient

## Tips & Tricks

1. **First run creates cache**, subsequent runs are instant
2. **Cache auto-expires** after 5 minutes
3. **Fallback system** handles complex commands
4. **No model errors** - uses opencode/big-pickle

## Verification

```bash
# Test speed
time wzrd status
time wzrd-fast status

# Compare output
wzrd status | head -3
wzrd-fast status | head -3
```

## Need Help?

- Check cache: `ls -la ~/.cache/wzrd-ultra/`
- Clear cache: `rm -rf ~/.cache/wzrd-ultra/`
- Re-run setup: `./wzrd-ultra-fast-setup.sh`

