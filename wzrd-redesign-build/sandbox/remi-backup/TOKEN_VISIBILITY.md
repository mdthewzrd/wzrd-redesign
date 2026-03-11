# Remi's Token Visibility & Optimization System

**Purpose**: Make Remi aware of token usage and enable smart loading
**Date**: March 5, 2026

---

## 📊 Current Cost Tracker Status

Cost tracker exists at: `configs/cost-tracker.json`

**Current Configuration**:
```
Daily Budget: $1.00
Monthly Budget: $30.00
Models Tracked: 
  - glm-4.7-flash ($0.0008 input / $0.001 output per 1K)
  - deepseek-v3.2 ($0.002 input / $0.006 output per 1K)
  - qwen2.5-coder-32b (...)
```

**Status**: ✅ Cost tracking is active

---

## 🎯 PROBLEM: Remi Cannot See Token Usage

Currently, the cost tracker runs but Remi has NO VISIBILITY into:
- How many tokens were used in this query
- How much it cost
- How much cost is remaining today
- Which skills were loaded
- Whether we're on track for <$1/day

---

## 💡 SOLUTION: Add Token Visibility to Remi

### Implementation Strategy

#### 1. Add `show-token-usage` Command to CLI Wrapper

Update `wzrd-mode` to show token usage after each response:

```bash
# In wzrd-mode, add after response:
echo "
══════════════════════════════════════════════════
          TOKEN USAGE - REMI ANALYTICS
══════════════════════════════════════════════════
📊 Query Stats:
  • Model:          $MODEL_NAME
  • Input Tokens:   $INPUT_TOKENS
  • Output Tokens:  $OUTPUT_TOKENS
  • Total Tokens:   $((INPUT + OUTPUT))
  • Cost:           $COST
 🔧 Skills Loaded:  $SKILLS_COUNT
  • Core (always):  $SKILLS_CORE_COUNT
  • Task-specific:  $SKILLS_TASK_COUNT
 💰 Today's Spend:
  • Total Tokens:   $TODAY_TOKENS
  • Total Cost:     $TODAY_COST
  • Budget Left:    $BUDGET_REMAINING
  • On Track:       $ON_TRACK ✅/❌
══════════════════════════════════════════════════
"
```

#### 2. Add Token Usage to Topic Memory

When working on topics, track token usage per topic:

```markdown
## Topic: Implementing Phase 2

**Token Usage**:
- This session: 45,234 tokens
- Total for topic: 156,789 tokens
- Cost: $0.34
- Budget: <$1.00/day ✅

**Skills Used**:
- Core (8 skills): Always loaded
- Frontend (4 skills): React patterns loaded
- Product Building (3 skills): Superpowers loaded
- DevOps (2 skills): Deployment skills loaded
```

#### 3. Add Skill Load Reports

Show which skills are loaded and why:

```bash
🔧 Skills Loaded This Query (12 total):

ALWAYS LOADED (8 skills - 4,400 tokens):
  ✅ planning
  ✅ coding
  ✅ testing
  ✅ architecture
  ✅ debugging
  ✅ security
  ✅ github
  ✅ agent-browser

LOADED FOR THIS TASK (4 skills - 2,200 tokens):
  🎨 vercel-react-best-practices  → Detected: "React component"
  🎨 vercel-composition-patterns  → Detected: "compose components"
  📝 writing-plans               → Detected: "implement feature"
  🧪 test-driven-development     → Detected: "test before implementing"

NOT LOADED (78 skills - 39,000 tokens saved):
  🐍 Python skills (15)          → Not Python task
  🚀 DevOps skills (5)           → Not deploying
  📊 LLM skills (7)              → Not LLM task
  ... (64 more optimized away)
```

---

## 🎯 Smart Loading Implementation

### Create: `skills/skill-loader.ts`

```typescript
interface SkillLoadConfig {
  alwaysLoad: string[];           // Core skills (always present)
  taskTriggers: Record<string, string[]>;  // Task → Skills mapping
}

const skillConfig: SkillLoadConfig = {
  alwaysLoad: [
    'planning', 'coding', 'testing', 'architecture',
    'debugging', 'security', 'github', 'agent-browser'
  ],
  
  taskTriggers: {
    frontend: [
      'react', 'component', 'UI', 'design', 'tailwind',
      'frontend', 'jsx', 'tsx', 'shadcn', 'vercel'
    ],
    python: [
      'python', '.py', 'fastapi', 'django', 'flask',
      'pandas', 'numpy', 'ai agent'
    ],
    deployment: [
      'deploy', 'production', 'CI/CD', 'github actions',
      'pipeline', 'release', 'publish'
    ],
    testing: [
      'test', 'debug', 'fix bug', 'error', 'issue',
      'verify', 'validate'
    ],
    llm: [
      'LLM', 'prompt', 'RAG', 'embedding', 'AI',
      'model', 'token', 'cost', 'optimization'
    ],
    api: [
      'API', 'endpoint', 'REST', 'GraphQL', 'http',
      'request', 'response', 'backend'
    ],
    database: [
      'database', 'sql', 'postgres', 'query', 'schema',
      'migration', 'table'
    ],
    documentation: [
      'document', 'readme', 'write to file', 'doc',
      'guide', 'tutorial'
    ]
  }
};

function loadSkillsForTask(userMessage: string): string[] {
  const loadedSkills = new Set(skillConfig.alwaysLoad);
  
  const messageLower = userMessage.toLowerCase();
  
  // Detect task type
  for (const [task, triggers] of Object.entries(skillConfig.taskTriggers)) {
    if (triggers.some(trigger => messageLower.includes(trigger.toLowerCase()))) {
      // Load skills for this task
      const taskSkills = getSkillsForTask(task);
      taskSkills.forEach(skill => loadedSkills.add(skill));
      
      console.log(`[SkillLoader] Detected task: ${task}`);
      console.log(`[SkillLoader] Loading ${taskSkills.length} skills`);
    }
  }
  
  return Array.from(loadedSkills);
}
```

