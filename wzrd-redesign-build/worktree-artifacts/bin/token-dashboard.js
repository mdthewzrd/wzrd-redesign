#!/usr/bin/env node
/**
 * Token Visibility Dashboard
 * Shows token usage, budget tracking, and skill loading efficiency
 * Called after each query to provide visibility into Remi's performance
 */

const path = require('path');
const fs = require('fs');

class TokenDashboard {
  constructor() {
    this.basePath = path.join(__dirname, '..');
    this.logsPath = path.join(this.basePath, 'logs');
    this.configPath = path.join(this.basePath, 'configs', 'cost-tracker.json');
    this.skillsPath = path.join(this.basePath, '.claude', 'skills');
  }

  // Get today's date in YYYY-MM-DD format
  getToday() {
    return new Date().toISOString().split('T')[0];
  }

  // Load cost configuration
  loadConfig() {
    if (!fs.existsSync(this.configPath)) {
      return null;
    }
    return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
  }

  // Read today's cost log
  loadTodayStats() {
    const costLogFile = path.join(this.logsPath, `cost-${this.getToday()}.log`);

    if (!fs.existsSync(costLogFile)) {
      // No logs today
      return {
        totalTokens: 0,
        totalCost: 0,
        interactions: 0,
        byModel: {},
        byPersona: {}
      };
    }

    const lines = fs.readFileSync(costLogFile, 'utf8').trim().split('\n');
    const stats = {
      totalTokens: 0,
      totalCost: 0,
      interactions: lines.length,
      byModel: {},
      byPersona: {}
    };

    // Parse log lines: timestamp|persona|model|input_tokens|output_tokens|cost
    for (const line of lines) {
      const parts = line.split('|');
      if (parts.length >= 6) {
        const [, persona, model, inputTokens, outputTokens, cost] = parts;
        const tokenCount = parseInt(inputTokens) + parseInt(outputTokens);
        const costValue = parseFloat(cost);

        stats.totalTokens += tokenCount;
        stats.totalCost += costValue;

        // Track by model
        if (!stats.byModel[model]) {
          stats.byModel[model] = { tokens: 0, cost: 0 };
        }
        stats.byModel[model].tokens += tokenCount;
        stats.byModel[model].cost += costValue;

        // Track by persona
        if (!stats.byPersona[persona]) {
          stats.byPersona[persona] = { tokens: 0, cost: 0, interactions: 0 };
        }
        stats.byPersona[persona].tokens += tokenCount;
        stats.byPersona[persona].cost += costValue;
        stats.byPersona[persona].interactions += 1;
      }
    }

    return stats;
  }

  // Get skill loading info based on mode
  getSkillLoadInfo(mode) {
    // Core skills (always loaded in all modes)
    const coreSkills = [
      'using-superpowers',
      'context',
      'workflow-patterns',
      'documentation'
    ];

    // Mode-specific skills
    const modeSkills = {
      chat: [
        'orchestration',
        'communication',
        'topic-switcher',
        'auto-memory'
      ],
      thinker: [
        'planning',
        'architecture',
        'research',
        'validation'
      ],
      coder: [
        'coding',
        'debugging',
        'testing',
        'github'
      ],
      debug: [
        'debugging',
        'system-health',
        'performance',
        'verification-before-completion'
      ],
      research: [
        'research',
        'web-search',
        'documentation',
        'data-analysis'
      ]
    };

    return {
      core: coreSkills,
      modeSpecific: modeSkills[mode] || [],
      total: coreSkills.length + (modeSkills[mode]?.length || 0)
    };
  }

  // Count total skills available
  getTotalSkillsCount() {
    if (!fs.existsSync(this.skillsPath)) {
      return 0;
    }
    const items = fs.readdirSync(this.skillsPath);
    // Filter out non-skill directories
    return items.filter(item => {
      const skillPath = path.join(this.skillsPath, item, 'SKILL.md');
      return fs.existsSync(skillPath);
    }).length;
  }

  // Calculate budget tracking
  calculateBudgetTracking(stats, config) {
    if (!config || !config.budget) {
      return null;
    }

    const dailyLimit = config.budget.daily_limit;
    const budgetUsed = stats.totalCost;
    const budgetRemaining = dailyLimit - budgetUsed;
    const budgetPercent = (budgetUsed / dailyLimit) * 100;

    // Estimate if on track
    const now = new Date();
    const hoursPassed = now.getHours();
    const dayProgress = hoursPassed / 24;
    const expectedAtProgress = dayProgress * dailyLimit;
    const onTrack = budgetUsed <= expectedAtProgress;

    // Project daily total
    if (stats.interactions > 0) {
      const avgPerInteraction = stats.totalCost / stats.interactions;
      const estHoursTillEnd = 24 - hoursPassed;
      const estInteractionsTillEnd = Math.ceil(estHoursTillEnd * (stats.interactions / hoursPassed));
      const estAdditionalCost = estInteractionsTillEnd * avgPerInteraction;
      const projectedDaily = budgetUsed + estAdditionalCost;

      return {
        dailyLimit,
        budgetUsed,
        budgetRemaining,
        budgetPercent,
        onTrack,
        projectedDaily,
        withinBudget: projectedDaily <= dailyLimit
      };
    }

    return {
      dailyLimit,
      budgetUsed,
      budgetRemaining,
      budgetPercent,
      onTrack: true,
      projectedDaily: budgetUsed,
      withinBudget: true
    };
  }

