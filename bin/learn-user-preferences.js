#!/usr/bin/env node
/**
 * User Preference Learning System
 * Phase 2 Week 2: Learn from user interactions to optimize skill loading
 */

const fs = require('fs');
const path = require('path');

class PreferenceLearner {
  constructor() {
    this.basePath = path.join(__dirname, '..');
    this.logsPath = path.join(this.basePath, 'logs');
    this.preferencesPath = path.join(this.basePath, 'preferences');
    this.profilesPath = path.join(this.preferencesPath, 'profiles');
    
    // Ensure directories exist
    if (!fs.existsSync(this.profilesPath)) {
      fs.mkdirSync(this.profilesPath, { recursive: true });
    }
  }

  /**
   * Main learning routine
   */
  async run() {
    console.log('🎓 Learning user preferences from interactions...\n');
    
    const results = {
      profilesUpdated: 0,
      preferencesLearned: 0,
      optimizationSuggestions: [],
      userPatterns: {}
    };

    try {
      // 1. Load interaction history
      const interactions = await this.loadInteractions();
      
      if (interactions.length === 0) {
        console.log('⚠️ No interactions found to analyze');
        return results;
      }
      
      // 2. Analyze user patterns
      results.userPatterns = await this.analyzeUserPatterns(interactions);
      
      // 3. Update user profiles
      results.profilesUpdated = await this.updateUserProfiles(results.userPatterns);
      
      // 4. Extract preferences
      results.preferencesLearned = await this.extractPreferences(results.userPatterns);
      
      // 5. Generate optimization suggestions
      results.optimizationSuggestions = await this.generateOptimizations(results.userPatterns);
      
      // 6. Apply learned preferences
      await this.applyLearnedPreferences(results);
      
      console.log('\n✅ Preference learning completed:');
      console.log(`  • Analyzed ${interactions.length} interactions`);
      console.log(`  • Updated ${results.profilesUpdated} user profiles`);
      console.log(`  • Learned ${results.preferencesLearned} preferences`);
      console.log(`  • Generated ${results.optimizationSuggestions.length} optimizations`);
      
      return results;
      
    } catch (error) {
      console.error('❌ Preference learning failed:', error.message);
      throw error;
    }
  }

