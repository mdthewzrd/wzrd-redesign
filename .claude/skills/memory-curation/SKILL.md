---
name: memory-curation
description: Memory management, pattern extraction, archiving, and wisdom curation
category: operations
priority: P0
tags: [memory, curation, archiving, patterns, wisdom]
dependencies: [context, learning-loop]
---

# Memory Curation Skill

## Purpose

Extract patterns from learnings.md, curate into MEMORY.md, archive old content, and ensure WZRD.dev gets smarter over time.

## Core Principle

**"Raw data is noise. Curated wisdom is signal. Extract the signal, archive the noise."**

---

## The Curation Pipeline

```
           ┌─────────────────────────────────────────┐
           │            Raw Input Sources            │
           └─────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
  ┌──────────┐       ┌──────────┐        ┌──────────┐
  │learnings │       │  Daily   │        │ assets   │
  │  .md     │       │  Logs    │        │  .md     │
  └──────────┘       └──────────┘        └──────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            ▼
                 ┌─────────────────────┐
                 │   Memory Curator    │
                 │  (extraction +      │
                 │   filtering)        │
                 └─────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
     ┌──────────┐    ┌──────────┐    ┌──────────┐
     │MEMORY.md │    │ MEMORY   │    │ archive/ │
     │(curated) │    │_SUMMARY  │    │(preserved)│
     └──────────┘    └──────────┘    └──────────┘
```

---

## Phase 1: Pattern Extraction

### What Gets Extracted

From `/wzrd.dev/context/learnings.md`:

```yaml
entry_with_feedback_a:
  confirmed: true
  action: "extract_to_memory"

entry_with_feedback_b:
  confirmed: true
  action: "extract_to_memory_with_notes"

entry_with_feedback_c:
  confirmed: false
  action: "flagged_do_not_extract"
```

### Extraction Rules

**Auto-Extract (Feedback = a):**
- Appeared 1+ time → Candidate for MEMORY.md
- Add to pattern queue

**Extract with Notes (Feedback = b):**
- Note the adjustments made
- Add to pattern queue with caveats

