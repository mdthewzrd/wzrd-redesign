#!/usr/bin/env node

/**
 * Async Skill Loader - Performance-optimized replacement for smart-skill-loader.js
 * Key improvements:
 * 1. Async file operations (non-blocking)
 * 2. LRU caching for parsed skills
 * 3. Parallel skill loading
 * 4. Performance monitoring
 */

const fs = require('fs').promises;
const path = require('path');

class AsyncSkillLoader {
  constructor(options = {}) {
    this.options = {
      cacheSize: 50, // LRU cache size
      maxParallelReads: 10, // Max concurrent file reads
      skillBasePath: path.join(__dirname, '..'),
      skillPathPrefix: '.agents/skills',
      ...options
    };
    
    // LRU cache for skill content (path -> parsed content)
    this.skillCache = new Map();
    this.cacheHits = 0;
    this.cacheMisses = 0;
    
    // Cache for mode/task -> skill paths
    this.mappingCache = new Map();
    
    // Performance metrics
    this.metrics = {
      loadTimes: [],
      cacheStats: { hits: 0, misses: 0 },
      fileReads: 0
    };
    
    // Preload core skills on startup
    this.preloadCoreSkills().catch(console.error);
  }
  
  /**
   * Preload frequently used core skills
   */
  async preloadCoreSkills() {
    // Find actual core skills that exist
    const coreSkills = [
      'using-superpowers/SKILL.md',
      'workflow-patterns/SKILL.md'
    ].map(skill => `${this.options.skillPathPrefix}/${skill}`);
    
    console.log('Preloading core skills...');
    await Promise.all(
      coreSkills.map(skillPath => this.loadSkillFile(skillPath))
    );
    console.log(`Preloaded ${coreSkills.length} core skills`);
  }
  
  /**
   * Main entry point - loads skills for a message
   */
  async loadSkillsForMessage(message, mode = null) {
    const startTime = Date.now();
    
    try {
      // Step 1: Detect mode if not provided
      const detectedMode = mode || await this.detectModeAsync(message);
      
      // Step 2: Load core skills (cached/async)
      const coreSkillsPromise = this.loadCoreSkills();
      
      // Step 3: Load mode-specific skills
      const modeSkillsPromise = this.loadModeSkills(detectedMode);
      
      // Step 4: Load task-specific skills if applicable
      const task = await this.detectTaskAsync(message);
      const taskSkillsPromise = task ? 
        this.loadTaskSkills(task) : 
        Promise.resolve([]);
      
      // Step 5: Load language-specific skills if applicable
      const language = await this.detectLanguageAsync(message);
      const languageSkillsPromise = language ?
        this.loadLanguageSkills(language) :
        Promise.resolve([]);
      
      // Run all loads in parallel
      const [coreSkills, modeSkills, taskSkills, languageSkills] = await Promise.all([
        coreSkillsPromise,
        modeSkillsPromise,
        taskSkillsPromise,
        languageSkillsPromise
      ]);
      
      // Combine and deduplicate
      const allSkills = [...new Set([
        ...coreSkills,
        ...modeSkills,
        ...taskSkills,
        ...languageSkills
      ])];
      
      const endTime = Date.now();
      const loadTime = endTime - startTime;
      
      // Update metrics
      this.metrics.loadTimes.push(loadTime);
      this.metrics.cacheStats.hits = this.cacheHits;
      this.metrics.cacheStats.misses = this.cacheMisses;
      
      console.log(`Loaded ${allSkills.length} skills in ${loadTime}ms`);
      console.log(`Cache hits: ${this.cacheHits}, misses: ${this.cacheMisses}`);
      
      return {
        skills: allSkills,
        mode: detectedMode,
        task,
        language,
        metrics: {
          loadTime,
          skillCount: allSkills.length,
          cacheHitRate: this.cacheHits / (this.cacheHits + this.cacheMisses) || 0
        }
      };
      
    } catch (error) {
      console.error('Error loading skills:', error);
      // Return at least core skills on error
      const coreSkills = await this.loadCoreSkills();
      return {
        skills: coreSkills,
        mode: 'CHAT', // Fallback mode
        task: null,
        language: null,
        error: error.message,
        metrics: { loadTime: Date.now() - startTime, skillCount: coreSkills.length }
      };
    }
  }
  
