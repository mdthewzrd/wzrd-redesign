# WZRD Project Memory

This file contains platform decisions, patterns, and important learnings for the WZRD.dev system.

## Platform Architecture

**Core System:** OpenCode wrapper with mode-based agent shifting
**Model Provider:** NVIDIA API with free credits
**Primary Agent:** Remi (single agent with mode shifting)

## Mode System

### 5 Hard Modes:
1. **Chat Mode** (`chat.md`)
   - Primary model: `nvidia/z-ai/glm4.7`
   - Purpose: Orchestration, coordination, general tasks
   - Token efficiency focus

2. **Thinker Mode** (`thinker.md`)
   - Primary model: `nvidia/deepseek-ai/deepseek-v3.2`
   - Purpose: Planning, architecture, strategy, analysis
   - Complex reasoning focus

3. **Coder Mode** (`coder.md`)
   - Primary model: `nvidia/deepseek-ai/deepseek-coder-6.7b-instruct`
   - Purpose: Implementation, refactoring, code generation
   - Code-specific focus

4. **Debug Mode** (`debug.md`)
   - Primary model: `nvidia/deepseek-ai/deepseek-v3.2`
   - Purpose: Testing, QA, problem-solving, debugging
   - Analytical focus

5. **Research Mode** (`research.md`)
   - Primary model: `nvidia/moonshotai/kimi-k2.5`
   - Purpose: Investigation, learning, analysis, research
   - Information gathering focus

## Project Structure

```
/home/mdwzrd/wzrd-redesign/
├── remi/
│   ├── SOUL.md              # Remi identity and principles
│   ├── SKILLS.md            # Available skills
│   ├── modes/               # 5 mode configuration files
│   └── personas/            # Legacy persona system (archived)
├── topics/                  # Topic memory system
├── memory/                  # Project memory (this file)
├── skills/                  # Skills directory
└── wzrd-mode               # Main CLI wrapper
```

## Key Decisions

1. **Single Agent vs Multi-Agent**: Using Remi as single agent with mode shifting instead of spawning multiple agents
2. **Model Selection**: Using NVIDIA free models optimized for each mode type
3. **CLI Design**: `wzrd.dev` command launches OpenCode TUI with mode switching
4. **Gateway Integration**: Updated Gateway V2 to use OpenCode instead of Claude CLI
5. **Token Optimization**: Mode-based model selection reduces token usage compared to always using premium models

## Patterns

- **Mode Shifting Announcement**: Always announce when shifting modes: "Shifting to [mode] mode..."
- **Context Containment**: Keep all files within wzrd-redesign directory structure
- **Model Consistency**: Use same model per mode for predictable behavior
- **File Verification**: Always read back files after writing them
- **Executable Proof**: Show that code runs, tests pass, commands work

## Integration Points

1. **OpenCode Agent System**: Remi registered as primary OpenCode agent
2. **Gateway V2**: Updated to spawn OpenCode agents instead of Claude
3. **NVIDIA API**: Free model access through NVIDIA developer account
4. **Directory Structure**: Consistent paths for topics and memory access

## Open Issues

- Gateway V2 integration testing pending
- Auto-mode switching logic implementation
- Topic memory system integration with mode system

## Success Metrics

- CLI launches correctly with all 5 modes
- Gateway can spawn Remi agents
- Model selection works per mode
- All files contained within project structure