---

## 📊 REMI DASHBOARD - Token Usage Visibility

### Display at End of Every Response

```markdown
══════════════════════════════════════════════════
          💰 TOKEN USAGE - REMI DASHBOARD
══════════════════════════════════════════════════

📊 THIS QUERY:
  Model:           nvidia/z-ai/glm4.7
  Input Tokens:    8,452
  Output Tokens:   5,123
  Total Tokens:    13,575
  Cost:            $0.017

🔧 SKILLS LOADED:  12 skills
  
  Always Loaded (8 skills - 4,400 tokens):
    ✅ planning
    ✅ coding
    ✅ testing
    ✅ architecture
    ✅ debugging
    ✅ security
    ✅ github
    ✅ agent-browser
  
  Task-Specific (4 skills - 2,200 tokens):
    🎨 vercel-react-best-practices   → Task: "React component"
    🎨 vercel-composition-patterns   → Task: "compose"
    📝 writing-plans                 → Task: "implement feature"
    🧪 test-driven-development       → Task: "test before code"

  Optimized Away (78 skills - 39K tokens saved):
    💡 Python skills (15)           → Not Python task
    💡 DevOps skills (5)            → Not deploying
    💡 LLM skills (7)               → Not LLM task
    💡 + 56 more skills

💰 TODAY'S SPEND:
  Total Tokens:   156,789 (15 queries avg: 10,452)
  Total Cost:     $0.34
  Budget Left:    $0.66 / $1.00
  On Track:       ✅ YES (66% used, 50% through day)
  
  📈 Projections:
    At current rate: 45 queries today
    Est. daily cost: $0.92 ✅ (under budget)

⚡ EFFICIENCY:
  Smart Loading Savings: 79% (37.8K avoided vs loaded 13.6K)
  Target: <$1.00/day
  Today: $0.34 ✅
  
🎯 TARGETS:
  Daily Budget:    ≤ $1.00           ✅ ($0.34 / $1.00)
  Monthly Budget:  ≤ $30.00          ✅ Today's pro: $10.20)
  Avg Per Query:   ≤ 15,000 tokens   ✅ (13,575)

══════════════════════════════════════════════════
```

---

## 🔍 TOKEN ANALYSIS CAPABILITIES

### Remi Can Ask About Own Performance

User: "How are our token usage stats?"
Remi: Shows dashboard

User: "Are we on track for our daily budget?"
Remi: Analyzes and confirms/flags concern

User: "What skills were loaded last query?"
Remi: Shows breakdown

User: "Why did we load Python skills?"
Remi: "Because you mentioned 'python agent' and we're working on .py files"

User: "Can we optimize further?"
Remi: "Yes, we could reduce Frontend skills since we're only styling, no React"

---

## 🚀 IMPLEMENTATION PLAN

### Phase 1: Add Visibility Now (Quick Win)
1. Modify `wzrd-mode` CLI to show token usage after each response
2. Add skill load report (which skills loaded)
3. Show daily spend vs budget

### Phase 2: Smart Loading (Next Phase)
1. Create `skills/skill-loader.ts` task detector
2. Map tasks to skill groups
3. Load skills dynamically based on user message

### Phase 3: Optimization Iteration
1. After 1 week of data, analyze which skills are most/least used
2. Optimize skill groups further
3. A/B test different loading strategies

---

## ✅ RECOMMENDATIONS

1. ✅ **Keep all 90 skills** - Full coverage is valuable
2. ✅ **Implement token visibility** - Show Remi its own usage
3. ✅ **Implement smart loading** - Load based on task
4. ✅ **Maintain <$1/day** - Easy with smart loading
5. ✅ **Keep Python skills** - Load only when Python task

**Expected Results**:
- Average per query: ~10,000 tokens (vs 48K without smart loading)
- Daily cost: ~$0.50-$0.80
- Under $1/day budget: ✅
- Token transparency: ✅ (Remi sees its own performance)