  /**
   * Load core skills (always loaded)
   */
  async loadCoreSkills() {
    const coreSkillPaths = [
      'using-superpowers/SKILL.md',
      'workflow-patterns/SKILL.md'
    ].map(skill => `${this.options.skillPathPrefix}/${skill}`);
    
    return this.loadSkillsFromPaths(coreSkillPaths);
  }
  
  /**
   * Load skills for a specific mode
   */
  async loadModeSkills(mode) {
    const modeMapping = {
      CHAT: [
        'team-communication-protocols/SKILL.md',
        'writing-plans/SKILL.md',
        'executing-plans/SKILL.md'
      ],
      CODER: [
        'coding/SKILL.md',
        'debugging-strategies/SKILL.md',
        'python-testing-patterns/SKILL.md',
        'github-actions-templates/SKILL.md'
      ],
      THINKER: [
        'architecture-patterns/SKILL.md',
        'architecture-decision-records/SKILL.md',
        'writing-plans/SKILL.md',
        'planning/SKILL.md'
      ],
      DEBUG: [
        'debugging-strategies/SKILL.md',
        'systematic-debugging/SKILL.md',
        'parallel-debugging/SKILL.md',
        'verification-before-completion/SKILL.md'
      ],
      RESEARCH: [
        'research/SKILL.md',
        'hybrid-search-implementation/SKILL.md',
        'similarity-search-patterns/SKILL.md',
        'data-analysis/SKILL.md'
      ]
    };
    
const skillPaths = (modeMapping[mode] || modeMapping.CHAT)
      .map(skill => `${this.options.skillPathPrefix}/${skill}`);
    
    return this.loadSkillsFromPaths(skillPaths);
  }
  
  /**
   * Load skills for a specific task
   */
  async loadTaskSkills(task) {
    // Simplified task mapping - can be expanded
    const taskMapping = {
      frontend: ['react-ui-master/SKILL.md'],
      python: ['python-code-style/SKILL.md'],
      api: ['api-design-principles/SKILL.md'],
      database: ['postgresql-table-design/SKILL.md'],
      devops: ['bash-defensive-patterns/SKILL.md']
    };
    
    const skillPaths = (taskMapping[task] || [])
      .map(skill => `${this.options.skillPathPrefix}/${skill}`);
    return this.loadSkillsFromPaths(skillPaths);
  }
  
  /**
   * Load language-specific skills
   */
  async loadLanguageSkills(language) {
    const languageMapping = {
      python: ['python-code-style/SKILL.md'],
      javascript: ['modern-javascript-patterns/SKILL.md'],
      typescript: ['typescript-advanced-types/SKILL.md']
    };
    
    const skillPaths = (languageMapping[language] || [])
      .map(skill => `${this.options.skillPathPrefix}/${skill}`);
    return this.loadSkillsFromPaths(skillPaths);
  }
  
  /**
   * Load multiple skills from paths (with parallel reads)
   */
  async loadSkillsFromPaths(paths) {
    if (!paths || paths.length === 0) return [];
    
    // Filter out already cached skills
    const uncachedPaths = paths.filter(p => !this.skillCache.has(p));
    
    if (uncachedPaths.length > 0) {
      // Read uncached files in parallel (batched)
      const batches = this.chunkArray(uncachedPaths, this.options.maxParallelReads);
      
      for (const batch of batches) {
        const readPromises = batch.map(p => this.loadSkillFile(p));
        await Promise.all(readPromises);
      }
    }
    
    // Return all requested skills (cached + newly loaded)
    return paths
      .map(p => this.skillCache.get(p))
      .filter(Boolean);
  }
  
  /**
   * Load a single skill file with caching
   */
  async loadSkillFile(skillPath) {
    const fullPath = path.join(this.options.skillBasePath, skillPath);
    
    // Check cache first
    if (this.skillCache.has(skillPath)) {
      this.cacheHits++;
      return this.skillCache.get(skillPath);
    }
    
    this.cacheMisses++;
    this.metrics.fileReads++;
    
    try {
      const content = await fs.readFile(fullPath, 'utf8');
      
      // Parse skill content
      const skillData = {
        path: skillPath,
        content,
        name: this.extractSkillName(skillPath),
        size: content.length,
        loadedAt: Date.now()
      };
      
      // Cache with LRU eviction
      this.skillCache.set(skillPath, skillData);
      if (this.skillCache.size > this.options.cacheSize) {
        // Remove oldest entry (first inserted)
        const firstKey = this.skillCache.keys().next().value;
        this.skillCache.delete(firstKey);
      }
      
      return skillData;
      
    } catch (error) {
      console.warn(`Failed to load skill ${skillPath}:`, error.message);
      return null;
    }
  }
  
