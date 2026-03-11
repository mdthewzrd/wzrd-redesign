# Phase 1: Core Systems Build
## Duration: Week 3-4 | Prerequisite: Phase 0 Complete (Enhanced Remi Operational)

## Goal
Build simplified core systems WITH Enhanced Remi's help:
1. **Unified Memory System** (replace RAG)
2. **Topic Registry** (central source of truth)
3. **Model Router** (intelligent GLM/DeepSeek/Qwen3 routing)
4. **Cost Tracking** (< $1/day enforcement)

## Why This Phase?
1. **Foundation for everything**: Memory, topics, models are core
2. **Simplification**: Replace complex gateway-v2 with clean systems
3. **Cost control**: Implement token budgeting from day one
4. **Enhanced Remi proof**: Test that Enhanced Remi can build effectively

## Success Criteria
- ✅ Unified memory system operational (jCodeMunch + agentic search)
- ✅ Topic registry with CRUD operations
- ✅ Model router selecting right model for each task
- ✅ Cost tracking with < $1/day enforcement
- ✅ All systems integrated with OpenCode
- ✅ Performance: < 5s response time, < 100ms overhead

## Step 1: Unified Memory System

### Architecture
**Replace**: Complex RAG with vector DB (7 files)  
**With**: Simple file-based + jCodeMunch + agentic search (2 files)

### Component: `memory/unified-memory.ts`
```typescript
/**
 * Unified Memory System - Simple, fast, effective
 * Replaces RAG complexity with jCodeMunch + ripgrep/glob
 */
export class UnifiedMemory {
  private jcodeMunch: JCodeMunchClient;
  private topicRegistry: TopicRegistry;
  
  constructor(config: MemoryConfig) {
    this.jcodeMunch = new JCodeMunchClient(config.jcodeMunchPath);
    this.topicRegistry = new TopicRegistry(config.topicRegistryPath);
  }
  
  async search(query: string, options: SearchOptions): Promise<MemoryResult[]> {
    // 1. Try jCodeMunch first (semantic search)
    const semanticResults = await this.jcodeMunch.search(query, options);
    
    // 2. Agentic search fallback (ripgrep/glob)
    if (semanticResults.length < options.minResults) {
      const agenticResults = await this.agenticSearch(query, options);
      return [...semanticResults, ...agenticResults];
    }
    
    return semanticResults;
  }
  
  async store(content: MemoryContent, topic: string): Promise<void> {
    // Store in topic-specific file
    const topicPath = this.topicRegistry.getTopicPath(topic);
    await this.writeToFile(topicPath, content);
    
    // Index in jCodeMunch for semantic search
    await this.jcodeMunch.index(content);
  }
  
  private async agenticSearch(query: string, options: SearchOptions): Promise<MemoryResult[]> {
    // Use ripgrep for text search
    // Use glob for file pattern matching
    // Return ranked results
  }
}
```

### File Structure
```
/home/mdwzrd/wzrd-redesign/memory/
├── unified-memory.ts         # Main memory class
├── search.ts                 # Search algorithms
├── storage.ts                # File storage operations
├── topics/                   # Topic-organized memory
│   ├── system-design/
│   │   ├── decisions.json
│   │   ├── notes.json
│   │   └── references.json
│   ├── implementation/
│   └── planning/
├── global/                   # Cross-topic memory
│   ├── skills-usage.json
│   ├── model-performance.json
│   └── cost-tracking.json
└── cache/                    # Search cache
```

### Integration Points
1. **OpenCode Tools**: Memory search available as OpenCode tool
2. **Skills**: Skills can store/retrieve memory
3. **Topics**: Memory organized by topic
4. **Models**: Memory of model performance for routing decisions

## Step 2: Topic Registry

### Architecture
**Single source of truth** for all interfaces:
- Discord channels ↔ Topics
- Web UI tabs ↔ Topics  
- CLI `--topic` parameter ↔ Topics

