---
name: orchestration
description: Agent coordination, role-shifting, and parallel execution
category: orchestration
priority: P0
tags: [orchestration, coordination, role-shifting, parallel]
subskills:
  - handoff-protocol
  - parallel-execution
  - role-shifting
---

# Orchestration Skill

## Purpose
Coordinate work across different modes and parallel tasks using role-shifting and smart orchestration.

## Core Principle
**"Role-shift for sequential work. Spawn subagents only for parallel independent work."**

## Orchestration Strategy

### Role-Shifting (Sequential Work)

When work is sequential (one step after another), use **role-shifting**:

```
Planning → Coding → Testing → Documentation
   ↓           ↓         ↓          ↓
"Shifting to planning mode..."
"Shifting to coding mode..."
"Shifting to QA mode..."
"Shifting to documentation mode..."
```

**Benefits:**
- Preserves context
- Faster transitions
- Lower token cost
- Clearer tracking

**Examples:**
- ✅ Plan feature → Code feature → Test feature (role-shift)
- ✅ Write code → Write tests → Write docs (role-shift)
- ❌ Research A while coding B (use subagents instead)

### Subagent Spawning (Parallel Work)

When tasks are independent and can run simultaneously, **spawn subagents**:

```
"While I fix bug A, investigate bug B"
"While I write frontend, set up backend"
"While I implement X, research Y"
```

**Rules:**
- ✅ Tasks must be independent (no dependencies)
- ✅ Tasks must be truly parallel (can run simultaneously)
- ✅ Max spawn depth: 1 (no nesting)
- ❌ Don't spawn for sequential work (role-shift instead)

**Examples:**
- ✅ "Research competitor A while I build feature B" (parallel)
- ✅ "Write frontend component while I set up API" (parallel)
- ❌ "Plan then code" (sequential, use role-shift)
- ❌ "Test what I just wrote" (sequential, use role-shift)

---

## ⚠️ CRITICAL: WZRD.dev Agent Spawning

**ALWAYS route through wzrd.dev Gateway V2. NEVER use Claude Code's Agent tool for wzrd.dev work.**

### wzrd.dev Gateway V2 Pattern

When spawning wzrd.dev agents (Remi, Renata, personas), use the Gateway V2 API:

```bash
# Launch Raya for research
curl -X POST http://127.0.0.1:18801/api/gateway/chat \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Research X topic",
    "agent": "raya",
    "topic": "research",
    "model": "glm-4.5-air",
    "platform": "cli"
  }'
```

### Agent Configuration Table

| Agent | Project | Model | Topic | Purpose |
|-------|---------|--------|-------|---------|
| remi | wzrd.dev | glm-4.5-air | general | Orchestration, coordination |
| renata | edge.dev | glm-4.5 | renata-build | Trading strategies, scanners |
| sadie | wzrd.dev | glm-4.5-air | planning | Planning, quick tasks |
| raya | wzrd.dev | glm-4.5-air | research | Research, fetching info |
| ted | wzrd.dev | glm-4.7 | architecture | Architecture, deep reasoning |
| arya-fe | varies | glm-4.5 | frontend | Frontend coding |
| arya-be | varies | glm-4.5 | backend | Backend coding |
| chet | varies | glm-4.5-air | testing | QA, validation |

### Never Use Claude Code Agent Tool

**Wrong:**
```javascript
Agent({
  subagent_type: "general-purpose",
  prompt: "Research X..."
})
```

**Right:**
```bash
curl -X POST http://127.0.0.1:18801/api/gateway/chat \
  -H "Content-Type: application/json" \
  -d '{
    "agent": "raya",
    "prompt": "Research X...",
    "topic": "research",
    "model": "glm-4.5-air"
  }'
```

### Background Execution

For autonomous background work, use the scheduler:

```bash
curl -X POST http://127.0.0.1:18801/api/scheduler/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Research Task",
    "type": "immediate",
    "agent": "raya",
    "model": "glm-4.5-air",
    "params": {
      "prompt": "Research and plan...",
      "topic": "research"
    }
  }'
```

### Project Context Rules

| Agent | Working Directory | Topic |
|-------|------------------|-------|
| remi | `/home/mdwzrd` | general |
| renata | `/home/mdwzrd/wzrd.dev/projects/edge.dev` | renata-build |
| sadie | `/home/mdwzrd` | planning |
| raya | `/home/mdwzrd` | research |
| ted | `/home/mdwzrd` | architecture |

### Gateway V2 Endpoints

- **Health Check:** `http://127.0.0.1:18801/health`
- **List Agents:** `http://127.0.0.1:18801/agents`
- **Chat API:** `POST http://127.0.0.1:18801/api/gateway/chat`
- **Scheduler:** `POST http://127.0.0.1:18801/api/scheduler/*`

### Quick Launch Templates

**Remi (General):**
```bash
agent=remi model=glm-4.5-air topic=general workdir=/home/mdwzrd
```

**Renata (Edge.dev):**
```bash
agent=renata model=glm-4.5 topic=renata-build workdir=/home/mdwzrd/wzrd.dev/projects/edge.dev
```

**Raya (Research):**
```bash
agent=raya model=glm-4.5-air topic=research workdir=/home/mdwzrd
```

**See:** `/launch` command for full details

## Role-Shifting System

### Available Modes

