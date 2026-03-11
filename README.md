# WZRD.dev Framework v2.0

**The Ultimate Agentic Engineering Platform**

**Original Vision**: Discord-First AI Engineering with Infinite Scaling
**Infrastructure**: Stripe Minions 7-Component Architecture
**Status**: ✅ Production Ready

---

## 🎯 The Two Pillars

WZRD.dev unifies two powerful visions:

### Pillar 1: WZRD.dev Original Vision
> *"Discord-native AI engineering that scales infinitely"*

- **Discord-First Interface** - Natural chat-based engineering
- **Multi-Agent Coordination** - Teams of specialized agents
- **Infinite Scaling** - Projects become autonomous agents
- **Proactive Operation** - Anticipates needs before you ask
- **Memory & Context** - Persistent, project-aware conversations

### Pillar 2: Stripe Minions Infrastructure
> *"Predictable, high-performance agentic engineering"*

- **7 Battle-Tested Components** - Proven at scale
- **Quality Gates** - Validation at every step
- **Predictable Workflows** - Blueprints, not guesswork
- **Systematic Excellence** - Engineering rigor, not magic

**Together**: A platform that feels like magic but works like engineering.

---

## 🚀 Quick Start

### Install
```bash
git clone https://github.com/wzrddev/wzrd-redesign.git
cd wzrd-redesign
export PATH="$PWD/bin:$PATH"
```

### Launch
```bash
# Start development
wzrd dev

# Work on specific project
wzrd dev ./my-project

# Check status
wzrd --version
wzrd status
```

### Make Requests
```
"Create a React dashboard with auth"
"Fix the bug in API response"
"Design database for e-commerce"
"Research best practices for X"
```

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACES                           │
├──────────────┬──────────────┬──────────────┬────────────────┤
│   Discord    │    CLI/TUI   │    Web UI    │   API/Webhooks │
│   (Chat)     │  (Terminal)  │  (Browser)   │   (Programmatic)│
└──────┬───────┴──────┬───────┴──────┬───────┴────────┬─────────┘
       │              │              │                │
       └──────────────┼──────────────┴────────────────┘
                      │
       ┌──────────────▼──────────────┐
       │     CONDUCTOR SYSTEM        │
       │  (Orchestration Layer)      │
       └──────────────┬──────────────┘
                      │
    ┌─────────────────┼─────────────────┐
    │                 │                 │
┌───▼───┐      ┌──────▼──────┐   ┌─────▼──────┐
│ REMI  │      │   TOOL      │   │  SANDBOX   │
│ CORE  │      │   SHED      │   │   ENGINE   │
└───┬───┘      │  180 Skills │   └─────┬──────┘
    │          └─────────────┘         │
    │                                  │
    │   ┌──────────────────────────────┤
    │   │                              │
