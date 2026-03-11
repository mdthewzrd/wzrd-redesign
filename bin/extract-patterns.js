#!/usr/bin/env node
/**
 * Pattern Extraction for Continuous Learning
 * Phase 2 Week 2: Pattern extraction from query logs
 */

const fs = require('fs');
const path = require('path');
const natural = require('natural');

class PatternExtractor {
  constructor() {
    this.basePath = path.join(__dirname, '..');
    this.logsPath = path.join(this.basePath, 'logs');
    this.patternsPath = path.join(this.basePath, 'patterns');
    
    // Ensure directories exist
    if (!fs.existsSync(this.patternsPath)) {
      fs.mkdirSync(this.patternsPath, { recursive: true });
    }
    
    // Initialize NLP tools
    this.tokenizer = new natural.WordTokenizer();
    this.tfidf = new natural.TfIdf();
  }

  /**
   * Main extraction routine
   */
  async run() {
    console.log('🧠 Extracting patterns from query logs...\n');
    
    const results = {
      totalQueries: 0,
      patternsExtracted: 0,
      patternsByCategory: {},
      insights: []
    };

    try {
      // 1. Load recent queries
      const queries = await this.loadRecentQueries();
      results.totalQueries = queries.length;
      
      if (queries.length === 0) {
        console.log('⚠️ No queries found to analyze');
        return results;
      }
      
      // 2. Extract common patterns
      const patterns = await this.extractCommonPatterns(queries);
      results.patternsExtracted = patterns.length;
      
      // 3. Categorize patterns
      results.patternsByCategory = this.categorizePatterns(patterns);
      
      // 4. Generate insights
      results.insights = await this.generateInsights(queries, patterns);
      
      // 5. Save patterns to knowledge base
      await this.savePatterns(patterns, results.patternsByCategory);
      
      console.log('\n✅ Pattern extraction completed:');
      console.log(`  • Analyzed ${results.totalQueries} queries`);
      console.log(`  • Extracted ${results.patternsExtracted} patterns`);
      console.log(`  • Found ${Object.keys(results.patternsByCategory).length} categories`);
      console.log(`  • Generated ${results.insights.length} insights`);
      
      return results;
      
    } catch (error) {
      console.error('❌ Pattern extraction failed:', error.message);
      throw error;
    }
  }