### Component: `topics/registry.ts`
```typescript
/**
 * Central Topic Registry - Single source of truth
 */
export class TopicRegistry {
  private topics: Map<string, Topic>;
  private configPath: string;
  
  constructor(configPath: string) {
    this.configPath = configPath;
    this.topics = this.loadTopics();
  }
  
  createTopic(name: string, config: TopicConfig): Topic {
    const topic: Topic = {
      id: this.generateId(),
      name,
      config,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      memoryPath: `./memory/topics/${name}`,
      discordChannel: config.discordChannel,
      webUiTab: config.webUiTab,
      cliAlias: config.cliAlias
    };
    
    this.topics.set(topic.id, topic);
    this.saveTopics();
    
    // Create directory structure
    this.createTopicDirectories(topic);
    
    return topic;
  }
  
  getTopicByDiscordChannel(channelId: string): Topic | undefined {
    return Array.from(this.topics.values())
      .find(t => t.config.discordChannel === channelId);
  }
  
  getTopicByCliAlias(alias: string): Topic | undefined {
    return Array.from(this.topics.values())
      .find(t => t.config.cliAlias === alias);
  }
  
  syncTopicProgress(topicId: string, progress: TopicProgress): void {
    const topic = this.topics.get(topicId);
    if (topic) {
      topic.progress = progress;
      topic.updatedAt = Date.now();
      this.saveTopics();
    }
  }
}
```

### Topic Configuration (`topics/config.yaml`)
```yaml
topics:
  system-design:
    name: "System Design"
    discord_channel: "112233445566778899"  # Discord channel ID
    web_ui_tab: "system-design"
    cli_alias: "system"
    permissions:
      remi: read_write
      projects: read_only
    memory_quota: "100MB"
    
  implementation:
    name: "Implementation"
    discord_channel: "998877665544332211"
    web_ui_tab: "implementation"
    cli_alias: "impl"
    
  edge-dev:
    name: "edge.dev Project"
    discord_channel: "556677889900112233"
    web_ui_tab: "edge-dev"
    cli_alias: "edge"
    project_link: "/projects/edge.dev"
    
  dilution-agent:
    name: "Dilution Agent"
    discord_channel: "667788990011223344"
    web_ui_tab: "dilution"
    cli_alias: "dilution"
    project_link: "/projects/dilution-agent"
```

### Topic Directory Structure
```
/home/mdwzrd/wzrd-redesign/topics/
├── registry.ts              # Topic registry class
├── config.yaml              # Topic configuration
├── sync.ts                  # Cross-interface sync
├── data/
│   ├── topics.json          # Topic definitions
│   └── progress.json        # Topic progress tracking
└── interfaces/
    ├── discord.ts          # Discord integration
    ├── web-ui.ts           # Web UI integration
    └── cli.ts              # CLI integration
```

## Step 3: Model Router

### Architecture
**Intelligent routing** based on task type:
- General tasks → GLM 4.7 Flash (fast, cheap)
- Research/complex → DeepSeek V3.2
- Coding/technical → Qwen3 Coder 30B

### Component: `models/router.ts`
```typescript
/**
 * Cost-Aware Model Router
 */
export class ModelRouter {
  private config: ModelRouterConfig;
  private costTracker: CostTracker;
  private performanceHistory: Map<string, ModelPerformance[]>;
  
  constructor(config: ModelRouterConfig) {
    this.config = config;
    this.costTracker = new CostTracker(config.costLimits);
    this.performanceHistory = new Map();
  }
  
  async route(task: Task): Promise<ModelSelection> {
    // 1. Check daily limits (circuit breaker)
    if (this.costTracker.isCircuitBreakerActive()) {
      throw new Error('Daily token limit reached');
    }
    
    // 2. Analyze task for optimal model
    const taskAnalysis = this.analyzeTask(task);
    
    // 3. Select model based on task type + cost
    const selection = this.selectModel(taskAnalysis);
    
    // 4. Check rate limits
    if (this.isRateLimited(selection.model)) {
      selection = this.fallbackModel(selection);
    }
    
    // 5. Return selection with cost estimate
    return {
      model: selection.model,
      provider: selection.provider,
      estimatedTokens: this.estimateTokens(task, selection.model),
      costLimit: this.costTracker.getRemainingBudget(),
      fallbackModel: this.getFallbackModel(selection.model)
    };
  }
  
  private analyzeTask(task: Task): TaskAnalysis {
    // Analyze content for task type
    const keywords = this.extractKeywords(task.content);
    const complexity = this.estimateComplexity(task.content);
    const taskType = this.classifyTaskType(task, keywords);
    
    return { keywords, complexity, taskType };
  }
  
  private selectModel(analysis: TaskAnalysis): ModelSelection {
    const rules = this.config.routingRules;
    
    // Rule-based selection
    if (analysis.taskType === 'coding' || analysis.keywords.has('code')) {
      return { model: 'qwen3-coder-30b', provider: 'openrouter' };
    }
    
    if (analysis.taskType === 'research' || analysis.complexity > 7) {
      return { model: 'deepseek-v3.2', provider: 'openrouter' };
    }
    
    if (analysis.taskType === 'planning' || analysis.complexity <= 3) {
      return { model: 'glm-4.7-flash', provider: 'openrouter' };
    }
    
    // Default to GLM 4.7 Flash (cheapest)
    return { model: 'glm-4.7-flash', provider: 'openrouter' };
  }
}
```