  /**
   * Load interaction history
   */
  async loadInteractions(days = 30) {
    console.log('📁 Loading interaction history...');
    
    const interactions = [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const logFiles = this.getLogFiles();
    
    for (const file of logFiles) {
      try {
        // Only process recent files
        const stats = fs.statSync(file);
        if (stats.mtime < cutoffDate) {
          continue;
        }
        
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        
        for (const line of lines) {
          if (line.trim()) {
            try {
              const entry = JSON.parse(line);
              
              if (entry.query) {
                interactions.push({
                  timestamp: entry.timestamp || stats.mtime.toISOString(),
                  query: entry.query,
                  mode: entry.mode || 'unknown',
                  skills: entry.skills || [],
                  model: entry.model || 'unknown',
                  duration: entry.duration || 0,
                  success: entry.success !== false,
                  userFeedback: entry.feedback || null,
                  context: entry.context || {}
                });
              }
            } catch (e) {
              // Not JSON, skip
            }
          }
        }
      } catch (error) {
        console.error(`  ⚠️ Failed to read ${path.basename(file)}:`, error.message);
      }
    }
    
    console.log(`  • Loaded ${interactions.length} interactions`);
    return interactions;
  }

  /**
   * Analyze user patterns
   */
  async analyzeUserPatterns(interactions) {
    console.log('🔍 Analyzing user patterns...');
    
    const patterns = {
      modePreferences: {},
      skillPreferences: {},
      timingPatterns: {},
      feedbackPatterns: {},
      workflowPatterns: {}
    };
    
    // 1. Mode preferences
    const modeCounts = {};
    const successfulModeCounts = {};
    
    for (const interaction of interactions) {
      modeCounts[interaction.mode] = (modeCounts[interaction.mode] || 0) + 1;
      
      if (interaction.success) {
        successfulModeCounts[interaction.mode] = (successfulModeCounts[interaction.mode] || 0) + 1;
      }
    }
    
    patterns.modePreferences = Object.entries(modeCounts)
      .map(([mode, count]) => ({
        mode,
        usageCount: count,
        usagePercentage: (count / interactions.length * 100).toFixed(2),
        successRate: successfulModeCounts[mode] 
          ? ((successfulModeCounts[mode] / count) * 100).toFixed(2)
          : '0.00'
      }))
      .sort((a, b) => b.usageCount - a.usageCount);
    
    // 2. Skill preferences
    const skillSuccessRates = {};
    const skillUsageCounts = {};
    
    for (const interaction of interactions) {
      for (const skill of interaction.skills) {
        skillUsageCounts[skill] = (skillUsageCounts[skill] || 0) + 1;
        
        if (!skillSuccessRates[skill]) {
          skillSuccessRates[skill] = { successes: 0, total: 0 };
        }
        
        skillSuccessRates[skill].total++;
        if (interaction.success) {
          skillSuccessRates[skill].successes++;
        }
      }
    }
    
    patterns.skillPreferences = Object.entries(skillSuccessRates)
      .filter(([_, data]) => data.total >= 3) // Minimum usage threshold
      .map(([skill, data]) => ({
        skill,
        usageCount: skillUsageCounts[skill] || 0,
        successRate: ((data.successes / data.total) * 100).toFixed(2),
        preferenceScore: this.calculatePreferenceScore(data.successes, data.total)
      }))
      .sort((a, b) => b.preferenceScore - a.preferenceScore);
    
    // 3. Timing patterns
    const hourPatterns = {};
    const dayPatterns = {};
    
    for (const interaction of interactions) {
      const date = new Date(interaction.timestamp);
      const hour = date.getHours();
      const day = date.getDay(); // 0 = Sunday
      
      hourPatterns[hour] = (hourPatterns[hour] || 0) + 1;
      dayPatterns[day] = (dayPatterns[day] || 0) + 1;
    }
    
    patterns.timingPatterns = {
      peakHours: Object.entries(hourPatterns)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([hour, count]) => ({ hour: parseInt(hour), count })),
      peakDays: Object.entries(dayPatterns)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([day, count]) => ({ day: parseInt(day), count }))
    };
    
    // 4. Feedback patterns
    const feedbackInteractions = interactions.filter(i => i.userFeedback);
    
    if (feedbackInteractions.length > 0) {
      patterns.feedbackPatterns = {
        totalFeedback: feedbackInteractions.length,
        positiveFeedback: feedbackInteractions.filter(i => 
          i.userFeedback && (i.userFeedback.toLowerCase().includes('good') || 
                           i.userFeedback.toLowerCase().includes('thanks') ||
                           i.userFeedback.toLowerCase().includes('great'))
        ).length,
        negativeFeedback: feedbackInteractions.filter(i => 
          i.userFeedback && (i.userFeedback.toLowerCase().includes('bad') || 
                           i.userFeedback.toLowerCase().includes('wrong') ||
                           i.userFeedback.toLowerCase().includes('incorrect'))
        ).length,
        commonThemes: this.extractFeedbackThemes(feedbackInteractions)
      };
    }
    
    // 5. Workflow patterns
    patterns.workflowPatterns = this.extractWorkflowPatterns(interactions);
    
