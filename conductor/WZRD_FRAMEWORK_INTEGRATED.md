# WZRD.dev Integrated Framework Specification

## Unified Vision Integration

This document integrates ALL learnings from:
1. **Stripe Minions Research** (Agentic Engineering Framework)
2. **WZRD.framework OG Design** (Original Vision)
3. **WZRD-redesign Implementation** (Current Work)
4. **Strategic Transformation Plan** (7-Pillar Framework)

## Core Philosophy Shift

**From Vibe Coding → Agentic Engineering**
- Predictable systems over trial-and-error
- Quality gates over "it works on my machine"
- Systematic workflows over ad-hoc prompting
- Engineering rigor over magical thinking

## Stripe Minions 7-Component Framework Integration

### 1. API Layer (Multi-Channel)
**Current Implementation**: 
- Discord interface ✓ (interfaces/remi-monitor.ts)
- CLI/TUI interface ✓ (WZRD CLI tools)
- Web interface planned

**Integration Required**: 
- Unified API gateway for all channels
- Session management across interfaces
- State synchronization between channels

### 2. Warm Dev Box Pool (Sandboxes)
**Current Implementation**: 
- Git worktree isolation (.worktrees/)
- Topic-based separation (topics/)
- Background agent system (bg-agent.py)

**Integration Required**: 
- Automatic sandbox provisioning
- Resource allocation and limits
- Cleanup and recycling strategy

### 3. Agent Harness (OpenCode Fork)
**Current Implementation**: 
- OpenCode harness ✓
- DeepSeek V3.2 model ✓
- Tool access system ✓

**Integration Required**: 
- Custom OpenCode enhancements
- Performance monitoring integration
- Memory optimization layer

### 4. Blueprint Engine (Predictable Workflows)
**Current Implementation**: 
- Skills system (166 skills)
- Mode shifting (CHAT/CODER/THINKER/etc.)
- Conductor context system

**CRITICAL GAP**: No systematic blueprint engine
**Integration Required**: 
- Workflow templates for common tasks
- Step-by-step predictable execution
- Validation checkpoints automatically inserted

### 5. Rules File (Domain-Specific Context)
**Current Implementation**: 
- Conductor context artifacts (product.md, etc.)
- Skill-specific configuration
- Environment variables

**CRITICAL GAP**: No rules-based context optimization
**Integration Required**: 
- Token optimization rules per domain
- Context pruning strategies
- Priority-based attention allocation

### 6. Tool Shed Meta-Layer (Skill Registry)
**Current Implementation**: 
- 166 skills in .agents/skills/
- Skill loading system ✓
- Skill documentation ✓

**Integration Required**: 
- Skill discovery and recommendation
- Dependency resolution between skills
- Version management and updates

### 7. Validation Layer (Quality Gates)
**Current Implementation**: 
- Test suite ✓
- Performance benchmarks ✓
- Memory system validation ✓

**CRITICAL GAP**: No systematic validation pipeline
**Integration Required**: 
- Automated quality gates
- Pre-commit validation
- Production readiness checks

## WZRD.framework OG Design Integration

### Original Vision Components Still Relevant:
1. **Agent Team Coordination**: Multiple specialized agents
2. **Project Isolation**: Separate environments per project  
3. **Infinite Scaling**: Delegation to project agents
4. **Proactive Operation**: Agents take initiative

### Current Adaptation (WZRD-redesign):
- **Consolidated multi-agent → single agent with mode shifting**
- **Maintained project isolation vision** (topics system)
- **Kept infinite scaling goal** (background agents)
- **Enhanced proactive capabilities** (Remi SOUL.md)

### Integration Required:
- Bridge between single-agent mode shifting and multi-agent vision
- Connect topics system to project agent creation
- Link background agents to project delegation

## WZRD-redesign Implementation Status

### What Works:
1. **Skills System**: 166 skills functional ✓
2. **Mode Shifting**: CHAT/CODER/THINKER/DEBUG/RESEARCH ✓
3. **Memory System**: Context management ✓
4. **Topics System**: 16 active topics ✓
5. **Interfaces**: Discord/CLI monitoring ✓
6. **Background Agents**: Parallel execution ✓
7. **Conductor Context**: New foundation ✓

### What's Broken/Missing:
1. **Blueprint Engine**: No systematic workflows (CRITICAL)
2. **Rules-Based Context**: No token optimization rules (CRITICAL)
3. **Validation Pipeline**: No quality gates (CRITICAL)
4. **Project Agent Creation**: Topics ≠ Project agents
5. **Skill Coordination**: 166 skills but poor integration
6. **Performance Optimization**: Server resource issues (21.5 CPU cores)

