# WZRD.dev Agentic Engineering Roadmap
## Transitioning from "Vibe Coding" to Predictable Systems

**Date:** March 8, 2026  
**Created By:** Remi (Thinker Mode)  
**Based On:** Performance Analysis + Stripe Minions Research

---

## Executive Summary

WZRD.dev is experiencing server strain and lag due to **systemic architectural gaps**, not framework performance issues. We've been optimizing the wrong layer. The transition from "vibe coding" (trial and error) to "agentic engineering" (predictable outcomes) requires implementing Stripe's proven patterns.

### **Core Insight:**
Your server is "going crazy" because:
1. **Runaway processes** consume unlimited resources
2. **No process isolation** allows workspace corruption  
3. **No structured workflows** leads to repetitive planning
4. **No resource limits** on skills/services

### **The Fix:**
Implement Stripe's Minions framework patterns:
1. **Blueprint Engine** - Predictable workflows
2. **Sandbox System** - Process isolation
3. **Rules-Based Context** - Efficient token usage
4. **Validation Pipeline** - Quality gates

---

## Current State Analysis

### **What's Working Well:**
- ✅ **Skills System** (200+ specialized skills)
- ✅ **Remi Role-Shifting** (Token-efficient single agent)
- ✅ **Context Management** (Compact system)
- ✅ **Memory System** (Topics, project memory)
- ✅ **Gold Standard Compliance** (Evidence-first approach)

### **What's Broken:**
- ❌ **Resource Management**: Runaway processes (21.5 CPU cores!)
- ❌ **Process Isolation**: All work in main workspace
- ❌ **Predictability**: No structured workflows
- ❌ **Scalability**: Can't handle 100k+ line codebases efficiently
- ❌ **Team Support**: CLI/chat only, no multi-user

### **Root Cause:**
We've been optimizing **framework speed** when the problem is **system architecture**. Following Stripe's philosophy:

**"Vibe Coding"** → Try things, see what happens (current state)  
**"Agentic Engineering"** → Predictable systems with known outcomes (target)

---

## 7-Pillar Implementation Plan

### **PILLAR 1: Blueprint Engine** (Week 1-2)
**Problem:** Repetitive planning, inconsistent implementations  
**Solution:** Predefined workflows for common tasks

**Implementation:**
```
/blueprints/
├── api-endpoint.json          # Express.js REST endpoint
├── react-component.json       # React component with tests
├── database-migration.json    # DB schema migration
├── microservice.json          # New microservice scaffold
└── blueprint-loader.js        # Load/execute blueprints
```

**Key Features:**
- JSON-defined workflows
- Skill composition (which skills to use)
- Validation requirements
- Success criteria
- Time estimates

**Impact:** 2-3x faster for common tasks, 90% consistency

### **PILLAR 2: Sandbox System** (Week 2-3)
**Problem:** Workspace pollution, dependency conflicts  
**Solution:** Isolated execution environments

**Implementation:**
```
/sandboxes/
├── create-sandbox.sh          # Creates /tmp/wzrd-sandbox-$ID
├── cleanup-sandbox.sh         # Removes sandbox after use
├── sync-sandbox.sh            # Syncs approved changes to main
├── sandbox-manager.js         # Orchestration
└── sandbox-config.json        # Resource limits, isolation rules
```

**Key Features:**
- Resource limits (CPU, memory, disk)
- Clean state for each task
- Safe experimentation
- Automatic cleanup

**Impact:** Zero workspace corruption, safe experimentation

### **PILLAR 3: Rules-Based Context** (Week 3-4)
**Problem:** Context overload with large codebases  
**Solution:** Domain-specific loading rules

**Implementation:**
```
/rules/
├── context-rules.json         # What to load per file type
├── validation-rules.json      # Required checks per task
├── workflow-rules.json        # Required steps per task type
└── rules-engine.js            # Rule application logic
```

**Example Rule:**
```json
{
  "fileType": "*.tsx",
  "context": ["react-ui-master", "typescript-advanced-types"],
  "validation": ["npm run type-check", "npm run lint"],
  "requiredTests": ["component renders", "props work"]
}
```

**Impact:** 30-50% reduction in token usage

### **PILLAR 4: Validation Pipeline** (Week 4-5)
**Problem:** Quality issues caught late  
**Solution:** Integrated quality gates

**Implementation:**
```
/validation/
├── pre-commit/               # Pre-commit hooks
├── pre-pr/                   # Pre-PR validation
├── post-implementation/      # Post-implementation checks
├── validator.js              # Validation orchestration
└── validation-rules.js       # Rule definitions
```