  // Display the dashboard
  display(mode = 'unknown') {
    const config = this.loadConfig();
    const stats = this.loadTodayStats();
    const budget = this.calculateBudgetTracking(stats, config);
    const skillInfo = this.getSkillLoadInfo(mode);
    const totalSkills = this.getTotalSkillsCount();
    const skillsNotLoaded = totalSkills - skillInfo.total;

    // Calculate efficiency metrics
    const avgTokensPerQuery = stats.interactions > 0 ? Math.round(stats.totalTokens / stats.interactions) : 0;
    const tokenSavingsPercent = totalSkills > 0
      ? Math.round((1 - (skillInfo.total / totalSkills)) * 100)
      : 0;

    console.log(`
═══════════════════════════════════════════════════
           💰 TOKEN USAGE - REMI DASHBOARD
═══════════════════════════════════════════════════

📊 THIS QUERY:
   Mode:            ${mode}
   Model:           ${config?.personas?.remi?.model || 'nvidia/z-ai/glm4.7'}

🔧 SKILLS LOADED:  ${skillInfo.total} of ${totalSkills} skills

   Always Loaded (${skillInfo.core.length} skills):
     ${skillInfo.core.map(s => `✅ ${s}`).join('\n     ')}

   Mode-Specific (${skillInfo.modeSpecific.length} skills for ${mode} mode):
     ${skillInfo.modeSpecific.map(s => `🎯 ${s}`).join('\n     ')}
   
   Optimized Away (${skillsNotLoaded} skills):
     💡 Smart loading: ${tokenSavingsPercent}% token savings
     💡 Estimated: ~(Math.round(skillsNotLoaded * 2.5))KB tokens avoided`);

    if (stats.interactions > 0) {
      console.log(`
💰 TODAY'S SPEND:
   Total Tokens:   ${stats.totalTokens.toLocaleString()} (${stats.interactions} queries, ${avgTokensPerQuery} avg)
   Total Cost:     $${stats.totalCost.toFixed(4)}`
      );

      if (budget) {
        const onTrackIcon = budget.onTrack ? '✅' : '⚠️';
        const withinBudgetIcon = budget.withinBudget ? '✅' : '❌';

        console.log(`
   Budget Left:    $${budget.budgetRemaining.toFixed(4)} / $${budget.dailyLimit.toFixed(2)} (${Math.round(budget.budgetPercent)}% used)
   On Track:       ${onTrackIcon} ${budget.onTrack ? 'YES' : 'NO'} (used ${Math.round(budget.budgetPercent)}% of day)

   📈 Projections:
     At current rate: ~${stats.interactions} queries so far
     Est. daily cost: $${budget.projectedDaily.toFixed(4)} ${withinBudgetIcon} (under budget: ${budget.withinBudget})`);
      }
    } else {
      console.log(`
💰 TODAY'S SPEND:
   No queries yet today

   📈 Projections:
     Track will update after first query`);
    }

    console.log(`
⚡ EFFICIENCY:
   Smart Loading:  ${skillInfo.total} skills loaded vs ${totalSkills} total (${tokenSavingsPercent}% savings)
   Target:         <$${config?.budget?.daily_limit || '1.00'}/day
   Today:          $${stats.totalCost.toFixed(4)} ${stats.totalCost <= (config?.budget?.daily_limit || 1.00) ? '✅' : '❌'}

🎯 TARGETS:
   Daily Budget:    ≤ $${config?.budget?.daily_limit || '1.00'}           ${stats.totalCost <= (config?.budget?.daily_limit || 1.00) ? '✅' : '❌'} ($${stats.totalCost.toFixed(4)} used)
   Monthly Budget:  ≤ $${config?.budget?.monthly_limit || '30.00'}          ${budget?.projectedDaily ? '✅' : '⏳'} (Today's projection: $${(budget?.projectedDaily * 30).toFixed(2)})
   Avg Per Query:   ≤ 15,000 tokens   ${avgTokensPerQuery <= 15000 ? '✅' : '⚠️'} (${avgTokensPerQuery.toLocaleString()} avg)

═══════════════════════════════════════════════════
    `);
  }
}

// CLI interface
function main() {
  const args = process.argv.slice(2);
  let mode = 'unknown';

  // Parse mode from arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--mode' && i + 1 < args.length) {
      mode = args[i + 1];
      break;
    }
  }

  const dashboard = new TokenDashboard();
  dashboard.display(mode);
}

if (require.main === module) {
  main();
}

module.exports = TokenDashboard;
