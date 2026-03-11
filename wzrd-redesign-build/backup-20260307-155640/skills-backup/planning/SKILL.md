---
name: planning
description: Task breakdown, project planning, dependency resolution, and roadmap creation
category: planning
priority: P0
tags: [planning, tasks, roadmap, dependencies]
subskills:
  - task-decomposition
  - dependency-resolution
  - roadmap-creation
---

# Planning Skill

## Purpose
Break down complex projects into manageable tasks with clear dependencies and execution order.

## Core Principle
**"Any task that can't be broken down smaller isn't understood well enough."**

## Modes

### 1. Task Decomposition
Break high-level requirements into executable tasks:

```
Feature: User Authentication
├─ Create user model
├─ Design database schema
├─ Implement registration endpoint
├─ Implement login endpoint
├─ Add JWT token handling
├─ Create password reset flow
└─ Write tests for each component
```

**Rules:**
- Each task should be completable in < 2 hours
- Tasks should be independent where possible
- Clear acceptance criteria for each task
- Identify blockers upfront

### 2. Dependency Resolution
Map task dependencies to determine execution order:

```
Task Dependency Graph:
┌─────────────┐
│  Database   │
│   Schema    │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│  User Model │ ──▶ │    Tests    │
└──────┬──────┘     └─────────────┘
       │
       ▼
┌─────────────┐
│   API       │
│  Endpoints  │
└─────────────┘
```

**Rules:**
- Critical path tasks identified
- Parallel opportunities marked
- Blockers called out early
- Estimate based on dependencies

### 3. Roadmap Creation
Create phased delivery plans:

```
Phase 1: Foundation (Week 1)
├─ Database setup
├─ Basic models
└─ Core authentication

Phase 2: Features (Week 2-3)
├─ User profile management
├─ Authorization rules
└─ Password reset

Phase 3: Polish (Week 4)
├─ Testing suite
├─ Documentation
└─ Deployment
```

**Rules:**
- Each phase delivers working value
- Early phases validate assumptions
- Later phases build on working foundation
- Buffer time included for unknowns

## Planning Checklist

Before starting implementation, verify:

- [ ] Requirements clearly understood
- [ ] Tasks broken down to < 2 hours each
- [ ] Dependencies mapped
- [ ] Critical path identified
- [ ] Parallel opportunities noted
- [ ] Blockers called out
- [ ] Acceptance criteria defined
- [ ] Testing approach planned

## Role-Shifting

When shifting **to** planning mode:
```
"Shifting to planning mode..."
→ Analyze requirements
→ Break down tasks
→ Map dependencies
→ Present plan for approval
```

When shifting **from** planning mode:
```
"Plan approved. Shifting to execution mode..."
→ Execute tasks in order
→ Update plan as needed
→ Escalate blockers
```

## Examples

### Example 1: Feature Planning

**Input:** "Add user notifications"

**Plan:**
```
1. Requirements Analysis
   - What types of notifications? (email, push, in-app)
   - Real-time or batched?
   - User preferences?

2. Task Breakdown
   ├─ Design notification data model
   ├─ Create notification service
   ├─ Implement email delivery
   ├─ Implement push notifications
   ├─ Build in-app notification UI
   ├─ Add user preference settings
   └─ Write tests

3. Dependencies
   - Data model → Service
   - Service → Email/Push/In-app
   - All → UI

4. Roadmap
   - Day 1: Model + Service
   - Day 2: Email delivery
   - Day 3: Push notifications
   - Day 4: In-app UI
   - Day 5: Testing + polish
```

### Example 2: Bug Fix Planning

**Input:** "Fix memory leak in websocket handler"

**Plan:**
```
1. Investigation
   ├─ Add memory profiling
   ├─ Reproduce the leak
   └─ Identify source

2. Fix
   ├─ Patch identified issue
   ├─ Add resource cleanup
   └─ Verify fix

3. Validation
   ├─ Run extended load test
   ├─ Monitor memory over time
   └─ Confirm leak resolved

Estimated: 2-4 hours (uncertainty due to investigation)
```

## Gold Standard Integration

- **Read-back**: Verify plan makes sense before starting
- **Executable Proof**: Show task breakdown with estimates
- **Loop Prevention**: If planning takes > 30 min, escalate
- **Context Monitoring**: Long plans need summarization

## Subskills

### Task Decomposition
Break complex requirements into small, executable tasks.

See: `planning/task-decomposition.md`

### Dependency Resolution
Identify and map task dependencies for optimal execution order.

See: `planning/dependency-resolution.md` (to be created)

### Roadmap Creation
Create phased delivery plans with clear milestones.

See: `planning/roadmap-creation.md` (to be created)

---

**"A good plan today is better than a perfect plan tomorrow."**
