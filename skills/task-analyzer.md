# Task Analysis System for Smart Skill Loading

**Purpose**: Analyze task keywords and match to relevant skills
**Author**: Remi (Phase 2, Week 1)
**File**: skills/task-analyzer.ts

---

## Overview

The TaskAnalyzer analyzes natural language tasks and determines which skills should be loaded. It uses keyword matching, task type detection, and mode-based filtering to optimize skill loading.

---

## Task Type Detection

### Primary Task Types

| Type | Keywords | Suggested Skills |
|------|----------|------------------|
| **Code Implementation** | implement, write, build, create | coding, vercel-react-best-practices, test-driven-development |
| **Debug** | fix, bug, error, issue, troubleshoot | systematic-debugging, debugging-strategies |
| **Design** | design, UI, component, interface | design-system-patterns, interaction-design, tailwind-design-system |
| **Testing** | test, verify, validate, QA | test-driven-development, e2e-testing-patterns |
| **Planning** | plan, roadmap, architecture | writing-plans, architecture-patterns |
| **Documentation** | document, guide, readme | writing-skills, web-design-guidelines |
| **Optimization** | optimize, improve, performance | cost-optimization, prompt-engineering-patterns |
| **Integration** | integrate, connect, API | api-design-principles, openapi-spec-generation |
| **Research** | research, learn, explore | langchain-architecture, llm-evaluation |

---

## Mode-Specific Base Skills

### Chat Mode
```typescript
['orchestration', 'context', 'communication', 'topic-switcher']
```

### Thinker Mode
```typescript
['architecture', 'planning', 'research', 'validation']
```

### Coder Mode
```typescript
['coding', 'refactoring', 'testing', 'git']
```

### Debug Mode
```typescript
['debugging', 'testing', 'performance', 'system-health']
```

### Research Mode
```typescript
['research', 'web-search', 'data-analysis', 'documentation']
```

---

## Skill Mapping Database

### Coding Tasks
```typescript
const codingSkills = {
  'frontend': [
    'vercel-react-best-practices',
    'vercel-composition-patterns',
    'tailwind-design-system',
    'design-system-patterns'
  ],
  'backend': [
    'nodejs-backend-patterns',
    'fastapi-templates',
    'api-design-principles',
    'python-design-patterns'
  ],
  'mobile': [
    'react-native-design',
    'mobile-android-design',
    'mobile-ios-design'
  ],
  'testing': [
    'test-driven-development',
    'e2e-testing-patterns',
    'javascript-testing-patterns',
    'python-testing-patterns'
  ]
}
```

### Architecture Tasks
```typescript
const architectureSkills = {
  'system': ['architecture-patterns', 'microservices-patterns'],
  'database': ['postgresql-table-design', 'cqrs-implementation'],
  'ai': ['llm-evaluation', 'langchain-architecture', 'rag-implementation']
}
```

### Product Building Tasks
```typescript
const productSkills = [
  'brainstorming',
  'writing-plans',
  'executing-plans',
  'verification-before-completion',
  'systematic-debugging'
]
```

---

## Analysis Algorithm

### Step 1: Task Type Detection
```typescript
function detectTaskType(task: string): TaskType {
  const keywords = {
    coding: ['implement', 'write', 'code', 'build', 'create'],
    debugging: ['fix', 'bug', 'error', 'troubleshoot'],
    design: ['design', 'UI', 'interface', 'component'],
    testing: ['test', 'verify', 'validate', 'QA'],
    planning: ['plan', 'roadmap', 'architecture'],
    documentation: ['document', 'guide', 'readme', 'docs'],
    optimization: ['optimize', 'improve', 'performance'],
    integration: ['integrate', 'connect', 'API'],
    research: ['research', 'learn', 'explore', 'investigate']
  };

  const taskLower = task.toLowerCase();

  for (const [type, words] of Object.entries(keywords)) {
    if (words.some(word => taskLower.includes(word))) {
      return type as TaskType;
    }
  }

  return 'general';
}
```

### Step 2: Technology Detection
```typescript
function detectTechnologies(task: string): string[] {
  const techMap = {
    'react': /react|jsx|tsx/i,
    'vue': /vue/i,
    'python': /python|django|flask/i,
    'typescript': /typescript|ts/i,
    'javascript': /javascript|js/i,
    'nextjs': /next\.?js/i,
    'tailwind': /tailwind/i,
    'shadcn': /shadcn/i,
    'mongodb': /mongo/i,
    'postgresql': /postgres|pg/i,
    'llm': /llm|ai|model|gpt/i,
    'rag': /rag|vector|embedding/i
  };

  const detected: string[] = [];
  for (const [tech, regex] of Object.entries(techMap)) {
    if (regex.test(task)) {
      detected.push(tech);
    }
  }

  return detected;
}
```

### Step 3: Skill Selection
```typescript
function selectSkills(taskType: TaskType, technologies: string[], mode: Mode): string[] {
  const baseSkills = getModeBaseSkills(mode);
  const taskBasedSkills = getTaskBasedSkills(taskType);
  const techBasedSkills = getTechBasedSkills(technologies);

  // Deduplicate and prioritize
  const allSkills = [
    ...baseSkills,
    ...taskBasedSkills,
    ...techBasedSkills
  ];

  return deduplicateSkills(allSkills).slice(0, 6); // Max 6 skills
}
```

---

## Examples

### Example 1: Build React Component
```
Task: "Build a reusable button component with React and Tailwind"

Analysis:
- Task Type: coding
- Technologies: ['react', 'tailwind']
- Mode: coder

Skills Selected:
1. coding (base)
2. vercel-react-best-practices (React)
3. vercel-composition-patterns (React)
4. tailwind-design-system (Tailwind)
5. design-system-patterns (Component design)
6. test-driven-development (Quality)
```

### Example 2: Fix Bug in API
```
Task: "Fix the timeout error in the authentication API"

Analysis:
- Task Type: debugging
- Technologies: ['api']
- Mode: debug

Skills Selected:
1. debugging (base)
2. systematic-debugging (Debugging method)
3. api-design-principles (API context)
4. testing (base)
5. error-handling-patterns (Error analysis)
6. performance (Performance context)
```

### Example 3: Design System Architecture
```
Task: "Design the architecture for a new design system"

Analysis:
- Task Type: planning
- Technologies: []
- Mode: thinker

Skills Selected:
1. architecture (base)
2. planning (base)
3. design-system-patterns (Design systems)
4. architecture-patterns (Architecture)
5. writing-plans (Planning)
6. verification-before-completion (Quality gate)
```

---

## Implementation Notes

- Skills are prioritized: Base → Task-based → Tech-based
- Maximum 6 skills loaded to maintain token efficiency
- Skills list is deduplicated to avoid redundancy
- Analysis runs in < 10ms for optimal performance

---

**Next**: Implement in TypeScript as part of dynamic skill router