| Mode | When to Use | Announces As |
|------|-------------|--------------|
| Planning | Breaking down tasks | "Shifting to planning mode..." |
| Coding | Implementing features | "Shifting to coding mode..." |
| QA | Testing and validation | "Shifting to QA mode..." |
| Architecture | System design | "Acting as architect..." |
| Documentation | Writing docs | "Shifting to documentation mode..." |
| Research | Investigating topics | "Shifting to research mode..." |
| Orchestrator | Coordinating work | "Coordinating..." |

### Role-Shift Pattern

```typescript
// 1. Announce shift
"Shifting to planning mode..."

// 2. Perform work in that mode
// Break down task into steps
const plan = breakDownTask(feature);

// 3. When done, shift to next mode
"Plan complete. Shifting to coding mode..."

// 4. Continue workflow
// Implement the planned feature
```

## Handoff Protocol

When coordinating work between different areas:

### Simple Handoff

```
→ Task completed in area A
→ "Handing off to area B..."
→ Next agent/mode picks up work
→ Acknowledges receipt
→ Continues work
```

### Handoff with Context

```typescript
// Handoff message structure
{
  from: "frontend",
  to: "backend",
  task: "Implement user profile endpoint",
  context: {
    apiPath: "/api/users/:id",
    fields: ["id", "name", "email", "bio"],
    authentication: "required"
  },
  dependencies: ["User model exists"],
  notes: "Frontend will consume this at /profile/:id"
}
```

### Handoff Verification

When receiving a handoff:
1. Acknowledge receipt
2. Verify context is understood
3. Confirm dependencies exist
4. Ask questions if unclear
5. Start work

## Parallel Execution

### When to Use Parallel

```
Pattern: "While I X, you Y"
- Both tasks independent
- Both can start immediately
- No dependencies between them
```

### Parallel Template

```typescript
// Task A: Fix authentication bug
// Task B: Fix styling bug (independent)

// Spawn subagent for Task B
spawn({
  task: "Fix styling bug in login form",
  context: "CSS issue with button alignment",
  workdir: "/home/mdwzrd/project"
});

// Work on Task A in parallel
fixAuthBug();

// Both work completes independently
// Results combined at end
```

### Parallel Rules

1. **maxSpawnDepth: 1** - No nesting
   - ✅ Main → Spawn A, Spawn B
   - ❌ Main → Spawn A → Spawn A1 (nested)

2. **Max concurrent:** 10-12 subagents
   - Don't overwhelm system
   - Monitor resource usage

3. **Timeout:** 5 minutes per subagent
   - Auto-archive if stuck
   - Don't wait forever

## Decision Tree

```
Need to do work?
│
├─ Is it sequential (step-by-step)?
│  └─ YES → Role-shift through modes
│          "Shifting to X mode..."
│
└─ Can tasks run independently?
   └─ YES → Spawn subagents
           "While I X, spawn subagent for Y"
```

## Examples

### Example 1: Sequential Work (Role-Shift)

```
Task: "Add user authentication"

1. "Shifting to planning mode..."
   → Break down: models, endpoints, tests, docs

2. "Plan complete. Shifting to coding mode..."
   → Implement: User model, auth service, endpoints

3. "Code complete. Shifting to QA mode..."
   → Write tests, verify edge cases

4. "Tests passing. Shifting to documentation mode..."
   → Update API docs, add examples

✅ Complete - All done via role-shifting
```

### Example 2: Parallel Work (Subagents)

```
Task: "Investigate and fix multiple bugs"

1. Main agent: "I'll fix the authentication bug"
2. Spawn subagent: "Investigate the memory leak bug"
3. Spawn subagent: "Research the timeout issue"

All work in parallel...
→ Main: Fixes auth bug
→ Subagent 1: Identifies memory leak source
→ Subagent 2: Finds timeout configuration issue

Results combined, all bugs addressed.
```

### Example 3: Mixed Strategy

```
Task: "Build new feature with research"

1. "Shifting to research mode..."
   → Research best practices, libraries

2. "Shifting to planning mode..."
   → Plan implementation

3. "Shifting to coding mode..."
   → "While I write backend, spawn subagent for frontend"

4. Both work in parallel...
   → Main: Backend API
   → Subagent: Frontend UI

5. "Frontend and backend complete. Shifting to QA mode..."
   → Integration tests, end-to-end tests

6. "Tests passing. Shifting to documentation mode..."
   → API docs, usage examples

✅ Complete - Combined role-shifting with parallel execution
```

## Gold Standard Integration

### Read-Back Verification
- Verify handoff context was received
- Confirm subagent tasks completed
- Read back results from all agents

### Executable Proof
- Show results from all parallel tasks
- Demonstrate working end-to-end flow
- Test handoff integration

### Loop Prevention
If orchestration fails:
- Attempt 1: Retry with clearer context
- Attempt 2: Use sequential approach instead
- Attempt 3: Escalate with full details

## Role-Shifting Checklist

Before shifting modes:
- [ ] Current mode work complete
- [ ] Results documented
- [ ] Next mode requirements clear
- [ ] Handoff context prepared

## Parallel Execution Checklist

Before spawning subagents:
- [ ] Tasks truly independent
- [ ] No dependencies between tasks
- [ ] Clear task instructions
- [ ] Context provided for each
- [ ] Resource limits considered

---

**"Orchestration is about clarity: clear roles, clear handoffs, clear communication."**