**Workflow:**
Implementation → Pre-Commit Checks → Pre-PR Validation → Quality Gates → PR Creation

**Impact:** 80% reduction in validation failures

### **PILLAR 5: Tool Shed Meta-Layer** (Week 5-6)
**Problem:** Skills underutilized, hard to discover  
**Solution:** Unified tool registry

**Implementation:**
```
/toolshed/
├── registry.json             # All tools with metadata
├── capabilities.json         # What each tool can do
├── integration-patterns/     # How tools work together
├── tool-discovery.js         # Skill search/filter
└── skill-metadata.json       # Auto-extracted metadata
```

**Impact:** 50% increase in skill utilization

### **PILLAR 6: Multi-Channel API** (Week 6-7)
**Problem:** Individual usage only, no team support  
**Solution:** Unified task processing across channels

**Implementation:**
```
/api/
├── slack-webhook/            # Slack integration
├── http-api/                 # REST API endpoints
├── webhook-handlers/         # Webhook processing
├── task-processor.js         # Unified task processing
└── channel-router.js         # Output routing
```

**Workflow:**
Slack → Webhook → Task Processor → Remi → Results → Channel Router → Slack/PR/Email

**Impact:** Team collaboration (3-10 users)

### **PILLAR 7: Agent Harness Optimization** (Ongoing)
**Problem:** Generic OpenCode wrapper overhead  
**Solution:** Custom optimized integration

**Implementation:**
```
/harness/
├── performance-monitor.js    # Track execution metrics
├── optimization-rules.js     # Performance optimizations
├── integration-hooks.js      # Custom OpenCode hooks
└── benchmark-results.json    # Performance tracking
```

**Impact:** 20% performance improvement

---

## Immediate Action Plan (Today)

### **Step 1: Emergency Resource Fixes**
```bash
# Already done: Kill runaway Python processes
# Current load: 1.35 (down from 4.73)

# Monitor resource usage
./monitor-resources.sh

# Fix transcription skill with resource limits
edit /home/mdwzrd/wzrd-redesign/.claude/skills/transcribe/SKILL.md
# Add: CPU limits, memory limits, timeout handling
```

### **Step 2: Create First Blueprint** (15 minutes)
```bash
mkdir -p /home/mdwzrd/wzrd-redesign/blueprints

cat > /home/mdwzrd/wzrd-redesign/blueprints/api-endpoint.json << 'EOF'
{
  "name": "express-api-endpoint",
  "description": "Standard Express.js REST API endpoint",
  "skills": ["nodejs-backend-patterns", "api-design-principles"],
  "phases": ["plan", "code", "test", "document"],
  "validation": ["npm test", "npm run lint"],
  "successCriteria": "PR created with all tests passing",
  "estimatedTime": "30-60 minutes"
}
EOF
```

### **Step 3: Create Sandbox Prototype** (30 minutes)
```bash
mkdir -p /home/mdwzrd/wzrd-redesign/sandboxes

cat > /home/mdwzrd/wzrd-redesign/sandboxes/create-sandbox.sh << 'EOF'
#!/bin/bash
SANDBOX_ID=$(date +%s)
SANDBOX_DIR="/tmp/wzrd-sandbox-$SANDBOX_ID"
mkdir -p "$SANDBOX_DIR"
cp -r /home/mdwzrd/wzrd-redesign/* "$SANDBOX_DIR/"
cd "$SANDBOX_DIR"
echo "$SANDBOX_DIR"
EOF

chmod +x /home/mdwzrd/wzrd-redesign/sandboxes/create-sandbox.sh
```

### **Step 4: Create Rules Starter** (10 minutes)
```bash
mkdir -p /home/mdwzrd/wzrd-redesign/rules

cat > /home/mdwzrd/wzrd-redesign/rules/context-rules.json << 'EOF'
{
  "typescript": {
    "context": ["typescript-advanced-types", "coding"],
    "validation": ["npm run type-check"]
  },
  "react": {
    "context": ["react-ui-master", "vercel-react-best-practices"],
    "validation": ["npm test -- --testPathPattern=.*\\.tsx$"]
  },
  "python": {
    "context": ["python-design-patterns", "python-testing-patterns"],
    "validation": ["python -m pytest"]
  }
}
EOF
```

---

## Architecture Simplification Opportunities

### **What to Trim (Complexity Reduction):**

