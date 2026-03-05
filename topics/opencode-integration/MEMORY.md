# OpenCode Integration Topic

## Current Status

**CLI Redesign Complete:**
- ✅ Created 5 mode docs: `chat.md`, `thinker.md`, `coder.md`, `debug.md`, `research.md`
- ✅ Created `wzrd-mode` wrapper script with mode switching logic
- ✅ Registered Remi as OpenCode agent via `~/.config/opencode/agents/remi.md`
- ✅ Replaced old CLI wrapper (`wzrd-old` → `wzrd-mode`)
- ✅ Created `wzrd.dev` command alias for easier typing
- ✅ Updated project memory structure
- ✅ Fixed path references to use absolute paths within wzrd-redesign

## Mode Configuration

### Model Mapping:
- **Chat Mode**: `nvidia/z-ai/glm4.7` (fast/cheap orchestration)
- **Thinker Mode**: `nvidia/deepseek-ai/deepseek-v3.2` (planning/architecture)
- **Coder Mode**: `nvidia/deepseek-ai/deepseek-coder-6.7b-instruct` (implementation)
- **Debug Mode**: `nvidia/deepseek-ai/deepseek-v3.2` (testing/problem-solving)
- **Research Mode**: `nvidia/moonshotai/kimi-k2.5` (investigation/analysis)

## CLI Usage Examples

```bash
# Launch TUI in chat mode (default)
wzrd.dev

# Launch TUI in thinker mode
wzrd.dev --mode thinker

# Run prompt in coder mode
wzrd.dev --mode coder "Fix the authentication bug"

# Run with custom model
wzrd.dev --model nvidia/deepseek-ai/deepseek-v3.2 "Analyze performance"

# Show help
wzrd.dev --help
```

## Gateway V2 Status

**Updated:**
- ✅ Config updated to use Remi as primary agent
- ✅ Workdir set to `/home/mdwzrd/wzrd-redesign`
- ✅ Agent.ts modified to spawn OpenCode instead of Claude

**Pending Testing:**
- Gateway spawning OpenCode agents
- Gateway mode integration

## Next Steps

1. **Test Gateway V2 Integration**
   - Start Gateway service
   - Test agent spawning
   - Verify mode selection works

2. **Implement Auto-Mode Switching**
   - Detect task type from prompt
   - Announce mode shifts automatically
   - Document shift patterns

3. **Complete Topic Integration**
   - Ensure all topic memory paths are correct
   - Test topic commands
   - Update topic registry

4. **Documentation**
   - Update README with new CLI usage
   - Create migration guide from old system
   - Document troubleshooting steps

## Issues Fixed

1. **Command Typo Issue**: Created `wzrd.dev` alias to avoid confusion with `wzrdcode`
2. **Path References**: Updated all paths to use absolute paths within wzrd-redesign
3. **Old CLI Removal**: Removed old Claude-based `~/.claude/wzrd` script
4. **Memory Structure**: Created proper MEMORY.md files for project and topic memory

## Integration Points

- **OpenCode Agent System**: Remi is registered and working
- **NVIDIA Models**: All 5 models accessible via free credits
- **File Structure**: All files contained within wzrd-redesign
- **CLI Access**: `wzrd.dev` command available system-wide

## Validation Checklist

- [x] `wzrd.dev --help` works
- [x] `wzrd.dev` launches OpenCode TUI
- [x] `wzrd.dev --mode thinker` uses correct model
- [x] Remi agent loads correctly
- [x] All mode files exist in `remi/modes/`
- [x] Memory files created with correct paths
- [ ] Gateway V2 integration tested
- [ ] Auto-mode switching implemented