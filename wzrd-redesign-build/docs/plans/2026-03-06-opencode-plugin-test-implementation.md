# OpenCode Dynamic Context Pruning Plugin Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Test the `opencode-dynamic-context-pruning` plugin to determine if it solves OpenCode's context accumulation problem.

**Architecture:** Research plugin availability, install, test with various scenarios, evaluate results, and integrate with existing workflow if successful.

**Tech Stack:** OpenCode plugin system, bash scripting, file monitoring, git worktrees

---

### Task 1: Research Plugin Availability

**Files:**
- Create: `scripts/research-opencode-plugin.sh`

**Step 1: Check if plugin exists and is accessible**

```bash
#!/bin/bash
echo "Researching OpenCode Dynamic Context Pruning Plugin..."

# Check GitHub URL
PLUGIN_URL="https://github.com/Opencode-DCP/opencode-dynamic-context-pruning"
echo "Plugin URL: $PLUGIN_URL"

# Try to access repository
curl -s -I "$PLUGIN_URL" | head -1

# Check if plugin mentioned in OpenCode docs
if [ -d ~/.config/opencode ]; then
    echo "OpenCode config directory exists"
fi
```

**Step 2: Run research script**

```bash
cd /home/mdwzrd/wzrd-redesign/.worktrees/opencode-plugin-test
chmod +x scripts/research-opencode-plugin.sh
./scripts/research-opencode-plugin.sh
```

Expected: Output showing HTTP status and OpenCode config existence

**Step 3: Commit research script**

```bash
git add scripts/research-opencode-plugin.sh
git commit -m "feat: add plugin research script"
```

### Task 2: Establish Baseline Monitoring

**Files:**
- Create: `scripts/monitor-opencode-baseline.sh`
- Monitor: `~/.local/state/opencode/prompt-history.jsonl`

**Step 1: Create baseline monitoring script**

```bash
#!/bin/bash
echo "=== OpenCode Baseline Monitoring ==="
echo "Date: $(date)"
echo ""

# Check prompt-history.jsonl
HISTORY_FILE="$HOME/.local/state/opencode/prompt-history.jsonl"
if [ -f "$HISTORY_FILE" ]; then
    SIZE=$(stat -c%s "$HISTORY_FILE")
    LINE_COUNT=$(wc -l < "$HISTORY_FILE")
    echo "prompt-history.jsonl:"
    echo "  Size: $SIZE bytes"
    echo "  Lines: $LINE_COUNT"
    echo "  Last modified: $(stat -c%y "$HISTORY_FILE")"
else
    echo "prompt-history.jsonl not found"
fi

echo ""
# Check OpenCode process
ps aux | grep -i opencode | grep -v grep
```

**Step 2: Run baseline monitoring**

```bash
chmod +x scripts/monitor-opencode-baseline.sh
./scripts/monitor-opencode-baseline.sh
```

Expected: Current size of prompt-history.jsonl (~14KB, 50 messages)

**Step 3: Commit baseline script**

```bash
git add scripts/monitor-opencode-baseline.sh
git commit -m "feat: add OpenCode baseline monitoring"
```

### Task 3: Determine Installation Method

**Files:**
- Create: `scripts/check-opencode-plugin-installation.md`

**Step 1: Research OpenCode plugin installation methods**

Check documentation or common patterns:
1. OpenCode plugin registry
2. NPM package
3. Manual installation via config files

**Step 2: Create installation guide document**

```markdown
# OpenCode Plugin Installation Methods

## Common Methods:
1. **Plugin Registry**: OpenCode → Plugins → Install
2. **NPM**: `npm install opencode-dynamic-context-pruning`
3. **Manual**: Clone repo, add to config

## Current Investigation:
- Plugin URL: https://github.com/Opencode-DCP/opencode-dynamic-context-pruning
- Need to check if accessible
- Need to check OpenCode version compatibility
```

**Step 3: Commit installation guide**

```bash
git add scripts/check-opencode-plugin-installation.md
git commit -m "docs: add plugin installation research"
```

### Task 4: Attempt Plugin Installation

**Files:**
- Create: `scripts/install-opencode-plugin.sh`

**Step 1: Create installation script with fallbacks**

