#!/usr/bin/env node
/**
 * Skill Effectiveness Tracking
 * Phase 2 Week 2: Continuous Learning System
 * Tracks which skills are most effective for different tasks
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SkillAnalyzer {
  constructor() {
    this.basePath = path.join(__dirname, '..');
    this.logsPath = path.join(this.basePath, 'logs');
    this.skillsPath = path.join(this.basePath, '.claude', 'skills');
    this.analysisPath = path.join(this.basePath, 'analysis');
    
    // Ensure directories exist
    if (!fs.existsSync(this.analysisPath)) {
      fs.mkdirSync(this.analysisPath, { recursive: true });
    }
  }

  /**
   * Main analysis routine
   */
  async run() {
    console.log('📊 Analyzing skill effectiveness...\n');
    
    const results = {
      totalQueries: 0,
      skillsAnalyzed: 0,
      effectivenessBySkill: {},
      patternsByTaskType: {},
      recommendations: []
    };

    try {
      // 1. Collect usage data from logs
      const usageData = await this.collectUsageData();
      results.totalQueries = usageData.totalQueries;
      
      // 2. Analyze skill effectiveness
      results.effectivenessBySkill = await this.analyzeSkillEffectiveness(usageData);
      results.skillsAnalyzed = Object.keys(results.effectivenessBySkill).length;
      
      // 3. Extract patterns by task type
      results.patternsByTaskType = await this.extractTaskPatterns(usageData);
      
      // 4. Generate recommendations
      results.recommendations = await this.generateRecommendations(results);
      
      // 5. Save analysis results
      await this.saveAnalysisResults(results);
      
      console.log('\n✅ Skill analysis completed:');
      console.log(`  • Analyzed ${results.totalQueries} queries`);
      console.log(`  • Evaluated ${results.skillsAnalyzed} skills`);
      console.log(`  • Found ${Object.keys(results.patternsByTaskType).length} task patterns`);
      console.log(`  • Generated ${results.recommendations.length} recommendations`);
      
      return results;
      
    } catch (error) {
      console.error('❌ Skill analysis failed:', error.message);
      throw error;
    }
  }

  /**
   * Collect usage data from logs
   */
  async collectUsageData() {
    console.log('📁 Collecting usage data from logs...');
    
    const usageData = {
      totalQueries: 0,
      queries: [],
      skillUsage: {},
      taskTypes: {}
    };

    // Read recent log files
    const logFiles = this.getRecentLogFiles(30); // Last 30 days
    
    for (const file of logFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        
        for (const line of lines) {
          if (line.trim()) {
            try {
              const entry = JSON.parse(line);
              
              if (entry.query && entry.skills && entry.mode) {
                usageData.queries.push({
                  timestamp: entry.timestamp || new Date().toISOString(),
                  query: entry.query,
                  skills: entry.skills,
                  mode: entry.mode,
                  taskType: this.detectTaskType(entry.query),
                  success: entry.success !== false // Assume success unless marked
                });
                
                usageData.totalQueries++;
                
                // Track skill usage
                for (const skill of entry.skills) {
                  usageData.skillUsage[skill] = (usageData.skillUsage[skill] || 0) + 1;
                }
                
                // Track task types
                const taskType = this.detectTaskType(entry.query);
                usageData.taskTypes[taskType] = (usageData.taskTypes[taskType] || 0) + 1;
              }
            } catch (e) {
              // Not JSON or malformed, skip
            }
          }
        }
      } catch (error) {
        console.error(`  ⚠️ Failed to read ${path.basename(file)}:`, error.message);
      }
    }
    
    console.log(`  • Collected ${usageData.totalQueries} queries`);
    console.log(`  • Found ${Object.keys(usageData.skillUsage).length} unique skills`);
    
    return usageData;
  }

  /**
   * Analyze skill effectiveness
   */
  async analyzeSkillEffectiveness(usageData) {
    console.log('🎯 Analyzing skill effectiveness...');
    
    const effectiveness = {};
    
    // For each skill, calculate metrics
    for (const [skillName, usageCount] of Object.entries(usageData.skillUsage)) {
      const skillData = {
        usageCount: usageCount,
        usagePercentage: (usageCount / usageData.totalQueries * 100).toFixed(2),
        averageQueryLength: 0,
        successRate: 0,
        coOccurrences: {}
      };
      
      // Find queries that used this skill
      const skillQueries = usageData.queries.filter(q => q.skills.includes(skillName));
      
      if (skillQueries.length > 0) {
        // Calculate average query length
        const totalLength = skillQueries.reduce((sum, q) => sum + q.query.length, 0);
        skillData.averageQueryLength = Math.round(totalLength / skillQueries.length);
        
        // Calculate success rate (if we have success data)
        const successfulQueries = skillQueries.filter(q => q.success);
        skillData.successRate = (successfulQueries.length / skillQueries.length * 100).toFixed(2);
        
        // Find co-occurring skills
        for (const query of skillQueries) {
          for (const otherSkill of query.skills) {
            if (otherSkill !== skillName) {
              skillData.coOccurrences[otherSkill] = (skillData.coOccurrences[otherSkill] || 0) + 1;
            }
          }
        }
        
        // Sort co-occurrences
        skillData.topCoOccurrences = Object.entries(skillData.coOccurrences)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([skill, count]) => ({ skill, count }));
      }
      
      effectiveness[skillName] = skillData;
    }
    
    console.log(`  • Analyzed ${Object.keys(effectiveness).length} skills`);
    
    return effectiveness;
  }

  /**
   * Extract patterns by task type
   */
  async extractTaskPatterns(usageData) {
    console.log('🔍 Extracting task patterns...');
    
    const patterns = {};
    
    // Group queries by task type
    for (const query of usageData.queries) {
      const taskType = query.taskType;
      
      if (!patterns[taskType]) {
        patterns[taskType] = {
          count: 0,
          skills: {},
          commonQueries: [],
          averageSkillsPerQuery: 0
        };
      }
      
      patterns[taskType].count++;
      
      // Track skills used for this task type
      for (const skill of query.skills) {
        patterns[taskType].skills[skill] = (patterns[taskType].skills[skill] || 0) + 1;
      }
      
      // Store representative queries
      if (patterns[taskType].commonQueries.length < 10) {
        patterns[taskType].commonQueries.push(query.query.substring(0, 100));
      }
    }
    
    // Calculate metrics for each task type
    for (const [taskType, data] of Object.entries(patterns)) {
      // Find top skills for this task type
      data.topSkills = Object.entries(data.skills)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([skill, count]) => ({ skill, count, percentage: (count / data.count * 100).toFixed(2) }));
      
      // Calculate average skills per query
      const totalSkills = Object.values(data.skills).reduce((sum, count) => sum + count, 0);
      data.averageSkillsPerQuery = (totalSkills / data.count).toFixed(2);
      
      // Remove raw skills object to keep output clean
      delete data.skills;
    }
    
    console.log(`  • Found ${Object.keys(patterns).length} task types`);
    
    return patterns;
  }

  /**
   * Generate recommendations
   */
  async generateRecommendations(analysis) {
    console.log('💡 Generating recommendations...');
    
    const recommendations = [];
    
    // 1. Overused skills (used in > 50% of queries)
    const overusedSkills = Object.entries(analysis.effectivenessBySkill)
      .filter(([skill, data]) => parseFloat(data.usagePercentage) > 50)
      .map(([skill, data]) => ({
        type: 'overused',
        skill: skill,
        usage: `${data.usagePercentage}%`,
        recommendation: `Consider reducing automatic loading of "${skill}" - it's used in ${data.usagePercentage}% of queries`
      }));
    
    recommendations.push(...overusedSkills);
    
    // 2. Underused skills (used in < 1% of queries)
    const underusedSkills = Object.entries(analysis.effectivenessBySkill)
      .filter(([skill, data]) => parseFloat(data.usagePercentage) < 1)
      .map(([skill, data]) => ({
        type: 'underused',
        skill: skill,
        usage: `${data.usagePercentage}%`,
        recommendation: `Consider removing "${skill}" - used in only ${data.usagePercentage}% of queries`
      }));
    
    recommendations.push(...underusedSkills);
    
    // 3. High-performing skills (success rate > 90%)
    const highPerformingSkills = Object.entries(analysis.effectivenessBySkill)
      .filter(([skill, data]) => parseFloat(data.successRate) > 90 && data.usageCount > 10)
      .map(([skill, data]) => ({
        type: 'high_performing',
        skill: skill,
        successRate: `${data.successRate}%`,
        recommendation: `Prioritize loading "${skill}" for relevant tasks - ${data.successRate}% success rate`
      }));
    
    recommendations.push(...highPerformingSkills);
    
    // 4. Task-specific patterns
    for (const [taskType, pattern] of Object.entries(analysis.patternsByTaskType)) {
      if (pattern.topSkills.length > 0) {
        const topSkill = pattern.topSkills[0];
        recommendations.push({
          type: 'task_pattern',
          taskType: taskType,
          skill: topSkill.skill,
          usage: `${topSkill.percentage}%`,
          recommendation: `For "${taskType}" tasks, prioritize loading "${topSkill.skill}" (used in ${topSkill.percentage}% of cases)`
        });
      }
    }
    
    console.log(`  • Generated ${recommendations.length} recommendations`);
    
    return recommendations;
  }

  /**
   * Save analysis results
   */
  async saveAnalysisResults(results) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFile = path.join(this.analysisPath, `skill-analysis-${timestamp}.json`);
    
    // Add metadata
    const fullResults = {
      metadata: {
        analysisDate: new Date().toISOString(),
        analysisVersion: '1.0',
        dataSource: 'query logs',
        totalSkills: Object.keys(results.effectivenessBySkill).length
      },
      summary: {
        totalQueries: results.totalQueries,
        skillsAnalyzed: results.skillsAnalyzed,
        taskTypesFound: Object.keys(results.patternsByTaskType).length,
        recommendationsCount: results.recommendations.length
      },
      effectivenessBySkill: results.effectivenessBySkill,
      patternsByTaskType: results.patternsByTaskType,
      recommendations: results.recommendations
    };
    
    fs.writeFileSync(outputFile, JSON.stringify(fullResults, null, 2));
    
    // Also save a summary file
    const summaryFile = path.join(this.analysisPath, 'latest-analysis.json');
    fs.writeFileSync(summaryFile, JSON.stringify(fullResults, null, 2));
    
    console.log(`  • Saved full analysis to: ${outputFile}`);
    console.log(`  • Saved summary to: ${summaryFile}`);
    
    return outputFile;
  }

  /**
   * Get recent log files
   */
  getRecentLogFiles(days = 30) {
    const files = [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    function walk(dir) {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          walk(fullPath);
        } else if (stat.isFile() && (item.includes('query') || item.includes('skill') || item.includes('log'))) {
          // Only include recent files
          if (stat.mtime > cutoffDate) {
            files.push(fullPath);
          }
        }
      }
    }
    
    walk(this.logsPath);
    return files;
  }

  /**
   * Detect task type from query
   */
  detectTaskType(query) {
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('code') || queryLower.includes('function') || queryLower.includes('implement')) {
      return 'coding';
    } else if (queryLower.includes('test') || queryLower.includes('debug') || queryLower.includes('bug')) {
      return 'debugging';
    } else if (queryLower.includes('plan') || queryLower.includes('design') || queryLower.includes('architecture')) {
      return 'planning';
    } else if (queryLower.includes('research') || queryLower.includes('learn') || queryLower.includes('investigate')) {
      return 'research';
    } else if (queryLower.includes('ui') || queryLower.includes('design') || queryLower.includes('layout')) {
      return 'ui_design';
    } else if (queryLower.includes('api') || queryLower.includes('endpoint') || queryLower.includes('rest')) {
      return 'api_development';
    } else if (queryLower.includes('database') || queryLower.includes('schema') || queryLower.includes('sql')) {
      return 'database';
    } else {
      return 'general';
    }
  }
}

