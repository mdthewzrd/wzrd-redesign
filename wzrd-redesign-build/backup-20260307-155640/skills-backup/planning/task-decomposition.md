---
name: task-decomposition
description: Break down complex goals into small, actionable tasks
category: planning
priority: P0
tags: [planning, decomposition, tasks, gold-standard]
---

# Task Decomposition

## Purpose
Break down complex goals into small, actionable tasks that can be assigned to specialized agents.

## When to Use
- User provides high-level goal ("build a trading bot")
- Need to identify all required work
- Need to determine task dependencies
- Need to assign work to appropriate agents

## Process

### 1. Understand the Goal
```
Input: "Build a trading bot"

Questions to ask:
- What type of trading? (crypto, stocks, forex)
- What strategies? (momentum, mean-reversion, arbitrage)
- What exchanges? (Binance, Coinbase, etc.)
- What risk limits? (position sizing, stop-loss)
- What frequency? (HFT, swing, long-term)
```

### 2. Identify Required Work
```
Phases:
1. Research → Raya agent
2. Architecture → Ted agent
3. Implementation → Arya agent
4. Testing → Chet agent
5. Documentation → Archie agent
6. Deployment → Remi coordinates
```

### 3. Break Down into Tasks
```
Research Phase:
- Task 1: Market research (trading strategies)
- Task 2: Exchange API research
- Task 3: Competitor analysis

Architecture Phase:
- Task 4: System design
- Task 5: Database schema
- Task 6: API interfaces

Implementation Phase:
- Task 7: Core trading logic
- Task 8: Exchange integration
- Task 9: Risk management
- Task 10: Backtesting

Testing Phase:
- Task 11: Unit tests
- Task 12: Integration tests
- Task 13: Paper trading

Documentation Phase:
- Task 14: API documentation
- Task 15: User guide
- Task 16: Operations manual
```

### 4. Identify Dependencies
```
Task 2 (Exchange API) must complete before Task 6 (API interfaces)
Task 4 (System design) must complete before Task 7 (Trading logic)
Tasks 1, 2, 3 can run in parallel (no dependencies)
```

### 5. Assign to Agents
```
Research → @raya
Architecture → @ted
Implementation → @arya
Testing → @chet
Documentation → @archie
```

## Output Format

```markdown
## Project: Trading Bot

### Tasks (15 total)

#### Research Phase (3 tasks, can run in parallel)
- [ ] Task 1: Market research (@raya)
- [ ] Task 2: Exchange API research (@raya)
- [ ] Task 3: Competitor analysis (@raya)

#### Architecture Phase (2 tasks, depends on Research)
- [ ] Task 4: System design (@ted) [depends on: 1,2,3]
- [ ] Task 5: Database schema (@ted) [depends on: 4]

#### Implementation Phase (4 tasks, depends on Architecture)
- [ ] Task 6: API interfaces (@arya) [depends on: 5]
- [ ] Task 7: Trading logic (@arya) [depends on: 4,5]
- [ ] Task 8: Exchange integration (@arya) [depends on: 6]
- [ ] Task 9: Risk management (@arya) [depends on: 7]

... (continue for all phases)
```

## Best Practices

- Start with research (don't skip understanding)
- Identify dependencies explicitly (prevent blocking)
- Make tasks small (1-2 hours each)
- Assign to right agent (expertise matching)
- Allow parallel execution where possible

## Anti-Patterns

❌ Don't create monolithic tasks ("build everything")
❌ Don't ignore dependencies (will cause blocking)
❌ Don't skip research phase (will cause rework)
❌ Don't assign tasks randomly (use expertise matching)

## Gold Standard Integration

This skill works with:
- Pillar 2 (Subagents) - Assign tasks to specialized agents
- Pillar 3 (Parallel Processing) - Identify independent tasks
- Pillar 9 (PRP Framework) - Structured planning workflow
