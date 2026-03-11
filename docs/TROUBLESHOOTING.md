# Troubleshooting WZRD.dev

Quick fixes for common issues.

## Framework Won't Start

**Problem:** `wzrd: command not found`

**Fix:**
```bash
export PATH="/home/mdwzrd/wzrd-redesign/bin:$PATH"
```

**Problem:** Permission denied

**Fix:**
```bash
chmod +x /home/mdwzrd/wzrd-redesign/bin/*
chmod +x /home/mdwzrd/wzrd-redesign/conductor/*.sh
```

## Skills Not Loading

**Problem:** "Skill not found"

**Fix:**
```bash
./conductor/update-tool-shed.sh
./conductor/tool-shed.sh list | head
```

## Sandbox Issues

**Problem:** "Cannot create sandbox"

**Fix:**
```bash
# Check resources
df -h
free -h

# Check permissions
ls -la .worktrees/

# Force cleanup
./conductor/sandbox-engine.sh cleanup --all
```

## Validation Fails

**Problem:** Work marked as "not finished"

**Check:**
- Git changes committed?
- Tests present?
- Documentation exists?
- No TODO markers?

**Force check:**
```bash
./conductor/finished-work-validator.sh ./project
```

## Migration Issues

**Problem:** "Migration failed"

**Fix:**
```bash
# Check registry
cat .worktrees/migration-registry.json | jq .

# Retry specific project
./conductor/auto-migration-system.sh validate ./project
./conductor/auto-migration-system.sh migrate
```

## Performance

**Problem:** Slow response

**Fix:**
```bash
# Check logs for bottlenecks
tail logs/wzrd-*.log

# Prune old sandboxes
./conductor/sandbox-engine.sh cleanup

# Restart fresh
wzrd dev
```

## Get Help

1. Check logs: `logs/`
2. Run diagnostics: `./conductor/test-framework.sh`
3. Validate: `./conductor/finished-work-validator.sh`