### Model Configuration (`models/config.yaml`)
```yaml
models:
  glm-4.7-flash:
    provider: openrouter
    cost_per_token: 0.000001  # $0.001 per 1K tokens
    capabilities: [general, planning, fast]
    rate_limit: 1000  # requests per hour
    fallback: glm-4.7
    
  deepseek-v3.2:
    provider: openrouter  
    cost_per_token: 0.000002  # $0.002 per 1K tokens
    capabilities: [research, analysis, complex]
    rate_limit: 500
    fallback: glm-4.7-flash
    
  qwen3-coder-30b:
    provider: openrouter
    cost_per_token: 0.000003  # $0.003 per 1K tokens
    capabilities: [coding, technical, implementation]
    rate_limit: 300
    fallback: glm-4.7-flash

routing_rules:
  - pattern: ".*code.*|.*implement.*|.*fix.*"
    model: qwen3-coder-30b
    priority: high
    
  - pattern: ".*research.*|.*analyze.*|.*complex.*"
    model: deepseek-v3.2
    priority: medium
    
  - pattern: ".*plan.*|.*design.*|.*simple.*"
    model: glm-4.7-flash
    priority: low
    
  default: glm-4.7-flash

cost_limits:
  daily_token_limit: 30000      # ~$1/day
  warning_threshold: 80%        # Warn at 80% of limit
  circuit_breaker: 95%          # Stop at 95% of limit
  reset_time: "00:00"           # Reset daily at midnight
```

## Step 4: Cost Tracking & Enforcement

### Component: `cost/tracker.ts`
```typescript
/**
 * Token Cost Tracker - Enforce < $1/day limit
 */
export class CostTracker {
  private dailyLimit: number;
  private currentUsage: number;
  private usageHistory: DailyUsage[];
  private circuitBreakerActive: boolean;
  
  constructor(dailyLimit: number = 30000) {
    this.dailyLimit = dailyLimit;  // ~$1 worth of tokens
    this.currentUsage = 0;
    this.usageHistory = this.loadHistory();
    this.circuitBreakerActive = false;
    
    // Reset at midnight
    this.scheduleDailyReset();
  }
  
  trackUsage(tokens: number, model: string): void {
    this.currentUsage += tokens;
    
    // Update history
    const today = this.getToday();
    const dailyUsage = this.usageHistory.find(u => u.date === today);
    if (dailyUsage) {
      dailyUsage.tokens += tokens;
      dailyUsage.models[model] = (dailyUsage.models[model] || 0) + tokens;
    }
    
    // Check limits
    this.checkLimits();
    
    // Save history
    this.saveHistory();
  }
  
  private checkLimits(): void {
    const percentage = (this.currentUsage / this.dailyLimit) * 100;
    
    // Warning at 80%
    if (percentage >= 80 && percentage < 95) {
      this.sendWarning(percentage);
    }
    
    // Circuit breaker at 95%
    if (percentage >= 95) {
      this.activateCircuitBreaker();
    }
  }
  
  private activateCircuitBreaker(): void {
    this.circuitBreakerActive = true;
    
    // Alert via Discord/web/CLI
    this.sendAlert('CRITICAL: Daily token limit reached. System paused until reset.');
    
    // Log for analysis
    console.error(`Circuit breaker activated at ${this.currentUsage}/${this.dailyLimit} tokens`);
  }
  
  getRemainingBudget(): number {
    return this.dailyLimit - this.currentUsage;
  }
  
  getDailyReport(): DailyReport {
    return {
      date: this.getToday(),
      tokensUsed: this.currentUsage,
      tokensRemaining: this.getRemainingBudget(),
      percentageUsed: (this.currentUsage / this.dailyLimit) * 100,
      modelBreakdown: this.getModelBreakdown(),
      circuitBreakerActive: this.circuitBreakerActive
    };
  }
}
```