    console.log(`  • Analyzed ${interactions.length} interactions for patterns`);
    return patterns;
  }

  /**
   * Update user profiles
   */
  async updateUserProfiles(patterns) {
    console.log('👤 Updating user profiles...');
    
    const defaultProfile = path.join(this.profilesPath, 'default-user.json');
    let profile = {
      userId: 'default',
      lastUpdated: new Date().toISOString(),
      preferences: {},
      patterns: {},
      optimizations: {}
    };
    
    if (fs.existsSync(defaultProfile)) {
      try {
        profile = JSON.parse(fs.readFileSync(defaultProfile, 'utf8'));
      } catch (error) {
        console.error('  ⚠️ Failed to load existing profile:', error.message);
      }
    }
    
    // Update preferences
    profile.preferences = {
      preferredModes: patterns.modePreferences.slice(0, 3).map(p => p.mode),
      preferredSkills: patterns.skillPreferences.slice(0, 10).map(p => p.skill),
      peakUsageTimes: patterns.timingPatterns.peakHours.map(p => p.hour),
      successThreshold: 80 // Default success threshold
    };
    
    // Update patterns
    profile.patterns = {
      modeUsage: patterns.modePreferences,
      skillEffectiveness: patterns.skillPreferences,
      timing: patterns.timingPatterns,
      feedback: patterns.feedbackPatterns,
      workflows: patterns.workflowPatterns
    };
    
    // Update last updated timestamp
    profile.lastUpdated = new Date().toISOString();
    
    // Save profile
    fs.writeFileSync(defaultProfile, JSON.stringify(profile, null, 2));
    
    console.log(`  • Updated default user profile`);
    return 1; // Number of profiles updated
  }

  /**
   * Extract preferences from patterns
   */
  async extractPreferences(patterns) {
    console.log('💡 Extracting preferences...');
    
    const preferences = [];
    
    // Extract mode preferences
    if (patterns.modePreferences.length > 0) {
      const topMode = patterns.modePreferences[0];
      preferences.push({
        type: 'mode_preference',
        key: 'preferred_mode',
        value: topMode.mode,
        confidence: parseFloat(topMode.usagePercentage) / 100,
        evidence: `Used in ${topMode.usagePercentage}% of queries with ${topMode.successRate}% success rate`
      });
    }
    
    // Extract skill preferences
    const topSkills = patterns.skillPreferences.slice(0, 5);
    for (const skill of topSkills) {
      if (parseFloat(skill.successRate) > 70) {
        preferences.push({
          type: 'skill_preference',
          key: 'preferred_skill',
          value: skill.skill,
          confidence: parseFloat(skill.successRate) / 100,
          evidence: `${skill.successRate}% success rate across ${skill.usageCount} uses`
        });
      }
    }
    
    // Extract timing preferences
    if (patterns.timingPatterns.peakHours.length > 0) {
      const peakHour = patterns.timingPatterns.peakHours[0];
      preferences.push({
        type: 'timing_preference',
        key: 'peak_usage_hour',
        value: peakHour.hour,
        confidence: peakHour.count / Math.max(...patterns.timingPatterns.peakHours.map(p => p.count)),
        evidence: `${peakHour.count} queries during hour ${peakHour.hour}:00`
      });
    }
    
    console.log(`  • Extracted ${preferences.length} preferences`);
    return preferences.length;
  }

  /**
   * Generate optimization suggestions
   */
  async generateOptimizations(patterns) {
    console.log('⚡ Generating optimization suggestions...');
    
    const optimizations = [];
    
    // 1. Mode-specific skill loading optimization
    if (patterns.modePreferences.length > 0) {
      const topMode = patterns.modePreferences[0];
      const modeSkills = patterns.skillPreferences
        .filter(skill => skill.preferenceScore > 0.7)
        .slice(0, 5);
      
      if (modeSkills.length > 0) {
        optimizations.push({
          type: 'skill_loading',
          target: `${topMode.mode}_mode`,
          action: `Prioritize loading: ${modeSkills.map(s => s.skill).join(', ')}`,
          rationale: `These skills have high success rates (${modeSkills[0].successRate}%+) in ${topMode.mode} mode`,
          impact: 'Should improve success rate and reduce token usage'
        });
      }
    }
    
    // 2. Skill combination optimization
    const successfulSkillPairs = this.findSuccessfulSkillPairs(patterns);
    if (successfulSkillPairs.length > 0) {
      const topPair = successfulSkillPairs[0];
      optimizations.push({
        type: 'skill_combination',
        target: 'smart_skill_loader',
        action: `Load "${topPair.skill1}" and "${topPair.skill2}" together for ${topPair.taskType} tasks`,
        rationale: `${topPair.cooccurrence} co-occurrences with ${topPair.successRate}% combined success rate`,
        impact: 'More effective skill combinations for common tasks'
      });
    }
    
    // 3. Timing-based optimizations
    if (patterns.timingPatterns.peakHours.length > 0) {
      const peakHour = patterns.timingPatterns.peakHours[0];
      optimizations.push({
        type: 'resource_scheduling',
        target: 'background_jobs',
        action: `Schedule intensive jobs outside hour ${peakHour.hour}:00`,
        rationale: `Peak user activity at ${peakHour.hour}:00 (${peakHour.count} queries)`,
        impact: 'Better system responsiveness during peak usage'
      });
    }
    
    // 4. Model selection optimization
    const modelPreferences = this.analyzeModelPreferences(patterns);
    if (modelPreferences.length > 0) {
      const topModel = modelPreferences[0];
      optimizations.push({
        type: 'model_selection',
        target: 'model_router',
        action: `Default to ${topModel.model} for ${topModel.mode} mode`,
        rationale: `${topModel.successRate}% success rate across ${topModel.count} queries`,
        impact: 'More appropriate model selection per task type'
      });
    }
    
    console.log(`  • Generated ${optimizations.length} optimization suggestions`);
    return optimizations;
  }

  /**
   * Apply learned preferences
   */
  async applyLearnedPreferences(results) {
    console.log('🔧 Applying learned preferences...');
    
    const preferencesFile = path.join(this.preferencesPath, 'learned-preferences.json');
    
    const learnedData = {
      lastApplied: new Date().toISOString(),
      totalPreferences: results.preferencesLearned,
      optimizations: results.optimizationSuggestions,
      profiles: {
        default: {
          preferences: results.userPatterns,
          lastUpdated: new Date().toISOString()
        }
      }
    };
    
    fs.writeFileSync(preferencesFile, JSON.stringify(learnedData, null, 2));
    
    // Create optimization configuration
    await this.createOptimizationConfig(results.optimizationSuggestions);
    
    console.log(`  • Applied ${results.optimizationSuggestions.length} optimizations`);
  }

  /**
   * Create optimization configuration
   */
  async createOptimizationConfig(optimizations) {
    const configFile = path.join(this.preferencesPath, 'optimization-config.json');
    
    const config = {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      optimizations: {}
    };
    
    for (const opt of optimizations) {
      if (!config.optimizations[opt.type]) {
        config.optimizations[opt.type] = [];
      }
      
      config.optimizations[opt.type].push({
        target: opt.target,
        action: opt.action,
        rationale: opt.rationale,
        enabled: true
      });
    }
    
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
  }

  /**
   * Calculate preference score
   */
  calculatePreferenceScore(successes, total) {
    if (total === 0) return 0;
    
    const successRate = successes / total;
    const usageWeight = Math.min(total / 10, 1); // Cap at 10 uses
    
    return (successRate * 0.7 + usageWeight * 0.3).toFixed(3);
  }

  /**
   * Extract feedback themes
   */
  extractFeedbackThemes(feedbackInteractions) {
    const themes = {};
    const positiveWords = ['good', 'great', 'excellent', 'perfect', 'thanks', 'helpful'];
    const negativeWords = ['bad', 'wrong', 'incorrect', 'poor', 'terrible', 'useless'];
    
    for (const interaction of feedbackInteractions) {
      const feedback = interaction.userFeedback.toLowerCase();
      
      for (const word of positiveWords) {
        if (feedback.includes(word)) {
          themes['positive'] = (themes['positive'] || 0) + 1;
          break;
        }
      }
      
      for (const word of negativeWords) {
        if (feedback.includes(word)) {
          themes['negative'] = (themes['negative'] || 0) + 1;
          break;
        }
      }
      
      // Extract specific topics
      if (feedback.includes('speed') || feedback.includes('fast') || feedback.includes('slow')) {
        themes['performance'] = (themes['performance'] || 0) + 1;
      }
      
      if (feedback.includes('accurate') || feedback.includes('correct') || feedback.includes('wrong')) {
        themes['accuracy'] = (themes['accuracy'] || 0) + 1;
      }
      
      if (feedback.includes('explain') || feedback.includes('detail') || feedback.includes('clear')) {
        themes['explanation'] = (themes['explanation'] || 0) + 1;
      }
    }
    
    return Object.entries(themes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }

  /**
   * Extract workflow patterns
   */
  extractWorkflowPatterns(interactions) {
    const workflows = [];
    
    // Group by session (assuming interactions within 5 minutes are part of same session)
    const sessions = this.groupIntoSessions(interactions, 5 * 60 * 1000); // 5 minutes
    
    for (const session of sessions) {
      if (session.length >= 2) {
        // Look for common sequences
        const sequence = session.map(i => i.mode).join(' → ');
        const skillsUsed = [...new Set(session.flatMap(i => i.skills))];
        
        workflows.push({
          sequence,
          steps: session.length,
          duration: new Date(session[session.length - 1].timestamp) - new Date(session[0].timestamp),
          skills: skillsUsed,
          success: session.every(i => i.success)
        });
      }
    }
    
    // Find common sequences
    const sequenceCounts = {};
    for (const workflow of workflows) {
      sequenceCounts[workflow.sequence] = (sequenceCounts[workflow.sequence] || 0) + 1;
    }
    
    return Object.entries(sequenceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([sequence, count]) => ({ sequence, count }));
  }

  /**
   * Group interactions into sessions
   */
  groupIntoSessions(interactions, maxGapMs) {
    if (interactions.length === 0) return [];
    
    // Sort by timestamp
    const sorted = [...interactions].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
    
    const sessions = [];
    let currentSession = [sorted[0]];
    
    for (let i = 1; i < sorted.length; i++) {
      const prevTime = new Date(sorted[i - 1].timestamp);
      const currTime = new Date(sorted[i].timestamp);
      const gap = currTime - prevTime;
      
      if (gap <= maxGapMs) {
        currentSession.push(sorted[i]);
      } else {
        sessions.push(currentSession);
        currentSession = [sorted[i]];
      }
    }
    
    if (currentSession.length > 0) {
      sessions.push(currentSession);
    }
    
    return sessions;
  }

  /**
   * Find successful skill pairs
   */
  findSuccessfulSkillPairs(patterns) {
    // This would analyze co-occurrence data from logs
    // For now, return mock data
    return [
      {
        skill1: 'coding',
        skill2: 'testing',
        taskType: 'debugging',
        cooccurrence: 15,
        successRate: '85.3'
      },
      {
        skill1: 'planning',
        skill2: 'architecture',
        taskType: 'design',
        cooccurrence: 12,
        successRate: '92.1'
      }
    ];
  }

  /**
   * Analyze model preferences
   */
  analyzeModelPreferences(patterns) {
    // This would analyze model performance data
    // For now, return mock data
    return [
      {
        model: 'nvidia/deepseek-ai/deepseek-v3.2',
        mode: 'coder',
        count: 45,
        successRate: '88.9'
      },
      {
        model: 'nvidia/moonshotai/kimi-k2.5',
        mode: 'research',
        count: 23,
        successRate: '82.6'
      }
    ];
  }

  /**
   * Get log files
   */
  getLogFiles() {
    const files = [];
    
    function walk(dir) {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          walk(fullPath);
        } else if (stat.isFile() && item.includes('log')) {
          files.push(fullPath);
        }
      }
    }
    
    walk(this.logsPath);
    return files;
  }
}

// CLI interface
if (require.main === module) {
  const learner = new PreferenceLearner();
  
  learner.run()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Preference learning failed:', error);
      process.exit(1);
    });
}

module.exports = PreferenceLearner;