// CLI interface
if (require.main === module) {
  const analyzer = new SkillAnalyzer();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'run':
      analyzer.run()
        .then(() => process.exit(0))
        .catch(error => {
          console.error('Analysis failed:', error);
          process.exit(1);
        });
      break;
      
    case 'summary':
      // Show summary of latest analysis
      const summaryFile = path.join(__dirname, '..', 'analysis', 'latest-analysis.json');
      
      if (fs.existsSync(summaryFile)) {
        const summary = JSON.parse(fs.readFileSync(summaryFile, 'utf8'));
        
        console.log('📊 Latest Skill Analysis Summary:\n');
        console.log(`Date: ${summary.metadata.analysisDate}`);
        console.log(`Total Queries: ${summary.summary.totalQueries}`);
        console.log(`Skills Analyzed: ${summary.summary.skillsAnalyzed}`);
        console.log(`Task Types: ${summary.summary.taskTypesFound}`);
        console.log(`Recommendations: ${summary.summary.recommendationsCount}\n`);
        
        console.log('Top Recommendations:');
        summary.recommendations.slice(0, 5).forEach((rec, i) => {
          console.log(`${i + 1}. ${rec.recommendation}`);
        });
      } else {
        console.log('No analysis found. Run "node analyze-skill-usage.js run" first.');
      }
      break;
      
    default:
      console.log('Usage: node analyze-skill-usage.js [command]');
      console.log('Commands:');
      console.log('  run     - Run full analysis');
      console.log('  summary - Show summary of latest analysis');
      break;
  }
}

module.exports = SkillAnalyzer;