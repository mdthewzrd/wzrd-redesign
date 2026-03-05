---
name: handoff-protocol
description: Transfer work between agents with clear state tracking
category: orchestration
priority: P0
tags: [orchestration, handoff, agents, gold-standard]
---

# Agent Handoff Protocol

## Purpose
Transfer work between agents with clear acknowledgment, state tracking, and timeout handling.

## When to Use
- One agent completes work, next agent needs to continue
- Phase transitions in workflow (planning → research → architect → build → test)
- Task requires multiple agents with different expertise

## Handoff State Machine

```
┌─────────────────────────────────────────────────────────────┐
│                    HANDOFF PROTOCOL                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. SENDER: Create handoff task in Archon                   │
│     - Mark current task: "awaiting_handoff"                 │
│     - Store handoff details (task_id, to_agent, context)    │
│                                                              │
│  2. SENDER: @mention receiver agent with task details       │
│     - Include: task_id, summary, artifacts, dependencies    │
│                                                              │
│  3. RECEIVER: Mark handoff task: "in_progress"              │
│     - Acknowledge within 2 minutes                          │
│                                                              │
│  4. SENDER: Wait for acknowledgment (2 min timeout)         │
│     - If timeout: Escalate to Remi                          │
│                                                              │
│  5. RECEIVER: Acknowledge handoff                           │
│     - Confirm: Task received, starting work                │
│                                                              │
│  6. SENDER: Mark original task: "handed_off"                │
│     - Transfer ownership complete                           │
│                                                              │
│  7. RECEIVER: Execute task                                  │
│     - Work on assigned task                                 │
│                                                              │
│  8. RECEIVER: Mark task: "complete" (when done)            │
│     - Provide evidence (Gold Standard)                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Example

### Planning → Research Handoff

**Sender:** Sadie (Planning Agent)
**Receiver:** Raya (Research Agent)

**Step 1: Sadie creates handoff task**
```
Task ID: 123
Status: "awaiting_handoff"
Handoff to: @raya
Context: PRD complete, need market research
Artifacts: PRD document (ID: 456)
```

**Step 2: Sadie @mentions Raya**
```
@raya Handoff: PRD complete for trading bot (Task 123)
- Requirements defined (see PRD:456)
- Need market research on trading strategies
- Focus on crypto markets, momentum strategies
- Dependencies: None (can start immediately)
```

**Step 3: Raya acknowledges**
```
@remi Handoff received (Task 123)
- Starting market research now
- ETA: 2 hours
```

**Step 4: Sadie marks task complete**
```
Task 123: "handed_off"
Transfer complete to @raya
```

**Step 5: Raya completes research**
```
Task 123: "complete"
Evidence: Market research document (ID: 789)
- 5 trading strategies analyzed
- 3 competitors researched
- Recommendations provided
```

## Timeout Handling

### 2-Minute Acknowledgment Timeout
```
If receiver doesn't acknowledge in 2 minutes:
1. Escalate to Remi
2. Remi investigates (agent down? busy?)
3. Remi assigns backup agent or waits
4. Original sender notified
```

### 30-Minute Completion Timeout
```
If task not complete in 30 minutes:
1. Receiver sends status update
2. If blocked: Escalate to Remi
3. Remi assists or reassigns
4. Original sender kept informed
```

## Failure Recovery

### Receiver Unavailable
```
1. Remi detects agent unresponsive
2. Remi assigns backup agent
3. Handoff restarted with backup
4. Original sender notified
```

### Task Cannot Be Completed
```
1. Receiver identifies blocker
2. Receiver escalates to Remi immediately
3. Remi coordinates resolution
4. Handoff preserved (don't lose context)
```

## Best Practices

- **Always use Archon** for handoff state tracking
- **Include full context** in handoff message
- **Acknowledge immediately** (within 2 minutes)
- **Report blockers** early (don't wait until timeout)
- **Preserve artifacts** (attach all work products)

## Anti-Patterns

❌ Don't skip @mention (receiver won't know)
❌ Don't forget acknowledgment (sender will timeout)
❌ Don't lose artifacts (attach all work to Archon)
❌ Don't ignore timeouts (escalate immediately)

## Gold Standard Integration

This skill works with:
- Pillar 2 (Subagents) - Agent coordination
- Pillar 5 (Validation) - Evidence preserved in handoffs
- Pillar 10 (Ultimate Workflow) - Phase transitions