### Cost Dashboard (`cost/dashboard.ts`)
Real-time monitoring:
- Current token usage
- Model breakdown
- Project-level costs
- Alerts and warnings
- Historical trends

## Step 5: Integration & Testing

### Integration Points
1. **OpenCode Extension**: All systems available as OpenCode tools
2. **Enhanced Remi Access**: Remi can use all systems via API
3. **Skill Integration**: Skills can access memory, topics, models
4. **Interface Ready**: Systems prepared for Discord/web/CLI integration

### Test Suite
```bash
#!/bin/bash
# test-phase1.sh
echo "=== Phase 1 Core Systems Test ==="

echo "1. Testing Unified Memory System..."
cd /home/mdwzrd/wzrd-redesign
node -e "const memory = require('./memory/unified-memory'); console.log('Memory system OK')"

echo "2. Testing Topic Registry..."
node -e "const topics = require('./topics/registry'); const tr = new topics.TopicRegistry('./topics/config.yaml'); console.log('Topic registry OK')"

echo "3. Testing Model Router..."
node -e "const router = require('./models/router'); const mr = new router.ModelRouter('./models/config.yaml'); console.log('Model router OK')"

echo "4. Testing Cost Tracker..."
node -e "const cost = require('./cost/tracker'); const ct = new cost.CostTracker(30000); console.log('Cost tracker OK')"

echo "5. Integration Test..."
# Test all systems working together
```

### Performance Benchmarks
| System | Target Response Time | Target Memory | Target Tokens/Request |
|--------|----------------------|---------------|----------------------|
| Memory Search | < 2s | < 50MB | N/A |
| Topic Lookup | < 100ms | < 10MB | N/A |
| Model Routing | < 500ms | < 20MB | < 100 |
| Cost Tracking | < 50ms | < 5MB | N/A |

## Step 6: Documentation & Handoff

### Documentation Created
1. `MEMORY_SYSTEM_GUIDE.md` - How to use unified memory
2. `TOPIC_MANAGEMENT.md` - Topic creation and management
3. `MODEL_ROUTING.md` - Model selection guidelines
4. `COST_MANAGEMENT.md` - Token budgeting and tracking
5. `API_REFERENCE.md` - System APIs and integration

### Handoff Checklist
- [ ] Unified memory system operational
- [ ] Topic registry with Discord/web/CLI mappings
- [ ] Model router selecting appropriate models
- [ ] Cost tracking enforcing < $1/day limit
- [ ] All systems integrated with OpenCode
- [ ] Performance benchmarks met
- [ ] Test suite passing
- [ ] Documentation complete
- [ ] Phase 2 planning ready

## Phase Exit Criteria

**All core systems must:**
1. Be operational and integrated
2. Meet performance benchmarks
3. Stay within token budget during testing
4. Have comprehensive documentation
5. Be ready for interface integration (Phase 2)

**Enhanced Remi must demonstrate:**
1. Ability to use all new systems
2. Understanding of model routing decisions
3. Cost-aware decision making
4. Topic-based memory organization

## Next Phase Preparation

Once Phase 1 is complete, proceed to:
1. **Phase 2 Planning**: Interface integration strategy
2. **Discord Bot Update**: Topic-aware Discord integration
3. **Web UI Enhancement**: Topic-based web interface
4. **CLI Extension**: Topic-aware CLI commands

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| jCodeMunch performance issues | Ripgrep/glob fallback ready |
| Topic sync conflicts | Version tracking, conflict resolution |
| Model API rate limits | Circuit breakers, intelligent backoff |
| Cost tracking inaccuracy | Redundant tracking, manual verification |
| System integration complexity | Incremental testing, mock interfaces |

## Success Signals

1. **Technical**: All systems operational, tests passing
2. **Performance**: Response times meet targets
3. **Cost**: < $1/day budget maintained during testing
4. **Integration**: Systems work together seamlessly
5. **Usability**: Enhanced Remi can explain and use all systems