```bash
#!/bin/bash
echo "Attempting to install OpenCode Dynamic Context Pruning Plugin..."

PLUGIN_URL="https://github.com/Opencode-DCP/opencode-dynamic-context-pruning"

# Method 1: Check if npm package exists
echo "Method 1: Checking npm..."
npm view opencode-dynamic-context-pruning 2>/dev/null && {
    echo "Found npm package, installing..."
    npm install opencode-dynamic-context-pruning
    echo "npm installation attempted"
}

# Method 2: Check OpenCode plugin directory
echo ""
echo "Method 2: Checking OpenCode plugin directories..."
if [ -d ~/.config/opencode/plugins ]; then
    echo "Plugins directory exists: ~/.config/opencode/plugins"
    ls -la ~/.config/opencode/plugins/
fi

# Method 3: Manual clone attempt
echo ""
echo "Method 3: Attempting to access repository..."
if curl -s -I "$PLUGIN_URL" | grep -q "200 OK"; then
    echo "Repository accessible at: $PLUGIN_URL"
    echo "Manual installation possible"
else
    echo "Repository not accessible"
fi
```

**Step 2: Run installation attempt**

```bash
chmod +x scripts/install-opencode-plugin.sh
./scripts/install-opencode-plugin.sh
```

Expected: Output showing which installation methods are available

**Step 3: Commit installation script**

```bash
git add scripts/install-opencode-plugin.sh
git commit -m "feat: add plugin installation script"
```

### Task 5: Test Plugin Functionality

**Files:**
- Create: `scripts/test-plugin-functionality.sh`

**Step 1: Create test script**

```bash
#!/bin/bash
echo "Testing OpenCode Plugin Functionality..."
echo ""

# Record baseline
BASELINE_FILE="/tmp/opencode-baseline.txt"
./scripts/monitor-opencode-baseline.sh > "$BASELINE_FILE"
echo "Baseline recorded to $BASELINE_FILE"

echo ""
echo "=== Test Plan ==="
echo "1. Use OpenCode normally (generate 20+ messages)"
echo "2. Run /compact command"
echo "3. Monitor prompt-history.jsonl changes"
echo "4. Check if context is truly pruned"

echo ""
echo "Instructions for manual testing:"
echo "1. Open OpenCode TUI"
echo "2. Generate conversation (ask questions, get responses)"
echo "3. Run /compact command"
echo "4. Check if prompt-history.jsonl size decreases"
echo "5. Repeat with plugin installed vs not installed"
```

**Step 2: Run test plan generator**

```bash
chmod +x scripts/test-plugin-functionality.sh
./scripts/test-plugin-functionality.sh
```

Expected: Test instructions generated

**Step 3: Commit test script**

```bash
git add scripts/test-plugin-functionality.sh
git commit -m "feat: add plugin test script"
```

### Task 6: Create Integration Test with Existing Workflow

**Files:**
- Modify: `scripts/test-plugin-integration.sh`
- Use: `wzrd-compact-workflow.sh`

**Step 1: Create integration test**

```bash
#!/bin/bash
echo "Testing Plugin Integration with Existing Workflow..."
echo ""

# Check if existing workflow exists
if [ -f ../wzrd-compact-workflow.sh ]; then
    echo "Found existing workflow: wzrd-compact-workflow.sh"
    echo ""
    echo "Integration test plan:"
    echo "1. Run wzrd-compact-workflow.sh"
    echo "2. Check if plugin interferes with workflow"
    echo "3. Check if plugin enhances workflow"
    echo "4. Test adaptive cleanup (12hr active / 24hr idle)"
else
    echo "Existing workflow not found in parent directory"
fi

echo ""
echo "=== Plugin Integration Scenarios ==="
echo "Scenario A: Plugin provides true context reset"
echo "  - Workflow: Use plugin instead of manual /new"
echo "  - Benefit: Fully automated compaction"
echo ""
echo "Scenario B: Plugin only token optimization"
echo "  - Workflow: Keep manual /new step"
echo "  - Benefit: Token savings but still manual"
echo ""
echo "Scenario C: Plugin conflicts with workflow"
echo "  - Workflow: Disable plugin or adjust config"
echo "  - Benefit: Avoid conflicts"
```

**Step 2: Run integration test generator**

```bash
chmod +x scripts/test-plugin-integration.sh
./scripts/test-plugin-integration.sh
```

Expected: Integration scenarios outlined

**Step 3: Commit integration test**

```bash
git add scripts/test-plugin-integration.sh
git commit -m "feat: add plugin integration test"
```

### Task 7: Create Evaluation Criteria Document

**Files:**
- Create: `docs/evaluation-criteria.md`

**Step 1: Define success/failure criteria**

