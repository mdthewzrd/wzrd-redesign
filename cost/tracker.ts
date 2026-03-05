/**
 * Cost Tracker - Enforce token budget < $1/day
 *
 * Tracks:
 * - Daily token usage
 * - Model-specific costs
 * - Cost per task
 * - Budget warnings
 * - Circuit breaker activation
 *
 * Architecture:
 * - JSON-based storage for performance and history
 * - Real-time budget monitoring
 * - Warning alerts at 80% of budget
 * - Circuit breaker at 95% of budget
 * - Daily reset at midnight
 */

export interface DailyUsage {
  date: string;
  tokens: number;
  tokensUsed: number;
  costs: Record<string, number>;
  tasks: CostTask[];
  warnings: CostWarning[];
  circuitBreakerActive: boolean;
}

export interface CostTask {
  id: string;
  timestamp: number;
  contentLength: number;
  estimatedTokens: number;
  actualTokens?: number;
  model: string;
  cost: number;
  taskType: string;
}

export interface CostWarning {
  id: string;
  timestamp: number;
  level: 'warning' | 'critical';
  message: string;
  percentage: number;
}

export interface CostLimits {
  dailyLimit: number;  // ~$1 worth of tokens
  dailyLimitTokens: number;  // ~30000 tokens
  warningThreshold: number;  // 80% of limit
  circuitBreakerThreshold: number;  // 95% of limit
  resetTime: string;  // "00:00"
}

export interface ModelCostConfig {
  model: string;
  inputCostPer1k: number;
  outputCostPer1k: number;
  contextWindow: number;
  maxDailyBudget: number;
}

export interface CostTrackerConfig {
  dataPath: string;
  limits: CostLimits;
  models: ModelCostConfig[];
  dailySummaryPath?: string;
}

export class CostTracker {
  private dailyLimit: number;
  private dailyLimitTokens: number;
  private currentUsage: number;
  private currentTokens: number;
  private usageHistory: DailyUsage[] = [];
  private costsByModel: Map<string, number> = new Map();
  private tasks: CostTask[] = [];
  private warnings: CostWarning[] = [];
  private circuitBreakerActive: boolean = false;
  private lastResetTime: number = 0;
  private config: CostTrackerConfig;

  constructor(config: CostTrackerConfig) {
    this.config = config;
    this.dailyLimit = config.limits.dailyLimit;
    this.dailyLimitTokens = config.limits.dailyLimitTokens;
    this.currentUsage = 0;
    this.currentTokens = 0;

    // Load existing data
    this.loadHistory();

    // Schedule daily reset
    this.scheduleDailyReset();
  }

  /**
   * Track token usage for a task
   */
  trackUsage(estimatedTokens: number, model: string, taskType: string = 'general', actualTokens?: number): void {
    // Calculate cost
    const modelConfig = this.getModelConfig(model);
    if (!modelConfig) {
      console.warn(`[CostTracker] Unknown model: ${model}`);
      return;
    }

    // Calculate input cost
    const inputCost = (estimatedTokens * modelConfig.inputCostPer1k) / 1000;
    const outputCost = 0;  // Output cost tracked separately if needed
    const totalCost = inputCost + outputCost;

    // Update usage
    this.currentUsage += totalCost;
    this.currentTokens += estimatedTokens;
    this.currentTokens += actualTokens || 0;

    // Update model-specific costs
    this.costsByModel.set(model, (this.costsByModel.get(model) || 0) + totalCost);

    // Create task record
    const task: CostTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      contentLength: 0,  // Would be set by caller
      estimatedTokens,
      actualTokens,
      model,
      cost: totalCost,
      taskType,
    };

    this.tasks.push(task);

    // Check limits
    this.checkLimits();

    // Save changes
    this.saveHistory();

