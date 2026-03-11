---
title: Learning Loop
priority: P0
dependencies: [gold-standard, context]
mode: always_active
progressive: true
---

# Learning Loop Skill

> **"How did this perform?" - The question that makes the system smarter**

---

## Purpose

After every deliverable, ask for feedback and log it to `/wzrd.dev/context/learnings.md`. This creates continuous improvement across the entire ecosystem.

---

## When to Use

**Trigger: After ANY deliverable is complete**

A deliverable is:
- Feature built and tested
- Bug fixed and verified
- Documentation written
- Research completed
- Architecture designed
- Test suite created

**If you say "Complete" or "Done" → You MUST invoke learning loop.**

---

## The Protocol

### Step 1: Ask the Question

```
"Deliverable complete. How did this perform?

a) Shipped as-is - No changes needed
b) Minor edits   - Small adjustments made
c) Rewrote significantly - Major changes required

Please respond with a, b, or c and optionally explain why."
```

### Step 2: Wait for Response

User will respond with:
- `a` → Shipped as-is (positive)
- `b` → Minor edits (neutral, note adjustments)
- `c` → Rewrote significantly (negative, flag for review)

### Step 3: Log to learnings.md

**Format:**
```yaml
---
date: 2026-02-19
mode: <current_mode>
skill: <skill_used>
agent: remi
session: <session_id>
deliverable: <what_was_delivered>
feedback: <a|b|c>
reason: <why_this_feedback>
next_action: <what_to_do_differently>
evidence: |
  <test_results, file_paths, actual_outcome>
---
```

### Step 4: Read-Back Verify

After writing to learnings.md:
1. Read back the entry
2. Verify it was written correctly
3. Only then claim success

---

## Feedback Handling

### (a) Shipped As-Is

**Meaning:** Perfect execution, no changes needed

**Action:**
- Log as positive reinforcement
- Pattern becomes immediately available
- Future sessions can replicate

**Example:**
```yaml
---
date: 2026-02-19
mode: coding
skill: typescript
agent: remi
deliverable: JSON Logger utility
feedback: a
shipped_as_is: true
reason: Tests passing (11/11), read-back verified
next_action: Continue using this pattern
evidence: |
  npm test: ✓ 11/11 passing
  Duration: 109ms
  Files: /wzrd.dev/remi/core/logger.ts
---
```

### (b) Minor Edits

**Meaning:** Mostly good, small adjustments made

**Action:**
- Log with adjustments noted
- Pattern becomes available with caveats
- Future sessions know what to adjust

**Example:**
```yaml
---
date: 2026-02-19
mode: coding
skill: typescript
agent: remi
deliverable: API endpoint
feedback: b
minor_edits: Added error handling
reason: Missing try/catch on edge case
next_action: Always include error handling on API endpoints
evidence: |
  Initial: 10/10 tests passing
  After edits: 10/10 tests passing + edge case covered
  Files: /wzrd.dev/src/api/user.ts
---
```

### (c) Rewrote Significantly

**Meaning:** Initial approach was wrong, major pivot

**Action:**
- Log as FLAGGED entry
- Pattern does NOT become available
- Requires 3+ confirmations before consideration
- Mark as "don't repeat" unless confirmed otherwise

**Example:**
```yaml
---
date: 2026-02-19
mode: coding
skill: typescript
agent: remi
deliverable: Auth system
feedback: c
flagged: true
reason: Initial approach used sessions, user wanted JWT
next_action: Use JWT for auth, not sessions
evidence: |
  Initial: Session-based auth (200 lines)
  Final: JWT-based auth (150 lines, user requirement)
  Reason: User explicitly requested JWT
  Status: FLAGGED - session-based auth not a pattern
---
```

---

## The Learning Loop Rules

### 1. Always Ask, Never Assume

**Don't assume it went well.**

Bad: "Complete! That went perfectly."
Good: "Complete! How did this perform? (a/b/c)"

### 2. Log Everything

**Every deliverable gets a log entry.**

- Even if it went perfectly (log it)
- Even if it was minor (log it)
- Especially if it failed (log it)

**No exceptions.**

### 3. Evidence Required

**No evidence = not logged.**

Must include:
- Test results (if applicable)
- File paths (what was changed)
- Actual outcome (what happened)

### 4. Read-Back Verify

**After writing, read back.**

```
1. Write to /wzrd.dev/context/learnings.md
2. Read back the entry
3. Verify contents match intent
4. Only THEN claim success
```