  /**
   * Load recent queries from logs
   */
  async loadRecentQueries(days = 7) {
    console.log('📁 Loading recent queries...');
    
    const queries = [];
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
                queries.push({
                  query: entry.query,
                  timestamp: entry.timestamp || stats.mtime.toISOString(),
                  mode: entry.mode || 'unknown',
                  skills: entry.skills || [],
                  success: entry.success !== false
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
    
    console.log(`  • Loaded ${queries.length} recent queries`);
    return queries;
  }

  /**
   * Extract common patterns from queries
   */
  async extractCommonPatterns(queries) {
    console.log('🔍 Extracting common patterns...');
    
    const patterns = [];
    
    // Group queries by mode
    const queriesByMode = {};
    for (const query of queries) {
      if (!queriesByMode[query.mode]) {
        queriesByMode[query.mode] = [];
      }
      queriesByMode[query.mode].push(query);
    }
    
    // Extract patterns for each mode
    for (const [mode, modeQueries] of Object.entries(queriesByMode)) {
      if (modeQueries.length < 3) {
        continue; // Need enough data
      }
      
      // Extract common phrases
      const commonPhrases = this.extractCommonPhrases(modeQueries);
      
      // Extract common skill combinations
      const commonSkillCombos = this.extractCommonSkillCombinations(modeQueries);
      
      // Extract workflow patterns
      const workflowPatterns = this.extractWorkflowPatterns(modeQueries);
      
      patterns.push({
        mode: mode,
        commonPhrases: commonPhrases.slice(0, 10),
        commonSkillCombinations: commonSkillCombos.slice(0, 10),
        workflowPatterns: workflowPatterns.slice(0, 5),
        sampleQueries: modeQueries.slice(0, 5).map(q => ({
          query: q.query.substring(0, 100) + '...',
          skills: q.skills,
          success: q.success
        }))
      });
    }
    
    console.log(`  • Extracted patterns for ${Object.keys(queriesByMode).length} modes`);
    return patterns;
  }

  /**
   * Extract common phrases from queries
   */
  extractCommonPhrases(queries) {
    const phraseFrequency = {};
    
    for (const query of queries) {
      const text = query.query.toLowerCase();
      const tokens = this.tokenizer.tokenize(text);
      
      // Extract 2-4 word phrases
      for (let i = 0; i < tokens.length - 1; i++) {
        for (let j = 2; j <= 4 && i + j <= tokens.length; j++) {
          const phrase = tokens.slice(i, i + j).join(' ');
          
          // Filter out very common words
          if (this.isSignificantPhrase(phrase)) {
            phraseFrequency[phrase] = (phraseFrequency[phrase] || 0) + 1;
          }
        }
      }
    }
    
    // Convert to array and sort
    return Object.entries(phraseFrequency)
      .filter(([_, count]) => count > 1) // At least 2 occurrences
      .sort((a, b) => b[1] - a[1])
      .map(([phrase, count]) => ({
        phrase,
        count,
        frequency: (count / queries.length * 100).toFixed(2) + '%'
      }));
  }

  /**
   * Extract common skill combinations
   */
  extractCommonSkillCombinations(queries) {
    const comboFrequency = {};
    
    for (const query of queries) {
      if (query.skills && query.skills.length > 1) {
        // Sort skills to normalize order
        const sortedSkills = [...query.skills].sort();
        
        // Track all combinations
        for (let i = 0; i < sortedSkills.length; i++) {
          for (let j = i + 1; j < sortedSkills.length; j++) {
            const combo = `${sortedSkills[i]}+${sortedSkills[j]}`;
            comboFrequency[combo] = (comboFrequency[combo] || 0) + 1;
          }
        }
      }
    }
    
    // Convert to array and sort
    return Object.entries(comboFrequency)
      .filter(([_, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .map(([combo, count]) => ({
        combo: combo.split('+'),
        count,
        frequency: (count / queries.length * 100).toFixed(2) + '%'
      }));
  }

  /**
   * Extract workflow patterns
   */
  extractWorkflowPatterns(queries) {
    const workflows = [];
    
    // Group queries by likely workflow steps
    const codingQueries = queries.filter(q => 
      q.query.toLowerCase().includes('code') || 
      q.query.toLowerCase().includes('function') ||
      q.query.toLowerCase().includes('implement')
    );
    
    const testingQueries = queries.filter(q => 
      q.query.toLowerCase().includes('test') ||
      q.query.toLowerCase().includes('debug')
    );
    
    const planningQueries = queries.filter(q => 
      q.query.toLowerCase().includes('plan') ||
      q.query.toLowerCase().includes('design')
    );
    
    // Look for sequences
    if (planningQueries.length > 0 && codingQueries.length > 0) {
      workflows.push({
        name: 'Plan → Implement',
        steps: ['planning', 'coding'],
        frequency: Math.min(planningQueries.length, codingQueries.length),
        skills: this.findCommonSkills([...planningQueries, ...codingQueries])
      });
    }
    
    if (codingQueries.length > 0 && testingQueries.length > 0) {
      workflows.push({
        name: 'Code → Test',
        steps: ['coding', 'testing'],
        frequency: Math.min(codingQueries.length, testingQueries.length),
        skills: this.findCommonSkills([...codingQueries, ...testingQueries])
      });
    }
    
    return workflows;
  }

  /**
   * Categorize patterns
   */
  categorizePatterns(patterns) {
    const categories = {};
    
    for (const pattern of patterns) {
      const category = pattern.mode;
      
      if (!categories[category]) {
        categories[category] = {
          totalPatterns: 0,
          patterns: [],
          mostCommonPhrase: '',
          mostCommonSkillCombo: []
        };
      }
      
      categories[category].totalPatterns++;
      categories[category].patterns.push(pattern);
      
      // Find most common phrase
      if (pattern.commonPhrases.length > 0) {
        const topPhrase = pattern.commonPhrases[0];
        if (!categories[category].mostCommonPhrase || 
            topPhrase.count > categories[category].mostCommonPhrase.count) {
          categories[category].mostCommonPhrase = topPhrase;
        }
      }
      
      // Find most common skill combo
      if (pattern.commonSkillCombinations.length > 0) {
        const topCombo = pattern.commonSkillCombinations[0];
        if (!categories[category].mostCommonSkillCombo.length || 
            topCombo.count > categories[category].mostCommonSkillCombo.count) {
          categories[category].mostCommonSkillCombo = topCombo;
        }
      }
    }
    
    return categories;
  }

  /**
   * Generate insights from patterns
   */
  async generateInsights(queries, patterns) {
    console.log('💡 Generating insights...');
    
    const insights = [];
    
    // Insight 1: Most common query types
    const modeCounts = {};
    for (const query of queries) {
      modeCounts[query.mode] = (modeCounts[query.mode] || 0) + 1;
    }
    
    const topMode = Object.entries(modeCounts).sort((a, b) => b[1] - a[1])[0];
    if (topMode) {
      insights.push({
        type: 'usage_pattern',
        title: `Most Common Mode: ${topMode[0]}`,
        description: `${topMode[0]} mode is used in ${((topMode[1] / queries.length) * 100).toFixed(2)}% of queries`,
        action: `Optimize skill loading for ${topMode[0]} mode`
      });
    }
    
    // Insight 2: Most successful skill combinations
    const successfulQueries = queries.filter(q => q.success);
    if (successfulQueries.length > 0) {
      const skillSuccessRates = {};
      
      for (const query of successfulQueries) {
        for (const skill of query.skills) {
          skillSuccessRates[skill] = (skillSuccessRates[skill] || { successes: 0, total: 0 });
          skillSuccessRates[skill].successes++;
        }
      }
      
      // Also count failures for rate calculation
      for (const query of queries) {
        for (const skill of query.skills) {
          if (!skillSuccessRates[skill]) {
            skillSuccessRates[skill] = { successes: 0, total: 0 };
          }
          skillSuccessRates[skill].total++;
        }
      }
      
      // Find skills with highest success rates
      const successRates = Object.entries(skillSuccessRates)
        .filter(([_, data]) => data.total > 5)
        .map(([skill, data]) => ({
          skill,
          rate: (data.successes / data.total * 100).toFixed(2),
          uses: data.total
        }))
        .sort((a, b) => b.rate - a.rate)
        .slice(0, 3);
      
      if (successRates.length > 0) {
        insights.push({
          type: 'skill_effectiveness',
          title: 'Most Effective Skills',
          description: `${successRates.map(s => `${s.skill} (${s.rate}%)`).join(', ')}`,
          action: 'Prioritize loading these skills for relevant tasks'
        });
      }
    }
    
    // Insight 3: Common workflow patterns
    for (const pattern of patterns) {
      if (pattern.workflowPatterns.length > 0) {
        const workflow = pattern.workflowPatterns[0];
        insights.push({
          type: 'workflow_pattern',
          title: `Common Workflow: ${workflow.name}`,
          description: `Found ${workflow.frequency} instances of ${workflow.steps.join(' → ')} workflow`,
          action: `Create workflow template for ${workflow.name}`
        });
      }
    }
    
    console.log(`  • Generated ${insights.length} insights`);
    return insights;
  }

  /**
   * Save patterns to knowledge base
   */
  async savePatterns(patterns, categorizedPatterns) {
    console.log('💾 Saving patterns to knowledge base...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Save detailed patterns
    const patternsFile = path.join(this.patternsPath, `patterns-${timestamp}.json`);
    const patternsData = {
      metadata: {
        extractionDate: new Date().toISOString(),
        totalPatterns: patterns.length,
        source: 'query_logs'
      },
      patterns: patterns,
      categorizedPatterns: categorizedPatterns
    };
    
    fs.writeFileSync(patternsFile, JSON.stringify(patternsData, null, 2));
    
    // Save summary for quick access
    const summaryFile = path.join(this.patternsPath, 'latest-patterns.json');
    const summaryData = {
      extractionDate: new Date().toISOString(),
      totalPatterns: patterns.length,
      categories: Object.keys(categorizedPatterns),
      insights: await this.generateInsights([], patterns) // Quick insights
    };
    
    fs.writeFileSync(summaryFile, JSON.stringify(summaryData, null, 2));
    
    // Update pattern library
    await this.updatePatternLibrary(patternsData);
    
    console.log(`  • Saved ${patterns.length} patterns to knowledge base`);
  }

  /**
   * Update pattern library
   */
  async updatePatternLibrary(patternsData) {
    const libraryFile = path.join(this.patternsPath, 'pattern-library.json');
    
    let library = {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      totalPatterns: 0,
      patternsByMode: {},
      insights: []
    };
    
    if (fs.existsSync(libraryFile)) {
      try {
        library = JSON.parse(fs.readFileSync(libraryFile, 'utf8'));
      } catch (error) {
        // Start fresh if corrupted
      }
    }
    
    // Update patterns by mode
    for (const pattern of patternsData.patterns) {
      if (!library.patternsByMode[pattern.mode]) {
        library.patternsByMode[pattern.mode] = {
          totalPatterns: 0,
          commonPhrases: [],
          commonSkillCombinations: [],
          workflowPatterns: []
        };
      }
      
      library.patternsByMode[pattern.mode].totalPatterns += pattern.commonPhrases.length;
      
      // Merge common phrases (keep top 10)
      library.patternsByMode[pattern.mode].commonPhrases = [
        ...library.patternsByMode[pattern.mode].commonPhrases,
        ...pattern.commonPhrases
      ]
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      // Merge skill combinations
      library.patternsByMode[pattern.mode].commonSkillCombinations = [
        ...library.patternsByMode[pattern.mode].commonSkillCombinations,
        ...pattern.commonSkillCombinations
      ]
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      // Merge workflow patterns
      library.patternsByMode[pattern.mode].workflowPatterns = [
        ...library.patternsByMode[pattern.mode].workflowPatterns,
        ...pattern.workflowPatterns
      ]
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 5);
    }
    
    library.lastUpdated = new Date().toISOString();
    library.totalPatterns = Object.values(library.patternsByMode)
      .reduce((sum, mode) => sum + mode.totalPatterns, 0);
    
    fs.writeFileSync(libraryFile, JSON.stringify(library, null, 2));
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

  /**
   * Check if phrase is significant
   */
  isSignificantPhrase(phrase) {
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const words = phrase.split(' ');
    
    // Filter out phrases with only stop words
    return !words.every(word => stopWords.includes(word));
  }

  /**
   * Find common skills across queries
   */
  findCommonSkills(queries) {
    const skillFrequency = {};
    
    for (const query of queries) {
      for (const skill of query.skills) {
        skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
      }
    }
    
    return Object.entries(skillFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([skill, count]) => ({ skill, count }));
  }
}

// CLI interface
if (require.main === module) {
  const extractor = new PatternExtractor();
  
  extractor.run()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Pattern extraction failed:', error);
      process.exit(1);
    });
}

module.exports = PatternExtractor;