## Strategic Transformation Plan Integration

### 7-Pillar Implementation Priority:

**PHASE 1: FOUNDATION (Highest ROI)**
1. **Blueprint Engine** (Week 1-2)
   - Create workflow templates
   - Implement step-by-step execution
   - Add validation checkpoints

2. **Rules-Based Context** (Week 3-4)
   - Token optimization rules
   - Context pruning strategies  
   - Priority attention allocation

3. **Validation Pipeline** (Week 5-6)
   - Quality gates for all operations
   - Automated testing integration
   - Performance benchmarks

**PHASE 2: SCALING**
4. **Tool Shed Meta-Layer** (Week 7-8)
5. **Multi-Channel API** (Week 9-10)
6. **Sandbox System** (Week 11-12)
7. **Performance Optimization** (Ongoing)

## Critical Wiring Required

### Immediate Wiring Fixes (Stop "Running in Circles"):

1. **Skills ↔ Topics Connection**
   - Each topic should auto-load relevant skills
   - Skill execution tied to topic context

2. **Background Agents ↔ Mode Shifting**
   - Background agents should respect current mode
   - Mode changes should propagate to background work

3. **Conductor ↔ All Systems**
   - Conductor context should drive ALL agent behavior
   - All systems should check conductor before acting

4. **Memory ↔ Performance**
   - Memory system should optimize token usage
   - Performance monitoring should inform memory decisions

## Remi Framework "Functioning Optimally" Definition

For Remi to be "truly functioning right" we need:

### Level 1: Core Functionality ✓ (Mostly Done)
- Mode shifting works
- Tool access works  
- Skill loading works
- Memory management works

### Level 2: Integration ✗ (BROKEN - "Running in Circles")
- Systems talk to each other (skills/topics/agents/memory)
- Predictable workflows (blueprint engine)
- Quality assurance (validation pipeline)
- Performance optimization (rules-based context)

### Level 3: Proactive Operation ✗ (MISSING)
- Anticipates needs based on context
- Suggests optimal approaches automatically
- Manages own resource allocation
- Learns from interactions to improve

## Implementation Roadmap (Stop Running in Circles)

### WEEK 1: BLUEPRINT ENGINE (Stop Ad-Hoc Work)
1. Create 5 core blueprint templates:
   - Feature implementation blueprint
   - Bug fixing blueprint  
   - Code review blueprint
   - Research blueprint
   - Documentation blueprint

2. Integrate blueprint engine into Remi:
   - Mode selection triggers blueprint
   - Step-by-step guidance
   - Validation checkpoints

### WEEK 2: RULES-BASED CONTEXT (Optimize Token Usage)
1. Define context rules per domain:
   - Coding tasks: prioritize code, minimize explanations
   - Debugging: prioritize errors, stack traces
   - Research: prioritize breadth, include sources
   - Planning: prioritize structure, tradeoffs

2. Implement automatic context optimization:
   - Token budget allocation
   - Priority-based pruning
   - Strategic context retention

### WEEK 3: VALIDATION PIPELINE (Quality Gates)
1. Create pre-execution validation:
   - Skills validation before loading
   - Context validation before execution
   - Resource validation before starting

2. Create post-execution validation:
   - Result verification
   - Performance benchmarking
   - Quality scoring

## Coordination with Other Chats

Since 3 other chats are working on "interior issues", they likely need:

1. **Blueprint templates** to guide their work systematically
2. **Rules-based context** to optimize their token usage
3. **Validation checkpoints** to ensure quality
4. **Shared conductor context** to stay aligned

## Immediate Next Actions

1. **Create first blueprint template** (Feature Implementation)
2. **Test with one interior issue** from other chats
3. **Measure improvement** in "running in circles" feeling
4. **Iterate based on results**

## Success Metrics

### Framework "Functioning Optimally" When:
1. **Predictability**: Same input → Same quality output
2. **Efficiency**: Optimal token usage per task type  
3. **Quality**: All work passes validation gates
4. **Proactivity**: Suggests improvements before asked
5. **Scalability**: Can handle project agent creation

### Developer Experience Improved When:
1. **Less cognitive load**: Framework handles complexity
2. **Faster iterations**: Systematic workflows reduce trial-and-error
3. **Higher confidence**: Validation ensures quality
4. **Clear direction**: Blueprints guide optimal approach
5. **Reduced frustration**: Systems work together coherently