### 5. Flag the Bad

**(c) entries get FLAGGED.**

- Don't become patterns
- Marked as "flagged: true"
- Require 3+ confirmations
- Prevent repetition of mistakes

---

## Integration with Modes

### Planning Mode Deliverables

After creating a plan:
```
"Plan created. How did this perform? (a/b/c)"
```

Log:
- mode: planning
- skill: planning
- deliverable: "Plan for X"

### Coding Mode Deliverables

After implementing a feature:
```
"Feature built. How did this perform? (a/b/c)"
```

Log:
- mode: coding
- skill: <language>
- deliverable: "Feature X"

### Testing Mode Deliverables

After writing tests:
```
"Tests created. How did this perform? (a/b/c)"
```

Log:
- mode: testing
- skill: testing
- deliverable: "Test suite for X"

### Documentation Mode Deliverables

After writing docs:
```
"Documentation written. How did this perform? (a/b/c)"
```

Log:
- mode: documentation
- skill: documentation
- deliverable: "Docs for X"

---

## Pattern Confirmation

### How Patterns Become Confirmed

1. **(a) entries** → Confirmed immediately (auto-approved)
2. **(b) entries** → Confirmed with notes (become patterns)
3. **(c) entries** → Require 3+ confirmations
   - Must be replicated successfully 3+ times
   - Across different sessions
   - Then becomes pattern

### Moving from learnings.md to MEMORY.md

**MEMORY.md = Curated wisdom (only proven patterns)**

**Criteria:**
- Multiple confirmations (3+ sessions)
- Pattern stability across time
- No contradictory evidence

**Process:**
```
1. Pattern emerges in learnings.md
2. Confirmed across multiple sessions
3. Proven stable over time
4. Curated into MEMORY.md
```

---

## Example: Complete Learning Loop

### Scenario: Building JSON Logger

```
Me: "Shifting to coding mode..."
    [Implement JSON logger]
    [Write tests]
    [Run tests: 11/11 passing]

Me: "JSON logger complete. How did this perform?

a) Shipped as-is - No changes needed
b) Minor edits   - Small adjustments made
c) Rewrote significantly - Major changes required"

User: "a"

Me: [Writes to /wzrd.dev/context/learnings.md]

---
date: 2026-02-19
mode: coding
skill: typescript
agent: remi
deliverable: JSON Logger utility
feedback: a
shipped_as_is: true
reason: Tests passing (11/11), read-back verified
next_action: Continue using this pattern
evidence: |
  npm test: ✓ 11/11 passing
  Duration: 109ms
  Files: /wzrd.dev/remi/core/logger.ts
---

Me: "Reading back... confirmed at line 42"
    "Learning logged. Pattern: Use npx tsx --test for TypeScript"
```

---

## Anti-Patterns (What NOT to Do)

### ❌ Don't Skip the Question

Bad: "Done! Moving on."
Good: "Done! How did this perform? (a/b/c)"

### ❌ Don't Log Without Evidence

Bad: "Logged to learnings.md" (no evidence shown)
Good: "Logged with evidence: 11/11 tests passing"

### ❌ Don't Assume (a)

Bad: "That went great! Logging as (a)..."
Good: "How did this perform? (a/b/c)"

### ❌ Don't Forget Read-Back

Bad: "Logged to learnings.md"
Good: "Logged to learnings.md. Reading back... confirmed."

---

## Checklist: After Every Deliverable

- [ ] Deliverable complete and verified
- [ ] Ask: "How did this perform? (a/b/c)"
- [ ] Receive feedback from user
- [ ] Write to /wzrd.dev/context/learnings.md
- [ ] Include all required fields
- [ ] Include evidence
- [ ] Read-back verify
- [ ] Confirm success

---

## Session ID Format

**Format:** `{date}-{abbreviated-description}`

**Examples:**
- `2026-02-19-json-logger`
- `2026-02-19-auth-system`
- `2026-02-19-trading-bot`

**Purpose:** Track sessions over time, identify patterns.

---

## Summary

**The learning loop is simple:**

1. **After every deliverable, ask:** "How did this perform? (a/b/c)"
2. **Log the feedback** to `/wzrd.dev/context/learnings.md`
3. **Read-back verify** the entry
4. **Patterns emerge** over time
5. **System gets smarter** with every loop

**This is how WZRD.dev learns from experience.**

---

**This skill is always active. Invoke after EVERY deliverable.**