**Flag for Review (Feedback = c):**
- Don't extract to MEMORY.md
- Keep visible in learnings.md (don't repeat)
- Mark as `flagged: true`

### Pattern Confirmation Logic

```typescript
interface Pattern {
  description: string;
  count: number;
  sessions: string[];
  evidence: EvidenceEntry[];
  status: "candidate" | "confirmed" | "flagged";
}

function extractPatterns(learnings: LearningEntry[]): Pattern[] {
  const patternMap = new Map<string, Pattern>();

  for (const entry of learnings) {
    if (entry.feedback === 'c') continue;  // Skip flagged

    const key = patternKey(entry);  // "use tsx for typescript tests"

    if (!patternMap.has(key)) {
      patternMap.set(key, {
        description: key,
        count: 0,
        sessions: [],
        evidence: [],
        status: "candidate"
      });
    }

    const pattern = patternMap.get(key);
    pattern.count++;
    pattern.sessions.push(entry.session);
    pattern.evidence.push(entry);

    // Confirm after 3+ appearances across different sessions
    if (pattern.count >= 3 && new Set(pattern.sessions).size >= 2) {
      pattern.status = "confirmed";
    }
  }

  return Array.from(patternMap.values());
}
```

---

## Phase 2: MEMORY.md Curation

### What Goes Into MEMORY.md

**Criteria:**
- ✅ 3+ confirmations across sessions
- ✅ Pattern stable over time
- ✅ No contradictory evidence
- ✅ Actionable and specific

**Does NOT go in:**
- ❌ Single occurrences (not patterns yet)
- ❌ Context-specific edge cases
- ❌ Flagged entries (c feedback)
- ❌ Contradicted by newer evidence

### MEMORY.md Structure

```markdown
# WZRD.dev Memory

> **Curated wisdom - proven patterns only**

---

## Technical Patterns

### TypeScript Development
- **Use npx tsx --test for TypeScript tests** (confirmed 5x)
  - Why: node --test fails with module resolution
  - Evidence: JSON logger (11/11 tests passing)

### API Development
- **JWT over sessions for auth** (confirmed 3x)
  - Why: Statelessness, easier scaling
  - Evidence: Trading bot auth, user service

## Architecture Patterns

### Project Structure
- **Shared context directory** (confirmed 4x)
  - Location: /wzrd.dev/context/
  - Files: voice-profile, positioning, technical-stack, etc.

## Communication Patterns

### Code Review
- **Read-back verify all writes** (confirmed 8x)
  - Why: Catches 90% of hallucinations
  - Process: Write → Read → Verify → Confirm
```

---

## Phase 3: MEMORY_SUMMARY.md Update

### Purpose

MEMORY_SUMMARY.md is the **auto-loaded** context (~1000 tokens). It's a compressed view of MEMORY.md.

### Update Process

```typescript
async function updateMemorySummary(memory: Memory): Promise<string> {
  const summary = {
    recent_patterns: memory.patterns.slice(-10),  // Last 10
    key_decisions: memory.decisions.filter(d => d.age < 30),  // Last 30 days
    active_projects: memory.projects.filter(p => p.status === "active"),
    tech_stack: memory.tech_stack,
  };

  return formatSummary(summary);  // Target ~1000 tokens
}
```

### Template

```markdown
# WZRD.dev Memory Summary

> **Auto-loaded at session start**

## Recent Patterns (Last 10)
- Use tsx for TypeScript tests
- Read-back verify all writes
- Shared context per mode
- Optimistic concurrency

## Key Decisions (Last 30 Days)
- No Archon RAG (2026-02-18) - Use agentic search
- Skills-based architecture (2026-02-18) - Role-shifting over specialists

## Active Projects
- Gateway V2 (running)
- Memory Curator (in progress)

## Tech Stack
TypeScript, Node.js 20+, Express, PostgreSQL

---
*Generated: 2026-02-19 | Tokens: 1,047*
```

---

## Phase 4: Archival

### What Gets Archived

```yaml
archive_triggers:
  age_days: 90
  confirmed_in_memory: true
  superseded: true

archive_locations:
  learnings: /wzrd.dev/memory/archive/learnings/YYYY/MM/
  daily_logs: /wzrd.dev/memory/archive/daily/YYYY/QQ/
  assets: /wzrd.dev/memory/archive/assets/YYYY/MM/
```

### Archive Process

```typescript
async function archiveLearnings(learnings: LearningEntry[]): Promise<ArchiveResult> {
  const toArchive = learnings.filter(entry => {
    const age = daysSince(entry.date);
    const confirmed = isConfirmedInMemory(entry);

    // Archive if: (90+ days old AND confirmed) OR (superseded)
    return (age >= 90 && confirmed) || isSuperseded(entry);
  });

  // Group by month
  const byMonth = groupBy(toMonth);

  // Move to archive
  for (const [month, entries] of Object.entries(byMonth)) {
    const archivePath = `/wzrd.dev/memory/archive/learnings/${month}.md`;
    await appendToFile(archivePath, formatEntries(entries));
  }

  // Remove from learnings.md
  await removeFromLearnings(toArchive);

  return { archived: toArchive.length };
}
```

### Archive Format

```markdown
# Archive: 2025-11

## Archived Entries

### Learning 001: Use tsx for TypeScript tests
```yaml
---
date: 2025-11-15
feedback: a
confirmed: true
archived: 2026-02-19 (moved to MEMORY.md)
---
```

---

## Curator Job (Daily @ 2 AM)

### Job Definition

```yaml
name: memory-curator
schedule: "0 2 * * *"
timeout: 300
phases:
  - extract_patterns
  - update_memory
  - update_summary
  - archive_old
```

### Execution Flow

```typescript
async function runMemoryCurator(): Promise<CuratorResult> {
  const start = Date.now();

  // Phase 1: Extract patterns
  const learnings = await loadLearnings();
  const patterns = extractPatterns(learnings);
  const confirmed = patterns.filter(p => p.status === "confirmed");

  // Phase 2: Update MEMORY.md
  for (const pattern of confirmed) {
    await addToMemory(pattern);
  }

  // Phase 3: Update MEMORY_SUMMARY.md
  await updateMemorySummary();

  // Phase 4: Archive old
  const archived = await archiveLearnings(learnings);

  return {
    duration: Date.now() - start,
    patterns_extracted: confirmed.length,
    entries_archived: archived.length,
  };
}
```

---

## Manual Curation

### CLI Commands

```bash
# Show pending patterns
npx curator pending

# Confirm specific pattern
npx curator confirm "use tsx for typescript tests"

# Show archive candidates
npx curator archive-candidates

# Run full curation manually
npx curator run --verbose

# Show memory health
npx curator health
```

### Pending Patterns Output

```
Pending Patterns (awaiting confirmation):

  ✓ [3/3] Use tsx for TypeScript tests
    Sessions: logger-build, auth-api, user-service
    Confirm: npx curator confirm "Use tsx..."

  ⚠ [2/3] JWT over sessions (need 1 more)
    Sessions: trading-bot, auth-api
    Status: Not yet confirmed

  ✓ [5/5] Read-back verify all writes
    Sessions: [5 different sessions]
    Confirm: npx curator confirm "Read-back..."
```

---

## Memory Health Metrics

### What Gets Tracked

```yaml
memory_health:
  memory_summary_size: 1047  # tokens (target < 1500)
  learnings_count: 127
  memory_patterns: 43
  archive_size_gb: 2.3
  learning_rate: 3.2  # patterns/week
  staleness_rate: 0.8  # % entries > 90 days
```

### Health Checks

```typescript
interface MemoryHealth {
  status: "healthy" | "warning" | "critical";
  metrics: MemoryMetrics;
  alerts: string[];
  recommendations: string[];
}

function checkMemoryHealth(): MemoryHealth {
  const alerts = [];
  const recommendations = [];

  if (metrics.memory_summary_size > 1500) {
    alerts.push("MEMORY_SUMMARY.md too large (>1500 tokens)");
    recommendations.push("Summarize now");
  }

  if (metrics.learning_rate < 1) {
    alerts.push("Learning rate low (<1 pattern/week)");
    recommendations.push("Check learning loop is active");
  }

  if (metrics.staleness_rate > 0.5) {
    recommendations.push("Run archive to clean old entries");
  }

  return {
    status: alerts.length === 0 ? "healthy" : "warning",
    metrics,
    alerts,
    recommendations,
  };
}
```

---

## Conflict Resolution

### Contradictory Patterns

When two patterns contradict:

```yaml
conflict_example:
  pattern_a: "Use PostgreSQL for all data"
  pattern_b: "Use Redis for caching"
  resolution: "Not contradictory - different use cases"

conflict_example:
  pattern_a: "Always use TypeScript"
  pattern_b: "Use Python for ML"
  resolution: "Context-specific - document when to use each"
```

### Resolution Process

1. **Detect conflict** (automatic)
2. **Flag for review** (manual intervention)
3. **Create incident report** in `/wzrd.dev/ops/incidents/`
4. **Resolve** by:
   - Merging (both true in different contexts)
   - Deprecating (one is outdated)
   - Clarifying (add context)

---

## Curation Logging

All curation activities logged to:

```
/wzrd.dev/memory/curator/logs/
├── 2026-02-19-curation.log
└── curator-history.log
```

**Log format:**
```yaml
---
timestamp: 2026-02-19T02:00:00Z
job: memory-curator
status: success
duration: 45.2s
patterns_extracted: 3
patterns_confirmed: 2
entries_archived: 12
memory_summary_updated: true
alerts: []
---
```

---

## Gold Standard Compliance

### Read-Back Verification
- After MEMORY.md update, read back to verify
- After archival, confirm archive file created
- Verify MEMORY_SUMMARY.md under token limit

### Executable Proof
- Show patterns extracted: `npx curator pending`
- Show memory health: `npx curator health`
- Show curation history: `npx curator history`

### Loop Prevention
If curation fails:
1. Retry once with increased timeout
2. If fails again, stop and alert
3. Don't auto-retry (could corrupt memory)

---

## Curation Checklist

After every curation run:
- [ ] Patterns extracted correctly
- [ ] MEMORY.md read-back verified
- [ ] MEMORY_SUMMARY.md under token limit
- [ ] Archives created successfully
- [ ] No contradictions introduced
- [ ] Health metrics updated
- [ ] Log entry written

---

## Summary: The Curation Cycle

```
Daily @ 2 AM:
  1. Extract patterns from learnings.md
  2. Confirm patterns (3+ sessions)
  3. Add confirmed to MEMORY.md
  4. Update MEMORY_SUMMARY.md (~1000 tokens)
  5. Archive old content to archive/
  6. Log everything
  7. Report health

Result:
  ✅ System gets smarter (MEMORY.md grows)
  ✅ Context stays clean (MEMORY_SUMMARY.md)
  ✅ Nothing lost (archive/ preserved)
  ✅ Health monitored (metrics tracked)
```

---

**"Curate wisdom, archive everything, keep context clean. The system learns while staying fast."**
