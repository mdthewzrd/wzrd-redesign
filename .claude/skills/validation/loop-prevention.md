---
name: loop-prevention
description: Max 3 attempts per task, then escalate
category: validation
priority: P0
tags: [gold-standard, validation, loop-prevention]
---

# Loop Prevention Protocol

## Purpose
Prevent infinite loops and wasted time by limiting attempts per task.

## Rule
Maximum 3 attempts to complete any task. After 3 failed attempts, ESCALATE.

## Implementation

### Attempt Tracking
Track attempts for each task:
```
Task: Implement feature X
├─ Attempt 1: Direct approach → Failed (error Y)
├─ Attempt 2: Alternative method → Failed (error Z)
└─ Attempt 3: Last resort → Failed (error W)
→ ESCALATE TO USER
```

### Escalation Message Template
```
I've attempted this task 3 times without success. I need your guidance:

**Task:** [task description]

**Attempt 1:**
- Approach: [what I tried]
- Result: [what happened]
- Error: [if any]

**Attempt 2:**
- Approach: [alternative I tried]
- Result: [what happened]
- Error: [if any]

**Attempt 3:**
- Approach: [last resort method]
- Result: [what happened]
- Error: [if any]

**Please advise:**
- Should I try a different approach?
- Is there additional context I need?
- Should we skip this task for now?
```

## Examples

### Example 1: Code Implementation
```
Task: Implement user authentication

Attempt 1: Use library X
Result: Failed - library doesn't support required feature

Attempt 2: Custom implementation
Result: Failed - missing dependency Y

Attempt 3: Alternative library Z
Result: Failed - incompatible with our database

→ ESCALATE: "I've tried 3 authentication approaches without success.
            Library X lacks features, custom implementation has dependency issues,
            library Z is incompatible. How should we proceed?"
```

### Example 2: File Operation
```
Task: Create config file

Attempt 1: Write to /etc/config
Result: Failed - permission denied

Attempt 2: Write to ~/.config
Result: Failed - directory doesn't exist

Attempt 3: Create directory then write
Result: Failed - still permission issues

→ ESCALATE: "I've tried 3 approaches to create the config file.
            Permission denied on /etc, ~/.config doesn't exist,
            can't create directory. Where should I put this file?"
```

## Red Flags Indicating Need to Escalate

- Same error occurring repeatedly
- Running in circles with same approach
- Making no progress after multiple attempts
- Hitting same blocker each time
- No clear path forward

## When to Escalate Sooner

Escalate immediately (don't wait for 3 attempts) if:
- Security risk detected
- Data loss risk
- Critical system failure
- Unclear requirements
- Missing dependencies that can't be resolved
- Permission issues that block all approaches

## Loop Detection Patterns

### Patterns That Indicate Loops
- Trying same thing with minor variations
- Ignoring previous failures
- Not adapting approach based on errors
- Continuing without new information
- Repeating mistakes

### Breaking Out of Loops
1. Recognize you're in a loop (3 attempts same outcome)
2. Stop and reassess
3. Escalate to user with full context
4. Wait for guidance before continuing

## Gold Standard Rule
"Better to ask for help after 3 failed attempts than to waste time in an infinite loop."

## Context
This skill is part of Gold Standard Pillar 5: Reliability & Validation.
See: /home/mdwzrd/claude-code-gold-standard/05-reliability-honest-validation.md
