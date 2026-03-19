# Day 7: Agent Onboarding Flow Design

## Current Agent Architecture Analysis
1. **Base Agent**: `hello-agent.sh` - Simple welcome template
2. **Background Agent**: `background-agent.sh` - File watcher for automated workflows
3. **Gateway V2**: Session-aware AI integration with NVIDIA API
4. **Agent Pool**: Manager for coordinating multiple agent types

## Agent Template System Design

### 1. Agent Role Templates
Four primary agent roles (matching Gateway V2 agent types):

**a) Coder Agent** (`agent-coder-template.sh`)
- Specialized for coding tasks
- Loads coding skill automatically
- Gold Standard enforcement
- Test-driven development mindset

**b) Thinker Agent** (`agent-thinker-template.sh`)  
- Architecture and planning
- Loads architecture/planning skills
- System design focus
- Trade-off analysis

**c) Researcher Agent** (`agent-researcher-template.sh`)
- Investigation and analysis
- Loads research/web-search skills
- Source verification
- Comprehensive reporting

**d) General Agent** (`agent-general-template.sh`)
- All-purpose, adaptable
- Auto-mode switching
- Multiple skill loading
- Conversational by default

### 2. Skill Injection System
- **Skill Registry**: List of available skills with descriptions
- **Auto-Load**: Based on agent role and task type
- **Dependency Resolution**: Load required skills in order
- **Context Management**: Skills add to context intelligently

### 3. Project-Specific Context Loading
- **Project Config**: `.wzrd/project-config.yaml`
- **Context Files**: Auto-load MEMORY_SUMMARY.md, tech stack, etc.
- **Skill Selection**: Project-specific skills (e.g., React skills for web projects)
- **Mode Presets**: Default modes based on project type

### 4. Onboarding Flow
```
New Agent Creation:
1. Select agent role template
2. Configure project context
3. Select skills to inject
4. Generate agent script
5. Register with Gateway V2
6. Test with validation suite
```

## Implementation Plan

### Phase 1: Create Agent Templates
1. Copy `hello-agent.sh` as base template
2. Create role-specific versions
3. Add skill loading logic
4. Add project context integration

### Phase 2: Skill Injection System
1. Create skill registry YAML
2. Build skill loader function
3. Implement dependency resolution
4. Add to agent templates

### Phase 3: Project Context Loading
1. Design `.wzrd/` directory structure
2. Create project config format
3. Build context loader
4. Integrate with templates

### Phase 4: Onboarding CLI
1. Create `create-agent.sh` CLI
2. Interactive role selection
3. Skill picking interface
4. Generation and registration

## Files to Create
1. `agent-coder-template.sh`
2. `agent-thinker-template.sh`  
3. `agent-researcher-template.sh`
4. `agent-general-template.sh`
5. `skill-registry.yaml`
6. `create-agent.sh` (CLI)
7. `.wzrd/project-config-template.yaml`

## Integration Points
- Gateway V2 agent pool registration
- Skill system from `.claude/skills/`
- Stripe Minions database for agent tracking
- Discord bot for agent communication
