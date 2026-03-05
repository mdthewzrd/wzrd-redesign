# Remi's Skills

> **Purpose:** List all skills available to Remi and how they're used.
> **Last Updated:** 2026-02-21
> **Total Skills:** 37
> **P0 (Always Full):** 9 skills
> **P2+ (Metadata Only):** 28 skills

---

## Skills Organization

Skills are organized by priority for progressive loading:

- **P0 (Priority 0):** Loaded with full content (~550 tokens each)
- **P2 (Priority 2+):** Loaded as metadata only
- **On-Demand:** Can fetch full content when needed

---

## P0 Skills (Always Full Content)

These skills are always loaded with full documentation:

### planning (P0)
**Lines:** 214
**Tokens:** ~550
**Purpose:** Break down work into manageable tasks
**Used In Mode:** Planning, Orchestration
**Key Functions:**
- Task decomposition
- Dependency identification
- Roadmap creation
- Effort estimation

### coding (P0)
**Lines:** 268
**Tokens:** ~550
**Purpose:** Write and implement code
**Used In Mode:** Coding
**Key Functions:**
- All language support
- Best practices
- Code patterns
- Refactoring

### testing (P0)
**Lines:** 329
**Tokens:** ~550
**Purpose:** Verify quality and catch issues
**Used In Mode:** Testing, Debugging
**Key Functions:**
- Test strategies
- Test frameworks
- Coverage analysis
- Bug catching

### architecture (P0)
**Lines:** 364
**Tokens:** ~550
**Purpose:** Design systems and make decisions
**Used In Mode:** Architecture
**Key Functions:**
- System design
- Trade-off analysis
- Pattern application
- Technology choices

### debugging (P0)
**Lines:** 368
**Tokens:** ~550
**Purpose:** Find and fix issues
**Used In Mode:** Debugging
**Key Functions:**
- Bug hunting
- Root cause analysis
- Fix strategies
- Prevention

### security (P0)
**Lines:** ~200
**Tokens:** ~550
**Purpose:** Secure code and detect vulnerabilities
**Used In Mode:** Architecture, Coding, Testing
**Key Functions:**
- OWASP Top 10
- Security patterns
- Vulnerability detection
- Best practices

### github (P0)
**Lines:** ~150
**Tokens:** ~550
**Purpose:** GitHub repository operations
**Used In Mode:** Coding, Research
**Key Functions:**
- Repository search
- PR workflows
- Issue navigation
- Collaboration patterns

### web-search (P0)
**Lines:** ~150
**Tokens:** ~550
**Purpose:** Web search and information gathering
**Used In Mode:** Research, Planning
**Key Functions:**
- Search operators
- Source verification
- Information extraction
- Credibility checking

### mcp (P0)
**Lines:** ~150
**Tokens:** ~550
**Purpose:** Model Context Protocol integration
**Used In Mode:** All modes
**Key Functions:**
- MCP configuration
- Tool calling
- Context management

---

## P2 Skills (Metadata Only)

These skills are loaded as metadata and can be fetched on-demand:

### cli (P2)
**Purpose:** Command-line interface and bash scripting
**Used When:** System operations, automation

### sql (P2)
**Purpose:** Database queries and optimization
**Used When:** Data operations, analytics

### api (P2)
**Purpose:** API design and authentication
**Used When:** Backend development, integration

### git (P2)
**Purpose:** Git workflow and version control
**Used When:** Collaboration, rollback

### transcribe (P2)
**Purpose:** Audio transcription
**Used When:** Meeting notes, voice input

### skills-builder (P2)
**Purpose:** Meta-skill for creating skills
**Used When:** Adding new capabilities

### gold-standard (P2)
**Purpose:** Quality enforcement and validation
**Used When:** All tasks (compliance)

### orchestration (P2)
**Purpose:** Task coordination and parallel execution
**Used When:** Complex work, orchestration

### context (P2)
**Purpose:** Token monitoring and context management
**Used When:** Large conversations, context optimization

### research (P2)
**Purpose:** Code research and competitive analysis
**Used When:** Learning new topics, investigation

### documentation (P2)
**Purpose:** Technical writing and guides
**Used When:** Writing docs, README, API docs