```markdown
# OpenCode Plugin Evaluation Criteria

## Success Criteria (Plugin Works)
1. ✅ Plugin installs without errors
2. ✅ prompt-history.jsonl size decreases after pruning
3. ✅ No performance degradation (TUI remains responsive)
4. ✅ Compatible with existing /compact command
5. ✅ Works with wzrd-compact-workflow.sh

## Failure Criteria (Plugin Doesn't Work)
1. ❌ Plugin not accessible or incompatible
2. ❌ No effect on prompt-history.jsonl size
3. ❌ Causes performance issues or crashes
4. ❌ Conflicts with existing commands
5. ❌ Requires significant configuration

## Evaluation Matrix
| Aspect | Weight | Notes |
|--------|--------|-------|
| Installation ease | 3 | Should be simple to install |
| Effectiveness | 5 | Must reduce context accumulation |
| Performance | 4 | Should not slow down TUI |
| Compatibility | 4 | Must work with existing workflow |
| Configuration | 2 | Should need minimal config |

## Decision Threshold
- **Adopt if**: Score ≥ 16/18 AND effectiveness = 5
- **Reject if**: Score < 12 OR effectiveness < 3
- **Modify if**: Score 12-15 with specific issues fixable
```

**Step 2: Commit evaluation criteria**

```bash
git add docs/evaluation-criteria.md
git commit -m "docs: add plugin evaluation criteria"
```

### Task 8: Create Final Recommendation Script

**Files:**
- Create: `scripts/generate-recommendation.sh`

**Step 1: Create recommendation generator**

```bash
#!/bin/bash
echo "Generating Plugin Recommendation..."
echo ""

# Check if tests have been run
if [ ! -f /tmp/plugin-test-results.txt ]; then
    echo "No test results found. Run tests first."
    echo ""
    echo "To run tests:"
    echo "1. ./scripts/install-opencode-plugin.sh"
    echo "2. ./scripts/test-plugin-functionality.sh"
    echo "3. ./scripts/test-plugin-integration.sh"
    exit 1
fi

echo "Based on test results:"
echo ""
echo "=== RECOMMENDATION OPTIONS ==="
echo ""
echo "Option 1: Adopt Plugin"
echo "  When: Plugin works effectively"
echo "  Action: Integrate into workflow, update documentation"
echo ""
echo "Option 2: Reject Plugin"
echo "  When: Plugin doesn't work or causes issues"
echo "  Action: Continue with current manual workflow"
echo ""
echo "Option 3: Modify & Use Plugin"
echo "  When: Plugin works but needs adjustments"
echo "  Action: Create wrapper script, adjust configuration"
echo ""
echo "Option 4: Alternative Solution"
echo "  When: Plugin completely unavailable"
echo "  Action: Build custom context manager"
```

**Step 2: Commit recommendation script**

```bash
git add scripts/generate-recommendation.sh
git commit -m "feat: add plugin recommendation generator"
```

### Task 9: Update Status Command Integration

**Files:**
- Modify: `wzrd-system-status.sh` (in parent directory)

**Step 1: Check current status command**

```bash
cd /home/mdwzrd/wzrd-redesign
if [ -f wzrd-system-status.sh ]; then
    echo "Current status command found"
    grep -n "opencode\|plugin" wzrd-system-status.sh || echo "No plugin monitoring found"
fi
```

**Step 2: Plan status command enhancement**

Add plugin status monitoring to existing `/status` command:
- Check if plugin installed
- Check if plugin active
- Show pruning statistics
- Show performance impact

**Step 3: Create enhancement plan**

```markdown
# Status Command Enhancement Plan

## Current Features:
- System health monitoring
- Process monitoring
- Memory usage

## New Plugin Monitoring:
- Plugin installation status
- Plugin configuration
- Pruning statistics
- Performance metrics
```

**Step 4: Commit enhancement plan**

```bash
git add docs/evaluation-criteria.md  # Update if needed
git commit -m "docs: add status command enhancement plan"
```

### Task 10: Create Rollback Plan

**Files:**
- Create: `scripts/plugin-rollback.sh`

**Step 1: Create rollback script**

```bash
#!/bin/bash
echo "OpenCode Plugin Rollback Plan"
echo ""

echo "=== Rollback Steps ==="
echo ""
echo "1. Uninstall plugin:"
echo "   npm uninstall opencode-dynamic-context-pruning"
echo ""
echo "2. Remove plugin config:"
echo "   rm -rf ~/.config/opencode/plugins/opencode-dynamic-context-pruning"
echo ""
echo "3. Restore original workflow:"
echo "   Use wzrd-compact-workflow.sh without plugin"
echo ""
echo "4. Verify system status:"
echo "   ./wzrd-system-status.sh"
echo ""
echo "5. Test manual workflow:"
echo "   Run compact-and-continue.sh"
```

**Step 2: Commit rollback plan**

```bash
git add scripts/plugin-rollback.sh
git commit -m "feat: add plugin rollback script"
```

---

## Execution Options

**Plan complete and saved to `docs/plans/2026-03-06-opencode-plugin-test-implementation.md`. Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**