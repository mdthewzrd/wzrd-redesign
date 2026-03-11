---
name: gold-standard
description: Gold Standard enforcement - validation, verification, and quality protocols
category: validation
priority: P0
tags: [gold-standard, validation, quality, anti-hallucination]
subskills:
  - read-back-verification
  - executable-proof
  - loop-prevention
  - context-monitoring
  - progressive-disclosure
---

# Gold Standard

## Purpose
The Gold Standard is a set of non-negotiable quality protocols that prevent hallucinations, ensure validation, and maintain high standards of work.

## Core Principle
**"Never claim something works without executable proof."**

## The 10 Pillars

### Pillar 0: Soul (First, Always)
- **Soul loads FIRST** in system prompt (before any operational content)
- **Experiential format**: "I've learned X because Y" not "Do X"
- **Anti-patterns**: 30-40% of soul defines what you refuse
- **Productive flaw**: Name the cost of your core strength
- **U-shaped attention**: First and last tokens get most weight
- Soul shapes how EVERY capability gets wielded

### Pillar 1: Skills
- Load skills per task via progressive disclosure
- Metadata first, full content on demand
- Token-efficient context management

### Pillar 2: Subagents
- Max spawn depth: 1 (no nesting)
- Only for parallel independent work
- Role-shift for sequential work

### Pillar 3: Parallel
- Task dependency graphs
- Parallel execution groups
- Proper orchestration

### Pillar 4: Memory
- 4-layer memory system
- MEMORY_SUMMARY.md (500-1000 tokens)
- Daily logs for debugging
- Curated wisdom in MEMORY.md

### Pillar 5: Reliability (Validation)
- **Read-back verification** after every file write
- **Executable proof** for all claims
- **Loop prevention** (max 3 attempts)
- **E2E testing** after implementation (MANDATORY for all code changes)
- Honest failure reporting

See: `/home/mdwzrd/wzrd.dev/E2E-INTEGRATION.md` for complete E2E testing framework

### Pillar 5.5: Resource Usage (NEW - CRITICAL)
- **Web search rate limiting**: Max 5 per task, 3 per 60s, 10 per 5min
- **Token monitoring**: Warn at 65%, critical at 75%
- **Tool efficiency**: Prefer local tools (Grep/Glob) over external (WebSearch)
- **No resource loops**: Stop and escalate when hitting limits

See `resource-usage.md` for complete limits

### Pillar 6: MCP
- External systems integration
- Knowledge base connections
- Tool augmentation

### Pillar 7: RAG
- Vector search for knowledge retrieval
- Semantic + keyword hybrid
- Context-aware results

### Pillar 8: Context
- Progressive disclosure
- Phase-based context
- Token economics (40/65/75% thresholds)

### Pillar 9: PRP Framework
- Prompt-Response-Process
- Structured workflows
- Reproducible patterns

### Pillar 10: Ultimate
- All pillars integrated
- End-to-end quality
- Production-ready standards

## Subskills

### Read-Back Verification
After EVERY file write operation:
1. Perform the write
2. IMMEDIATELY read back
3. Verify contents match intent
4. Only THEN claim success

See: `validation/read-back-verification.md`

### Executable Proof
Never claim something works without:
- Actual execution output shown
- Test results displayed
- File paths verified
- Screenshots for UI work

See: `validation/executable-proof.md`

### Loop Prevention
Maximum 3 attempts per task:
- Track each attempt
- Document failures
- Escalate after 3rd failure

See: `validation/loop-prevention.md`

### Context Monitoring
Token thresholds:
- 40%: Warn (consider summarizing)
- 65%: Strong warning (should summarize)
- 75%: Critical (must summarize now)

See: `context/context-monitoring.md`

## Non-Negotiable Rules

1. **Soul First**: Soul loads FIRST in system prompt, never diluted by operational content
2. **Read-Back Verification**: After every Write/Edit, read back to verify
3. **Executable Proof**: Never claim success without proof
4. **Loop Prevention**: Max 3 attempts, then escalate
5. **Honest Reporting**: Admit failures, don't hide errors
6. **Context Awareness**: Monitor token usage, summarize when needed
7. **Resource Limits**: NEVER exceed web search limits (5/task, 3/60s, 10/5min, 20/session)
8. **Experiential Soul**: Soul written as "I've learned X because Y" not rules
9. **Anti-Patterns in Soul**: 30-40% of soul defines what you refuse (catchable behaviors)

## Quick Reference

```
Soul Design? → Experiential: "I've learned X because Y"
File Write? → Read back to verify
Claim Works? → Show executable proof
Failed 3x? → Escalate to user
High Token Usage? → Summarize
Web Search? → Check limits first (5/task, 3/60s, 10/5min)
Resource Loop? → Stop and escalate immediately
Subagent Spawn? → Only for parallel independent work
Implementation Complete? → Run E2E tests (/e2e-test or see E2E-INTEGRATION.md)
```

## Documentation
Full Gold Standard documentation at: `/home/mdwzrd/claude-code-gold-standard/`

## Enforcement
To activate Gold Standard in a session, paste the contents of:
`/home/mdwzrd/.claude/PROMPT.txt`

---

**"Quality is not optional. Validation is mandatory. Proof is required."**