### validation/read-back-verification (P2)
**Purpose:** Verify file operations succeeded
**Used When:** All file writes (Gold Standard)

### validation/executable-proof (P2)
**Purpose:** Show work is executable
**Used When:** All code/test completions

### validation/loop-prevention (P2)
**Purpose:** Detect and break repetitive failures
**Used When:** Multiple failed attempts

### validation/context-monitoring (P2)
**Purpose:** Monitor context usage and warnings
**Used When:** Long conversations

### orchestration/handoff-protocol (P2)
**Purpose:** Handle work transitions (legacy)
**Used When:** Passing work between modules

### orchestration/parallel-execution (P2)
**Purpose:** Execute independent work simultaneously (legacy)
**Used When:** Parallelizable tasks

### planning/task-decomposition (P2)
**Purpose:** Break complex tasks into subtasks
**Used When:** Planning complex features

### coding/test-driven-development (P2)
**Purpose:** Write tests before implementation
**Used When:** New features

### Additional Skills (P2)
- discord (P2) - Discord integration
- telegram (P2) - Telegram integration
- openrouter (P2) - OpenRouter API
- claude-code (P2) - Claude Code integration
- claude-ops (P2) - Operations integration
- claude-shell (P2) - Shell operations
- claude-gui (P2) - GUI operations
- claude-tui (P2) - Terminal UI operations
- claude-agent (P2) - Agent protocols
- claude-code-gateway (P2) - Gateway integration

---

## Skills by Mode

### Planning Mode Skills
- planning (P0) - Full content
- task-decomposition (P2) - On-demand
- web-search (P0) - Full content
- research (P2) - On-demand

### Architecture Mode Skills
- architecture (P0) - Full content
- security (P0) - Full content
- context (P2) - On-demand
- gold-standard (P2) - On-demand

### Coding Mode Skills
- coding (P0) - Full content
- test-driven-development (P2) - On-demand
- github (P0) - Full content
- git (P2) - On-demand

### Testing Mode Skills
- testing (P0) - Full content
- debugging (P0) - Full content
- validation/* (P2) - On-demand

### Documentation Mode Skills
- documentation (P2) - On-demand
- skills-builder (P2) - On-demand

### Research Mode Skills
- research (P2) - On-demand
- web-search (P0) - Full content
- github (P0) - Full content

### Orchestration Mode Skills
- orchestration (P2) - On-demand
- planning (P0) - Full content
- context (P2) - On-demand

### Debugging Mode Skills
- debugging (P0) - Full content
- testing (P0) - Full content
- research (P2) - On-demand

---

## Skills Loading

### Progressive Loading Strategy

```
1. Load P0 skills (9 skills) → Full content, ~5,000 tokens
2. Load P2+ skills metadata (28 skills) → List only, ~700 tokens
3. Load on-demand when needed → Fetch full content for specific skill
```

### Context Token Budget

```
P0 skills (full): 9 × 550 = 4,950 tokens
P2+ metadata: 28 × 25 = 700 tokens
──────────────────────────────────────────
Skills total: ~5,650 tokens
```

---

## Skills Usage Guide

### When to Use Which Skill

**Coding a new feature:**
```
Planning → Architecture → Coding → Testing → Documentation
  ↓          ↓          ↓        ↓          ↓
  planning   architecture  coding    testing   documentation
```

**Debugging an issue:**
```
Research → Debugging → Testing
   ↓          ↓          ↓
  web-search   debugging   testing
```

**Planning a project:**
```
Research → Planning → Documentation
   ↓          ↓           ↓
  web-search   planning     documentation
```

---

## Skills Maintenance

### Adding New Skills

1. Create skill directory: `~/.claude/skills/{skill-name}/`
2. Write SKILL.md with proper format
3. Set priority (P0, P1, P2, etc.)
4. Update skills metadata list
5. Test skill loading

### Updating Existing Skills

1. Edit SKILL.md in `~/.claude/skills/{skill-name}/`
2. Update lines, key functions
3. Verify format is consistent
4. Update documentation if changed

### Removing Skills

1. Move skill directory to archive
2. Remove from skills metadata
3. Note reason in general memory

---

**Last Updated:** 2026-02-21
**Total Skills:** 37
**P0 Skills:** 9
**P2+ Skills:** 28