┌───▼───▼──────┐   ┌──────────┐   ┌────▼─────┐
│  BLUEPRINT   │   │ CONTEXT  │   │ VALIDATION│
│   ENGINE     │   │ OPTIMIZER│   │ PIPELINE │
└──────────────┘   └──────────┘   └──────────┘
```

---

## 📁 Directory Structure

```
wzrd-redesign/
│
├── 📡 interfaces/          # Multi-Channel API Layer
│   ├── discord-bot.ts    # Discord integration
│   ├── cli-wrapper.ts    # CLI/TUI interface
│   ├── web-ui-extension.ts
│   ├── remi-monitor.ts
│   └── sync-manager.ts
│
├── 🧠 remi/              # Core Agent Identity
│   ├── SOUL.md          # Core principles & vision
│   ├── PRINCIPLES.md    # WZRD.dev philosophy
│   ├── TOKEN_VISIBILITY.md
│   ├── modes/           # CHAT/CODER/THINKER/DEBUG/RESEARCH
│   ├── personas/        # Agent personalities
│   └── context/         # Context management
│
├── 🎛️ conductor/         # Framework Engine (Stripe Minions)
│   ├── blueprint-engine.yaml  # Workflow templates
│   ├── context-rules.yaml     # Token optimization
│   ├── sandbox-engine.yaml    # Project isolation
│   ├── tool-shed.yaml         # Skill registry
│   ├── validation-pipeline.yaml
│   └── *.sh                   # Executable components
│
├── 🛠️ .agents/skills/    # 180+ Specialized Capabilities
│   ├── coding/          # Programming languages
│   ├── debugging/       # Troubleshooting
│   ├── architecture/    # System design
│   ├── testing/         # QA & validation
│   ├── devops/          # Infrastructure
│   └── ...
│
├── 💾 memory/            # Persistent Context
│   ├── unified-memory.ts
│   ├── storage/         # Persistent data
│   └── topics/          # Topic isolation
│
├── ⚡ bin/               # CLI Tools
│   ├── wzrd -> wzrd-framework-v2
│   └── wzrd-framework-v2
│
└── 📊 logs/              # Framework logs & metrics
```

---

## 🎭 Remi: The Agent

### Core Identity
- **Name**: Remi
- **Role**: Agentic Engineering Partner
- **Home**: WZRD.dev Framework
- **Personality**: Proactive, thorough, engineering-focused

### Operating Modes
Remi automatically switches based on task:

| Mode | Trigger | What Remi Does |
|------|---------|----------------|
| **CHAT** | "Hey Remi", casual talk | Friendly conversation |
| **CODER** | "Write code", "implement" | Full implementation |
| **THINKER** | "Design", "plan", "architecture" | System design |
| **DEBUG** | "Fix", "broken", "error" | Problem solving |
| **RESEARCH** | "Research", "compare", "analyze" | Deep investigation |

### Superpowers
- **Skill Mastery**: 180+ skills auto-loaded per task
- **Multi-Tool**: bash, read, write, edit, web, git, sub-agents
- **Context Optimization**: Smart distill/prune for efficiency
- **Proactive**: Suggests improvements before you ask
- **Memory**: Remembers everything across sessions

---

## 🏭 The 7 Components (Stripe Minions)

### 1. API Layer (Multi-Channel)
**Files**: `interfaces/*`

Discord-first, multi-channel engineering:
- **Discord**: Natural chat interface
- **CLI**: Terminal power users
- **Web**: Browser-based development
- **API**: Programmatic access

```bash
# Discord: @Remi create a React app
# CLI: wzrd dev ./my-project
# API: Coming soon
```

### 2. Sandbox System (Warm Dev Box Pool)
**Files**: `conductor/sandbox-engine.sh`

Automated project isolation:
```bash
# Create isolated environment
./conductor/sandbox-engine.sh create ./my-project

# List active sandboxes
./conductor/sandbox-engine.sh list

# Auto-migrate finished work
./conductor/auto-migration-system.sh migrate
```

**Types**:
- `git_worktree`: Filesystem isolation (1-5s)
- `docker_container`: Full containerization (10-30s)
- `process_namespace`: Process-level (2-10s)

### 3. Agent Harness (OpenCode Fork)
**Files**: `remi/SOUL.md`, `remi/PRINCIPLES.md`

Enhanced OpenCode with:
- Mode auto-detection
- Skill auto-loading
- Context optimization
- Multi-agent coordination

### 4. Blueprint Engine (Predictable Workflows)
**Files**: `conductor/blueprint-engine.yaml`

Systematic execution patterns:
- **feature_implementation**: Build features
- **bug_fixing**: Debug issues
- **research**: Investigate
- **planning**: Design systems
- **refactoring**: Improve code

### 5. Rules File (Context Optimization)
**Files**: `conductor/context-rules.yaml`

Token optimization per task:
- Coding: 30K tokens, prioritize code
- Debugging: 15K tokens, focus on errors
- Research: 20K tokens, include sources
- Planning: 15K tokens, show tradeoffs

### 6. Tool Shed (Skill Registry)
**Files**: `conductor/tool-shed.yaml`, `.agents/skills/`

180+ auto-categorized skills:
```bash
# Discover skills
./conductor/tool-shed.sh find "react"

# Update registry
./conductor/tool-shed.sh update

# Categorize new skills
./conductor/tool-shed.sh categorize
```

### 7. Validation Pipeline (Quality Gates)
**Files**: `conductor/validation-pipeline.sh`

Automated quality checks:
- Pre-execution validation
- Mid-execution checkpoints
- Post-execution verification
- Performance benchmarking

---

## 🎮 Using the Framework

### Basic Usage

```bash
# Start development
wzrd dev ./my-project

# Or current directory
wzrd dev
```

### Making Requests

Once Remi is active, just type:

```
"Create a user authentication system"
"Fix the CORS error in API"
"Research GraphQL vs REST"
"Design database schema for marketplace"
```

### Advanced Features

**Create a Blueprint** (capture workflow):
```
"Create a blueprint for API development"
```

**Multi-Agent Task**:
```
"Launch parallel agents to review this code"
```

**Memory Management**:
```
"Save this context to project memory"
"Load the e-commerce project context"
```

---

## 🔄 Auto-Migration System

**Problem**: Worktrees accumulate work, manual migration is error-prone

**Solution**: Automated migration with validation

```bash
# Detect candidates
./conductor/auto-migration-system.sh detect

# Validate specific work
./conductor/finished-work-validator.sh ./my-project

# Full migration (with validation)
./conductor/auto-migration-system.sh migrate

# Check status
./conductor/auto-migration-system.sh status
```

**Validation Criteria**:
- Git status (committed/staged)
- Tests passing
- Documentation present
- No TODO markers
- Recent activity
- Quality score > 60%

---

## 🧪 Testing

### Framework Tests
```bash
# Full integration test
./conductor/test-framework.sh

# Component tests
./conductor/sandbox-engine.sh test
./conductor/tool-shed.sh test
./conductor/validation-pipeline.sh test
```

### Validation
```bash
# Check if work is finished
./conductor/finished-work-validator.sh ./project

# Run quality gates
./conductor/validation-pipeline.sh validate ./project
```

---

## 📊 Monitoring

### Health Checks
```bash
# Check all components
wzrd status

# Check specific component
./conductor/sandbox-engine.sh health
```

### Logs
- Framework logs: `logs/`
- Migration logs: `logs/migration-*.log`
- Validation logs: `logs/validation-*.log`

---

## 📚 Documentation

### Essential Reading
1. `README.md` - This file
2. `remi/SOUL.md` - Remi's core identity
3. `remi/PRINCIPLES.md` - WZRD.dev philosophy
4. `conductor/WZRD_FRAMEWORK_INTEGRATED.md` - Full architecture

### Component Docs
- `conductor/blueprint-engine.yaml` - Workflow templates
- `conductor/context-rules.yaml` - Token optimization
- `conductor/sandbox-engine.yaml` - Sandbox config

### Skills
Each skill has documentation in `.agents/skills/[category]/SKILL.md`

---

## 🚀 Getting Started (First Time)

### Step 1: Verify Installation
```bash
cd /home/mdwzrd/wzrd-redesign
wzrd --version
```

### Step 2: Quick Test
```bash
wzrd dev
```

### Step 3: Make First Request
```
"List the skills available"
```

### Step 4: Try a Project
```bash
mkdir ~/test-project
wzrd dev ~/test-project
```

Then:
```
"Create a simple web server"
```

---

## 🆘 Troubleshooting

### Framework Won't Start
```bash
# Check permissions
ls -la bin/wzrd*

# Verify PATH
echo $PATH | grep wzrd-redesign

# Check logs
tail logs/wzrd-*.log
```

### Skills Not Loading
```bash
# Update skill registry
./conductor/update-tool-shed.sh

# Check skill count
ls -la .agents/skills/ | wc -l
```

### Sandbox Issues
```bash
# Check resource availability
df -h
free -h

# List sandboxes
./conductor/sandbox-engine.sh list

# Clean up
./conductor/sandbox-engine.sh cleanup --all
```

---

## 🎯 Success Metrics

Framework is "functioning optimally" when:
- ✅ Same input → Same quality output (predictable)
- ✅ Optimal token usage per task type (efficient)
- ✅ All work passes validation gates (quality)
- ✅ Suggests improvements before asked (proactive)
- ✅ Can handle project agent creation (scalable)

---

## 🔮 Roadmap

### Completed ✅
- All 7 Stripe Minions components
- 180+ skills
- Auto-migration system
- Validation pipeline

### In Progress 🚧
- Discord bot optimization
- Multi-agent coordination
- Web UI expansion

### Future 🚀
- Project agent auto-creation
- Marketplace for skills
- Team collaboration features

---

## 🤝 Contributing

This is a living framework. To contribute:

1. **Skills**: Add to `.agents/skills/`
2. **Blueprints**: Define in `conductor/blueprint-engine.yaml`
3. **Documentation**: Update relevant `.md` files
4. **Validation**: Extend `conductor/validation-pipeline.sh`

---

## 📞 Support

### Check First
- `logs/` directory for errors
- `./conductor/test-framework.sh` for diagnostics
- `./conductor/FRAMEWORK_ISSUES.md` for known issues

### Still Stuck?
The framework is self-documenting. Ask Remi:
```
"How do I use the sandbox system?"
"What does the blueprint engine do?"
"Show me the available skills"
```

---

**Status**: ✅ PRODUCTION READY  
**Version**: 2.0  
**Last Updated**: March 11, 2026  
**Components**: 7/7 Operational  
**Skills**: 180+ Active  

**Built with 💜 by the WZRD.dev team**  
*Agentic Engineering for the Infinite Scale*
