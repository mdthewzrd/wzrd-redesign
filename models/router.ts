/**
 * Model Router - Intelligent cost-aware model selection
 *
 * Routes tasks to optimal models based on:
 * - Task type (coding, research, general, planning)
 * - Complexity level
 * - Cost constraints
 * - Performance history
 * - Budget limits
 *
 * Models:
 * - GLM 4.7 Flash: Fast, cheap, general tasks (50-60%)
 * - Qwen3 Coder 32B: Coding and technical tasks (20-30%)
 * - DeepSeek V3.2: Research and complex analysis (10-20%)
 */

export interface Task {
  content: string;
  type?: 'coding' | 'research' | 'general' | 'planning' | 'technical' | 'strategy';
  complexity?: number;  // 1-10 scale
  category?: string;
  estimatedTokens?: number;
}

export interface ModelSelection {
  model: string;
  provider: string;
  estimatedTokens: number;
  estimatedCost: number;
  remainingBudget: number;
  fallbackModel?: string;
  reasoning: string;
  confidence: number;
}

export interface ModelPerformance {
  model: string;
  totalRequests: number;
  totalTokens: number;
  avgResponseTime: number;
  successRate: number;
  lastUsed: number;
}

export interface ModelConfig {
  [key: string]: any;
  glm_4_7_flash: {
    provider: string;
    costPer1kTokens: number;
    avgResponseTime: number;
    capabilities: string[];
    rateLimit: number;
    fallback: string;
    maxDailyBudget: number;
  };
  deepseek_v3_2: {
    provider: string;
    costPer1kTokens: number;
    avgResponseTime: number;
    capabilities: string[];
    rateLimit: number;
    fallback: string;
    maxDailyBudget: number;
  };
  qwen3_coder_30b: {
    provider: string;
    costPer1kTokens: number;
    avgResponseTime: number;
    capabilities: string[];
    rateLimit: number;
    fallback: string;
    maxDailyBudget: number;
  };
}

export interface RoutingRule {
  pattern: RegExp;
  model: string;
  priority: 'high' | 'medium' | 'low';
  conditions?: {
    complexity?: { min?: number; max?: number };
  };
}

export interface CostLimits {
  dailyLimit: number;
  warningThreshold: number;
  circuitBreakerThreshold: number;
  resetTime: string;
}

export interface ModelRouterConfig {
  models: ModelConfig;
  routingRules: RoutingRule[];
  costLimits: CostLimits;
  performanceHistoryPath?: string;
  costTrackerPath?: string;
}

export class ModelRouter {
  private models: ModelConfig;
  private routingRules: RoutingRule[];
  private costTracker: any;  // Simplified, would integrate with cost tracker
  private performanceHistory: Map<string, ModelPerformance> = new Map();
  private config: ModelRouterConfig;
  private circuitBreakerActive: boolean = false;
  private initialized: boolean = false;

  constructor(config: ModelRouterConfig) {
    this.models = config.models;
    this.routingRules = config.routingRules;
    this.config = config;
  }

  /**
   * Initialize router
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Initialize cost tracker (placeholder)
    this.initializeCostTracker();

    // Load performance history
    this.loadPerformanceHistory();

    // Initialize performance history for all models
    for (const modelKey of Object.keys(this.models)) {
      this.performanceHistory.set(modelKey, {
        model: modelKey,
        totalRequests: 0,
        totalTokens: 0,
        avgResponseTime: this.models[modelKey].avgResponseTime,
        successRate: 1.0,
        lastUsed: 0,
      });
    }

    this.initialized = true;

    console.log('[ModelRouter] Initialized with 3 models and cost tracking');
  }

  /**
   * Route task to optimal model
   */
  async route(task: Task): Promise<ModelSelection> {
    // Check circuit breaker
    if (this.circuitBreakerActive) {
      console.warn('[ModelRouter] Circuit breaker active, using fallback model');
      return this.fallbackSelection('GLM 4.7 Flash');
    }

    // Analyze task
    const analysis = this.analyzeTask(task);

    // Select model based on rules and analysis
    const selection = this.selectModel(analysis, task);

    // Estimate cost
    const estimatedTokens = this.estimateTokens(task, selection.model);
    const estimatedCost = (estimatedTokens / 1000) * this.models[selection.model].costPer1kTokens;

    // Check remaining budget
    const remainingBudget = this.getRemainingBudget();

    // Prepare selection
    const modelSelection: ModelSelection = {
      model: selection.model,
      provider: this.models[selection.model].provider,
      estimatedTokens,
      estimatedCost,
      remainingBudget,
      fallbackModel: this.models[selection.model].fallback,
      reasoning: selection.reasoning,
      confidence: selection.confidence,
    };

    // Record performance
    this.recordPerformance(analysis.modelUsed, estimatedTokens);

    console.log(`[ModelRouter] Routing to ${selection.model}: ${selection.reasoning}`);
    console.log(`[ModelRouter] Estimated cost: $${estimatedCost.toFixed(6)}, Budget remaining: $${remainingBudget.toFixed(6)}`);

    return modelSelection;
  }

