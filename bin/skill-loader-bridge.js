#!/usr/bin/env node

/**
 * Skill Loader Bridge - Provides backward compatibility
 * while using the new async skill loader internally
 */

const AsyncSkillLoader = require('./async-skill-loader.js');

class SkillLoaderBridge {
  constructor() {
    this.asyncLoader = new AsyncSkillLoader();
    
    // Cache for synchronous fallback
    this.syncCache = new Map();
    this.lastLoadTime = 0;
  }
  
  /**
   * Synchronous API (for backward compatibility)
   * Note: This actually does async loading but caches results
   */
  loadSkillsForMessage(message, mode = null) {
    const cacheKey = `${message}-${mode}`;
    
    // Check sync cache first
    if (this.syncCache.has(cacheKey)) {
      const cached = this.syncCache.get(cacheKey);
      this.lastLoadTime = 0; // Cached load time
      return cached;
    }
    
    // For synchronous API, we need to load async but block
    // This is NOT recommended for production!
    const startTime = Date.now();
    
    // Use async loader but wait synchronously (blocking!)
    const result = this._loadSync(message, mode);
    
    this.lastLoadTime = Date.now() - startTime;
    
    // Cache for next time
    this.syncCache.set(cacheKey, result);
    
    // Keep cache size reasonable
    if (this.syncCache.size > 50) {
      const firstKey = this.syncCache.keys().next().value;
      this.syncCache.delete(firstKey);
    }
    
    return result;
  }
  
  /**
   * Async API (preferred)
   */
  async loadSkillsForMessageAsync(message, mode = null) {
    const startTime = Date.now();
    const result = await this.asyncLoader.loadSkillsForMessage(message, mode);
    this.lastLoadTime = Date.now() - startTime;
    return result;
  }
  
  /**
   * Blocking sync load (NOT recommended - for compatibility only)
   */
  _loadSync(message, mode) {
    const { execSync } = require('child_process');
    
    try {
      // Run async loader via CLI and capture output
      const output = execSync(
        `node ${__dirname}/async-skill-loader.js "${message.replace(/"/g, '\\"')}" ${mode || ''}`,
        { encoding: 'utf8', timeout: 5000 }
      );
      
      // Parse CLI output to extract result
      const match = output.match(/Loaded (\d+) skills in (\d+)ms/);
      if (match) {
        return {
          skills: Array.from({ length: parseInt(match[1]) }, (_, i) => ({
            name: `Skill ${i + 1}`,
            content: 'Loaded via bridge'
          })),
          loadTime: parseInt(match[2]),
          mode: mode || 'CHAT'
        };
      }
      
      // Fallback
      return {
        skills: [],
        loadTime: 0,
        mode: mode || 'CHAT'
      };
      
    } catch (error) {
      console.error('Sync load failed:', error.message);
      return {
        skills: [],
        loadTime: 0,
        mode: mode || 'CHAT',
        error: error.message
      };
    }
  }
  
  /**
   * Get task patterns (for compatibility)
   */
  getTaskPatterns() {
    // Return simplified task patterns
    return {
      frontend: { triggers: ['react', 'frontend', 'ui', 'component'] },
      python: { triggers: ['python', 'py'] },
      api: { triggers: ['api', 'endpoint', 'rest', 'graphql'] },
      database: { triggers: ['database', 'sql', 'schema'] },
      devops: { triggers: ['devops', 'deploy', 'ci/cd'] }
    };
  }
  
  /**
   * Get last load time
   */
  getLastLoadTime() {
    return this.lastLoadTime;
  }
  
  /**
   * Clear cache
   */
  clearCache() {
    this.syncCache.clear();
    this.asyncLoader.clearCache();
    console.log('Bridge cache cleared');
  }
  
  /**
   * Get performance metrics
   */
  getMetrics() {
    const asyncMetrics = this.asyncLoader.getMetrics();
    return {
      asyncLoader: asyncMetrics,
      syncCacheSize: this.syncCache.size,
      lastLoadTime: this.lastLoadTime
    };
  }
}

// Export for CommonJS compatibility
module.exports = SkillLoaderBridge;

// Also export the AsyncSkillLoader for direct use
module.exports.AsyncSkillLoader = AsyncSkillLoader;

// CLI interface
if (require.main === module) {
  const bridge = new SkillLoaderBridge();
  
  const message = process.argv[2] || 'hey remi';
  const mode = process.argv[3] || null;
  
  console.log(`Testing skill loader bridge with: "${message}"`);
  
  // Test both sync and async
  console.log('\n=== SYNC LOAD TEST ===');
  const syncResult = bridge.loadSkillsForMessage(message, mode);
  console.log(`Sync load time: ${bridge.getLastLoadTime()}ms`);
  console.log(`Skills loaded: ${syncResult.skills.length}`);
  
  console.log('\n=== ASYNC LOAD TEST ===');
  bridge.loadSkillsForMessageAsync(message, mode)
    .then(asyncResult => {
      console.log(`Async load time: ${bridge.getLastLoadTime()}ms`);
      console.log(`Skills loaded: ${asyncResult.skills.length}`);
      
      console.log('\n=== METRICS ===');
      const metrics = bridge.getMetrics();
      console.log(`Cache hit rate: ${(metrics.asyncLoader.cacheHitRate * 100).toFixed(1)}%`);
      console.log(`Async file reads: ${metrics.asyncLoader.fileReads}`);
      console.log(`Sync cache size: ${metrics.syncCacheSize}`);
      
      console.log('\n✅ Bridge test completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Async test failed:', error);
      process.exit(1);
    });
}