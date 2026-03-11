# Getting Started with WZRD.dev

5-minute quick start.

## Prerequisites

- Linux/Mac system
- Git installed
- Node.js (for some features)

## Install

```bash
cd /home/mdwzrd/wzrd-redesign
export PATH="$PWD/bin:$PATH"
```

Add to `.bashrc` for persistence:
```bash
echo 'export PATH="/home/mdwzrd/wzrd-redesign/bin:$PATH"' >> ~/.bashrc
```

## Verify

```bash
wzrd --version
```

Expected output:
```
WZRD.dev Framework v2.0
7/7 Components Operational
```

## First Request

```bash
wzrd dev
```

Then type:
```
List available skills
```

## Common Tasks

| Task | Command |
|------|---------|
| Start dev | `wzrd dev ./project` |
| Check status | `wzrd status` |
| List sandboxes | `./conductor/sandbox-engine.sh list` |
| Validate work | `./conductor/finished-work-validator.sh` |
| Migrate | `./conductor/auto-migration-system.sh migrate` |

## Next Steps

- Read `remi/SOUL.md` for Remi's identity
- Check `ARCHITECTURE.md` for system design
- Run `./conductor/test-framework.sh` for diagnostics