    // Log for visibility
    console.log(`[CostTracker] Tracked: ${model} - $${totalCost.toFixed(6)}, Tokens: ${estimatedTokens}, Remaining: $${this.getRemainingBudget().toFixed(6)}`);
  }

  /**
   * Track output tokens (for completion tokens)
   */
  trackOutputUsage(outputTokens: number, model: string): void {
    const modelConfig = this.getModelConfig(model);
    if (!modelConfig) {
      return;
    }

    const outputCost = (outputTokens * modelConfig.outputCostPer1k) / 1000;
    this.currentUsage += outputCost;
    this.costsByModel.set(model, (this.costsByModel.get(model) || 0) + outputCost);

    // Update last task with actual output tokens
    if (this.tasks.length > 0) {
      const lastTask = this.tasks[this.tasks.length - 1];
      lastTask.actualTokens = outputTokens;
      lastTask.cost += outputCost;
      this.tasks[this.tasks.length - 1] = lastTask;
    }

    this.checkLimits();
    this.saveHistory();

    console.log(`[CostTracker] Output tracked: ${model} - $${outputCost.toFixed(6)}, Output tokens: ${outputTokens}`);
  }

  /**
   * Check budget limits
   */
  private checkLimits(): void {
    const percentage = (this.currentUsage / this.dailyLimit) * 100;

    console.log(`[CostTracker] Budget usage: ${percentage.toFixed(1)}% ($${this.currentUsage.toFixed(6)}/$${this.dailyLimit.toFixed(6)})`);

    // Warning at 80%
    if (percentage >= this.config.limits.warningThreshold && percentage < this.config.limits.circuitBreakerThreshold) {
      this.sendWarning(percentage);
    }

    // Circuit breaker at 95%
    if (percentage >= this.config.limits.circuitBreakerThreshold) {
      this.activateCircuitBreaker(percentage);
    }
  }

  /**
   * Send warning
   */
  private sendWarning(percentage: number): void {
    const warning: CostWarning = {
      id: `warning_${Date.now()}`,
      timestamp: Date.now(),
      level: 'warning',
      message: `Budget usage at ${percentage.toFixed(1)}% - ${this.getRemainingBudget().toFixed(6)} remaining`,
      percentage,
    };

    this.warnings.push(warning);

    // Keep only last 10 warnings
    if (this.warnings.length > 10) {
      this.warnings.shift();
    }

    console.warn(`[CostTracker] WARNING: Budget at ${percentage.toFixed(1)}%`);
    this.saveHistory();
  }

  /**
   * Activate circuit breaker
   */
  private activateCircuitBreaker(percentage: number): void {
    if (this.circuitBreakerActive) {
      return;
    }

    this.circuitBreakerActive = true;

    const criticalWarning: CostWarning = {
      id: `critical_${Date.now()}`,
      timestamp: Date.now(),
      level: 'critical',
      message: `CRITICAL: Daily limit reached at ${percentage.toFixed(1)}% - System paused`,
      percentage,
    };

    this.warnings.push(criticalWarning);
    this.tasks.push({
      id: `task_${Date.now()}`,
      timestamp: Date.now(),
      contentLength: 0,
      estimatedTokens: 0,
      cost: 0,
      model: 'SYSTEM',
      taskType: 'CIRCUIT_BREAKER',
    });

    console.error(`[CostTracker] CIRCUIT BREAKER ACTIVATED at ${percentage.toFixed(1)}% - $${this.currentUsage.toFixed(6)}/$${this.dailyLimit.toFixed(6)}`);
    this.saveHistory();

    // In production, this would trigger alerts
    this.triggerAlert(percentage);
  }

  /**
   * Trigger alerts (Discord, Web UI, CLI)
   */
  private triggerAlert(percentage: number): void {
    const message = `🚨 CIRCUIT BREAKER ACTIVATED: Daily budget limit reached at ${percentage.toFixed(1)}%.\nCurrent: $${this.currentUsage.toFixed(6)} | Limit: $${this.dailyLimit.toFixed(6)}\nPlease reduce usage or wait for midnight reset.`;

    // Here you would send to Discord, Web UI, or CLI
    console.error(`[CostTracker] ALERT: ${message}`);
  }

  /**
   * Get remaining budget
   */
  getRemainingBudget(): number {
    return Math.max(0, this.dailyLimit - this.currentUsage);
  }

  /**
   * Get remaining tokens
   */
  getRemainingTokens(): number {
    return Math.max(0, this.dailyLimitTokens - this.currentTokens);
  }

  /**
   * Get daily report
   */
  getDailyReport(): {
    date: string;
    tokensUsed: number;
    tokensRemaining: number;
    percentageUsed: number;
    costs: {
      total: number;
      byModel: Record<string, number>;
    };
    tasks: number;
    warnings: number;
    circuitBreakerActive: boolean;
    costsByModel: Record<string, number>;
  } {
    const today = this.getToday();

    return {
      date: today,
      tokensUsed: this.currentTokens,
      tokensRemaining: this.getRemainingTokens(),
      percentageUsed: (this.currentUsage / this.dailyLimit) * 100,
      costs: {
        total: this.currentUsage,
        byModel: Object.fromEntries(this.costsByModel),
      },
      tasks: this.tasks.length,
      warnings: this.warnings.length,
      circuitBreakerActive: this.circuitBreakerActive,
      costsByModel: Object.fromEntries(this.costsByModel),
    };
  }

  /**
   * Get model costs for today
   */
  getModelCosts(): Record<string, number> {
    return Object.fromEntries(this.costsByModel);
  }

  /**
   * Get task history
   */
  getTaskHistory(limit: number = 50): CostTask[] {
    return this.tasks.slice(-limit);
  }

  /**
   * Clear today's usage (for testing or manual reset)
   */
  clearDailyUsage(): void {
    const today = this.getToday();
    this.currentUsage = 0;
    this.currentTokens = 0;
    this.costsByModel.clear();
    this.tasks = [];
    this.warnings = [];
    this.circuitBreakerActive = false;

    this.saveHistory();

    console.log(`[CostTracker] Cleared daily usage for ${today}`);
  }

  /**
   * Get statistics
   */
  getStatistics() {
    return {
      totalCost: this.currentUsage,
      remainingBudget: this.getRemainingBudget(),
      tokensUsed: this.currentTokens,
      remainingTokens: this.getRemainingTokens(),
      percentageUsed: (this.currentUsage / this.dailyLimit) * 100,
      models: Object.fromEntries(this.costsByModel),
      tasks: this.tasks.length,
      warnings: this.warnings.length,
      circuitBreakerActive: this.circuitBreakerActive,
    };
  }

  /**
   * Get budget status
   */
  getBudgetStatus(): 'healthy' | 'warning' | 'critical' {
    const percentage = (this.currentUsage / this.dailyLimit) * 100;

    if (percentage >= this.config.limits.circuitBreakerThreshold) {
      return 'critical';
    }

    if (percentage >= this.config.limits.warningThreshold) {
      return 'warning';
    }

    return 'healthy';
  }

  /**
   * Schedule daily reset
   */
  private scheduleDailyReset(): void {
    // Check if we need to reset
    this.checkDailyReset();

    // Schedule next check (every 1 hour)
    setInterval(() => {
      this.checkDailyReset();
    }, 60 * 60 * 1000);
  }

  /**
   * Check for daily reset
   */
  private checkDailyReset(): void {
    const now = new Date();
    const resetHour = parseInt(this.config.limits.resetTime.split(':')[0]);

    if (now.getHours() === resetHour && now.getMinutes() === 0) {
      this.resetDailyUsage();
    }
  }

  /**
   * Reset daily usage
   */
  private resetDailyUsage(): void {
    if (this.circuitBreakerActive) {
      console.warn('[CostTracker] Cannot reset - circuit breaker is active');
      return;
    }

    const today = this.getToday();

    // Create daily usage record
    const dailyUsage: DailyUsage = {
      date: today,
      tokens: this.currentTokens,
      tokensUsed: this.currentTokens,
      costs: Object.fromEntries(this.costsByModel),
      tasks: [...this.tasks],
      warnings: [...this.warnings],
      circuitBreakerActive: false,
    };

    this.usageHistory.push(dailyUsage);

    // Keep only last 30 days
    if (this.usageHistory.length > 30) {
      this.usageHistory.shift();
    }

    // Clear current usage
    this.currentUsage = 0;
    this.currentTokens = 0;
    this.costsByModel.clear();
    this.tasks = [];
    this.warnings = [];
    this.circuitBreakerActive = false;
    this.lastResetTime = Date.now();

    this.saveHistory();

    console.log(`[CostTracker] Daily usage reset for ${today}`);
  }

  /**
   * Load history from file
   */
  private loadHistory(): void {
    try {
      const fs = require('fs');
      const path = require('path');

      // Load daily summary if exists
      if (this.config.dailySummaryPath && fs.existsSync(this.config.dailySummaryPath)) {
        const summary = JSON.parse(fs.readFileSync(this.config.dailySummaryPath, 'utf8'));
        this.currentUsage = summary.total_cost || 0;
      }

      // Calculate initial usage based on files
      if (fs.existsSync(this.config.dataPath)) {
        const data = JSON.parse(fs.readFileSync(this.config.dataPath, 'utf8'));

        if (data.history && data.history.length > 0) {
          const lastRecord = data.history[data.history.length - 1];
          this.currentUsage = lastRecord.costs.total || 0;
        }
      }

      console.log(`[CostTracker] Loaded history: $${this.currentUsage.toFixed(6)} current`);
    } catch (error) {
      console.error('[CostTracker] Error loading history:', error);
    }
  }

  /**
   * Save history to file
   */
  private saveHistory(): void {
    try {
      const fs = require('fs');

      const historyData = {
        history: this.usageHistory,
        current: {
          usage: this.currentUsage,
          tokens: this.currentTokens,
          costs: Object.fromEntries(this.costsByModel),
          tasks: this.tasks,
          warnings: this.warnings,
          circuitBreakerActive: this.circuitBreakerActive,
        },
        updated_at: Date.now(),
      };

      fs.writeFileSync(this.config.dataPath, JSON.stringify(historyData, null, 2));

      // Update daily summary
      if (this.config.dailySummaryPath) {
        const summaryData = {
          date: this.getToday(),
          total_cost: this.currentUsage,
          tokens_used: this.currentTokens,
          costs_by_model: Object.fromEntries(this.costsByModel),
          tasks: this.tasks.length,
          warnings: this.warnings.length,
          circuit_breaker_active: this.circuitBreakerActive,
          updated_at: Date.now(),
        };

        fs.writeFileSync(this.config.dailySummaryPath, JSON.stringify(summaryData, null, 2));
      }
    } catch (error) {
      console.error('[CostTracker] Error saving history:', error);
    }
  }

  /**
   * Get today's date string
   */
  private getToday(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Get model configuration
   */
  private getModelConfig(model: string): ModelCostConfig | null {
    return this.config.models.find(m => m.model === model) || null;
  }
}

// Export for use in other modules
export default CostTracker;