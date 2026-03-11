---
name: context-monitoring
description: Monitor context usage at 40%, 65%, 75% thresholds
category: context
priority: P0
tags: [gold-standard, context, memory, token-optimization]
---

# Context Monitoring Protocol

## Purpose
Prevent context bloat and maintain performance by monitoring token usage.

## Thresholds

### 40% Warning
**Action:** Consider summarizing current context
**Message:** "Context at 40%. Consider summarizing recent work to MEMORY_SUMMARY.md"

### 65% Warning
**Action:** Should summarize soon
**Message:** "Context at 65%. Should summarize to MEMORY_SUMMARY.md now to prevent issues"

### 75% Critical
**Action:** Auto-summarize immediately
**Message:** "CRITICAL: Context at 75%. Auto-summarizing to MEMORY_SUMMARY.md now"

## Auto-Summarization Protocol

When context reaches 75%:

1. **Stop all work**
   ```python
   if context_usage > 0.75:
       halt_work()
   ```

2. **Summarize to MEMORY_SUMMARY.md**
   ```python
   summary = generate_summary({
       "keep_recent": 7,  # Last 7 days
       "target_tokens": 500,  # Reduce to 500
       "preserve": ["decisions", "active_projects", "pending_tasks"]
   })

   update_memory_summary(summary)
   ```

3. **Archive older context**
   ```python
   archive_to_daily_logs({
       "older_than": 7,  # Days
       "destination": "memory/YYYY-MM-DD.md"
   })
   ```

4. **Reduce context to ~500 tokens**
   ```python
   trim_context({"target": 500})
   ```

5. **Resume work**
   ```python
   resume_work()
   ```

## Memory Layers

### Layer 1: Agent Context (Always Available, Zero Query Cost)
**What it is:** What each agent has loaded into context at all times.

**Components:**
- MEMORY_SUMMARY.md (500-1000 tokens)
- Daily logs (last 7 days)
- Agent identity files (SOUL.md, PRINCIPLES.md, SKILLS.md, etc.)

**Characteristics:**
- Zero query cost (always loaded)
- Instant access (no RAG latency)
- Perfect for recent context

### Layer 2: Daily Logs (Indexed by Archon, Debugging Only)
**What it is:** Timestamped session history for post-mortem analysis.

**File format:** `memory/YYYY-MM-DD.md`

**Characteristics:**
- NOT loaded into agent context
- Indexed by Archon for RAG queries
- Perfect for debugging and audits

### Layer 3: Archon Knowledge (RAG Retrieval, Searchable from Day 1)
**What it is:** Central knowledge base with smart retrieval.

**Components:**
- Projects (metadata, tasks, artifacts)
- Tasks (dependencies, priority, status)
- Knowledge (patterns, best practices)
- RAG engine (BM25 + vectors + reranking)

**Access pattern:**
```typescript
const results = await archon.ragQuery({
  query: 'What did we decide about X?',
  topK: 3,  // Only top 3 results
  threshold: 0.7,  // Relevance threshold
  filters: { tags: ['architecture'], project_id: null }
})
```

### Layer 4: MEMORY.md (Curated Wisdom, Per-Agent)
**What it is:** Distilled long-term wisdom, patterns that ALWAYS apply.

**Purpose:** Permanent knowledge that transcends specific projects.

**When updated:**
- Pattern observed 3+ times successfully
- Pattern validated across multiple agents
- Pattern is universal (applies to any project)

## Token Budgeting

### Context Window: 128K tokens

**Layer 1 Budget: 1000 tokens**
- MEMORY_SUMMARY.md: 500-1000
- Daily logs: 0 tokens (not loaded)
- Agent files: minimal (loaded once)

**Layer 3 Budget: Variable (Archon Queries)**
- Top-K=3: ~600-900 tokens average
- Progressive disclosure: reduces full-content requests
- Metadata filtering: reduces irrelevant results

### Monitoring Implementation

```python
class ContextMonitor:
    def __init__(self, max_tokens: int = 128000):
        self.max_tokens = max_tokens
        self.thresholds = {
            'warn': 0.40,
            'should_summarize': 0.65,
            'critical': 0.75
        }

    def check(self) -> float:
        """Return context usage as percentage (0-100)"""
        current = get_current_context_size()
        return current / self.max_tokens

    def get_action(self, usage: float) -> str:
        """Determine action based on usage"""
        if usage > self.thresholds['critical']:
            return 'summarize_now'
        elif usage > self.thresholds['should_summarize']:
            return 'should_summarize'
        elif usage > self.thresholds['warn']:
            return 'consider_summarizing'
        else:
            return 'ok'

# Usage
monitor = ContextMonitor()

usage = monitor.check()
action = monitor.get_action(usage)

if action == 'summarize_now':
    auto_summarize()
elif action == 'should_summarize':
    notify("Should summarize soon")
elif action == 'consider_summarizing':
    log("Consider summarizing current context")
```

## Progressive Disclosure

When retrieving from Archon (Layer 3):

1. **Search returns metadata only**
   ```typescript
   const results = await archon.ragQuery({
     query: 'trading strategies',
     topK: 3
   })

   // Each result has metadata
   results[0] = {
     content: 'Stop-loss mechanisms...',
     metadata: {
       type: 'strategy',
       source_agent: 'renata',
       date: '2026-02-15',
       tags: ['trading', 'risk']
     }
   }
   ```

2. **Agent decides if full content needed**
   ```typescript
   if (results[0].metadata.relevant) {
     // Request full content
     const full = await archon.getKnowledge(results[0].id)
   } else {
     // Use snippet only (saves tokens)
     use(results[0].content)
   }
   ```

## Why This Matters

- **Prevents context bloat** - Agents don't load everything
- **Maintains performance** - Relevant info, not noise
- **Token efficiency** - Cheaper, faster operations
- **Prevents cutoffs** - Agent never hits 75% and fails

## Gold Standard Rule
"Every token must earn its place in context"

## Context
This skill implements Gold Standard Pillar 4 (Memory & Context) and Pillar 8 (Advanced Context Engineering).

See:
- `/home/mdwzrd/claude-code-gold-standard/04-real-memory-context.md`
- `/home/mdwzrd/claude-code-gold-standard/08-advanced-context-engineering.md`
- `/home/mdwzrd/.openclaw/workspace/PLANS/final-build-plans/ARCHITECTURE.md` (4-layer memory system)
