---
name: context
description: Context monitoring, progressive disclosure, and token management
category: context
priority: P0
tags: [context, tokens, progressive-disclosure, monitoring]
subskills:
  - context-monitoring
  - progressive-disclosure
  - token-economics
---

# Context Skill

## Purpose
Monitor token usage, implement progressive disclosure, and manage context efficiently.

## Core Principle
**"Tokens are expensive. Use them wisely. Show metadata first, full content on demand."**

## Context Monitoring

### Token Thresholds

| Percentage | Action | Color |
|------------|--------|-------|
| 40% | Warning - Consider summarizing | Yellow |
| 65% | Strong warning - Should summarize | Orange |
| 75% | Critical - Must summarize now | Red |

### When to Summarize

**At 40%:**
- Consider summarizing old conversation
- Remove resolved tasks from active tracking
- Archive completed work

**At 65%:**
- Should summarize recent dialogue
- Condense task lists
- Keep only active work in focus

**At 75%:**
- Must summarize immediately
- Remove all non-essential context
- Keep only current task + critical info

### Summarization Template

```markdown
## Summary of [Session/Work]

**Completed:**
- Task A (verified working)
- Task B (tests passing)

**Currently Working On:**
- [ ] Task C - Description, status
- [ ] Task D - Description, status

**Key Decisions:**
- Decision 1 (brief note)
- Decision 2 (brief note)

**Next Steps:**
1. Complete Task C
2. Start Task D
```

## Progressive Disclosure

### Principle
Show metadata/summary first, full content only when requested.

### Pattern

```
User: "What files in the src directory?"

❌ BAD: Dumps full content of all files

✅ GOOD:
src/
├── auth.ts (245 lines) - Authentication service
├── user.ts (189 lines) - User model
├── api.ts (312 lines) - API endpoints
└── utils.ts (156 lines) - Helper functions

"Read any file with: @read src/auth.ts"
```

### When to Use Progressive Disclosure

**Search Results:**
```
Found 15 matches in 8 files:

✅ src/auth.ts - 5 matches
✅ src/user.ts - 3 matches
✅ src/api.ts - 7 matches

"Show full results with: @search --verbose"
```

**Knowledge Retrieval:**
```
Found 3 relevant docs:

📄 Authentication Guide (2500 words)
   → Covers: login, signup, password reset
   → Last updated: 2024-02-15

📄 API Reference (4500 words)
   → Covers: all endpoints, auth required
   → Last updated: 2024-02-18

"Read full doc with: @knowledge auth-guide"
```

**Code Lists:**
```
✅ Functions exported: 12
✅ Components: 8
✅ Tests: 24

"List all functions with: @list --detailed"
```

## Token Economics

### Token Costs (Approximate)

| Content | Cost | Strategy |
|---------|------|----------|
| 1 file read | ~100-500 tokens | Read only what's needed |
| Code search results | ~200-1000 tokens | Progressive disclosure |
| Skill documentation | ~500-2000 tokens | Load only relevant skills |
| Agent conversation | ~1000-5000 tokens | Summarize frequently |

### Cost-Saving Strategies

1. **Read Specific Ranges**
   ```typescript
   // Instead of reading entire file
   read_file("large.ts")

   // Read only what you need
   read_file("large.ts", { offset: 1, limit: 50 })
   ```

2. **Grep Instead of Read**
   ```bash
   # Don't read files to find things
   # Use grep to search
   grep -r "functionName" src/
   ```

3. **Load Skills On-Demand**
   ```
   Don't load all skills upfront.
   Load gold-standard first, then others as needed.
   ```

4. **Summarize Early**
   ```
   At 65% tokens, summarize.
   Don't wait until 75%+.
   ```

## Memory System Integration

### 4-Layer Memory

```
Layer 1: MEMORY_SUMMARY.md (500-1000 tokens)
   ↓ Auto-loaded at session start
   ↓ Current status, active projects

Layer 2: Daily Logs (memory/daily/YYYY-MM-DD.md)
   ↓ Session history, debugging only
   ↓ Loaded when investigating issues

Layer 3: RAG / Search
   ↓ Vector search for knowledge retrieval
   ↓ On-demand, not in context

Layer 4: MEMORY.md
   ↓ Curated wisdom, universal patterns
   ↓ Loaded when making architectural decisions
```

### When to Use Each Layer

| Layer | When to Load | What to Get |
|-------|--------------|-------------|
| Layer 1 | Session start | Current status, active work |
| Layer 2 | Debugging issues | Recent session history |
| Layer 3 | Knowledge needed | Search results, RAG |
| Layer 4 | Architecture | Long-term patterns, decisions |

## Context Management Examples

### Example 1: Large Codebase Search

```
User: "Find all authentication code"

❌ BAD:
- Reads every file in src/
- Dumps thousands of lines

✅ GOOD:
1. Use grep to search
2. Show file list with match counts
3. Offer to read specific files

Found authentication in:
- src/auth.ts (12 matches)
- src/middleware/auth.ts (8 matches)
- src/services/auth.service.ts (15 matches)

"Read specific file with: @read src/auth.ts"
```

### Example 2: Skill Loading

```
Starting session...
→ Load gold-standard skill (metadata first)

User: "I need to plan a feature"
→ Load planning skill (metadata first)

User: "Now help me implement it"
→ Load planning skill full content
→ Load coding skill (metadata first)

User: "Write tests for this"
→ Load testing skill (full content)
```

### Example 3: Token Threshold Hit

```
Current token usage: 71% (142,000 / 200,000)

⚠️ WARNING: Approaching context limit

Summarizing...

=== SESSION SUMMARY ===
Completed:
- ✅ User authentication (tests passing)
- ✅ API endpoints (documented)

In Progress:
- 🔄 Frontend UI (50% complete)

Key Context:
- Using TypeScript + Express
- JWT authentication
- PostgreSQL database

=== SUMMARY END ===

Token usage: 45% (90,000 / 200,000)
```

## Gold Standard Integration

### Read-Back Verification
- Verify token counts are accurate
- Confirm summarization captured key points

### Executable Proof
- Show token usage before/after summarization
- Demonstrate progressive disclosure working

### Loop Prevention
If context management fails:
1. Try more aggressive summarization
2. Remove non-essential skills
3. Escalate if still >75% tokens

## Context Checklist

Before expensive operations:
- [ ] Check current token usage
- [ ] Consider if search is better than read
- [ ] Use progressive disclosure for results
- [ ] Summarize if approaching thresholds

---

**"Tokens are the currency of context. Spend them wisely."**