  /**
   * Async mode detection
   */
  async detectModeAsync(message) {
    const messageLower = message.toLowerCase();
    
    if (messageLower.includes('write') && messageLower.includes('function') ||
        messageLower.includes('code') || messageLower.includes('script')) {
      return 'CODER';
    }
    
    if (messageLower.includes('design') || messageLower.includes('architecture') ||
        messageLower.includes('plan')) {
      return 'THINKER';
    }
    
    if (messageLower.includes('research') || messageLower.includes('analyze') ||
        messageLower.includes('compare')) {
      return 'RESEARCH';
    }
    
    if (messageLower.includes('error') || messageLower.includes('bug') ||
        messageLower.includes('fix') || messageLower.includes('debug')) {
      return 'DEBUG';
    }
    
    return 'CHAT';
  }
  
  /**
   * Async task detection
   */
  async detectTaskAsync(message) {
    const messageLower = message.toLowerCase();
    
    if (messageLower.includes('react') || messageLower.includes('frontend') ||
        messageLower.includes('ui') || messageLower.includes('component')) {
      return 'frontend';
    }
    
    if (messageLower.includes('python') || messageLower.includes('py')) {
      return 'python';
    }
    
    if (messageLower.includes('api') || messageLower.includes('endpoint') ||
        messageLower.includes('rest') || messageLower.includes('graphql')) {
      return 'api';
    }
    
    if (messageLower.includes('database') || messageLower.includes('sql') ||
        messageLower.includes('schema')) {
      return 'database';
    }
    
    return null;
  }
  
  /**
   * Async language detection
   */
  async detectLanguageAsync(message) {
    const messageLower = message.toLowerCase();
    
    if (messageLower.includes('python') || messageLower.includes('py')) {
      return 'python';
    }
    
    if (messageLower.includes('javascript') || messageLower.includes('js ')) {
      return 'javascript';
    }
    
    if (messageLower.includes('typescript') || messageLower.includes('ts ')) {
      return 'typescript';
    }
    
    return null;
  }
  
  /**
   * Extract skill name from path
   */
  extractSkillName(skillPath) {
    const parts = skillPath.split('/');
    const skillDir = parts[parts.length - 2];
    return skillDir.replace(/-/g, ' ');
  }
  
  /**
   * Chunk array for parallel processing
   */
  chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
  
  /**
   * Get performance metrics
   */
  getMetrics() {
    const loadTimes = this.metrics.loadTimes;
    const averageLoadTime = loadTimes.length > 0 ?
      loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length : 0;
    
    return {
      averageLoadTime: Math.round(averageLoadTime),
      totalLoads: loadTimes.length,
      cacheHitRate: this.cacheHits / (this.cacheHits + this.cacheMisses) || 0,
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
      fileReads: this.metrics.fileReads,
      cacheSize: this.skillCache.size
    };
  }
  
  /**
   * Clear cache
   */
  clearCache() {
    this.skillCache.clear();
    this.mappingCache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
    console.log('Skill cache cleared');
  }
}

// CLI interface
if (require.main === module) {
  const loader = new AsyncSkillLoader();
  
  const message = process.argv[2] || 'hey remi';
  const mode = process.argv[3] || null;
  
  console.log(`Testing async skill loader with message: "${message}"`);
  
  loader.loadSkillsForMessage(message, mode)
    .then(result => {
      console.log('\n=== SKILL LOADING RESULTS ===');
      console.log(`Mode: ${result.mode}`);
      console.log(`Task: ${result.task || 'N/A'}`);
      console.log(`Language: ${result.language || 'N/A'}`);
      console.log(`Loaded ${result.skills.length} skills`);
      console.log(`Load time: ${result.metrics.loadTime}ms`);
      
      console.log('\n=== PERFORMANCE METRICS ===');
      const metrics = loader.getMetrics();
      console.log(`Average load time: ${metrics.averageLoadTime}ms`);
      console.log(`Cache hit rate: ${(metrics.cacheHitRate * 100).toFixed(1)}%`);
      console.log(`Cache size: ${metrics.cacheSize} skills`);
      
      console.log('\n=== LOADED SKILLS ===');
      result.skills.forEach((skill, i) => {
        console.log(`${i + 1}. ${skill.name} (${skill.size.toLocaleString()} chars)`);
      });
      
      process.exit(0);
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}

module.exports = AsyncSkillLoader;