1. **Over-Optimized Speed Scripts:**
   - `wzrd-ultra-fast`, `wzrd-hot-*`, `wzrd-instantly`
   - **Keep:** `wzrd-mode` (clean version)
   - **Remove:** Redundant speed optimizations that add complexity

2. **Redundant Performance Files:**
   - Multiple `PERFORMANCE_*.md` files
   - **Consolidate:** Keep roadmap and analysis, remove duplicates

3. **Unused Skill Categories:**
   - Review `.agents/skills/` for rarely used skills
   - **Focus:** Core engineering skills vs niche specialties

4. **Complex Compact Systems:**
   - Multiple compact scripts (`wzrd-compact-*`)
   - **Simplify:** Single reliable compact system

### **Simplicity Principles:**
1. **One Way:** Single way to do common tasks
2. **Explicit over Implicit:** Clear configuration over magic
3. **Composition over Monolith:** Small, composable pieces
4. **Failure Isolation:** One broken piece shouldn't break system

---

## Success Metrics & Validation

### **Phase 1 Success (Blueprint Engine):**
- ✅ 3 working blueprints for common tasks
- ✅ Remi can load/execute blueprints
- ✅ 2x speed improvement for blueprint tasks
- ✅ Consistent output quality across runs

### **Overall Success Criteria:**
- ✅ Load Average: < 1.0 (currently 1.35, improving)
- ✅ CPU Usage: < 50% per process
- ✅ Zero workspace corruption incidents
- ✅ Handle 100k+ line codebases efficiently
- ✅ Team adoption (3+ users collaborating)
- ✅ 80%+ automated validation pass rate

### **Validation Protocol:**
1. **Before claiming completion:** Run verification commands
2. **Evidence before assertions:** Show output, not just claims
3. **Resource monitoring:** Track CPU, memory, load averages
4. **User testing:** Real workflows with timing measurements

---

## Risk Mitigation

### **Technical Risks:**
- **Complexity creep:** Start minimal, validate each addition
- **Performance overhead:** Benchmark before/after each change
- **Integration issues:** Test with existing workflows

### **Adoption Risks:**
- **Learning curve:** Clear documentation for each component
- **Workflow disruption:** Implement gradually, opt-in phases
- **Skill gap:** Examples/training for new patterns

### **Quality Risks:**
- **Blueprint rigidity:** Allow override/extension mechanisms
- **Validation false positives:** Tune thresholds carefully
- **Sandbox overhead:** Optimize creation/cleanup cycles

---

## Weekly Implementation Schedule

### **Week 1: Foundation & Blueprints**
- Day 1: Emergency fixes + first blueprint
- Day 2-3: Blueprint loader + 2 more blueprints
- Day 4-5: Integration testing + documentation
- Day 6-7: User feedback + iteration

### **Week 2: Sandbox System**
- Day 1: Sandbox creation/cleanup scripts
- Day 2-3: Resource limits + isolation
- Day 4-5: Sync mechanism + testing
- Day 6-7: Performance optimization

### **Week 3: Rules-Based Context**
- Day 1: Rules file format + engine
- Day 2-3: Domain-specific loading
- Day 4-5: Token optimization
- Day 6-7: Integration with memory system

### **Week 4: Validation Pipeline**
- Day 1: Pre-commit hooks
- Day 2-3: Pre-PR validation
- Day 4-5: Quality gates
- Day 6-7: Feedback system

### **Weeks 5-7: Advanced Features**
- Tool shed meta-layer
- Multi-channel API
- Harness optimization
- Performance tuning

---

## Conclusion

The path from "server going crazy" to "real-time agentic engineering" requires architectural changes, not framework optimizations. By adopting Stripe's proven patterns:

1. **Stop vibe coding** → Start agentic engineering
2. **Stop unlimited resources** → Add constraints and isolation
3. **Stop repetitive planning** → Use structured workflows
4. **Stop manual validation** → Implement automated quality gates

**Immediate Next Steps:**
1. Implement the 3 quick wins (blueprint, sandbox, rules)
2. Monitor resource usage with `./monitor-resources.sh`
3. Begin Phase 1 implementation (Blueprint Engine)

The goal is a **predictable system** where you KNOW what will happen without looking - exactly like Stripe engineers with their Minions framework.

---
**Roadmap Version:** 1.0  
**Next Review:** After implementing Phase 1 (Week 1)  
**Generated By:** Remi (Thinker → Coder Mode Transition)