  /**
   * Analyze task for optimal model
   */
  private analyzeTask(task: Task): {
    keywords: string[];
    complexity: number;
    taskType: string;
    modelUsed: string;
    reasoning: string;
    confidence: number;
  } {
    const content = task.content.toLowerCase();

    // Extract keywords
    const keywords: string[] = [];
    if (content.match(/code|implement|function|class|method|python|javascript|typescript/)) {
      keywords.push('coding');
    }
    if (content.match(/research|analyze|study|market|data|research/)) {
      keywords.push('research');
    }
    if (content.match(/design|architecture|plan|strategy|system/)) {
      keywords.push('planning');
    }
    if (content.match(/fix|bug|error|debug|debugging/)) {
      keywords.push('debugging');
    }

    // Determine task type
    let taskType = 'general';
    if (keywords.includes('coding')) {
      taskType = 'coding';
    } else if (keywords.includes('research')) {
      taskType = 'research';
    } else if (keywords.includes('planning')) {
      taskType = 'planning';
    } else if (keywords.includes('debugging')) {
      taskType = 'general';  // Debugging is general but requires precision
    }

    // Estimate complexity
    const complexity = task.complexity || this.estimateComplexityFromContent(content);

    // Select model based on routing rules
    const rules = this.matchRoutingRules(content, complexity);

    let modelUsed: string;
    let reasoning: string;
    let confidence: number;

    if (rules) {
      modelUsed = rules.model;
      reasoning = `Routing rule matched: ${rules.pattern} → ${rules.model}`;
      confidence = 0.9;
    } else {
      // Default routing based on task type and complexity
      if (taskType === 'coding') {
        modelUsed = 'qwen3_coder_30b';
        reasoning = 'Task is coding/technical, using specialized coder model';
        confidence = 0.85;
      } else if (taskType === 'research' || complexity > 6) {
        modelUsed = 'deepseek_v3_2';
        reasoning = `Research task with complexity ${complexity}, using specialized research model`;
        confidence = 0.85;
      } else {
        modelUsed = 'glm_4_7_flash';
        reasoning = `General task with complexity ${complexity}, using fast model`;
        confidence = 0.75;
      }
    }

    return { keywords, complexity, taskType, modelUsed, reasoning, confidence };
  }

  /**
   * Match routing rules
   */
  private matchRoutingRules(content: string, complexity: number): RoutingRule | null {
    for (const rule of this.routingRules) {
      if (rule.pattern.test(content)) {
        // Check complexity conditions if specified
        if (rule.conditions) {
          if (rule.conditions.complexity) {
            const min = rule.conditions.complexity.min || 0;
            const max = rule.conditions.complexity.max || Infinity;

            if (complexity < min || complexity > max) {
              continue;  // Skip this rule
            }
          }
        }

        return rule;
      }
    }

    return null;
  }

  /**
   * Select model based on analysis
   */
  private selectModel(
    analysis: {
      keywords: string[];
      complexity: number;
      taskType: string;
      modelUsed: string;
      reasoning: string;
      confidence: number;
    },
    task: Task
  ): { model: string; reasoning: string; confidence: number } {
    // If a rule matched, use that model
    if (analysis.taskType === 'coding') {
      return {
        model: 'qwen3_coder_30b',
        reasoning: analysis.reasoning,
        confidence: analysis.confidence,
      };
    }

    if (analysis.taskType === 'research' || analysis.complexity > 6) {
      return {
        model: 'deepseek_v3_2',
        reasoning: analysis.reasoning,
        confidence: analysis.confidence,
      };
    }

    // Default to GLM 4.7 Flash
    return {
      model: 'glm_4_7_flash',
      reasoning: 'General task with low complexity, using fast model',
      confidence: 0.7,
    };
  }

