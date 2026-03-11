# Design: Test OpenCode Dynamic Context Pruning Plugin

## Goal
Test the `opencode-dynamic-context-pruning` plugin to determine if it solves OpenCode's context accumulation problem, which causes TUI slowdowns and memory growth.

## Problem Statement
OpenCode's `/compact` command summarizes conversations but doesn't clear context from `prompt-history.jsonl`, leading to:
- Indefinite context growth
- TUI performance degradation  
- Memory accumulation over time
- Manual `/new` command required for true reset

## Current State
We've completed:
1. **Phase 1**: Permission bypass for OpenCode automation
2. **Phase 2**: Enhanced `/wzrd-compact` workflow (manual step required)
3. **Phase 3**: Topic auto-integration
4. **Phase 4**: Researching true automation solutions

## Plugin Discovery
Found `opencode-dynamic-context-pruning` plugin (https://github.com/Opencode-DCP/opencode-dynamic-context-pruning)
- Description: "Dynamic context pruning plugin for OpenCode - intelligently manages conversation context to optimize token usage"
- Potentially solves context accumulation automatically

## Testing Plan

### Phase A: Research & Installation
1. **Verify plugin availability**: Check GitHub repo, compatibility, installation method
2. **Installation**: Determine if via OpenCode plugin registry, npm, or manual
3. **Configuration**: Check available settings (thresholds, strategies)

### Phase B: Basic Testing  
1. **Baseline monitoring**: Current `prompt-history.jsonl` size (~14KB, 50 messages)
2. **Install plugin**: Follow official instructions
3. **Normal usage test**: Use OpenCode normally, monitor pruning
4. **Compact test**: Test with `/compact` command

### Phase C: Advanced Testing
1. **Stress test**: Generate 50+ messages to trigger pruning
2. **Performance monitoring**: Check memory/TUI speed improvements
3. **Workflow integration**: Test with `wzrd-compact-workflow.sh`

### Phase D: Evaluation & Integration
1. **If plugin works**:
   - Integrate with existing workflow
   - Create installation guide
   - Update `/status` monitoring
   - Consider plugin as final solution

2. **If plugin doesn't work**:
   - Fallback to custom wrapper solution
   - Re-evaluate other approaches
   - Document limitations

## Success Criteria
1. Plugin installs successfully
2. Plugin prunes context automatically (reduces `prompt-history.jsonl` size)
3. No performance degradation from plugin
4. Compatible with existing `/wzrd-compact` workflow

## Risk Assessment
- **Plugin incompatible**: May not work with current OpenCode version
- **Performance impact**: Plugin could add overhead
- **Limited functionality**: May not provide true `/new` reset
- **Maintenance risk**: External dependency

## Next Steps
1. Research plugin installation method
2. Install and configure plugin
3. Run comprehensive tests
4. Evaluate results and decide on integration

## Approval
✅ User approved testing approach on 2026-03-06