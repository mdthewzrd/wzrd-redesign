---
name: parallel-execution
description: Execute independent tasks simultaneously for efficiency
category: orchestration
priority: P0
tags: [orchestration, parallel, efficiency, gold-standard]
---

# Parallel Execution

## Purpose
Speed up work by executing independent tasks simultaneously instead of sequentially.

## When to Use
- Multiple tasks can run independently
- Tasks don't depend on each other's output
- Want to reduce total completion time

## Process

### 1. Identify Tasks
```
Input: 5 tasks to complete
- Task A: Market research
- Task B: Competitor analysis
- Task C: Tech stack research
- Task D: Database design
- Task E: API design
```

### 2. Build Dependency Graph
```
Dependencies:
- Task A: No dependencies
- Task B: No dependencies
- Task C: No dependencies
- Task D: Depends on Task A (market research informs data needs)
- Task E: No dependencies
```

### 3. Identify Parallel Groups
```
Group 1 (can run immediately):
- Task A (@raya)
- Task B (@raya)
- Task C (@raya)
- Task E (@ted)

Group 2 (must wait for Group 1):
- Task D (@ted) [depends on: Task A]
```

### 4. Execute in Parallel
```python
# Single message with multiple Task calls
Task("raya", "Market research for trading bot")
Task("raya", "Competitor analysis for trading bots")
Task("raya", "Tech stack research for real-time trading")
Task("ted", "Design API interfaces for trading system")

# All execute simultaneously
```

### 5. Aggregate Results
```python
# Wait for all to complete
results = await all_tasks()

# Aggregate
market_research = results[0]
competitor_analysis = results[1]
tech_stack = results[2]
api_design = results[3]
```

## Performance Gain

```
Sequential: 4 hours total
- Task A: 1 hour → Task B: 1 hour → Task C: 1 hour → Task E: 1 hour

Parallel: 1 hour total
- Task A, B, C, E all run at same time (1 hour each)

Speedup: 4x faster
```

## Best Practices

- Identify dependencies explicitly (prevent blocking)
- Use same agent for similar tasks (reduce context loading)
- Limit parallel tasks to 4-6 (don't overwhelm system)
- Handle partial failures (one task fails shouldn't block others)

## Anti-Patterns

❌ Don't parallelize dependent tasks (will cause failures)
❌ Don't spawn too many tasks at once (resource exhaustion)
❌ Don't ignore failures (must handle gracefully)
❌ Don't assume order (results can complete in any order)

## Gold Standard Integration

This skill works with:
- Pillar 3 (Parallel Processing) - Core parallel execution pattern
- Pillar 2 (Subagents) - Spawn multiple agents simultaneously
- Pillar 9 (PRP Framework) - Parallel workflows in Process phase