  /**
   * Estimate complexity from content
   */
  private estimateComplexityFromContent(content: string): number {
    let complexity = 3;  // Default baseline

    // Complexity factors
    const sentenceCount = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    if (sentenceCount > 10) complexity += 2;
    if (sentenceCount > 20) complexity += 3;

    // Technical complexity
    if (content.includes('function') || content.includes('class') || content.includes('implementation')) {
      complexity += 2;
    }

    if (content.includes('array') || content.includes('database') || content.includes('api')) {
      complexity += 1;
    }

    if (content.includes('algorithm') || content.includes('optimization')) {
      complexity += 2;
    }

    // Token count proxy
    const tokenCount = content.split(/\s+/).length;
    if (tokenCount > 200) complexity += 2;
    if (tokenCount > 500) complexity += 3;

    return Math.min(complexity, 10);
  }

  /**
   * Estimate tokens for a task
   */
  private estimateTokens(task: Task, model: string): number {
    // Simple estimation: avg token count per word * 1.3
    const wordCount = task.content.split(/\s+/).length;
    const avgTokensPerWord = 1.3;
    const estimatedTokens = wordCount * avgTokensPerWord;

    // Add some overhead
    return Math.round(estimatedTokens * 1.1);  // 10% overhead
  }

  /**
   * Record model performance
   */
  private recordPerformance(model: string, tokens: number): void {
    const performance = this.performanceHistory.get(model);
    if (performance) {
      performance.totalRequests += 1;
      performance.totalTokens += tokens;
      performance.lastUsed = Date.now();

      // Update average response time (rough estimate)
      performance.avgResponseTime = this.models[model].avgResponseTime;
    }
  }

  /**
   * Get remaining budget
   */
  private getRemainingBudget(): number {
    // In production, this would query the cost tracker
    // For now, return a large enough amount
    return 100000;  // $1 worth of tokens
  }

  /**
   * Initialize cost tracker (placeholder)
   */
  private initializeCostTracker(): void {
    // In production, this would initialize the cost tracking system
    // from config.costTrackerPath
    console.log('[ModelRouter] Cost tracker initialized');
  }

  /**
   * Load performance history
   */
  private loadPerformanceHistory(): void {
    // In production, this would load from file
    // For now, start with empty history
    console.log('[ModelRouter] Performance history loaded');
  }

  /**
   * Check if circuit breaker is active
   */
  isCircuitBreakerActive(): boolean {
    return this.circuitBreakerActive;
  }

  /**
   * Activate circuit breaker
   */
  activateCircuitBreaker(): void {
    this.circuitBreakerActive = true;
    console.error('[ModelRouter] CIRCUIT BREAKER ACTIVATED - Daily limit reached');
  }

  /**
   * Get fallback model selection
   */
  private fallbackSelection(originalModel: string): ModelSelection {
    return {
      model: 'glm_4_7_flash',
      provider: this.models['glm_4_7_flash'].provider,
      estimatedTokens: 1000,
      estimatedCost: (1000 / 1000) * this.models['glm_4_7_flash'].costPer1kTokens,
      remainingBudget: 0,
      fallbackModel: 'glm_4_7',
      reasoning: 'Circuit breaker active - using GLM 4.7 Flash fallback',
      confidence: 0.3,
    };
  }

  /**
   * Get routing statistics
   */
  getStatistics() {
    const stats = {
      totalRouting: 0,
      modelUsage: {} as Record<string, number>,
      averageConfidence: 0,
      activeCircuitBreaker: this.circuitBreakerActive,
    };

    for (const model of Object.keys(this.models)) {
      const performance = this.performanceHistory.get(model);
      stats.modelUsage[model] = performance?.totalRequests || 0;
      stats.totalRouting += performance?.totalRequests || 0;
    }

    stats.averageConfidence = stats.totalRouting > 0
      ? Object.values(stats.modelUsage).reduce((a, b) => a + b, 0) / stats.totalRouting
      : 0;

    return stats;
  }

  /**
   * Get model information
   */
  getModelInfo(model: string) {
    const info = this.models[model as keyof ModelConfig];

    return {
      ...info,
      currentPerformance: this.performanceHistory.get(model),
      fallbackModel: info.fallback,
    };
  }
}

// Export for use in other modules
export default ModelRouter;